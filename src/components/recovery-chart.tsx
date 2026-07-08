"use client";

import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "@/lib/analysis/getExperimentResults";

export function RecoveryChart({ data }: { data: ChartPoint[] }) {
  const indexed = data.map((point, index) => ({ ...point, index }));
  const intervention = indexed.filter((p) => p.assignedCondition === "INTERVENTION");
  const control = indexed.filter((p) => p.assignedCondition === "CONTROL");

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="index"
          name="Day"
          tickFormatter={(index) => indexed[index]?.date ?? ""}
          type="number"
          domain={["dataMin", "dataMax"]}
        />
        <YAxis dataKey="recoveryScore" name="Recovery score" domain={[0, 100]} />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          formatter={(value) => [`${value}`, "Recovery score"]}
          labelFormatter={(index) => indexed[Number(index)]?.date ?? ""}
        />
        <Legend />
        <Scatter name="Intervention" data={intervention} fill="#2563eb" />
        <Scatter name="Control" data={control} fill="#9ca3af" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
