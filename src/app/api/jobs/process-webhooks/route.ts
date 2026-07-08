import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyCronRequest } from "@/lib/auth/verifyCronRequest";
import { reconcileWhoopData, softDeleteRecovery, softDeleteSleep, syncSingleSleep } from "@/lib/whoop/sync";

const BATCH_SIZE = 25;
const MAX_ATTEMPTS = 5;

/**
 * Runs on a schedule (Supabase Cron / Vercel Cron hitting this route) and
 * drains webhook_events acting as a simple durable queue. Kept as a
 * database-table queue rather than a real message broker deliberately — at
 * ten users, the extra infrastructure isn't worth the operational cost yet.
 */
export async function POST(request: Request) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await db.webhookEvent.findMany({
    where: { status: { in: ["PENDING", "FAILED"] }, attemptCount: { lt: MAX_ATTEMPTS } },
    orderBy: { receivedAt: "asc" },
    take: BATCH_SIZE,
  });

  let processed = 0;
  let failed = 0;

  for (const event of events) {
    await db.webhookEvent.update({ where: { id: event.id }, data: { status: "PROCESSING" } });

    try {
      const user = await db.user.findFirst({
        where: { whoopConnection: { whoopUserId: event.whoopUserId } },
      });
      if (!user) throw new Error(`No user found for WHOOP user ${event.whoopUserId}`);

      switch (event.eventType) {
        case "SLEEP_UPDATED":
          await syncSingleSleep(user.id, event.objectId);
          break;
        case "SLEEP_DELETED":
          await softDeleteSleep(event.objectId);
          break;
        case "RECOVERY_UPDATED":
          // Recovery has no standalone single-record endpoint in v2 — a
          // short reconciliation window covers the affected night reliably.
          await reconcileWhoopData(user.id);
          break;
        case "RECOVERY_DELETED":
          await softDeleteRecovery(event.objectId);
          break;
        case "WORKOUT_UPDATED":
        case "WORKOUT_DELETED":
          // Not consumed by any analysis yet — acknowledge and move on.
          break;
      }

      await db.webhookEvent.update({
        where: { id: event.id },
        data: { status: "COMPLETED", processedAt: new Date(), attemptCount: { increment: 1 } },
      });
      processed++;
    } catch (error) {
      const attemptCount = event.attemptCount + 1;
      await db.webhookEvent.update({
        where: { id: event.id },
        data: {
          status: attemptCount >= MAX_ATTEMPTS ? "FAILED" : "PENDING",
          attemptCount,
          lastError: error instanceof Error ? error.message : String(error),
        },
      });
      failed++;
    }
  }

  return NextResponse.json({ processed, failed, remaining: events.length - processed - failed });
}
