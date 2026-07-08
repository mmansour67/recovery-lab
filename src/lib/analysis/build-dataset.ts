export type Condition = "INTERVENTION" | "CONTROL";
export type Adherence = "YES" | "PARTIAL" | "NO";

/**
 * The clean, self-contained input every analysis function accepts. Nothing
 * in lib/analysis ever queries the database directly — that keeps the
 * statistics testable with plain fixtures instead of a live Prisma client.
 */
export interface AnalysisObservation {
  date: string;
  assignedCondition: Condition;
  adherence: Adherence;
  recoveryScore: number;
  dayStrain: number | null;
  weekday: number; // 0 (Sunday) through 6 (Saturday)
}

export interface RawExperimentDay {
  localDate: Date;
  assignedCondition: Condition;
  validityStatus: string;
  checkinAdherence: Adherence | null;
  recoveryScore: number | null;
  dayStrain: number | null;
}

/** Keeps only VALID days and shapes them into AnalysisObservation rows. */
export function buildAnalysisDataset(days: RawExperimentDay[]): AnalysisObservation[] {
  return days
    .filter((day) => day.validityStatus === "VALID" && day.recoveryScore !== null && day.checkinAdherence !== null)
    .map((day) => ({
      date: day.localDate.toISOString().slice(0, 10),
      assignedCondition: day.assignedCondition,
      adherence: day.checkinAdherence as Adherence,
      recoveryScore: day.recoveryScore as number,
      dayStrain: day.dayStrain,
      weekday: day.localDate.getUTCDay(),
    }));
}
