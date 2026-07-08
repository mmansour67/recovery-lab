import { notFound } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/getCurrentUser";
import { db } from "@/lib/db";
import { getExperimentResults } from "@/lib/analysis/getExperimentResults";
import { ResultSummary } from "@/components/result-summary";
import { RecoveryChart } from "@/components/recovery-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LiveDot } from "@/components/graphics";
import { Reveal } from "@/components/motion";

export default async function ExperimentResultsPage({
  params,
}: {
  params: Promise<{ experimentId: string }>;
}) {
  const { experimentId } = await params;
  const user = await requireCurrentUser();

  const experiment = await db.experiment.findUnique({ where: { id: experimentId } });
  if (!experiment || experiment.userId !== user.id) notFound();

  const results = await getExperimentResults(experimentId);
  if (!results) notFound();

  const format = (date: Date) => date.toISOString().slice(0, 10);
  const isActive = experiment.status === "ACTIVE";

  return (
    <div className="space-y-8">
      <Reveal>
        <header className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Lab report</p>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">
              {experiment.title}
            </h1>
            <div className="flex items-center gap-2 pt-2">
              <Badge
                variant="outline"
                className={isActive ? "gap-1.5 border-primary/40 text-primary" : undefined}
              >
                {isActive && <LiveDot />}
                {experiment.status.toLowerCase()}
              </Badge>
              <span className="font-mono text-xs text-muted-foreground">
                {format(experiment.startDate)} → {format(experiment.endDate)}
              </span>
            </div>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            {experiment.hypothesis}
          </p>
        </header>
      </Reveal>

      <ResultSummary results={results} />

      <Reveal delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recovery, night by night</CardTitle>
          </CardHeader>
          <CardContent>
            {results.chartData.length > 0 ? (
              <>
                <RecoveryChart data={results.chartData} />
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  Each dot is one valid night&apos;s recovery score, colored by what that day was assigned.
                  The dashed lines are each condition&apos;s average, and the gap between them is your result.
                </p>
              </>
            ) : (
              <p className="py-10 text-center text-sm leading-relaxed text-muted-foreground">
                No valid nights on the board yet. A night shows up here once you&apos;ve logged the day, WHOOP
                has scored the sleep, and nothing unusual was flagged. Usually that means the next morning.
              </p>
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
