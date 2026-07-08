// Shapes for WHOOP API v2 responses.
// Reference: https://developer.whoop.com/api (developer/v2 collections)

export type WhoopScoreState = "SCORED" | "PENDING_SCORE" | "UNSCORABLE";

export interface WhoopPaginated<T> {
  records: T[];
  next_token: string | null;
}

export interface WhoopCycleResponse {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  start: string;
  end: string | null;
  timezone_offset: string;
  score_state: WhoopScoreState;
  score?: {
    strain: number;
    kilojoule: number;
    average_heart_rate: number;
    max_heart_rate: number;
  };
}

export interface WhoopSleepResponse {
  id: string;
  cycle_id: number | null;
  v1_id?: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  timezone_offset: string;
  nap: boolean;
  score_state: WhoopScoreState;
  score?: {
    stage_summary: {
      total_in_bed_time_milli: number;
      total_awake_time_milli: number;
      total_light_sleep_time_milli: number;
      total_slow_wave_sleep_time_milli: number;
      total_rem_sleep_time_milli: number;
      sleep_cycle_count: number;
      disturbance_count: number;
    };
    sleep_needed: Record<string, number>;
    respiratory_rate: number;
    sleep_performance_percentage: number;
    sleep_consistency_percentage: number;
    sleep_efficiency_percentage: number;
  };
}

export interface WhoopRecoveryResponse {
  cycle_id: number;
  sleep_id: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  score_state: WhoopScoreState;
  score?: {
    user_calibrating: boolean;
    recovery_score: number;
    resting_heart_rate: number;
    hrv_rmssd_milli: number;
    spo2_percentage?: number;
    skin_temp_celsius?: number;
  };
}

export interface WhoopProfileResponse {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export type WhoopWebhookEventType =
  | "sleep.updated"
  | "sleep.deleted"
  | "recovery.updated"
  | "recovery.deleted"
  | "workout.updated"
  | "workout.deleted";

export interface WhoopWebhookPayload {
  user_id: number;
  id: string | number;
  type: WhoopWebhookEventType;
  trace_id: string;
}

export interface WhoopTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}
