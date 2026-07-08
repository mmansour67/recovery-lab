import { randomUUID } from "node:crypto";
import { addDays, differenceInCalendarDays } from "date-fns";
import { db } from "@/lib/db";
import { checkExperimentEligibility, type ExperimentDraft } from "./eligibility";
import { generateAssignments } from "./assignments";

export interface CreateExperimentInput {
  userId: string;
  title: string;
  hypothesis: string;
  interventionInstructions: string;
  controlInstructions: string;
  startDate: Date;
  durationDays: number;
}

export type CreateExperimentResult =
  | { ok: true; experimentId: string }
  | { ok: false; errors: string[] };

export async function createExperiment(input: CreateExperimentInput): Promise<CreateExperimentResult> {
  const [activeExperiment, whoopConnection] = await Promise.all([
    db.experiment.findFirst({ where: { userId: input.userId, status: "ACTIVE" } }),
    db.whoopConnection.findUnique({ where: { userId: input.userId } }),
  ]);

  const draft: ExperimentDraft = {
    title: input.title,
    hypothesis: input.hypothesis,
    interventionInstructions: input.interventionInstructions,
    controlInstructions: input.controlInstructions,
    startDate: input.startDate,
    durationDays: input.durationDays,
  };

  const eligibility = checkExperimentEligibility(draft, {
    hasActiveExperiment: Boolean(activeExperiment),
    whoopConnected: Boolean(whoopConnection && !whoopConnection.revokedAt),
    today: new Date(),
  });

  if (!eligibility.valid) {
    return { ok: false, errors: eligibility.errors };
  }

  const seed = randomUUID();
  const conditions = generateAssignments(input.durationDays, seed);
  const endDate = addDays(input.startDate, input.durationDays - 1);

  const experiment = await db.$transaction(async (tx) => {
    const created = await tx.experiment.create({
      data: {
        userId: input.userId,
        title: input.title,
        hypothesis: input.hypothesis,
        interventionInstructions: input.interventionInstructions,
        controlInstructions: input.controlInstructions,
        startDate: input.startDate,
        endDate,
        status: "ACTIVE",
        randomizationSeed: seed,
      },
    });

    await tx.experimentDay.createMany({
      data: conditions.map((condition, index) => ({
        experimentId: created.id,
        localDate: addDays(input.startDate, index),
        assignedCondition: condition,
      })),
    });

    return created;
  });

  return { ok: true, experimentId: experiment.id };
}

/** Sanity check used by callers before persisting: total days must match the schedule length. */
export function expectedDayCount(startDate: Date, endDate: Date): number {
  return differenceInCalendarDays(endDate, startDate) + 1;
}
