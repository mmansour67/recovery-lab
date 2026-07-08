import type { AnalysisObservation } from "./build-dataset";

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export interface GroupComparison {
  interventionMean: number;
  controlMean: number;
  interventionCount: number;
  controlCount: number;
  effect: number;
  interventionValues: number[];
  controlValues: number[];
}

function compareGroups(interventionValues: number[], controlValues: number[]): GroupComparison {
  const interventionMean = mean(interventionValues);
  const controlMean = mean(controlValues);
  return {
    interventionMean,
    controlMean,
    interventionCount: interventionValues.length,
    controlCount: controlValues.length,
    effect: interventionMean - controlMean,
    interventionValues,
    controlValues,
  };
}

/** Primary analysis: intervention-assigned days vs control-assigned days, by randomization. */
export function differenceInMeansByAssignment(observations: AnalysisObservation[]): GroupComparison {
  const interventionValues = observations
    .filter((o) => o.assignedCondition === "INTERVENTION")
    .map((o) => o.recoveryScore);
  const controlValues = observations
    .filter((o) => o.assignedCondition === "CONTROL")
    .map((o) => o.recoveryScore);
  return compareGroups(interventionValues, controlValues);
}

/**
 * Secondary analysis: days the user actually followed vs actually didn't,
 * regardless of assignment. This is an association, not a randomized
 * comparison — callers must label it that way (see result-language.ts).
 * Partially-followed days are excluded so the two groups stay clean.
 */
export function differenceInMeansByAdherence(observations: AnalysisObservation[]): GroupComparison {
  const followedValues = observations.filter((o) => o.adherence === "YES").map((o) => o.recoveryScore);
  const notFollowedValues = observations.filter((o) => o.adherence === "NO").map((o) => o.recoveryScore);
  return compareGroups(followedValues, notFollowedValues);
}
