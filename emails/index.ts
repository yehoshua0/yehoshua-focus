// emails/index.ts
import { render } from "@react-email/render";
import YehoshuaFocusEmail from "./yehoshua-focus-template";
import YehoshuaReplyEmail from "./yehoshua-reply-template";

interface SessionData {
  title: string;
  prompt: string;
  subtext: string;
  moment: "morning" | "midday" | "evening";
}

/**
 * Render Yehoshua Focus email to HTML string
 * Used by Trigger.dev tasks to generate email content
 */
export async function renderYehoshuaFocusEmail(
  session: SessionData
): Promise<string> {
  return render(
    YehoshuaFocusEmail({
      title: session.title,
      prompt: session.prompt,
      subtext: session.subtext,
      moment: session.moment,
    })
  );
}

/**
 * Render Yehoshua Reply email (AI confrontational responses)
 * Used by process-reflection.ts
 */
export async function renderYehoshuaReplyEmail(
  replyMessage: string,
  moment: "morning" | "midday" | "evening",
  memoryCount?: number
): Promise<string> {
  return render(
    YehoshuaReplyEmail({
      replyMessage,
      moment,
      memoryCount,
    })
  );
}

/**
 * Get session data based on hour
 * Extracted from process-email.ts for reusability
 */
export function getSessionData(
  hour: number
): SessionData {
  // Morning Logic (6-10)
  if (hour >= 6 && hour <= 10) {
    return {
      title: "L'Intention",
      prompt: "Quelle est l'unique chose qui mérite ton attention aujourd'hui ? Pourquoi ?",
      subtext: "Définis ton critère de succès pour ce soir.",
      moment: "morning",
    };
  }

  // Evening Logic (18+)
  if (hour >= 18) {
    return {
      title: "Le Bilan",
      prompt: "Qu'as-tu appris aujourd'hui ? Qu'est-ce que tu devrais arrêter de répéter ?",
      subtext: "Convertis l'effort du jour en sagesse pour demain.",
      moment: "evening",
    };
  }

  // Midday Logic (default: 11-17)
  return {
    title: "La Vérité",
    prompt: "Es-tu toujours aligné avec ton intention du matin ? Quel bruit as-tu laissé entrer ?",
    subtext: "Identifie la distraction. Corrige la trajectoire maintenant.",
    moment: "midday",
  };
}