import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth/getCurrentUser";
import { db } from "@/lib/db";
import { decryptToken } from "@/lib/crypto/token-encryption";
import { revokeWhoopAccess } from "@/lib/whoop/oauth";

// Revokes WHOOP API access without deleting previously synced data, so
// results for experiments that already finished remain viewable. Full data
// deletion is a separate, explicit action (see settings/actions.ts).
export async function POST() {
  const user = await requireCurrentUser();

  const connection = await db.whoopConnection.findUnique({ where: { userId: user.id } });
  if (connection && !connection.revokedAt) {
    await revokeWhoopAccess(decryptToken(connection.accessTokenEncrypted));
    await db.whoopConnection.update({ where: { userId: user.id }, data: { revokedAt: new Date() } });
  }

  return NextResponse.redirect(new URL("/dashboard", process.env.NEXT_PUBLIC_APP_URL));
}
