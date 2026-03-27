"use client";

import type { AuditEventView } from "@/lib/types";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type AnalyticsPanelProps = {
  events: AuditEventView[];
};

export default function AnalyticsPanel({ events }: AnalyticsPanelProps) {
  const severityData = ["low", "medium", "high", "critical"].map(
    (severity) => ({
      name: severity,
      value: events.filter((event) => event.severity === severity).length,
    })
  );

  const flaggedData = [
    {
      name: "Flagged",
      value: events.filter((event) => event.flagged).length,
    },
    {
      name: "Not Flagged",
      value: events.filter((event) => !event.flagged).length,
    },
  ];

  const statusData = ["open", "investigating", "resolved", "closed"].map(
    (status) => ({
      name: status,
      value: events.filter((event) => event.status === status).length,
    })
  );

  const actorMap = new Map<string, number>();

  for (const event of events) {
    actorMap.set(event.actor, (actorMap.get(event.actor) ?? 0) + 1);
  }

  const topActorsData = [...actorMap.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const totalStatus = statusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-100">
          Severity Distribution
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Volume of events by severity level.
        </p>

        <div className="mt-6 h-72 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={severityData}>
              <XAxis
                dataKey="name"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={{ stroke: "#334155" }}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={{ stroke: "#334155" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                  color: "#e2e8f0",
                }}
                labelStyle={{ color: "#cbd5e1" }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {severityData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={
                      entry.name === "critical"
                        ? "#f43f5e"
                        : entry.name === "high"
                          ? "#f97316"
                          : entry.name === "medium"
                            ? "#f59e0b"
                            : "#10b981"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-100">
          Flagged vs. Non-Flagged
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Ratio of flagged events in the current dataset.
        </p>

        <div className="mt-6 h-72 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={flaggedData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={4}
              >
                {flaggedData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.name === "Flagged" ? "#06b6d4" : "#475569"}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                  color: "#e2e8f0",
                }}
                labelStyle={{ color: "#cbd5e1" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
          {flaggedData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{
                  backgroundColor:
                    item.name === "Flagged" ? "#06b6d4" : "#475569",
                }}
              />
              <span>
                {item.name}: {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-100">Top Actors</h2>
        <p className="mt-1 text-sm text-slate-400">
          Accounts generating the most audit activity.
        </p>

        <div className="mt-6 h-72 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topActorsData} layout="vertical" margin={{ left: 30 }}>
              <XAxis
                type="number"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={{ stroke: "#334155" }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={{ stroke: "#334155" }}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                  color: "#e2e8f0",
                }}
                labelStyle={{ color: "#cbd5e1" }}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="#22d3ee" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-100">
          Investigation Status Breakdown
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Distribution of current event statuses.
        </p>

        <div className="mt-6 space-y-4">
          {statusData.map((item) => {
            const percentage =
              totalStatus === 0 ? 0 : Math.round((item.value / totalStatus) * 100);

            return (
              <div key={item.name}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="capitalize text-slate-300">{item.name}</span>
                  <span className="text-slate-500">
                    {item.value} ({percentage}%)
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-cyan-400"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}