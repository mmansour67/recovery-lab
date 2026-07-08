import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckinForm } from "@/components/checkin-form";
import { InfoTip } from "@/components/info-tip";
import type { TodayAssignment } from "@/lib/experiments/getTodayAssignment";

export function DailyAssignment({ assignment }: { assignment: TodayAssignment }) {
  const isIntervention = assignment.assignedCondition === "INTERVENTION";

  return (
    <Card className={isIntervention ? "card-glow border-primary/25" : undefined}>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Today&apos;s draw · {assignment.localDate}
          </p>
          <span className="inline-flex items-center gap-1.5">
            <Badge
              variant={isIntervention ? "default" : "secondary"}
              className="px-3 py-1 font-mono text-[0.7rem] uppercase tracking-wider"
            >
              {isIntervention ? "Habit day" : "Normal day"}
            </Badge>
            <InfoTip term={isIntervention ? "intervention" : "control"} />
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <p className="text-pretty font-display text-3xl leading-snug tracking-tight sm:text-4xl">
          {assignment.instructions}
        </p>

        {assignment.alreadyCheckedIn ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3.5 text-sm">
            <span className="text-primary">✓</span> Checked in. Tonight&apos;s sleep gets scored against this
            card — see you tomorrow.
          </div>
        ) : (
          <div className="border-t pt-6">
            <CheckinForm experimentDayId={assignment.experimentDayId} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
