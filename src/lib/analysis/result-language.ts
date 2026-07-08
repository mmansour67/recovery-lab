export type ConfidenceLabel = "INSUFFICIENT" | "LOW" | "MODERATE" | "HIGHER";

export interface ConfidenceInput {
  validDayCount: number;
  interventionDayCount: number;
  controlDayCount: number;
  adherenceRate: number; // 0..1
  unadjustedEffect: number;
  adjustedEffect: number | null;
}

const MIN_DAYS_PER_CONDITION_SUFFICIENT = 5;
const POOR_ADHERENCE_THRESHOLD = 0.6;
const STRONG_ADHERENCE_THRESHOLD = 0.85;
const BALANCED_GROUP_MAX_DIFFERENCE = 2;

function resultsAreStableAcrossAnalyses(unadjusted: number, adjusted: number | null): boolean {
  if (adjusted === null) return false;
  const sameSign = Math.sign(unadjusted) === Math.sign(adjusted) || unadjusted === 0 || adjusted === 0;
  const withinRange = Math.abs(adjusted - unadjusted) <= Math.abs(unadjusted) + 1e-9;
  return sameSign && withinRange;
}

/**
 * These labels are product communication rules for how loudly to state a
 * result, not medically validated statistical categories — that distinction
 * matters for how the UI and any marketing copy describes them.
 */
export function computeConfidenceLabel(input: ConfidenceInput): ConfidenceLabel {
  const minDaysPerCondition = Math.min(input.interventionDayCount, input.controlDayCount);
  const groupsBalanced =
    Math.abs(input.interventionDayCount - input.controlDayCount) <= BALANCED_GROUP_MAX_DIFFERENCE;

  if (input.validDayCount < 12 || minDaysPerCondition < MIN_DAYS_PER_CONDITION_SUFFICIENT) {
    return "INSUFFICIENT";
  }

  if (
    input.validDayCount >= 28 &&
    input.adherenceRate >= STRONG_ADHERENCE_THRESHOLD &&
    resultsAreStableAcrossAnalyses(input.unadjustedEffect, input.adjustedEffect)
  ) {
    return "HIGHER";
  }

  if (input.validDayCount >= 18 && input.adherenceRate >= POOR_ADHERENCE_THRESHOLD && groupsBalanced) {
    return "MODERATE";
  }

  return "LOW";
}

const CONFIDENCE_INTERPRETATION: Record<ConfidenceLabel, string> = {
  INSUFFICIENT: "Not enough valid days yet to say anything meaningful. Keep going.",
  LOW: "An early signal, but the experiment is not yet conclusive.",
  MODERATE: "Possible benefit, but the experiment is not yet conclusive.",
  HIGHER: "A consistent signal across a full experiment, though still one person's data.",
};

export function confidenceInterpretation(label: ConfidenceLabel): string {
  return CONFIDENCE_INTERPRETATION[label];
}

export interface ResultNarrativeInput {
  experimentTitle: string;
  unadjustedEffect: number;
  confidenceIntervalLow: number;
  confidenceIntervalHigh: number;
  validDayCount: number;
  label: ConfidenceLabel;
}

function formatSigned(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return rounded >= 0 ? `+${rounded}` : `${rounded}`;
}

/** Produces the honest, hedge-forward sentence the results screen shows the user. */
export function buildResultNarrative(input: ResultNarrativeInput): string {
  const direction = input.unadjustedEffect >= 0 ? "higher" : "lower";
  const magnitude = Math.abs(Math.round(input.unadjustedEffect * 10) / 10);

  return (
    `On days assigned to "${input.experimentTitle}", your next-morning recovery averaged ` +
    `${magnitude} points ${direction} than on control days. The estimated range is ` +
    `${formatSigned(input.confidenceIntervalLow)} to ${formatSigned(input.confidenceIntervalHigh)} points ` +
    `across ${input.validDayCount} valid days. ${confidenceInterpretation(input.label)}`
  );
}
