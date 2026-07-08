import { after, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireCurrentUser } from "@/lib/auth/getCurrentUser";
import { db } from "@/lib/db";
import { encryptToken } from "@/lib/crypto/token-encryption";
import { exchangeCodeForTokens, fetchWhoopProfile, WHOOP_SCOPES } from "@/lib/whoop/oauth";
import { backfillWhoopData } from "@/lib/whoop/sync";
import { OAUTH_STATE_COOKIE } from "../connect/route";

export async function GET(request: Request) {
  const user = await requireCurrentUser();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(OAUTH_STATE_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/dashboard?whoopError=invalid_state", url.origin));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const profile = await fetchWhoopProfile(tokens.access_token);

    await db.whoopConnection.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        whoopUserId: String(profile.user_id),
        accessTokenEncrypted: encryptToken(tokens.access_token),
        refreshTokenEncrypted: encryptToken(tokens.refresh_token),
        tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        grantedScopes: WHOOP_SCOPES.split(" "),
      },
      update: {
        whoopUserId: String(profile.user_id),
        accessTokenEncrypted: encryptToken(tokens.access_token),
        refreshTokenEncrypted: encryptToken(tokens.refresh_token),
        tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        grantedScopes: WHOOP_SCOPES.split(" "),
        revokedAt: null,
      },
    });

    // Runs after the redirect is sent so the user isn't stuck waiting on 45
    // days of API calls. The reconciliation cron job covers anything this
    // misses if the serverless function is recycled before it finishes.
    after(() =>
      backfillWhoopData(user.id).catch((error) => {
        console.error("WHOOP backfill failed after connect", error);
      })
    );

    return NextResponse.redirect(new URL("/dashboard", url.origin));
  } catch (error) {
    console.error("WHOOP OAuth callback failed", error);
    return NextResponse.redirect(new URL("/dashboard?whoopError=connection_failed", url.origin));
  }
}
