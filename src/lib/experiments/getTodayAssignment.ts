import { db } from "@/lib/db";
import { localDateString, utcMidnightFromDateString } from "./timezone";

export interface TodayAssignment {
  experimentDayId: string;
  experimentId: string;
  experimentTitle: string;
  localDate: string;
  assignedCondition: "INTERVENTION" | "CONTROL";
  instructions: string;
  alreadyCheckedIn: boolean;
}

/**
 * Returns only today's assignment — never the full schedule. Showing future
 * days would let a user anticipate an upcoming condition and change their
 * behavior in advance, defeating the point of daily randomization.
 */
export async function getTodayAssignment(userId: string, timezone: string): Promise<TodayAssignment | null> {
  const experiment = await db.experiment.findFirst({
    where: { userId, status: "ACTIVE" },
  });
  if (!experiment) return null;

  const today = localDateString(new Date(), timezone);
  const todayDate = utcMidnightFromDateString(today);

  const experimentDay = await db.experimentDay.findUnique({
    where: { experimentId_localDate: { experimentId: experiment.id, localDate: todayDate } },
    include: { checkin: true },
  });
  if (!experimentDay) return null;

  const instructions =
    experimentDay.assignedCondition === "INTERVENTION"
      ? experiment.interventionInstructions
      : experiment.controlInstructions;

  return {
    experimentDayId: experimentDay.id,
    experimentId: experiment.id,
    experimentTitle: experiment.title,
    localDate: today,
    assignedCondition: experimentDay.assignedCondition,
    instructions,
    alreadyCheckedIn: Boolean(experimentDay.checkin),
  };
}
