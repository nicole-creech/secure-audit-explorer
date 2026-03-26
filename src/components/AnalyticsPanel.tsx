"use client";

import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { AuditEvent } from "@prisma/client";
import { ChartTooltip, PieTooltip } from "@/components/charts/ChartTooltip";

type Props = {
  events: AuditEvent[];
};

function countBy<T extends string>(items: T[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] ?? 0) + 1;
    return acc;
  }, {});
}

export default function AnalyticsPanel({ events }: Props) {
  const severityData = Object.entries(
    countBy(events.map((event) => event.severity))
  ).map(([name, value]) => ({
    name,
    value,
  }));

  const statusData = Object.entries(
    countBy(events.map((event) => event.status))
  ).map(([name, value]) => ({
    name,
    value,
  }));

  const actorData = Object.entries(
    countBy(events.map((event) => event.actor))
  )
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

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

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-100">
            Severity Distribution
          </h2>
          <p className="text-sm text-slate-400">
            Breakdown of audit events by severity level.
          </p>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={severityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <ChartTooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-100">
            Flagged Event Ratio
          </h2>
          <p className="text-sm text-slate-400">
            Quick view of flagged versus non-flagged activity.
          </p>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={flaggedData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={95}
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {flaggedData.map((entry, index) => (
                  <Cell
                    key={`${entry.name}-${index}`}
                    fill={index === 0 ? "#f43f5e" : "#22c55e"}
                  />
                ))}
              </Pie>
              <PieTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-100">Top Actors</h2>
          <p className="text-sm text-slate-400">
            Most active identities in the current event set.
          </p>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={actorData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#94a3b8"
                width={120}
              />
              <ChartTooltip />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-100">
            Status Overview
          </h2>
          <p className="text-sm text-slate-400">
            Open, investigating, and closed event distribution.
          </p>
        </div>

        <div className="space-y-4">
          {statusData.map((item) => (
            <div key={item.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="capitalize text-slate-300">{item.name}</span>
                <span className="text-slate-400">{item.value}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-800">
                <div
                  className="h-3 rounded-full bg-cyan-400"
                  style={{
                    width: `${events.length > 0 ? (item.value / events.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}