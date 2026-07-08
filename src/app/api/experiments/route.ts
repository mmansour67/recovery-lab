import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCurrentUser } from "@/lib/auth/getCurrentUser";
import { createExperiment } from "@/lib/experiments/createExperiment";
import { utcMidnightFromDateString } from "@/lib/experiments/timezone";

const createExperimentSchema = z.object({
  title: z.string().min(1),
  hypothesis: z.string().min(1),
  interventionInstructions: z.string().min(1),
  controlInstructions: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  durationDays: z.number().int(),
});

export async function POST(request: Request) {
  const user = await requireCurrentUser();
  const body = await request.json();

  const parsed = createExperimentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.issues.map((i) => i.message) }, { status: 400 });
  }

  const result = await createExperiment({
    userId: user.id,
    title: parsed.data.title,
    hypothesis: parsed.data.hypothesis,
    interventionInstructions: parsed.data.interventionInstructions,
    controlInstructions: parsed.data.controlInstructions,
    startDate: utcMidnightFromDateString(parsed.data.startDate),
    durationDays: parsed.data.durationDays,
  });

  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 422 });
  }

  return NextResponse.json({ experimentId: result.experimentId }, { status: 201 });
}
