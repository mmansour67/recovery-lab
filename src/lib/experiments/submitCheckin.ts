import { differenceInCalendarDays } from "date-fns";
import { db } from "@/lib/db";
import { localDateString } from "./timezone";
import { recomputeDayValidity } from "./recomputeDayValidity";

const EDIT_WINDOW_DAYS = 1; // a check-in can be submitted for today or backfilled for yesterday

export interface SubmitCheckinInput {
  experimentDayId: string;
  userId: string;
  timezone: string;
  adherence: "YES" | "PARTIAL" | "NO";
  unusualDay: boolean;
  unusualDayReason?: string;
  notes?: string;
}

export type SubmitCheckinResult = { ok: true } | { ok: false; error: string };

export async function submitCheckin(input: SubmitCheckinInput): Promise<SubmitCheckinResult> {
  const experimentDay = await db.experimentDay.findUnique({
    where: { id: input.experimentDayId },
    include: { experiment: true },
  });

  if (!experimentDay || experimentDay.experiment.userId !== input.userId) {
    return { ok: false, error: "Assignment not found." };
  }

  const today = localDateString(new Date(), input.timezone);
  const dayString = experimentDay.localDate.toISOString().slice(0, 10);
  const daysSince = differenceInCalendarDays(new Date(`${today}T00:00:00.000Z`), experimentDay.localDate);

  if (daysSince < 0 || daysSince > EDIT_WINDOW_DAYS) {
    return { ok: false, error: `Check-ins can only be submitted for ${dayString} within one day of that date.` };
  }

  await db.dailyCheckin.upsert({
    where: { experimentDayId: input.experimentDayId },
    update: {
      adherence: input.adherence,
      unusualDay: input.unusualDay,
      unusualDayReason: input.unusualDayReason ?? null,
      notes: input.notes ?? null,
      submittedAt: new Date(),
    },
    create: {
      experimentDayId: input.experimentDayId,
      adherence: input.adherence,
      unusualDay: input.unusualDay,
      unusualDayReason: input.unusualDayReason ?? null,
      notes: input.notes ?? null,
    },
  });

  await recomputeDayValidity(input.experimentDayId);

  return { ok: true };
}
