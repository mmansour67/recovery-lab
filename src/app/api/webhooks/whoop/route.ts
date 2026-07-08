import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/whoop/webhook-signature";
import type { WhoopWebhookEventType, WhoopWebhookPayload } from "@/types/whoop";

const EVENT_TYPE_MAP: Record<WhoopWebhookEventType, string> = {
  "sleep.updated": "SLEEP_UPDATED",
  "sleep.deleted": "SLEEP_DELETED",
  "recovery.updated": "RECOVERY_UPDATED",
  "recovery.deleted": "RECOVERY_DELETED",
  "workout.updated": "WORKOUT_UPDATED",
  "workout.deleted": "WORKOUT_DELETED",
};

/**
 * Receives WHOOP webhooks. This route does the minimum possible work —
 * verify the signature, record the event, return 200 — and lets the
 * scheduled processor (api/jobs/process-webhooks) do the actual API calls.
 * WHOOP retries failed webhooks for about an hour and expects a fast 200,
 * so anything slower than a DB insert doesn't belong in this handler.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("X-WHOOP-Signature");
  const timestamp = request.headers.get("X-WHOOP-Signature-Timestamp");
  const clientSecret = process.env.WHOOP_CLIENT_SECRET;

  if (!signature || !timestamp || !clientSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  if (!verifyWebhookSignature(timestamp, rawBody, signature, clientSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: WhoopWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = EVENT_TYPE_MAP[payload.type];
  if (!eventType) {
    return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
  }

  try {
    await db.webhookEvent.create({
      data: {
        traceId: String(payload.trace_id),
        whoopUserId: String(payload.user_id),
        objectId: String(payload.id),
        eventType: eventType as never,
      },
    });
  } catch (error) {
    // Unique constraint on traceId — WHOOP already sent this one. Treat as
    // success so WHOOP doesn't keep retrying a duplicate.
    if (!(error instanceof Error) || !error.message.includes("Unique constraint")) {
      throw error;
    }
  }

  return NextResponse.json({ ok: true });
}
