import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCurrentUser } from "@/lib/auth/getCurrentUser";
import { submitCheckin } from "@/lib/experiments/submitCheckin";

const checkinSchema = z.object({
  experimentDayId: z.string().min(1),
  adherence: z.enum(["YES", "PARTIAL", "NO"]),
  unusualDay: z.boolean().default(false),
  unusualDayReason: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const user = await requireCurrentUser();
  const body = await request.json();

  const parsed = checkinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.issues.map((i) => i.message) }, { status: 400 });
  }

  const result = await submitCheckin({ ...parsed.data, userId: user.id, timezone: user.timezone });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json({ ok: true });
}
