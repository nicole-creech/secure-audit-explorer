"use client";

import { Tooltip } from "recharts";

export function ChartTooltip() {
  return (
    <Tooltip
      contentStyle={{
        backgroundColor: "#020617",
        border: "1px solid #1e293b",
        borderRadius: "0.75rem",
        color: "#e2e8f0",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
      }}
      labelStyle={{ color: "#94a3b8" }}
      itemStyle={{ color: "#e2e8f0" }}
      cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
    />
  );
}

export function PieTooltip() {
  return (
    <Tooltip
      contentStyle={{
        backgroundColor: "#020617",
        border: "1px solid #1e293b",
        borderRadius: "0.75rem",
        color: "#e2e8f0",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
      }}
      labelStyle={{ color: "#94a3b8" }}
      itemStyle={{ color: "#e2e8f0" }}
    />
  );
}