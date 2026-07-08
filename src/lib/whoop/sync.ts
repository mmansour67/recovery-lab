import { subDays } from "date-fns";
import { db } from "@/lib/db";
import { fetchAllPages, fetchSingleRecord } from "./client";
import { getValidAccessToken } from "./tokens";
import { relinkExperimentDaysForUser } from "@/lib/experiments/relinkExperimentDays";
import type { WhoopCycleResponse, WhoopRecoveryResponse, WhoopScoreState, WhoopSleepResponse } from "@/types/whoop";

const BACKFILL_DAYS = 45;
const RECONCILE_DAYS = 3;

function toScoreState(state: WhoopScoreState): "SCORED" | "PENDING_SCORE" | "UNSCORABLE" {
  return state;
}

async function upsertCycle(userId: string, cycle: WhoopCycleResponse): Promise<void> {
  await db.whoopCycle.upsert({
    where: { whoopCycleId: String(cycle.id) },
    create: {
      whoopCycleId: String(cycle.id),
      userId,
      startTime: new Date(cycle.start),
      endTime: cycle.end ? new Date(cycle.end) : null,
      timezoneOffset: cycle.timezone_offset,
      scoreState: toScoreState(cycle.score_state),
      dayStrain: cycle.score?.strain ?? null,
      averageHeartRate: cycle.score?.average_heart_rate ?? null,
      maxHeartRate: cycle.score?.max_heart_rate ?? null,
      rawPayload: cycle as object,
    },
    update: {
      endTime: cycle.end ? new Date(cycle.end) : null,
      scoreState: toScoreState(cycle.score_state),
      dayStrain: cycle.score?.strain ?? null,
      averageHeartRate: cycle.score?.average_heart_rate ?? null,
      maxHeartRate: cycle.score?.max_heart_rate ?? null,
      rawPayload: cycle as object,
    },
  });
}

async function upsertSleep(userId: string, sleep: WhoopSleepResponse): Promise<void> {
  const cycle = sleep.cycle_id ? await db.whoopCycle.findUnique({ where: { whoopCycleId: String(sleep.cycle_id) } }) : null;

  await db.whoopSleep.upsert({
    where: { whoopSleepId: sleep.id },
    create: {
      whoopSleepId: sleep.id,
      userId,
      whoopCycleId: cycle?.id,
      startTime: new Date(sleep.start),
      endTime: new Date(sleep.end),
      timezoneOffset: sleep.timezone_offset,
      isNap: sleep.nap,
      scoreState: toScoreState(sleep.score_state),
      totalInBedMs: sleep.score?.stage_summary.total_in_bed_time_milli ?? null,
      totalAwakeMs: sleep.score?.stage_summary.total_awake_time_milli ?? null,
      totalLightSleepMs: sleep.score?.stage_summary.total_light_sleep_time_milli ?? null,
      totalSlowWaveSleepMs: sleep.score?.stage_summary.total_slow_wave_sleep_time_milli ?? null,
      totalRemSleepMs: sleep.score?.stage_summary.total_rem_sleep_time_milli ?? null,
      sleepPerformance: sleep.score?.sleep_performance_percentage ?? null,
      sleepConsistency: sleep.score?.sleep_consistency_percentage ?? null,
      sleepEfficiency: sleep.score?.sleep_efficiency_percentage ?? null,
      rawPayload: sleep as object,
    },
    update: {
      whoopCycleId: cycle?.id,
      endTime: new Date(sleep.end),
      scoreState: toScoreState(sleep.score_state),
      totalInBedMs: sleep.score?.stage_summary.total_in_bed_time_milli ?? null,
      totalAwakeMs: sleep.score?.stage_summary.total_awake_time_milli ?? null,
      totalLightSleepMs: sleep.score?.stage_summary.total_light_sleep_time_milli ?? null,
      totalSlowWaveSleepMs: sleep.score?.stage_summary.total_slow_wave_sleep_time_milli ?? null,
      totalRemSleepMs: sleep.score?.stage_summary.total_rem_sleep_time_milli ?? null,
      sleepPerformance: sleep.score?.sleep_performance_percentage ?? null,
      sleepConsistency: sleep.score?.sleep_consistency_percentage ?? null,
      sleepEfficiency: sleep.score?.sleep_efficiency_percentage ?? null,
      rawPayload: sleep as object,
      deletedAt: null,
    },
  });
}

async function upsertRecovery(userId: string, recovery: WhoopRecoveryResponse): Promise<void> {
  const [cycle, sleep] = await Promise.all([
    db.whoopCycle.findUnique({ where: { whoopCycleId: String(recovery.cycle_id) } }),
    db.whoopSleep.findUnique({ where: { whoopSleepId: recovery.sleep_id } }),
  ]);

  // WHOOP recoveries don't carry their own id in v2 — sleep_id is 1:1 with recovery, so it doubles as the key.
  await db.whoopRecovery.upsert({
    where: { whoopRecoveryId: recovery.sleep_id },
    create: {
      whoopRecoveryId: recovery.sleep_id,
      userId,
      whoopCycleId: cycle?.id,
      whoopSleepId: sleep?.id,
      scoreState: toScoreState(recovery.score_state),
      userCalibrating: recovery.score?.user_calibrating ?? false,
      recoveryScore: recovery.score?.recovery_score ?? null,
      restingHeartRate: recovery.score?.resting_heart_rate ?? null,
      hrvRmssdMs: recovery.score?.hrv_rmssd_milli ?? null,
      spo2Percentage: recovery.score?.spo2_percentage ?? null,
      skinTemperatureCelsius: recovery.score?.skin_temp_celsius ?? null,
      rawPayload: recovery as object,
    },
    update: {
      whoopCycleId: cycle?.id,
      whoopSleepId: sleep?.id,
      scoreState: toScoreState(recovery.score_state),
      userCalibrating: recovery.score?.user_calibrating ?? false,
      recoveryScore: recovery.score?.recovery_score ?? null,
      restingHeartRate: recovery.score?.resting_heart_rate ?? null,
      hrvRmssdMs: recovery.score?.hrv_rmssd_milli ?? null,
      spo2Percentage: recovery.score?.spo2_percentage ?? null,
      skinTemperatureCelsius: recovery.score?.skin_temp_celsius ?? null,
      rawPayload: recovery as object,
      deletedAt: null,
    },
  });
}

async function syncRange(userId: string, accessToken: string, sinceDays: number): Promise<void> {
  const start = subDays(new Date(), sinceDays).toISOString();
  const end = new Date().toISOString();
  const params = { start, end };

  const [cycles, sleeps, recoveries] = await Promise.all([
    fetchAllPages<WhoopCycleResponse>("/v2/cycle", accessToken, params),
    fetchAllPages<WhoopSleepResponse>("/v2/activity/sleep", accessToken, params),
    fetchAllPages<WhoopRecoveryResponse>("/v2/recovery", accessToken, params),
  ]);

  for (const cycle of cycles) await upsertCycle(userId, cycle);
  for (const sleep of sleeps) await upsertSleep(userId, sleep);
  for (const recovery of recoveries) await upsertRecovery(userId, recovery);

  await db.whoopConnection.update({ where: { userId }, data: { lastSuccessfulSyncAt: new Date() } });
  await relinkExperimentDaysForUser(userId);
}

export async function backfillWhoopData(userId: string): Promise<void> {
  const accessToken = await getValidAccessToken(userId);
  await syncRange(userId, accessToken, BACKFILL_DAYS);
}

/** Re-fetches the last few days for every connected user — a safety net for missed or delayed webhooks. */
export async function reconcileWhoopData(userId: string): Promise<void> {
  const accessToken = await getValidAccessToken(userId);
  await syncRange(userId, accessToken, RECONCILE_DAYS);
}

export async function syncSingleSleep(userId: string, sleepId: string): Promise<void> {
  const accessToken = await getValidAccessToken(userId);
  const sleep = await fetchSingleRecord<WhoopSleepResponse>(`/v2/activity/sleep/${sleepId}`, accessToken);
  if (sleep) await upsertSleep(userId, sleep);
}

export async function softDeleteSleep(whoopSleepId: string): Promise<void> {
  await db.whoopSleep.updateMany({ where: { whoopSleepId }, data: { deletedAt: new Date() } });
}

export async function softDeleteRecovery(whoopSleepId: string): Promise<void> {
  await db.whoopRecovery.updateMany({ where: { whoopRecoveryId: whoopSleepId }, data: { deletedAt: new Date() } });
}
