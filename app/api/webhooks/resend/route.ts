// Exemple pour Next.js (app/api/webhooks/resend/route.ts)
import { tasks } from "@trigger.dev/sdk/v3";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const payload = await req.json();

  // On lance la tâche Trigger.dev avec les données de l'email
  // Resend envoie les données dans payload.data
  await tasks.trigger("yehoshua-focus-reflection", {
    from: payload.data.from,
    text: payload.data.text,
    subject: payload.data.subject,
  });

  return NextResponse.json({ processed: true });
}