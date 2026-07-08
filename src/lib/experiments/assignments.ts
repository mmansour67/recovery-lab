export type Condition = "INTERVENTION" | "CONTROL";

const MAX_ALLOWED_STREAK = 3;
const MAX_SHUFFLE_ATTEMPTS = 1000;

/**
 * FNV-1a string hash, used to turn an arbitrary seed string into a 32-bit
 * integer that seeds the PRNG. Deterministic across platforms and Node versions.
 */
function hashSeed(seed: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32 PRNG — small, fast, deterministic for a given 32-bit seed. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: T[], seed: string): T[] {
  const random = mulberry32(hashSeed(seed));
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function maximumStreak(conditions: Condition[]): number {
  let longest = 0;
  let current = 0;
  let previous: Condition | null = null;

  for (const condition of conditions) {
    current = condition === previous ? current + 1 : 1;
    previous = condition;
    longest = Math.max(longest, current);
  }

  return longest;
}

/**
 * Generates a balanced, seeded random schedule of INTERVENTION/CONTROL days.
 * Rejects shuffles with a run of more than three identical days in a row so
 * the schedule doesn't accidentally hand the user a predictable week-long block.
 */
export function generateAssignments(totalDays: number, seed: string): Condition[] {
  if (totalDays < 2) {
    throw new Error("totalDays must be at least 2");
  }

  const interventionCount = Math.floor(totalDays / 2);
  const controlCount = totalDays - interventionCount;

  const assignments: Condition[] = [
    ...Array<Condition>(interventionCount).fill("INTERVENTION"),
    ...Array<Condition>(controlCount).fill("CONTROL"),
  ];

  for (let attempt = 0; attempt < MAX_SHUFFLE_ATTEMPTS; attempt++) {
    const shuffled = seededShuffle(assignments, `${seed}-${attempt}`);
    if (maximumStreak(shuffled) <= MAX_ALLOWED_STREAK) {
      return shuffled;
    }
  }

  throw new Error("Unable to create balanced assignments");
}
