// src/api/webhooks/resend/route.ts
// Endpoint that receives incoming emails from Resend and triggers the task

import { tasks } from "@trigger.dev/sdk/v3";
import type { processReflection } from "./../../../../src/trigger/process-reflection";

/**
 * POST /api/resend-webhook
 * Receives incoming email events from Resend
 * Triggers the processReflection task
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    console.log("Resend webhook received:", payload);
    
    // Resend sends events with this structure
    const { type, data } = payload;
    
    // Only process email.received events
    if (type !== "email.received") {
      return new Response(
        JSON.stringify({ message: "Event type ignored" }), 
        { status: 200 }
      );
    }
    
    // Extract email details
    const { from, email_id, subject } = data;
    
    // Validation
    if (!from || !email_id || !subject) {
      console.error("Missing required fields:", { from, email_id, subject });
      return new Response(
        JSON.stringify({ error: "Missing required fields" }), 
        { status: 400 }
      );
    }
    
    // Trigger the background task
    const handle = await tasks.trigger<typeof processReflection>(
      "yehoshua-focus-reflection",
      {
        from,
        email_id,
        subject,
      }
    );
    
    console.log("Task triggered:", handle.id);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        taskId: handle.id 
      }), 
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }), 
      { status: 500 }
    );
  }
}