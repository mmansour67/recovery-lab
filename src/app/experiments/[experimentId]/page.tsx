import { notFound } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/getCurrentUser";
import { db } from "@/lib/db";
import { getExperimentResults } from "@/lib/analysis/getExperimentResults";
import { ResultSummary } from "@/components/result-summary";
import { RecoveryChart } from "@/components/recovery-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{experiment.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{experiment.hypothesis}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recovery by day</CardTitle>
        </CardHeader>
        <CardContent>
          {results.chartData.length > 0 ? (
            <RecoveryChart data={results.chartData} />
          ) : (
            <p className="text-sm text-muted-foreground">No valid days yet.</p>
          )}
        </CardContent>
      </Card>

      <ResultSummary results={results} />
    </div>
  );
}
