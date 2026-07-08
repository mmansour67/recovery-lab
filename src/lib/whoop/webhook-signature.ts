import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * WHOOP signs webhooks as base64(HMAC_SHA256(timestamp + rawBody, clientSecret)).
 * Always verify against the raw request body — parsing to JSON first and
 * re-serializing can change byte-for-byte formatting and break the signature.
 */
export function computeWebhookSignature(timestamp: string, rawBody: string, clientSecret: string): string {
  return createHmac("sha256", clientSecret).update(timestamp + rawBody).digest("base64");
}

export function verifyWebhookSignature(
  timestamp: string,
  rawBody: string,
  receivedSignature: string,
  clientSecret: string
): boolean {
  const expected = computeWebhookSignature(timestamp, rawBody, clientSecret);

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(receivedSignature);
  if (expectedBuffer.length !== receivedBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}
