import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth/getCurrentUser";
import { db } from "@/lib/db";
import { getTodayAssignment } from "@/lib/experiments/getTodayAssignment";
import { DailyAssignment } from "@/components/daily-assignment";
import { ExperimentCard } from "@/components/experiment-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const user = await requireCurrentUser();

  const [whoopConnection, activeExperiment] = await Promise.all([
    db.whoopConnection.findUnique({ where: { userId: user.id } }),
    db.experiment.findFirst({ where: { userId: user.id, status: "ACTIVE" } }),
  ]);

  const whoopConnected = Boolean(whoopConnection && !whoopConnection.revokedAt);

  if (!whoopConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect WHOOP</CardTitle>
          <CardDescription>
            Recovery Lab needs read access to your recovery, sleep, and cycle data to run an experiment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/api/whoop/connect">Connect WHOOP</Link>} />
        </CardContent>
      </Card>
    );
  }

  if (!activeExperiment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Start your first experiment</CardTitle>
          <CardDescription>Test one daily habit for 14 to 42 days against a control condition.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/experiments/new">New experiment</Link>} />
        </CardContent>
      </Card>
    );
  }

  const assignment = await getTodayAssignment(user.id, user.timezone);

  return (
    <div className="space-y-6">
      <ExperimentCard
        experiment={{
          id: activeExperiment.id,
          title: activeExperiment.title,
          hypothesis: activeExperiment.hypothesis,
          status: activeExperiment.status,
          startDate: activeExperiment.startDate,
          endDate: activeExperiment.endDate,
        }}
      />

      {assignment ? (
        <DailyAssignment assignment={assignment} />
      ) : (
        <p className="text-sm text-muted-foreground">
          No assignment for today — this experiment may not have started yet or may have already ended.
        </p>
      )}
    </div>
  );
}
