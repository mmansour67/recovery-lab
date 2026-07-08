import { randomBytes } from "node:crypto";
import type { WhoopProfileResponse, WhoopTokenResponse } from "@/types/whoop";

export const WHOOP_AUTHORIZE_URL = "https://api.prod.whoop.com/oauth/oauth2/auth";
export const WHOOP_TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";
export const WHOOP_API_BASE = "https://api.prod.whoop.com/developer";

// read:workout is intentionally omitted until individual workout records are
// actually used — request only the scopes the product needs today.
export const WHOOP_SCOPES = "offline read:profile read:recovery read:cycles read:sleep";

export function generateOAuthState(): string {
  return randomBytes(6).toString("base64url").slice(0, 8);
}

export function buildAuthorizationUrl(state: string): string {
  const url = new URL(WHOOP_AUTHORIZE_URL);
  url.searchParams.set("client_id", process.env.WHOOP_CLIENT_ID!);
  url.searchParams.set("redirect_uri", process.env.WHOOP_REDIRECT_URI!);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", WHOOP_SCOPES);
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeCodeForTokens(code: string): Promise<WhoopTokenResponse> {
  const response = await fetch(WHOOP_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.WHOOP_REDIRECT_URI!,
      client_id: process.env.WHOOP_CLIENT_ID!,
      client_secret: process.env.WHOOP_CLIENT_SECRET!,
    }),
  });

  if (!response.ok) {
    throw new Error(`WHOOP token exchange failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

export async function refreshTokens(refreshToken: string): Promise<WhoopTokenResponse> {
  const response = await fetch(WHOOP_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.WHOOP_CLIENT_ID!,
      client_secret: process.env.WHOOP_CLIENT_SECRET!,
      scope: WHOOP_SCOPES,
    }),
  });

  if (!response.ok) {
    throw new Error(`WHOOP token refresh failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

export async function fetchWhoopProfile(accessToken: string): Promise<WhoopProfileResponse> {
  const response = await fetch(`${WHOOP_API_BASE}/v2/user/profile/basic`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch WHOOP profile: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

export async function revokeWhoopAccess(accessToken: string): Promise<void> {
  await fetch(`${WHOOP_API_BASE}/v2/user/access`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => {
    // Best-effort — local disconnect proceeds regardless (see disconnect route).
  });
}
