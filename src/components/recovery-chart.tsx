"use client";

import {
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "@/lib/analysis/getExperimentResults";

const INTERVENTION_COLOR = "var(--chart-1)";
const CONTROL_COLOR = "var(--chart-2)";

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export function RecoveryChart({ data }: { data: ChartPoint[] }) {
  const indexed = data.map((point, index) => ({ ...point, index }));
  const intervention = indexed.filter((p) => p.assignedCondition === "INTERVENTION");
  const control = indexed.filter((p) => p.assignedCondition === "CONTROL");
  const interventionMean = mean(intervention.map((p) => p.recoveryScore));
  const controlMean = mean(control.map((p) => p.recoveryScore));

  // Fit the axis to the data (with padding) so the condition gap is visible —
  // a fixed 0–100 axis flattens everything into one band.
  const scores = indexed.map((p) => p.recoveryScore);
  const yMin = Math.max(0, Math.floor((Math.min(...scores) - 12) / 10) * 10);
  const yMax = Math.min(100, Math.ceil((Math.max(...scores) + 8) / 10) * 10);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 10, right: 16, bottom: 4, left: -18 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="index"
          name="Day"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(index) => indexed[index]?.date.slice(5) ?? ""}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          stroke="var(--border)"
        />
        <YAxis
          dataKey="recoveryScore"
          name="Recovery score"
          domain={[yMin, yMax]}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          stroke="var(--border)"
        />
        <Tooltip
          cursor={{ strokeDasharray: "3 3", stroke: "var(--muted-foreground)" }}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: "0.6rem",
            color: "var(--popover-foreground)",
            fontSize: 12,
          }}
          formatter={(value) => [`${value}`, "Recovery"]}
          labelFormatter={(index) => indexed[Number(index)]?.date ?? ""}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {interventionMean !== null && (
          <ReferenceLine y={interventionMean} stroke={INTERVENTION_COLOR} strokeDasharray="5 5" strokeOpacity={0.6} />
        )}
        {controlMean !== null && (
          <ReferenceLine y={controlMean} stroke={CONTROL_COLOR} strokeDasharray="5 5" strokeOpacity={0.6} />
        )}
        <Scatter name="Habit days" data={intervention} fill={INTERVENTION_COLOR} isAnimationActive={false} />
        <Scatter name="Normal days" data={control} fill={CONTROL_COLOR} isAnimationActive={false} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
