import { schedules } from "@trigger.dev/sdk/v3";
import { Resend } from "resend";

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Yehoshua Focus: Personal Thinking OS
 * Logic: A single task triggered 3 times a day (08:00, 13:00, 19:00).
 * It identifies the context (Morning, Midday, Evening) based on the scheduled hour.
 */
export const processEmail = schedules.task({
  id: "yehoshua-focus-email",
  // Trigger at 08:00, 13:00, and 19:00 every day
  cron: "0 8,12,19 * * *", // "* * * * *", // for testing every minute
  run: async (payload) => {
    const receiver = process.env.RECEIVER_EMAIL;
    if (!receiver) {
      throw new Error("Missing RECEIVER_EMAIL in environment variables.");
    }

    // Determine the scheduled hour to select the right cognitive prompt
    const scheduledDate = payload.timestamp ? new Date(payload.timestamp) : new Date();
    const hour = scheduledDate.getHours();

    // Default: Midday Session (The moment of truth)
    let session = {
      title: "La Vérité",
      subject: "Où en es-tu vraiment ?",
      prompt: "Es-tu toujours aligné avec ton intention du matin ? Quel bruit as-tu laissé entrer ?",
      subtext: "Identifie la distraction. Corrige la trajectoire maintenant."
    };

    // Morning Logic (The focus)
    if (hour >= 6 && hour <= 10) {
      session = {
        title: "L'Intention",
        subject: "Quelle est ta priorité ?",
        prompt: "Quelle est l'unique chose qui mérite ton attention aujourd'hui ? Pourquoi ?",
        subtext: "Définis ton critère de succès pour ce soir."
      };
    } 
    // Evening Logic (The clarity)
    else if (hour >= 18) {
      session = {
        title: "Le Bilan",
        subject: "Qu'as-tu appris ?",
        prompt: "Qu'as-tu appris aujourd'hui ? Qu'est-ce que tu devrais arrêter de répéter ?",
        subtext: "Convertis l'effort du jour en sagesse pour demain."
      };
    }

    // Send the email via Resend
    const { data, error } = await resend.emails.send({
      from: "Yehoshua Focus <onboarding@resend.dev>",
      to: [receiver],
      // Replies are routed to your inbound address for AI processing
      replyTo: "focus@irkoudo.resend.app", 
      subject: `[Yehoshua Focus] ${session.subject}`,
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 600px; color: #1a1a1a; line-height: 1.6;">
          <p style="text-transform: uppercase; letter-spacing: 2px; color: #888; font-size: 11px; margin-bottom: 30px;">
            Yehoshua Focus // Système d'Exploitation de la Pensée
          </p>
          
          <h2 style="font-weight: 400; font-size: 22px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            ${session.title}
          </h2>
          
          <blockquote style="margin: 40px 0; padding-left: 20px; border-left: 3px solid #000; font-size: 18px; font-style: italic;">
            "${session.prompt}"
          </blockquote>
          
          <p style="color: #555;">${session.subtext}</p>
          
          <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #999;">
              Réponds à cet email pour documenter ta clarté. 
              Décider réduit le bruit. Le focus suit.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend delivery failed:", error);
      throw error; // Retrigger task on failure
    }

    return { 
      session: session.title, 
      sentAt: scheduledDate.toISOString(),
      id: data?.id 
    };
  },
});