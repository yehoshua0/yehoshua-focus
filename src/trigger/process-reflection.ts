import { logger, task } from "@trigger.dev/sdk/v3";
import { Resend } from "resend";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Supabase client initialization
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ReflectionPayload {
  from: string;
  email_id: string;
  subject: string;
}

export const processReflection = task({
  id: "yehoshua-focus-reflection",
  run: async (payload: ReflectionPayload) => {
    console.log("Payload received", payload);
    const { from, email_id, subject } = payload;

    /**
     * Retrieve the full email content from Resend
     * Inbound webhooks only send metadata; content must be fetched via API
     */
    const { data: fullEmail, error: fetchError } = await resend.emails.receiving.get(email_id);

    if (fetchError || !fullEmail) {
      logger.error("Failed to retrieve email content", { email_id, fetchError });
      console.log("Failed to retrieve email content", { email_id, fetchError });

      throw new Error(`Resend fetch failed: ${fetchError?.message}`);
    }

    // Use text body, fallback to HTML if text is null
    const userReflection = (fullEmail as any)?.text ?? (fullEmail as any)?.html ?? "";


    logger.log("Email content retrieved", { 
      email_id, 
      contentLength: userReflection.length 
    });
    console.log("Email content retrieved", { 
      email_id, 
      contentLength: userReflection.length 
    });

    /**
     * 2. Groq / LLM Analysis
     * Socratic persona logic
     */
    let replyMessage = "";

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Tu es un challenger stoïcien. Pas un assistant. Pas un coach gentil.

Ton rôle : Confronter l'utilisateur avec la vérité de ses propres mots.

RÈGLES STRICTES :
1. JAMAIS de politesse (pas de "Bonjour", "Merci", etc.)
2. JAMAIS de questions ouvertes molles ("Comment te sens-tu ?")
3. TOUJOURS des questions fermées et directes
4. Maximum 2 phrases courtes
5. Tutoiement obligatoire
6. Si c'est vague → exige la précision
7. Si c'est une excuse → confronte sans pitié
8. Si c'est clair et actionnable → valide sobrement`,
          },
          {
            role: "user",
            content: `Sujet: ${subject}\n\nMessage: ${userReflection}`,
          },
        ],
        model: "groq/compound",
        temperature: 0.5,
        max_tokens: 150,
      });

      replyMessage = completion.choices[0]?.message?.content || 
        "C'est noté. Mais es-tu sûr que c'est l'essentiel ?";
        
    } catch (error) {
      logger.error("Groq generation failed", { error });
      console.log("Groq generation failed", { error });

      const isVague = !userReflection || userReflection.trim().length < 20;
      replyMessage = isVague 
        ? "Ta réponse est courte. Est-ce par clarté ou par évitement ?" 
        : "Bien. J'ai enregistré cette intention.";
    }

    /**
     * 3. Persistence: Save to Supabase
     */
    await supabase.from('reflections').insert({
      user_email: from,
      content: userReflection,
      subject: subject,
      ai_response: replyMessage,
      moment: new Date().getHours() >= 17 ? "evening" : (new Date().getHours() >= 11 ? "midday" : "morning")
    });

    /**
     * 4. Environment Check & Delivery
     * Prevents duplicate emails by checking the NODE_ENV
     */
    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction) {
      await resend.emails.send({
        from: "Yehoshua Focus <onboarding@resend.dev>",
        to: [from],
        subject: `Re: ${subject}`,
        html: `
          <div style="font-family: 'Georgia', serif; max-width: 600px; color: #1a1a1a; line-height: 1.6;">
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="text-transform: uppercase; letter-spacing: 2px; color: #888; font-size: 11px; margin-bottom: 30px;">
              Yehoshua Focus // Système d'Exploitation de la Pensée
            </p>
            
            <blockquote style="margin: 40px 0; padding-left: 20px; border-left: 3px solid #000; font-size: 18px; font-style: italic;">
              "${replyMessage}"
            </blockquote>

            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #999;">
                Yehoshua Focus | Documenter ta clarté. 
                Décider réduit le bruit. Le focus suit.
              </p>
            </div>
          </div>
        `,
      });
    } else {
      logger.log("Development Mode: Email skipped", { replyMessage });
      console.log("Development Mode: Email skipped", { replyMessage });
    }

    return { processed: true, reply: replyMessage, sent: isProduction };
  },
});