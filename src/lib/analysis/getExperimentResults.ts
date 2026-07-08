import { db } from "@/lib/db";
import { buildAnalysisDataset, type RawExperimentDay } from "./build-dataset";
import { differenceInMeansByAdherence, differenceInMeansByAssignment } from "./difference-in-means";
import { differenceConfidenceInterval } from "./uncertainty";
import { fitAdjustedModel } from "./regression";
import { computeConfidenceLabel, buildResultNarrative, type ConfidenceLabel } from "./result-language";

export interface ChartPoint {
  date: string;
  assignedCondition: "INTERVENTION" | "CONTROL";
  recoveryScore: number;
}

export interface ExperimentResults {
  experimentTitle: string;
  totalDays: number;
  validDayCount: number;
  interventionDayCount: number;
  controlDayCount: number;
  adherenceRate: number;
  unadjustedEffect: number;
  adjustedEffect: number | null;
  confidenceIntervalLow: number;
  confidenceIntervalHigh: number;
  confidenceLabel: ConfidenceLabel;
  narrative: string;
  adherenceComparison: { followedMean: number; notFollowedMean: number; effect: number } | null;
  chartData: ChartPoint[];
}

export async function getExperimentResults(experimentId: string): Promise<ExperimentResults | null> {
  const experiment = await db.experiment.findUnique({
    where: { id: experimentId },
    include: {
      experimentDays: {
        include: { checkin: true, recovery: { include: { cycle: true } } },
        orderBy: { localDate: "asc" },
      },
    },
  });
  if (!experiment) return null;

  const rawDays: RawExperimentDay[] = experiment.experimentDays.map((day) => ({
    localDate: day.localDate,
    assignedCondition: day.assignedCondition,
    validityStatus: day.validityStatus,
    checkinAdherence: day.checkin?.adherence ?? null,
    recoveryScore: day.recovery?.recoveryScore ?? null,
    // The strain from the waking day that led into this recovery's sleep —
    // WHOOP's cycle groups exactly that daytime activity together.
    dayStrain: day.recovery?.cycle?.dayStrain ?? null,
  }));

  const dataset = buildAnalysisDataset(rawDays);

  const totalDays = experiment.experimentDays.length;
  const totalCheckedIn = experiment.experimentDays.filter((d) => d.checkin).length;
  const adherenceRate = totalDays === 0 ? 0 : totalCheckedIn / totalDays;

  const primary = differenceInMeansByAssignment(dataset);
  const hasBothGroups = primary.interventionCount > 0 && primary.controlCount > 0;

  if (!hasBothGroups) {
    return {
      experimentTitle: experiment.title,
      totalDays,
      validDayCount: dataset.length,
      interventionDayCount: primary.interventionCount,
      controlDayCount: primary.controlCount,
      adherenceRate,
      unadjustedEffect: 0,
      adjustedEffect: null,
      confidenceIntervalLow: 0,
      confidenceIntervalHigh: 0,
      confidenceLabel: "INSUFFICIENT",
      narrative: "Not enough valid days with both intervention and control data yet. Keep checking in daily.",
      adherenceComparison: null,
      chartData: dataset.map((d) => ({
        date: d.date,
        assignedCondition: d.assignedCondition,
        recoveryScore: d.recoveryScore,
      })),
    };
  }

  const ci = differenceConfidenceInterval(primary.interventionValues, primary.controlValues);
  const adjusted = fitAdjustedModel(dataset);

  const label = computeConfidenceLabel({
    validDayCount: dataset.length,
    interventionDayCount: primary.interventionCount,
    controlDayCount: primary.controlCount,
    adherenceRate,
    unadjustedEffect: primary.effect,
    adjustedEffect: adjusted?.adjustedEffect ?? null,
  });

  const narrative = buildResultNarrative({
    experimentTitle: experiment.title,
    unadjustedEffect: primary.effect,
    confidenceIntervalLow: ci.low,
    confidenceIntervalHigh: ci.high,
    validDayCount: dataset.length,
    label,
  });

  const adherenceComparisonRaw = differenceInMeansByAdherence(dataset);
  const adherenceComparison =
    adherenceComparisonRaw.interventionCount > 0 && adherenceComparisonRaw.controlCount > 0
      ? {
          followedMean: adherenceComparisonRaw.interventionMean,
          notFollowedMean: adherenceComparisonRaw.controlMean,
          effect: adherenceComparisonRaw.effect,
        }
      : null;

  return {
    experimentTitle: experiment.title,
    totalDays,
    validDayCount: dataset.length,
    interventionDayCount: primary.interventionCount,
    controlDayCount: primary.controlCount,
    adherenceRate,
    unadjustedEffect: primary.effect,
    adjustedEffect: adjusted?.adjustedEffect ?? null,
    confidenceIntervalLow: ci.low,
    confidenceIntervalHigh: ci.high,
    confidenceLabel: label,
    narrative,
    adherenceComparison,
    chartData: dataset.map((d) => ({
      date: d.date,
      assignedCondition: d.assignedCondition,
      recoveryScore: d.recoveryScore,
    })),
  };
}
