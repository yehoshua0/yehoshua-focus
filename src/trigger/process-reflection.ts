import { logger, task } from "@trigger.dev/sdk/v3";
import { Resend } from "resend";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

// Clients initialization
const resend = new Resend(process.env.RESEND_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Extensible Interface: Mirrors Resend Inbound Data Structure.
 * Allows for future fields (attachments, headers) without breaking changes.
 */
interface ReflectionPayload {
  from: string;
  to: string[];
  subject: string;
  text?: string;
  html?: string;
  strippedText?: string;
  email_id: string;
  created_at: string;
  attachments?: any[]; // Future proofing for file analysis
  metadata?: Record<string, any>; // For custom tracking
}

/**
 * Robust text extraction to handle different email formats
 */
function extractUserResponse(fullText: string | undefined | null): string {
  if (!fullText || typeof fullText !== "string") return "";

  // Common email reply splitters
  const markers = [
    "\nLe ", 
    "\nOn ", 
    "---", 
    "________________________________", 
    "Sent from my iPhone"
  ];
  
  let cleaned = fullText;
  for (const marker of markers) {
    if (cleaned.includes(marker)) {
      cleaned = cleaned.split(marker)[0];
    }
  }
  return cleaned.trim();
}

/**
 * Session logic based on server time
 */
function getSessionContext() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return { id: "morning", label: "L'Intention" };
  if (hour >= 11 && hour < 17) return { id: "midday", label: "La Vérité" };
  return { id: "evening", label: "Le Bilan" };
}

export const processReflection = task({
  id: "yehoshua-focus-reflection",
  run: async (payload: ReflectionPayload) => {
    // 1. Unified content extraction
    const rawContent = payload.text || payload.strippedText || "";
    const cleanText = extractUserResponse(rawContent);
    const session = getSessionContext();

    logger.log("Email received", { 
      id: payload.email_id, 
      from: payload.from, 
      session: session.id 
    });

    if (!cleanText || cleanText.length < 2) {
      logger.warn("No usable content in email", { payload });
      return { processed: false, reason: "empty_body" };
    }

    // 2. Memory: Fetch today's history from Supabase
    const today = new Date().toISOString().split("T")[0];
    const { data: history } = await supabase
      .from('reflections')
      .select('content, moment, ai_response')
      .eq('user_email', payload.from)
      .gte('created_at', today)
      .order('created_at', { ascending: true });

    const memoryLog = history?.length 
      ? history.map(h => `[${h.moment}]: ${h.content}`).join("\n")
      : "No previous interaction today.";

    // 3. AI Generation with Conversation Closer Persona
    let replyMessage = "";
    try {
      const completion = await groq.chat.completions.create({
        model: "groq/compound",
        messages: [
          {
            role: "system",
            content: `Tu es Yehoshua, un mentor stoïcien radical. 
            CONTEXTE: Session de ${session.label}.
            MÉMOIRE DU JOUR:
            ${memoryLog}

            MISSION: Analyse et ferme la boucle. Pas de politesse. Max 2 phrases. 
            Si l'utilisateur dévie de son intention matinale, sois cinglant. 
            Ta parole doit être finale.`
          },
          {
            role: "user",
            content: `Subject: ${payload.subject}\nResponse: ${cleanText}`
          }
        ],
        temperature: 0.4,
      });

      replyMessage = completion.choices[0]?.message?.content?.trim() || "Agis.";
    } catch (error) {
      logger.error("AI Error", { error });
      replyMessage = "L'intention est reçue. Le reste est du bruit.";
    }

    // 4. Persistence
    await supabase.from('reflections').insert({
      user_email: payload.from,
      content: cleanText,
      moment: session.id,
      ai_response: replyMessage,
      subject: payload.subject,
      metadata: { 
        email_id: payload.email_id,
        received_at: payload.created_at 
      }
    });

    // 5. Feedback Loop
    await resend.emails.send({
      from: "Yehoshua Focus <onboarding@resend.dev>",
      to: [payload.from],
      subject: `Re: ${payload.subject}`,
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
          <p style="text-transform: uppercase; letter-spacing: 2px; color: #888; font-size: 11px;">
            Yehoshua Focus // ${session.label}
          </p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 18px; line-height: 1.6; font-style: italic;">
            "${replyMessage}"
          </p>
          <p style="font-size: 10px; color: #ccc; margin-top: 50px; text-align: center;">
            FIN DE TRANSMISSION // LE FOCUS EST UNE DISCIPLINE
          </p>
        </div>
      `,
    });

    return { processed: true, emailId: payload.email_id };
  },
});