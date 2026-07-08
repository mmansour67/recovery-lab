/**
 * Seeds a demo account with a mid-flight experiment and plausible WHOOP data
 * so every screen state can be exercised without a live WHOOP connection.
 *
 *   npx tsx scripts/seed-demo.ts        (or: node --import tsx ...)
 *
 * Demo login: demo@recoverylab.test / demo-password-123
 */
import { config } from "dotenv";
config({ path: ".env.local" });

// Node 20 has no global WebSocket; supabase-js expects one at construction.
import WebSocket from "ws";
(globalThis as Record<string, unknown>).WebSocket ??= WebSocket;

import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { generateAssignments } from "../src/lib/experiments/assignments";

const DEMO_EMAIL = "demo@recoverylab.test";
const DEMO_PASSWORD = "demo-password-123";
const DURATION = 18;
const ELAPSED = 12; // days already "lived"

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

function dateNDaysAgo(n: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return new Date(`${d.toISOString().slice(0, 10)}T00:00:00.000Z`);
}

async function main() {
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Create (or find) the Supabase auth user, pre-confirmed.
  let authUserId: string;
  const created = await admin.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
  });
  if (created.data.user) {
    authUserId = created.data.user.id;
  } else {
    const list = await admin.auth.admin.listUsers();
    const existing = list.data.users.find((u) => u.email === DEMO_EMAIL);
    if (!existing) throw new Error(`Could not create or find demo auth user: ${created.error?.message}`);
    authUserId = existing.id;
  }

  // Reset any previous demo data.
  await db.user.deleteMany({ where: { id: authUserId } });

  const user = await db.user.create({
    data: { id: authUserId, email: DEMO_EMAIL, timezone: "America/Los_Angeles" },
  });

  await db.whoopConnection.create({
    data: {
      userId: user.id,
      whoopUserId: "demo-whoop-user",
      accessTokenEncrypted: "demo",
      refreshTokenEncrypted: "demo",
      tokenExpiresAt: new Date(Date.now() + 86400_000),
      grantedScopes: ["offline", "read:profile", "read:recovery", "read:cycles", "read:sleep"],
      lastSuccessfulSyncAt: new Date(),
    },
  });

  const startDate = dateNDaysAgo(ELAPSED - 1);
  const endDate = dateNDaysAgo(ELAPSED - DURATION); // in the future
  const conditions = generateAssignments(DURATION, "demo-seed");

  const experiment = await db.experiment.create({
    data: {
      userId: user.id,
      title: "No caffeine after 2 p.m.",
      hypothesis: "Cutting caffeine off at 2 p.m. improves recovery the next morning.",
      interventionInstructions: "No caffeine after 2:00 p.m. today. Morning coffee is fine.",
      controlInstructions: "Drink coffee like you normally would. No changes today.",
      startDate,
      endDate,
      status: "ACTIVE",
      randomizationSeed: "demo-seed",
    },
  });

  for (let i = 0; i < DURATION; i++) {
    const localDate = dateNDaysAgo(ELAPSED - 1 - i);
    const isPast = i < ELAPSED - 1; // everything before today
    const condition = conditions[i];

    const day = await db.experimentDay.create({
      data: { experimentId: experiment.id, localDate, assignedCondition: condition },
    });

    if (!isPast) continue;

    // ~1 missed check-in and 1 unusual day for realism
    if (i === 4) continue; // missed check-in day

    const unusual = i === 8;
    await db.dailyCheckin.create({
      data: {
        experimentDayId: day.id,
        adherence: condition === "INTERVENTION" ? (i % 5 === 3 ? "PARTIAL" : "YES") : "YES",
        unusualDay: unusual,
        unusualDayReason: unusual ? "Red eye flight home" : null,
      },
    });

    // Recovery: intervention days ~ +7 higher, with noise
    const base = 62 + ((i * 7) % 11) - 5;
    const score = Math.min(98, Math.max(20, base + (condition === "INTERVENTION" ? 7 : 0)));

    const sleep = await db.whoopSleep.create({
      data: {
        whoopSleepId: `demo-sleep-${i}`,
        userId: user.id,
        startTime: new Date(localDate.getTime() + 22.5 * 3600_000),
        endTime: new Date(localDate.getTime() + 30.5 * 3600_000),
        timezoneOffset: "-08:00",
        scoreState: "SCORED",
        totalInBedMs: 8 * 3600_000,
        sleepPerformance: 80 + (i % 15),
        rawPayload: {},
      },
    });

    const cycle = await db.whoopCycle.create({
      data: {
        whoopCycleId: `demo-cycle-${i}`,
        userId: user.id,
        startTime: new Date(localDate.getTime() + 4 * 3600_000),
        timezoneOffset: "-08:00",
        scoreState: "SCORED",
        dayStrain: 8 + ((i * 3) % 9),
        rawPayload: {},
      },
    });

    const recovery = await db.whoopRecovery.create({
      data: {
        whoopRecoveryId: `demo-recovery-${i}`,
        userId: user.id,
        whoopCycleId: cycle.id,
        whoopSleepId: sleep.id,
        scoreState: "SCORED",
        recoveryScore: score,
        restingHeartRate: 52,
        hrvRmssdMs: 68,
        rawPayload: {},
      },
    });

    await db.experimentDay.update({
      where: { id: day.id },
      data: {
        mainSleepId: sleep.id,
        recoveryId: recovery.id,
        validityStatus: unusual ? "INVALID" : "VALID",
        invalidReason: unusual ? "Red eye flight home" : null,
      },
    });
  }

  console.log(`Seeded demo account: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`Experiment: ${experiment.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
