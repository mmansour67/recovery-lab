import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyCronRequest } from "@/lib/auth/verifyCronRequest";
import { reconcileWhoopData } from "@/lib/whoop/sync";

/**
 * Daily safety net: re-fetches the last few days for every connected user,
 * independent of whether their webhooks arrived. Protects against WHOOP
 * webhook deliveries that were dropped, delayed, or never sent.
 */
export async function POST(request: Request) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connections = await db.whoopConnection.findMany({ where: { revokedAt: null } });

  let succeeded = 0;
  let failed = 0;

  for (const connection of connections) {
    try {
      await reconcileWhoopData(connection.userId);
      succeeded++;
    } catch (error) {
      console.error(`Reconciliation failed for user ${connection.userId}`, error);
      failed++;
    }
  }

  return NextResponse.json({ succeeded, failed, total: connections.length });
}
