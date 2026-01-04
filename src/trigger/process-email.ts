// src/trigger/process-email.ts
import { schedules } from "@trigger.dev/sdk/v3";
import { Resend } from "resend";
import { renderYehoshuaFocusEmail, getSessionData } from "../../emails";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Yehoshua Focus: Personal Thinking OS
 * Sends cognitive prompts at 08:00, 12:00, and 19:00 daily
 * Uses React Email templates for clean, maintainable email rendering
 */
export const processEmail = schedules.task({
  id: "yehoshua-focus-email",
  // Trigger at 08:00, 12:00, and 19:00 every day
  cron: "0 8,12,19 * * *",
  run: async (payload) => {
    const receiver = process.env.RECEIVER_EMAIL;
    if (!receiver) {
      throw new Error("Missing RECEIVER_EMAIL in environment variables.");
    }

    // Determine the scheduled hour to select the right cognitive prompt
    const scheduledDate = payload.timestamp
      ? new Date(payload.timestamp)
      : new Date();
    const hour = scheduledDate.getHours();

    // Get session data based on time of day
    const session = getSessionData(hour);

    // Render email using React Email template
    const html = await renderYehoshuaFocusEmail(session);

    // Send the email via Resend
    const { data, error } = await resend.emails.send({
      from: "Yehoshua Focus <onboarding@resend.dev>",
      to: [receiver],
      replyTo: "focus@irkoudo.resend.app",
      subject: `[Yehoshua Focus] ${session.title}`,
      html,
    });

    if (error) {
      console.error("Resend delivery failed:", error);
      throw error; // Retrigger task on failure
    }

    return {
      session: session.title,
      moment: session.moment,
      sentAt: scheduledDate.toISOString(),
      emailId: data?.id,
    };
  },
});