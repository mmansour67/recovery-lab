import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireCurrentUser } from "@/lib/auth/getCurrentUser";
import { buildAuthorizationUrl, generateOAuthState } from "@/lib/whoop/oauth";

export const OAUTH_STATE_COOKIE = "whoop_oauth_state";
const STATE_TTL_SECONDS = 10 * 60;

export async function GET() {
  await requireCurrentUser();

  const state = generateOAuthState();
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: STATE_TTL_SECONDS,
    path: "/",
  });

  return NextResponse.redirect(buildAuthorizationUrl(state));
}
