import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth/getCurrentUser";
import { db } from "@/lib/db";

/** Lets a user download everything Recovery Lab has stored about them. */
export async function GET() {
  const user = await requireCurrentUser();

  const [experiments, whoopSleeps, whoopRecoveries, whoopCycles] = await Promise.all([
    db.experiment.findMany({
      where: { userId: user.id },
      include: { experimentDays: { include: { checkin: true } } },
    }),
    db.whoopSleep.findMany({ where: { userId: user.id, deletedAt: null } }),
    db.whoopRecovery.findMany({ where: { userId: user.id, deletedAt: null } }),
    db.whoopCycle.findMany({ where: { userId: user.id } }),
  ]);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    user: { id: user.id, email: user.email, timezone: user.timezone },
    experiments,
    whoopSleeps,
    whoopRecoveries,
    whoopCycles,
  };

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=recovery-lab-export.json",
    },
  });
}
