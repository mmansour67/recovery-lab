import { db } from "@/lib/db";
import { linkDayToWhoopData } from "./link-whoop-data";
import { computeValidityStatus } from "./validity";
import { localDateString } from "./timezone";

/**
 * Re-derives mainSleepId/recoveryId/validityStatus for every day of a user's
 * active experiment(s) from the WHOOP data currently on file. Called after
 * any backfill, webhook-driven upsert, or reconciliation pass — WHOOP data
 * can arrive out of order relative to the day it belongs to.
 */
export async function relinkExperimentDaysForUser(userId: string): Promise<void> {
  const [user, experiments] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.experiment.findMany({
      where: { userId, status: "ACTIVE" },
      include: { experimentDays: { include: { checkin: true } } },
    }),
  ]);
  if (!user || experiments.length === 0) return;

  const [sleeps, recoveriesRaw] = await Promise.all([
    db.whoopSleep.findMany({ where: { userId, deletedAt: null } }),
    db.whoopRecovery.findMany({ where: { userId, deletedAt: null } }),
  ]);
  const recoveries = recoveriesRaw.map((r) => ({ ...r, sleepId: r.whoopSleepId }));

  for (const experiment of experiments) {
    for (const day of experiment.experimentDays) {
      const localDate = localDateString(day.localDate, user.timezone);
      const link = linkDayToWhoopData(localDate, sleeps, recoveries);

      const validityStatus = computeValidityStatus(
        { submitted: Boolean(day.checkin), unusualDay: day.checkin?.unusualDay ?? false },
        { hasCompleteWhoopData: link.hasCompleteWhoopData }
      );

      if (
        link.mainSleepId === day.mainSleepId &&
        link.recoveryId === day.recoveryId &&
        validityStatus === day.validityStatus
      ) {
        continue; // nothing changed — skip the write
      }

      await db.experimentDay.update({
        where: { id: day.id },
        data: {
          mainSleepId: link.mainSleepId,
          recoveryId: link.recoveryId,
          validityStatus,
          invalidReason:
            validityStatus === "INVALID" ? day.checkin?.unusualDayReason ?? "Reported as an unusual day" : null,
        },
      });
    }
  }
}
