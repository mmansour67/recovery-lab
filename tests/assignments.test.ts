import { describe, expect, it } from "vitest";
import { generateAssignments, maximumStreak, seededShuffle } from "@/lib/experiments/assignments";

describe("generateAssignments", () => {
  it("balances intervention and control days for an even duration", () => {
    const assignments = generateAssignments(18, "seed-a");
    const interventionCount = assignments.filter((c) => c === "INTERVENTION").length;
    const controlCount = assignments.filter((c) => c === "CONTROL").length;
    expect(interventionCount).toBe(9);
    expect(controlCount).toBe(9);
    expect(assignments).toHaveLength(18);
  });

  it("splits an odd duration as evenly as possible", () => {
    const assignments = generateAssignments(15, "seed-odd");
    const interventionCount = assignments.filter((c) => c === "INTERVENTION").length;
    const controlCount = assignments.filter((c) => c === "CONTROL").length;
    expect(interventionCount).toBe(7);
    expect(controlCount).toBe(8);
  });

  it("never produces a streak longer than three", () => {
    for (const seed of ["s1", "s2", "s3", "s4", "s5"]) {
      const assignments = generateAssignments(28, seed);
      expect(maximumStreak(assignments)).toBeLessThanOrEqual(3);
    }
  });

  it("is deterministic for the same seed", () => {
    const first = generateAssignments(20, "stable-seed");
    const second = generateAssignments(20, "stable-seed");
    expect(second).toEqual(first);
  });

  it("produces different schedules for different seeds", () => {
    const a = generateAssignments(20, "seed-one");
    const b = generateAssignments(20, "seed-two");
    expect(a).not.toEqual(b);
  });

  it("rejects a duration below the minimum shuffle size", () => {
    expect(() => generateAssignments(1, "seed")).toThrow();
  });
});

describe("maximumStreak", () => {
  it("returns 0 for an empty list", () => {
    expect(maximumStreak([])).toBe(0);
  });

  it("counts the longest run of identical values", () => {
    expect(
      maximumStreak(["INTERVENTION", "INTERVENTION", "CONTROL", "CONTROL", "CONTROL", "INTERVENTION"])
    ).toBe(3);
  });
});

describe("seededShuffle", () => {
  it("preserves the multiset of items", () => {
    const items = [1, 2, 3, 4, 5];
    const shuffled = seededShuffle(items, "seed");
    expect(shuffled.slice().sort()).toEqual(items.slice().sort());
  });

  it("does not mutate the input array", () => {
    const items = [1, 2, 3];
    seededShuffle(items, "seed");
    expect(items).toEqual([1, 2, 3]);
  });
});
