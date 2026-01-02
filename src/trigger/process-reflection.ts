// src/trigger/process-reflection.ts
// Code comments in English only

import { logger, task } from "@trigger.dev/sdk/v3";
import { Resend } from "resend";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ReflectionPayload {
  from: string;
  email_id: string;
  subject: string;
}

/**
 * Extract clean user response from email thread
 * Removes quoted history and email signatures
 */
function extractUserResponse(fullText: string | undefined | null): string {
  if (!fullText || typeof fullText !== "string") return "";
  
  // Split markers that indicate quoted content
  const markers = [
    "\nLe ", // French: "Le [date]..."
    "\nOn ", // French: "On [date]..."
    "---",
    "________________________________",
    "Sent from my iPhone",
    "Envoyé de mon iPhone",
    "Get Outlook for",
    "\n>", // Quoted lines starting with >
    "a écrit :", // French: "wrote:"
    "wrote:",
  ];
  
  let cleaned = fullText;
  
  // Find the earliest marker and cut everything after
  for (const marker of markers) {
    const index = cleaned.indexOf(marker);
    if (index !== -1) {
      cleaned = cleaned.substring(0, index);
    }
  }
  
  return cleaned.trim();
}

/**
 * Identify current session context based on time
 */
function getCognitiveContext() {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour <= 11) {
    return { 
      moment: "morning", 
      goal: "User is defining their daily priority" 
    };
  }
  
  if (hour > 11 && hour <= 17) {
    return { 
      moment: "midday", 
      goal: "User is checking alignment with morning intention" 
    };
  }
  
  return { 
    moment: "evening", 
    goal: "User is reflecting on the gap between intention and reality" 
  };
}

/**
 * Detect if response is evasive (excuses, avoidance patterns)
 */
function isEvasive(text: string): boolean {
  const evasivePatterns = [
    /j'ai eu/i,
    /urgence/i,
    /pas eu le temps/i,
    /compliqué/i,
    /difficile/i,
    /je vais/i,
    /demain/i,
    /bientôt/i,
    /essayer/i,
    /peut-être/i,
  ];
  
  return evasivePatterns.some((pattern) => pattern.test(text));
}

/**
 * Detect if response is vague (too short or ambiguous)
 */
function isVague(text: string): boolean {
  const cleanText = text.trim();
  
  // Too short
  if (cleanText.length < 15) return true;
  
  // Generic vague responses
  const vaguePatterns = [
    /^(oui|non|ok|bien|ça va)$/i,
    /je ne sais pas/i,
    /un peu/i,
    /beaucoup de choses/i, // Generic "many things"
    /j'ai accompli/i, // "I accomplished" without specifics
  ];
  
  return vaguePatterns.some((pattern) => pattern.test(cleanText));
}

/**
 * Build confrontational prompt using today's memory from Supabase
 */
function buildConfrontationalPrompt(
  userReflection: string,
  moment: string,
  goal: string,
  todayHistory: Array<{ content: string; moment: string; created_at: string }> | null
): string {
  const isUserEvasive = isEvasive(userReflection);
  const isUserVague = isVague(userReflection);
  
  // Build memory context
  let memoryContext = "No previous records for today.";
  let morningIntention = "";
  
  if (todayHistory && todayHistory.length > 0) {
    const morningRecord = todayHistory.find(r => r.moment === "morning");
    if (morningRecord) {
      morningIntention = morningRecord.content;
    }
    
    memoryContext = todayHistory
      .map(r => `[${r.moment.toUpperCase()}] User said: "${r.content}"`)
      .join("\n");
  }
  
  // Core system prompt - Stoic challenger
  let systemPrompt = `You are Yehoshua, a stoic challenger. Not a coach. Not a therapist.

Your role: Confront the user with the truth using their OWN WORDS from earlier today.

STRICT RULES:
1. NO politeness (no "Bonjour", "Merci", "Cordialement")
2. NO open-ended soft questions ("Comment te sens-tu ?")
3. ALWAYS use closed, direct questions
4. Maximum 2 short sentences
5. Use "tu" (informal French)
6. If vague → demand precision with ONE sharp question
7. If excuse → confront without mercy using their morning words
8. If clear → validate coldly ("C'est noté.")

CURRENT CONTEXT: ${goal}

TODAY'S MEMORY FROM DATABASE:
${memoryContext}
`;

  // Add moment-specific confrontation logic
  if (moment === "midday" && morningIntention) {
    systemPrompt += `

MIDDAY CONFRONTATION INSTRUCTIONS:
This morning, user committed to: "${morningIntention}"
Now they respond: "${userReflection}"

Your job: Compare morning intention vs current reality. Are they still aligned?
Use their exact morning words to create cognitive dissonance if they're drifting.

Example: "Ce matin : '${morningIntention}'. Maintenant : [their current state]. C'est cohérent ?"`;
  }
  
  if (moment === "evening" && morningIntention) {
    systemPrompt += `

EVENING CONFRONTATION INSTRUCTIONS:
This morning, user said this was the priority: "${morningIntention}"
End of day response: "${userReflection}"

Your job: Expose the gap between what they said mattered and what actually happened.
No judgment. Just truth. Use their own words to show the disconnect.

Example: "Ce matin : '${morningIntention}'. Qu'est-ce qui s'est vraiment passé ?"`;
  }
  
  // Add detection alerts
  if (isUserEvasive) {
    systemPrompt += `

⚠️ ALERT: User is making an excuse. Confront it directly by comparing to their morning intention.`;
  }
  
  if (isUserVague) {
    systemPrompt += `

⚠️ ALERT: Response is vague (generic phrases like "beaucoup de choses"). Demand ONE specific thing they accomplished.`;
  }
  
  // Add tone examples
  systemPrompt += `

EXAMPLES OF CORRECT TONE:
❌ "Peux-tu m'en dire plus ?"
✅ "Ce matin tu as dit X. Maintenant Y. Pourquoi ?"

❌ "Je comprends que ce soit difficile."
✅ "Difficile ou pas prioritaire ? Pas la même chose."

❌ "Bravo pour cette clarté !"
✅ "C'est noté. On verra demain."

Respond ONLY in French. Maximum 2 sentences.`;

  return systemPrompt;
}

/**
 * Fallback responses when LLM fails or is too soft
 */
function getFallbackResponse(
  text: string,
  isEvasive: boolean,
  isVague: boolean,
  morningIntention?: string
): string {
  // Vague responses with memory
  if (isVague && morningIntention) {
    return `Ce matin : "${morningIntention}". "Beaucoup de choses" n'est pas une réponse. Quoi exactement ?`;
  }
  
  if (isVague) {
    const responses = [
      "Trop flou. Quelle est LA chose en une phrase ?",
      "Précise. Je ne peux pas challenger du brouillard.",
      '"Beaucoup de choses" = rien de précis. Quoi exactement ?',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Evasive responses with memory
  if (isEvasive && morningIntention) {
    return `Ce matin : "${morningIntention}". Maintenant : des excuses. C'est la vérité ?`;
  }
  
  if (isEvasive) {
    const responses = [
      "Des urgences. Ça fait combien de fois cette semaine ?",
      "Pas eu le temps ou pas choisi de faire le temps ?",
      "Les urgences révèlent tes priorités réelles. C'est quoi ?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Clear responses
  const clearResponses = [
    "C'est noté. On verra ce soir.",
    "Ok. Mais si tu dévies à midi, assume-le.",
    "Bien. Une seule chose. Ne l'oublie pas.",
  ];
  return clearResponses[Math.floor(Math.random() * clearResponses.length)];
}

/**
 * Generate confrontational response using Groq with memory
 */
async function generateResponse(
  userReflection: string,
  subject: string,
  moment: string,
  goal: string,
  todayHistory: Array<{ content: string; moment: string; created_at: string }> | null
): Promise<string> {
  // Input validation
  if (!userReflection || userReflection.trim().length === 0) {
    return "Silence. C'est une réponse aussi. Mais à quelle question ?";
  }
  
  const systemPrompt = buildConfrontationalPrompt(
    userReflection,
    moment,
    goal,
    todayHistory
  );
  
  try {
    const completion = await groq.chat.completions.create({
      model: "groq/compound",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userReflection,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });
    
    const reply = completion.choices[0]?.message?.content?.trim();
    
    // Safety check: ensure LLM didn't become soft
    if (!reply || reply.length === 0) {
      logger.warn("LLM returned empty response, using fallback");
      const morningIntention = todayHistory?.find(r => r.moment === "morning")?.content;
      return getFallbackResponse(
        userReflection,
        isEvasive(userReflection),
        isVague(userReflection),
        morningIntention
      );
    }
    
    if (reply.includes("Merci") || reply.includes("Bravo") || reply.length > 200) {
      logger.warn("LLM response too soft, using fallback");
      const morningIntention = todayHistory?.find(r => r.moment === "morning")?.content;
      return getFallbackResponse(
        userReflection,
        isEvasive(userReflection),
        isVague(userReflection),
        morningIntention
      );
    }
    
    return reply;
    
  } catch (error) {
    logger.error("Groq generation failed", { error });
    const morningIntention = todayHistory?.find(r => r.moment === "morning")?.content;
    return getFallbackResponse(
      userReflection,
      isEvasive(userReflection),
      isVague(userReflection),
      morningIntention
    );
  }
}

/**
 * Main task: Process user reflection and send confrontational response
 */
export const processReflection = task({
  id: "yehoshua-focus-reflection",
  
  run: async (payload: ReflectionPayload, { ctx }) => {
    const { from, email_id, subject } = payload;
    
    console.log("Payload received", payload);
    
    // Retrieve full email content from Resend
    const response = await resend.emails.receiving.get(email_id);
    const { data: fullEmail, error: fetchError } = response;
    
    if (fetchError || !fullEmail) {
      logger.error("Failed to retrieve email content", { email_id, fetchError });
      console.log("Failed to retrieve email content", { email_id, fetchError });
      throw new Error(`Resend fetch failed: ${fetchError?.message}`);
    }
    
    // Extract text, fallback to HTML
    const rawText = (fullEmail as any)?.text ?? (fullEmail as any)?.html ?? "";
    
    // Clean the text to remove email history
    const cleanText = extractUserResponse(rawText);
    
    console.log("User reflection (cleaned)", cleanText);
    
    logger.log("Email content retrieved", { 
      email_id, 
      rawLength: rawText.length,
      cleanLength: cleanText.length 
    });
    
    // Get cognitive context
    const { moment, goal } = getCognitiveContext();
    
    logger.log("Processing reflection", { 
      userEmail: from, 
      moment, 
      goal,
      textLength: cleanText.length 
    });
    
    // Fetch today's memory from Supabase
    const todayStart = new Date().toISOString().split("T")[0];
    const { data: todayHistory, error: dbError } = await supabase
      .from("reflections")
      .select("content, moment, created_at")
      .eq("user_email", from)
      .gte("created_at", todayStart)
      .order("created_at", { ascending: true });
    
    if (dbError) {
      logger.error("Supabase query failed", { dbError });
      console.log("Supabase query failed", { dbError });
    }
    
    logger.log("Memory retrieved", { 
      recordCount: todayHistory?.length || 0,
      hasMorningIntention: todayHistory?.some(r => r.moment === "morning") || false
    });
    
    console.log("Today's history from DB:", todayHistory);
    
    // Generate confrontational response using memory
    const replyMessage = await generateResponse(
      cleanText,
      subject,
      moment,
      goal,
      todayHistory
    );
    
    console.log("Reply generated:", replyMessage);
    
    // Save to Supabase for future confrontations
    const { error: insertError } = await supabase.from("reflections").insert({
      user_email: from,
      content: cleanText,
      subject: subject,
      moment: moment,
      ai_response: replyMessage,
    });
    
    if (insertError) {
      logger.error("Failed to save reflection", { insertError });
      console.log("Failed to save reflection", { insertError });
    }
    
    // Environment check - prevent duplicate emails in dev
    // const isProduction = process.env.NODE_ENV === "production";
    const isProduction = ctx.environment.type === "PRODUCTION";

    console.log("Environment check via CTX:", { 
      envType: ctx.environment.type, 
      isProduction 
    });
    
    if (isProduction) {
      await resend.emails.send({
        from: "Yehoshua Focus <onboarding@resend.dev>",
        to: [from],
        subject: `Re: ${subject}`,
        html: `
          <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; color: #1a1a1a; line-height: 1.6;">
            <p style="text-transform: uppercase; letter-spacing: 2px; color: #888; font-size: 11px; margin-bottom: 20px;">
              Yehoshua Focus // ${moment.toUpperCase()}
            </p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <div style="font-size: 18px; line-height: 1.6; font-style: italic; border-left: 3px solid #000; padding-left: 20px; margin: 30px 0;">
              "${replyMessage}"
            </div>
            ${todayHistory && todayHistory.length > 0 ? `
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px;">
                Mémoire du jour : ${todayHistory.length} réflexion(s)
              </p>
            </div>
            ` : ''}
          </div>
        `,
      });
    } else {
      logger.log("Development Mode: Email skipped", { replyMessage });
      console.log("Development Mode: Email skipped", { replyMessage });
    }
    
    return {
      processed: true,
      reply: replyMessage,
      sent: isProduction,
      memoryCount: todayHistory?.length || 0,
      metrics: {
        wasVague: isVague(cleanText),
        wasEvasive: isEvasive(cleanText),
        responseLength: replyMessage.length,
      },
    };
  },
});