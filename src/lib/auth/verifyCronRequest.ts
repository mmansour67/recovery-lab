/** Guards scheduled job endpoints so they can't be triggered by an arbitrary public request. */
export function verifyCronRequest(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  return Boolean(expected) && authHeader === `Bearer ${expected}`;
}
