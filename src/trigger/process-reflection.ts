// src/trigger/process-reflection.ts
import { logger, task } from "@trigger.dev/sdk/v3";
import { Resend } from "resend";
import Groq from "groq-sdk";

const resend = new Resend(process.env.RESEND_API_KEY);
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface ReflectionPayload {
  from: string;
  text: string;
  subject: string;
}

export const processReflection = task({
  id: "yehoshua-focus-reflection",
  run: async (payload: ReflectionPayload) => {
    /**
     * Extract the reflection sent by the user
     * Resend delivers inbound emails through a JSON webhook
     */
    const userEmail = payload.from;
    const userReflection = payload.text;
    const subject = payload.subject;

    logger.log("Reflection received", { userEmail, userReflection });

    /**
     * Groq / LLM Analysis
     * We use a strong open-weight model to analyze the user's intent.
     * The goal is to be Socratic: question the user, ensuring clarity.
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
8. Si c'est clair et actionnable → valide sobrement

EXEMPLES DE TON :
❌ "Peux-tu m'en dire plus sur ce qui t'a empêché ?"
✅ "Des urgences. C'est la 3e fois cette semaine. Est-ce vraiment imprévu ou c'est toi qui choisis le chaos ?"

❌ "Je comprends que ce soit difficile."
✅ "Difficile ou pas prioritaire ? Les deux ne sont pas la même chose."

❌ "Bravo pour cette clarté !"
✅ "C'est noté. On verra demain si tu le fais vraiment.`,
          },
          {
            role: "user",
            content: `Sujet: ${subject}\n\nMessage: ${userReflection}`,
          },
        ],
        model: "groq/compound", // User requested this specific model
        temperature: 0.5,
        max_tokens: 150,
      });

      replyMessage = completion.choices[0]?.message?.content || 
        "C'est noté. Mais es-tu sûr que c'est l'essentiel ?";
        
    } catch (error) {
      logger.error("Groq generation failed", { error });
      // Fallback if AI fails
      const isVague = !userReflection || userReflection.trim().length < 20;
      if (isVague) {
        replyMessage = "Ta réponse est courte. Est-ce par clarté ou par évitement ?";
      } else {
        replyMessage = "Bien. J'ai enregistré cette intention.";
      }
    }

    /**
     * Send a response from Yehoshua Focus
     * This creates the feedback loop that makes the system alive.
     */
    await resend.emails.send({
      from: "Yehoshua Focus <onboarding@resend.dev>",
      to: [userEmail],
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

    return { processed: true, reply: replyMessage };
  },
});
