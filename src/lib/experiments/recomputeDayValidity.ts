import { db } from "@/lib/db";
import { computeValidityStatus } from "./validity";

/** Re-derives and persists validity_status for one experiment day from its current checkin + WHOOP links. */
export async function recomputeDayValidity(experimentDayId: string): Promise<void> {
  const day = await db.experimentDay.findUnique({
    where: { id: experimentDayId },
    include: { checkin: true },
  });
  if (!day) return;

  const validityStatus = computeValidityStatus(
    { submitted: Boolean(day.checkin), unusualDay: day.checkin?.unusualDay ?? false },
    { hasCompleteWhoopData: Boolean(day.mainSleepId && day.recoveryId) }
  );

  const invalidReason =
    validityStatus === "INVALID" ? day.checkin?.unusualDayReason ?? "Reported as an unusual day" : null;

  await db.experimentDay.update({
    where: { id: experimentDayId },
    data: { validityStatus, invalidReason },
  });
}
