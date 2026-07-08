-- CreateEnum
CREATE TYPE "ExperimentStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "PrimaryMetric" AS ENUM ('RECOVERY_SCORE');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('INTERVENTION', 'CONTROL');

-- CreateEnum
CREATE TYPE "ValidityStatus" AS ENUM ('PENDING', 'VALID', 'INVALID', 'MISSING_CHECKIN', 'MISSING_WHOOP_DATA');

-- CreateEnum
CREATE TYPE "Adherence" AS ENUM ('YES', 'PARTIAL', 'NO');

-- CreateEnum
CREATE TYPE "ScoreState" AS ENUM ('SCORED', 'PENDING_SCORE', 'UNSCORABLE');

-- CreateEnum
CREATE TYPE "WebhookEventType" AS ENUM ('SLEEP_UPDATED', 'SLEEP_DELETED', 'RECOVERY_UPDATED', 'RECOVERY_DELETED', 'WORKOUT_UPDATED', 'WORKOUT_DELETED');

-- CreateEnum
CREATE TYPE "WebhookStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ConfidenceLabel" AS ENUM ('INSUFFICIENT', 'LOW', 'MODERATE', 'HIGHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whoop_connections" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "whoop_user_id" TEXT NOT NULL,
    "access_token_encrypted" TEXT NOT NULL,
    "refresh_token_encrypted" TEXT NOT NULL,
    "token_expires_at" TIMESTAMP(3) NOT NULL,
    "granted_scopes" TEXT[],
    "connected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_successful_sync_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "refresh_locked_at" TIMESTAMP(3),

    CONSTRAINT "whoop_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "hypothesis" TEXT NOT NULL,
    "intervention_instructions" TEXT NOT NULL,
    "control_instructions" TEXT NOT NULL,
    "primary_metric" "PrimaryMetric" NOT NULL DEFAULT 'RECOVERY_SCORE',
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "ExperimentStatus" NOT NULL DEFAULT 'DRAFT',
    "randomization_seed" TEXT NOT NULL,
    "analysis_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiment_days" (
    "id" TEXT NOT NULL,
    "experiment_id" TEXT NOT NULL,
    "local_date" DATE NOT NULL,
    "assigned_condition" "Condition" NOT NULL,
    "main_sleep_id" TEXT,
    "recovery_id" TEXT,
    "validity_status" "ValidityStatus" NOT NULL DEFAULT 'PENDING',
    "invalid_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "experiment_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_checkins" (
    "id" TEXT NOT NULL,
    "experiment_day_id" TEXT NOT NULL,
    "adherence" "Adherence" NOT NULL,
    "unusual_day" BOOLEAN NOT NULL DEFAULT false,
    "unusual_day_reason" TEXT,
    "subjective_energy" INTEGER,
    "notes" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_checkins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whoop_cycles" (
    "id" TEXT NOT NULL,
    "whoop_cycle_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "timezone_offset" TEXT NOT NULL,
    "score_state" "ScoreState" NOT NULL,
    "day_strain" DOUBLE PRECISION,
    "average_heart_rate" INTEGER,
    "max_heart_rate" INTEGER,
    "raw_payload" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whoop_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whoop_sleeps" (
    "id" TEXT NOT NULL,
    "whoop_sleep_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "whoop_cycle_id" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "timezone_offset" TEXT NOT NULL,
    "is_nap" BOOLEAN NOT NULL DEFAULT false,
    "score_state" "ScoreState" NOT NULL,
    "total_in_bed_ms" INTEGER,
    "total_awake_ms" INTEGER,
    "total_light_sleep_ms" INTEGER,
    "total_slow_wave_sleep_ms" INTEGER,
    "total_rem_sleep_ms" INTEGER,
    "sleep_performance" DOUBLE PRECISION,
    "sleep_consistency" DOUBLE PRECISION,
    "sleep_efficiency" DOUBLE PRECISION,
    "raw_payload" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "whoop_sleeps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whoop_recoveries" (
    "id" TEXT NOT NULL,
    "whoop_recovery_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "whoop_cycle_id" TEXT,
    "whoop_sleep_id" TEXT,
    "score_state" "ScoreState" NOT NULL,
    "user_calibrating" BOOLEAN NOT NULL DEFAULT false,
    "recovery_score" INTEGER,
    "resting_heart_rate" INTEGER,
    "hrv_rmssd_ms" DOUBLE PRECISION,
    "spo2_percentage" DOUBLE PRECISION,
    "skin_temperature_celsius" DOUBLE PRECISION,
    "raw_payload" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "whoop_recoveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "trace_id" TEXT NOT NULL,
    "whoop_user_id" TEXT NOT NULL,
    "object_id" TEXT NOT NULL,
    "event_type" "WebhookEventType" NOT NULL,
    "status" "WebhookStatus" NOT NULL DEFAULT 'PENDING',
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "last_error" TEXT,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_runs" (
    "id" TEXT NOT NULL,
    "experiment_id" TEXT NOT NULL,
    "analysis_version" INTEGER NOT NULL,
    "valid_day_count" INTEGER NOT NULL,
    "intervention_day_count" INTEGER NOT NULL,
    "control_day_count" INTEGER NOT NULL,
    "adherence_rate" DOUBLE PRECISION NOT NULL,
    "unadjusted_effect" DOUBLE PRECISION NOT NULL,
    "adjusted_effect" DOUBLE PRECISION,
    "confidence_interval_low" DOUBLE PRECISION NOT NULL,
    "confidence_interval_high" DOUBLE PRECISION NOT NULL,
    "confidence_label" "ConfidenceLabel" NOT NULL,
    "result_payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analysis_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "whoop_connections_user_id_key" ON "whoop_connections"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "whoop_connections_whoop_user_id_key" ON "whoop_connections"("whoop_user_id");

-- CreateIndex
CREATE INDEX "experiments_user_id_status_idx" ON "experiments"("user_id", "status");

-- CreateIndex
CREATE INDEX "experiment_days_experiment_id_idx" ON "experiment_days"("experiment_id");

-- CreateIndex
CREATE UNIQUE INDEX "experiment_days_experiment_id_local_date_key" ON "experiment_days"("experiment_id", "local_date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_checkins_experiment_day_id_key" ON "daily_checkins"("experiment_day_id");

-- CreateIndex
CREATE UNIQUE INDEX "whoop_cycles_whoop_cycle_id_key" ON "whoop_cycles"("whoop_cycle_id");

-- CreateIndex
CREATE INDEX "whoop_cycles_user_id_start_time_idx" ON "whoop_cycles"("user_id", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "whoop_sleeps_whoop_sleep_id_key" ON "whoop_sleeps"("whoop_sleep_id");

-- CreateIndex
CREATE INDEX "whoop_sleeps_user_id_start_time_idx" ON "whoop_sleeps"("user_id", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "whoop_recoveries_whoop_recovery_id_key" ON "whoop_recoveries"("whoop_recovery_id");

-- CreateIndex
CREATE UNIQUE INDEX "whoop_recoveries_whoop_sleep_id_key" ON "whoop_recoveries"("whoop_sleep_id");

-- CreateIndex
CREATE INDEX "whoop_recoveries_user_id_idx" ON "whoop_recoveries"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_trace_id_key" ON "webhook_events"("trace_id");

-- CreateIndex
CREATE INDEX "webhook_events_status_idx" ON "webhook_events"("status");

-- CreateIndex
CREATE INDEX "analysis_runs_experiment_id_idx" ON "analysis_runs"("experiment_id");

-- AddForeignKey
ALTER TABLE "whoop_connections" ADD CONSTRAINT "whoop_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_days" ADD CONSTRAINT "experiment_days_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "experiments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_days" ADD CONSTRAINT "experiment_days_main_sleep_id_fkey" FOREIGN KEY ("main_sleep_id") REFERENCES "whoop_sleeps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_days" ADD CONSTRAINT "experiment_days_recovery_id_fkey" FOREIGN KEY ("recovery_id") REFERENCES "whoop_recoveries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_checkins" ADD CONSTRAINT "daily_checkins_experiment_day_id_fkey" FOREIGN KEY ("experiment_day_id") REFERENCES "experiment_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whoop_cycles" ADD CONSTRAINT "whoop_cycles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whoop_sleeps" ADD CONSTRAINT "whoop_sleeps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whoop_sleeps" ADD CONSTRAINT "whoop_sleeps_whoop_cycle_id_fkey" FOREIGN KEY ("whoop_cycle_id") REFERENCES "whoop_cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whoop_recoveries" ADD CONSTRAINT "whoop_recoveries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whoop_recoveries" ADD CONSTRAINT "whoop_recoveries_whoop_cycle_id_fkey" FOREIGN KEY ("whoop_cycle_id") REFERENCES "whoop_cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whoop_recoveries" ADD CONSTRAINT "whoop_recoveries_whoop_sleep_id_fkey" FOREIGN KEY ("whoop_sleep_id") REFERENCES "whoop_sleeps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_runs" ADD CONSTRAINT "analysis_runs_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "experiments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
