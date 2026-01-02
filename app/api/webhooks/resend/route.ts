// Example for Next.js (app/api/webhooks/resend/route.ts)
import { tasks } from "@trigger.dev/sdk/v3";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const payload = await req.json();

  // We launch Trigger.dev task with email data
  // Resend sends the data in payload.data
  await tasks.trigger("yehoshua-focus-reflection", {
    from: payload.data.from,
    email_id: payload.data.email_id,
    subject: payload.data.subject,
  });

  return NextResponse.json({ processed: true });
}

export async function GET() {
  // Simple response to validate the endpoint during Resend checks
  return NextResponse.json({ status: "ok", message: "Webhook endpoint ready" });
}