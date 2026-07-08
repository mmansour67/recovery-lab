export type ValidityStatus = "PENDING" | "VALID" | "INVALID" | "MISSING_CHECKIN" | "MISSING_WHOOP_DATA";

export interface CheckinSummary {
  submitted: boolean;
  unusualDay: boolean;
}

export interface WhoopDataSummary {
  hasCompleteWhoopData: boolean;
}

/**
 * A day only counts toward the primary analysis once every input we need is
 * in hand. Adherence itself does NOT affect validity — the primary analysis
 * is intent-to-treat (compares by assignment, not by what the user actually
 * did), so a day the user skipped is still a valid randomized observation.
 */
export function computeValidityStatus(checkin: CheckinSummary, whoop: WhoopDataSummary): ValidityStatus {
  if (!whoop.hasCompleteWhoopData) return "MISSING_WHOOP_DATA";
  if (!checkin.submitted) return "MISSING_CHECKIN";
  if (checkin.unusualDay) return "INVALID";
  return "VALID";
}
