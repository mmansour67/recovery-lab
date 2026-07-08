import { describe, expect, it } from "vitest";
import {
  findMainSleepForDate,
  linkDayToWhoopData,
  localDateFromSleepStart,
  type RecoveryRecord,
  type SleepRecord,
} from "@/lib/experiments/link-whoop-data";
import { computeValidityStatus } from "@/lib/experiments/validity";

function sleep(overrides: Partial<SleepRecord>): SleepRecord {
  return {
    id: "sleep-1",
    startTime: new Date("2026-07-10T23:00:00.000Z"),
    timezoneOffset: "+00:00",
    isNap: false,
    scoreState: "SCORED",
    totalInBedMs: 8 * 60 * 60 * 1000,
    ...overrides,
  };
}

function recovery(overrides: Partial<RecoveryRecord>): RecoveryRecord {
  return {
    id: "recovery-1",
    sleepId: "sleep-1",
    scoreState: "SCORED",
    userCalibrating: false,
    ...overrides,
  };
}

describe("localDateFromSleepStart", () => {
  it("resolves a sleep that begins before midnight to that same calendar day", () => {
    const date = localDateFromSleepStart(new Date("2026-07-10T23:30:00.000Z"), "+00:00");
    expect(date).toBe("2026-07-10");
  });

  it("resolves a sleep that begins after midnight UTC but is still the prior local evening", () => {
    // 2026-07-11T02:00 UTC in a -05:00 timezone is still 2026-07-10 locally.
    const date = localDateFromSleepStart(new Date("2026-07-11T02:00:00.000Z"), "-05:00");
    expect(date).toBe("2026-07-10");
  });

  it("shifts the local date when the recorded timezone changes (travel)", () => {
    const utcStart = new Date("2026-07-10T21:30:00.000Z");
    const asUtc = localDateFromSleepStart(utcStart, "+00:00");
    const asTokyo = localDateFromSleepStart(utcStart, "+09:00");
    expect(asUtc).toBe("2026-07-10");
    expect(asTokyo).toBe("2026-07-11");
  });
});

describe("findMainSleepForDate", () => {
  it("excludes naps from main-sleep matching", () => {
    const nap = sleep({ id: "nap", isNap: true, startTime: new Date("2026-07-10T18:00:00.000Z") });
    const mainSleep = sleep({ id: "main", startTime: new Date("2026-07-10T23:00:00.000Z") });
    const match = findMainSleepForDate([nap, mainSleep], "2026-07-10");
    expect(match?.id).toBe("main");
  });

  it("excludes unscored sleeps", () => {
    const unscored = sleep({ id: "unscored", scoreState: "PENDING_SCORE" });
    const match = findMainSleepForDate([unscored], "2026-07-10");
    expect(match).toBeNull();
  });

  it("picks the longer sleep when two qualify for the same local date", () => {
    const shortSleep = sleep({ id: "short", totalInBedMs: 60 * 60 * 1000 });
    const longSleep = sleep({ id: "long", totalInBedMs: 7 * 60 * 60 * 1000 });
    const match = findMainSleepForDate([shortSleep, longSleep], "2026-07-10");
    expect(match?.id).toBe("long");
  });

  it("returns null when nothing starts on that local date", () => {
    const match = findMainSleepForDate([sleep({})], "2026-01-01");
    expect(match).toBeNull();
  });
});

describe("linkDayToWhoopData", () => {
  it("links a day to its sleep and recovery when both are complete", () => {
    const result = linkDayToWhoopData("2026-07-10", [sleep({})], [recovery({})]);
    expect(result).toEqual({ mainSleepId: "sleep-1", recoveryId: "recovery-1", hasCompleteWhoopData: true });
  });

  it("flags missing WHOOP data when there is no matching sleep", () => {
    const result = linkDayToWhoopData("2026-07-10", [], []);
    expect(result.hasCompleteWhoopData).toBe(false);
    expect(result.mainSleepId).toBeNull();
  });

  it("flags missing WHOOP data when the recovery never arrived", () => {
    const result = linkDayToWhoopData("2026-07-10", [sleep({})], []);
    expect(result.mainSleepId).toBe("sleep-1");
    expect(result.recoveryId).toBeNull();
    expect(result.hasCompleteWhoopData).toBe(false);
  });

  it("excludes a recovery still marked user_calibrating", () => {
    const result = linkDayToWhoopData(
      "2026-07-10",
      [sleep({})],
      [recovery({ userCalibrating: true })]
    );
    expect(result.hasCompleteWhoopData).toBe(false);
  });

  it("excludes an unscored recovery", () => {
    const result = linkDayToWhoopData(
      "2026-07-10",
      [sleep({})],
      [recovery({ scoreState: "PENDING_SCORE" })]
    );
    expect(result.hasCompleteWhoopData).toBe(false);
  });
});

describe("computeValidityStatus", () => {
  it("is VALID when data and a normal check-in are both present", () => {
    expect(computeValidityStatus({ submitted: true, unusualDay: false }, { hasCompleteWhoopData: true })).toBe(
      "VALID"
    );
  });

  it("is MISSING_WHOOP_DATA when WHOOP data hasn't arrived, even with a check-in", () => {
    expect(computeValidityStatus({ submitted: true, unusualDay: false }, { hasCompleteWhoopData: false })).toBe(
      "MISSING_WHOOP_DATA"
    );
  });

  it("is MISSING_CHECKIN when the user never submitted one", () => {
    expect(computeValidityStatus({ submitted: false, unusualDay: false }, { hasCompleteWhoopData: true })).toBe(
      "MISSING_CHECKIN"
    );
  });

  it("is INVALID when the user flagged the day as unusual", () => {
    expect(computeValidityStatus({ submitted: true, unusualDay: true }, { hasCompleteWhoopData: true })).toBe(
      "INVALID"
    );
  });
});
