// Maps each experiment day to the WHOOP sleep/recovery that resulted from
// that day's behavior. See spec section 6: the outcome for a given local
// date is the recovery produced by the sleep that BEGAN that night, not the
// recovery that was already showing that morning.

export type ScoreState = "SCORED" | "PENDING_SCORE" | "UNSCORABLE";

export interface SleepRecord {
  id: string;
  startTime: Date;
  timezoneOffset: string;
  isNap: boolean;
  scoreState: ScoreState;
  totalInBedMs: number | null;
}

export interface RecoveryRecord {
  id: string;
  sleepId: string | null;
  scoreState: ScoreState;
  userCalibrating: boolean;
}

/** Parses a WHOOP-style offset like "+00:00" or "-05:00" into minutes. */
function parseOffsetMinutes(timezoneOffset: string): number {
  const match = /^([+-])(\d{2}):(\d{2})$/.exec(timezoneOffset.trim());
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3]);
  return sign * (hours * 60 + minutes);
}

/** Local calendar date (YYYY-MM-DD) on which a sleep began, in its recorded timezone. */
export function localDateFromSleepStart(startTime: Date, timezoneOffset: string): string {
  const offsetMinutes = parseOffsetMinutes(timezoneOffset);
  const local = new Date(startTime.getTime() + offsetMinutes * 60_000);
  const y = local.getUTCFullYear();
  const m = String(local.getUTCMonth() + 1).padStart(2, "0");
  const d = String(local.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isEligibleSleep(sleep: SleepRecord): boolean {
  return !sleep.isNap && sleep.scoreState === "SCORED";
}

/**
 * Finds the sleep that began on the given local date. If more than one
 * qualifying sleep starts on the same local date, the longest one (by time
 * in bed) is treated as the main sleep.
 */
export function findMainSleepForDate(sleeps: SleepRecord[], localDate: string): SleepRecord | null {
  const candidates = sleeps.filter(
    (sleep) => isEligibleSleep(sleep) && localDateFromSleepStart(sleep.startTime, sleep.timezoneOffset) === localDate
  );

  if (candidates.length === 0) return null;

  return candidates.reduce((longest, current) =>
    (current.totalInBedMs ?? 0) > (longest.totalInBedMs ?? 0) ? current : longest
  );
}

export function findRecoveryForSleep(recoveries: RecoveryRecord[], sleepId: string): RecoveryRecord | null {
  const recovery = recoveries.find((r) => r.sleepId === sleepId) ?? null;
  if (!recovery) return null;
  if (recovery.scoreState !== "SCORED") return null;
  if (recovery.userCalibrating) return null;
  return recovery;
}

export interface WhoopLinkResult {
  mainSleepId: string | null;
  recoveryId: string | null;
  hasCompleteWhoopData: boolean;
}

export function linkDayToWhoopData(
  localDate: string,
  sleeps: SleepRecord[],
  recoveries: RecoveryRecord[]
): WhoopLinkResult {
  const mainSleep = findMainSleepForDate(sleeps, localDate);
  if (!mainSleep) {
    return { mainSleepId: null, recoveryId: null, hasCompleteWhoopData: false };
  }

  const recovery = findRecoveryForSleep(recoveries, mainSleep.id);
  if (!recovery) {
    return { mainSleepId: mainSleep.id, recoveryId: null, hasCompleteWhoopData: false };
  }

  return { mainSleepId: mainSleep.id, recoveryId: recovery.id, hasCompleteWhoopData: true };
}
