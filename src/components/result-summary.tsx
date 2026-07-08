import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ExperimentResults } from "@/lib/analysis/getExperimentResults";

function formatSigned(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return rounded >= 0 ? `+${rounded}` : `${rounded}`;
}

const CONFIDENCE_LABEL_TEXT: Record<ExperimentResults["confidenceLabel"], string> = {
  INSUFFICIENT: "Insufficient data",
  LOW: "Low confidence",
  MODERATE: "Moderate confidence",
  HIGHER: "Higher confidence",
};

export function ResultSummary({ results }: { results: ExperimentResults }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Estimated difference" value={`${formatSigned(results.unadjustedEffect)} pts`} />
          <Stat
            label="Approximate 95% interval"
            value={`${formatSigned(results.confidenceIntervalLow)} to ${formatSigned(
              results.confidenceIntervalHigh
            )}`}
          />
          <Stat label="Valid days" value={String(results.validDayCount)} />
          <Stat label="Adherence" value={`${Math.round(results.adherenceRate * 100)}%`} />
        </div>

        <Separator />

        <p className="text-sm leading-relaxed">{results.narrative}</p>

        {results.adjustedEffect !== null && (
          <p className="text-xs text-muted-foreground">
            Adjusted for day strain and weekday effects, the estimate is{" "}
            {formatSigned(results.adjustedEffect)} points. Unadjusted: {formatSigned(results.unadjustedEffect)}{" "}
            points.
          </p>
        )}

        {results.adherenceComparison && (
          <p className="text-xs text-muted-foreground">
            On days you reported actually following the plan, recovery was{" "}
            {formatSigned(results.adherenceComparison.effect)} points different than on days you didn&apos;t.
            Because adherence wasn&apos;t randomized, this is an association, not a randomized comparison — it
            may partly reflect which days you happened to follow the plan on.
          </p>
        )}

        <p className="text-xs font-medium text-muted-foreground">
          Confidence: {CONFIDENCE_LABEL_TEXT[results.confidenceLabel]}
        </p>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
