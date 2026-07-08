import { beforeAll, describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";

beforeAll(() => {
  process.env.TOKEN_ENCRYPTION_KEY = randomBytes(32).toString("base64");
});

describe("token encryption", () => {
  it("round-trips a token through encrypt/decrypt", async () => {
    const { encryptToken, decryptToken } = await import("@/lib/crypto/token-encryption");
    const plaintext = "whoop-access-token-abc123";
    const encrypted = encryptToken(plaintext);
    expect(encrypted).not.toContain(plaintext);
    expect(decryptToken(encrypted)).toBe(plaintext);
  });

  it("produces different ciphertext for the same plaintext (random IV)", async () => {
    const { encryptToken } = await import("@/lib/crypto/token-encryption");
    const a = encryptToken("same-token");
    const b = encryptToken("same-token");
    expect(a).not.toBe(b);
  });

  it("fails to decrypt if the ciphertext has been tampered with", async () => {
    const { encryptToken, decryptToken } = await import("@/lib/crypto/token-encryption");
    const encrypted = encryptToken("some-token");
    const buffer = Buffer.from(encrypted, "base64");
    buffer[buffer.length - 1] ^= 0xff;
    expect(() => decryptToken(buffer.toString("base64"))).toThrow();
  });
});
