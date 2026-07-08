export const MIN_DURATION_DAYS = 14;
export const MAX_DURATION_DAYS = 42;

export interface ExperimentDraft {
  title: string;
  hypothesis: string;
  interventionInstructions: string;
  controlInstructions: string;
  startDate: Date;
  durationDays: number;
}

export interface EligibilityContext {
  hasActiveExperiment: boolean;
  whoopConnected: boolean;
  today: Date;
}

export interface EligibilityResult {
  valid: boolean;
  errors: string[];
}

function isSameOrAfterDay(date: Date, reference: Date): boolean {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const r = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate()));
  return d.getTime() >= r.getTime();
}

export function checkExperimentEligibility(
  draft: ExperimentDraft,
  context: EligibilityContext
): EligibilityResult {
  const errors: string[] = [];

  if (draft.durationDays % 2 !== 0) {
    errors.push("Duration must be an even number of days.");
  }

  if (draft.durationDays < MIN_DURATION_DAYS || draft.durationDays > MAX_DURATION_DAYS) {
    errors.push(`Duration must be between ${MIN_DURATION_DAYS} and ${MAX_DURATION_DAYS} days.`);
  }

  if (!isSameOrAfterDay(draft.startDate, context.today)) {
    errors.push("Start date cannot be in the past.");
  }

  if (context.hasActiveExperiment) {
    errors.push("You already have an active experiment. Complete or abandon it before starting another.");
  }

  if (draft.interventionInstructions.trim().toLowerCase() === draft.controlInstructions.trim().toLowerCase()) {
    errors.push("Intervention and control instructions cannot be identical.");
  }

  if (!context.whoopConnected) {
    errors.push("Connect your WHOOP account before starting an experiment.");
  }

  return { valid: errors.length === 0, errors };
}
