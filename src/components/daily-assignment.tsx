import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckinForm } from "@/components/checkin-form";
import type { TodayAssignment } from "@/lib/experiments/getTodayAssignment";

export function DailyAssignment({ assignment }: { assignment: TodayAssignment }) {
  const isIntervention = assignment.assignedCondition === "INTERVENTION";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Today&apos;s assignment</CardTitle>
          <Badge variant={isIntervention ? "default" : "secondary"}>
            {isIntervention ? "Intervention" : "Control"}
          </Badge>
        </div>
        <CardDescription>{assignment.experimentTitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm">{assignment.instructions}</p>

        {assignment.alreadyCheckedIn ? (
          <p className="text-sm text-muted-foreground">You&apos;ve already checked in for today. Thanks!</p>
        ) : (
          <CheckinForm experimentDayId={assignment.experimentDayId} />
        )}
      </CardContent>
    </Card>
  );
}
