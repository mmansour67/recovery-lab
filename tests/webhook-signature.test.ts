import { describe, expect, it } from "vitest";
import { computeWebhookSignature, verifyWebhookSignature } from "@/lib/whoop/webhook-signature";

describe("webhook signature verification", () => {
  const secret = "test-client-secret";
  const timestamp = "1751900000";
  const body = JSON.stringify({ user_id: 1, id: "sleep-uuid", type: "recovery.updated", trace_id: "trace-1" });

  it("accepts a correctly computed signature", () => {
    const signature = computeWebhookSignature(timestamp, body, secret);
    expect(verifyWebhookSignature(timestamp, body, signature, secret)).toBe(true);
  });

  it("rejects a tampered body", () => {
    const signature = computeWebhookSignature(timestamp, body, secret);
    const tamperedBody = body.replace("sleep-uuid", "sleep-different");
    expect(verifyWebhookSignature(timestamp, tamperedBody, signature, secret)).toBe(false);
  });

  it("rejects a tampered timestamp", () => {
    const signature = computeWebhookSignature(timestamp, body, secret);
    expect(verifyWebhookSignature("1751900001", body, signature, secret)).toBe(false);
  });

  it("rejects a signature produced with the wrong secret", () => {
    const signature = computeWebhookSignature(timestamp, body, "wrong-secret");
    expect(verifyWebhookSignature(timestamp, body, signature, secret)).toBe(false);
  });

  it("rejects garbage signatures without throwing", () => {
    expect(verifyWebhookSignature(timestamp, body, "not-valid-base64!!", secret)).toBe(false);
  });
});
