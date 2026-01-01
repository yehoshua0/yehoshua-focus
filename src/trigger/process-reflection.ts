// src/trigger/process-reflection.ts
import { logger, task } from "@trigger.dev/sdk/v3";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const processReflection = task({
  id: "yehoshua-focus-reflection",
  run: async (payload: any) => {
    /**
     * Extract the reflection sent by the user
     * Resend delivers inbound emails through a JSON webhook
     */
    const userEmail = payload.from;
    const userReflection = payload.text;
    const subject = payload.subject;

    logger.log("Reflection received", { userEmail, userReflection });

    /**
     * MVP-level analysis
     * For now, we only check whether the response is vague or substantive.
     * This will later be replaced by a Socratic / LLM-based analysis.
     */
    const isVague = !userReflection || userReflection.trim().length < 20;

    let replyMessage = "";
    if (isVague) {
      replyMessage =
        "Ta réponse est courte. Est-ce parce que c'est clair, ou parce que tu évites de regarder le problème en face ?";
    } else {
      replyMessage =
        "Bien. J'ai enregistré cette intention. Je te relancerai à midi pour voir si tes actions suivent tes mots.";
    }

    /**
     * Send a response from Yehoshua Focus
     * This creates the feedback loop that makes the system alive.
     */
    await resend.emails.send({
      from: "Yehoshua Focus <focus@resend.dev>",
      to: [userEmail],
      subject: `Re: ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
          <p style="text-transform: uppercase; letter-spacing: 1px; color: #666; font-size: 12px;">
            Yehoshua Focus // Reflection
          </p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 16px; line-height: 1.6;">
            ${replyMessage}
          </p>
        </div>
      `,
    });

    return { processed: true };
  },
});
