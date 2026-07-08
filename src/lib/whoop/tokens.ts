import { db } from "@/lib/db";
import { decryptToken, encryptToken } from "@/lib/crypto/token-encryption";
import { refreshTokens } from "./oauth";

const EXPIRY_BUFFER_MS = 5 * 60 * 1000; // refresh 5 minutes before actual expiry
const LOCK_TIMEOUT_MS = 30 * 1000; // a stuck lock is considered abandoned after 30s
const LOCK_POLL_INTERVAL_MS = 500;
const LOCK_POLL_ATTEMPTS = 20;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Returns a usable WHOOP access token for the user, refreshing it first if
 * it's near expiry. WHOOP rotates the refresh token on every use — the old
 * one becomes invalid immediately — so only one refresh may run at a time
 * per connection. Concurrent callers block on `refreshLockedAt` rather than
 * each firing their own refresh request, which would race and strand one of
 * them with an already-invalidated refresh token.
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  let connection = await db.whoopConnection.findUnique({ where: { userId } });
  if (!connection || connection.revokedAt) {
    throw new Error("No active WHOOP connection for this user");
  }

  if (connection.tokenExpiresAt.getTime() - EXPIRY_BUFFER_MS > Date.now()) {
    return decryptToken(connection.accessTokenEncrypted);
  }

  for (let attempt = 0; attempt < LOCK_POLL_ATTEMPTS; attempt++) {
    const lockCutoff = new Date(Date.now() - LOCK_TIMEOUT_MS);

    const acquired = await db.whoopConnection.updateMany({
      where: {
        userId,
        OR: [{ refreshLockedAt: null }, { refreshLockedAt: { lt: lockCutoff } }],
      },
      data: { refreshLockedAt: new Date() },
    });

    if (acquired.count === 0) {
      // Someone else is refreshing right now — wait for them to finish and re-read.
      await sleep(LOCK_POLL_INTERVAL_MS);
      connection = await db.whoopConnection.findUnique({ where: { userId } });
      if (!connection) throw new Error("WHOOP connection disappeared during refresh wait");
      if (connection.tokenExpiresAt.getTime() - EXPIRY_BUFFER_MS > Date.now()) {
        return decryptToken(connection.accessTokenEncrypted);
      }
      continue;
    }

    // Lock acquired. Re-check expiry in case another process just refreshed
    // before we got here.
    connection = await db.whoopConnection.findUnique({ where: { userId } });
    if (!connection) throw new Error("WHOOP connection disappeared during refresh");
    if (connection.tokenExpiresAt.getTime() - EXPIRY_BUFFER_MS > Date.now()) {
      await db.whoopConnection.update({ where: { userId }, data: { refreshLockedAt: null } });
      return decryptToken(connection.accessTokenEncrypted);
    }

    try {
      const refreshToken = decryptToken(connection.refreshTokenEncrypted);
      const tokens = await refreshTokens(refreshToken);

      await db.whoopConnection.update({
        where: { userId },
        data: {
          accessTokenEncrypted: encryptToken(tokens.access_token),
          refreshTokenEncrypted: encryptToken(tokens.refresh_token),
          tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
          refreshLockedAt: null,
        },
      });

      return tokens.access_token;
    } catch (error) {
      await db.whoopConnection.update({ where: { userId }, data: { refreshLockedAt: null } });
      throw error;
    }
  }

  throw new Error("Timed out waiting for WHOOP token refresh");
}
