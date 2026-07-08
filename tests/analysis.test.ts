import { describe, expect, it } from "vitest";
import type { AnalysisObservation, RawExperimentDay } from "@/lib/analysis/build-dataset";
import { buildAnalysisDataset } from "@/lib/analysis/build-dataset";
import { differenceInMeansByAdherence, differenceInMeansByAssignment } from "@/lib/analysis/difference-in-means";
import { differenceConfidenceInterval } from "@/lib/analysis/uncertainty";
import { fitAdjustedModel } from "@/lib/analysis/regression";
import { computeConfidenceLabel, buildResultNarrative } from "@/lib/analysis/result-language";

function observation(overrides: Partial<AnalysisObservation>): AnalysisObservation {
  return {
    date: "2026-07-01",
    assignedCondition: "INTERVENTION",
    adherence: "YES",
    recoveryScore: 70,
    dayStrain: 10,
    weekday: 3,
    ...overrides,
  };
}

describe("buildAnalysisDataset", () => {
  it("keeps only VALID days with a recovery score and a check-in", () => {
    const days: RawExperimentDay[] = [
      {
        localDate: new Date("2026-07-01T00:00:00.000Z"),
        assignedCondition: "INTERVENTION",
        validityStatus: "VALID",
        checkinAdherence: "YES",
        recoveryScore: 72,
        dayStrain: 8,
      },
      {
        localDate: new Date("2026-07-02T00:00:00.000Z"),
        assignedCondition: "CONTROL",
        validityStatus: "MISSING_WHOOP_DATA",
        checkinAdherence: "YES",
        recoveryScore: null,
        dayStrain: null,
      },
    ];

    const dataset = buildAnalysisDataset(days);
    expect(dataset).toHaveLength(1);
    expect(dataset[0].recoveryScore).toBe(72);
    expect(dataset[0].weekday).toBe(3); // 2026-07-01 is a Wednesday
  });
});

describe("differenceInMeansByAssignment", () => {
  it("computes the randomized primary effect from the worked example in the spec", () => {
    const observations = [
      ...Array.from({ length: 5 }, () => observation({ assignedCondition: "INTERVENTION", recoveryScore: 72.6 })),
      ...Array.from({ length: 5 }, () => observation({ assignedCondition: "CONTROL", recoveryScore: 65.2 })),
    ];

    const result = differenceInMeansByAssignment(observations);
    expect(result.interventionMean).toBeCloseTo(72.6);
    expect(result.controlMean).toBeCloseTo(65.2);
    expect(result.effect).toBeCloseTo(7.4, 5);
  });
});

describe("differenceInMeansByAdherence", () => {
  it("excludes partially-followed days from the adherence comparison", () => {
    const observations = [
      observation({ adherence: "YES", recoveryScore: 80 }),
      observation({ adherence: "NO", recoveryScore: 60 }),
      observation({ adherence: "PARTIAL", recoveryScore: 1000 }),
    ];

    const result = differenceInMeansByAdherence(observations);
    expect(result.interventionCount).toBe(1);
    expect(result.controlCount).toBe(1);
    expect(result.effect).toBeCloseTo(20);
  });
});

describe("differenceConfidenceInterval", () => {
  it("widens as variance increases", () => {
    const tight = differenceConfidenceInterval([70, 71, 69, 70], [60, 61, 59, 60]);
    const wide = differenceConfidenceInterval([40, 100, 30, 110], [10, 90, 20, 95]);
    const tightWidth = tight.high - tight.low;
    const wideWidth = wide.high - wide.low;
    expect(wideWidth).toBeGreaterThan(tightWidth);
  });

  it("centers the interval on the point estimate", () => {
    const ci = differenceConfidenceInterval([80, 82], [70, 72]);
    const midpoint = (ci.low + ci.high) / 2;
    expect(midpoint).toBeCloseTo(10, 5);
  });
});

describe("fitAdjustedModel", () => {
  it("returns null when there isn't enough data to fit the model", () => {
    const observations = [observation({})];
    expect(fitAdjustedModel(observations)).toBeNull();
  });

  it("recovers a known intervention effect from synthetic data", () => {
    // recovery = 50 + 10*T + 0*strain + 0*weekday + noise-free
    const observations: AnalysisObservation[] = [];
    for (let i = 0; i < 20; i++) {
      const isIntervention = i % 2 === 0;
      const strain = 8 + (i % 5); // varies across rows so it isn't collinear with the intercept
      observations.push(
        observation({
          assignedCondition: isIntervention ? "INTERVENTION" : "CONTROL",
          recoveryScore: 50 + (isIntervention ? 10 : 0),
          dayStrain: strain,
          weekday: i % 7,
        })
      );
    }

    const fit = fitAdjustedModel(observations);
    expect(fit).not.toBeNull();
    expect(fit?.adjustedEffect).toBeCloseTo(10, 1);
  });
});

describe("computeConfidenceLabel", () => {
  it("labels sparse data as insufficient", () => {
    expect(
      computeConfidenceLabel({
        validDayCount: 8,
        interventionDayCount: 4,
        controlDayCount: 4,
        adherenceRate: 0.9,
        unadjustedEffect: 5,
        adjustedEffect: 5,
      })
    ).toBe("INSUFFICIENT");
  });

  it("labels a solid balanced 18-day experiment as moderate", () => {
    expect(
      computeConfidenceLabel({
        validDayCount: 18,
        interventionDayCount: 9,
        controlDayCount: 9,
        adherenceRate: 0.78,
        unadjustedEffect: 7.4,
        adjustedEffect: 6.9,
      })
    ).toBe("MODERATE");
  });

  it("labels a long, high-adherence, stable experiment as higher", () => {
    expect(
      computeConfidenceLabel({
        validDayCount: 30,
        interventionDayCount: 15,
        controlDayCount: 15,
        adherenceRate: 0.9,
        unadjustedEffect: 7.4,
        adjustedEffect: 7.0,
      })
    ).toBe("HIGHER");
  });

  it("does not overstate confidence when adjusted and unadjusted effects disagree in sign", () => {
    expect(
      computeConfidenceLabel({
        validDayCount: 30,
        interventionDayCount: 15,
        controlDayCount: 15,
        adherenceRate: 0.9,
        unadjustedEffect: 7.4,
        adjustedEffect: -1,
      })
    ).not.toBe("HIGHER");
  });
});

describe("buildResultNarrative", () => {
  it("never claims causation outright", () => {
    const narrative = buildResultNarrative({
      experimentTitle: "No caffeine after 2 p.m.",
      unadjustedEffect: 7.4,
      confidenceIntervalLow: -1.8,
      confidenceIntervalHigh: 16.6,
      validDayCount: 18,
      label: "MODERATE",
    });

    expect(narrative).toContain("7.4 points higher");
    expect(narrative).toContain("18 valid days");
    expect(narrative.toLowerCase()).not.toContain("caused");
    expect(narrative.toLowerCase()).not.toContain("proves");
  });
});
