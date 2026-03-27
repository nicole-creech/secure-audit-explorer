"use client";

import type { AuditEventView } from "@/lib/types";
import { deriveAlerts } from "@/lib/alerts";
import { useMemo } from "react";

type AlertFeedProps = {
  events: AuditEventView[];
};

function badgeStyles(value: string) {
  const styles: Record<string, string> = {
    low: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
    medium: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30",
    high: "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/30",
    critical: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30",
    open: "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/30",
    triaged: "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30",
    resolved: "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30",
  };

  return styles[value] ?? "bg-white/10 text-white ring-1 ring-white/20";
}

export default function AlertFeed({ events }: AlertFeedProps) {
  const alerts = useMemo(() => deriveAlerts(events), [events]);

  function jumpToActor(actor: string) {
    const params = new URLSearchParams(window.location.search);
    params.set("q", actor);
    params.delete("page");
    window.location.href = `${window.location.pathname}?${params.toString()}`;
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
      <div className="mb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              Derived Alert Feed
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Correlated alerts generated from suspicious event patterns.
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300">
            {alerts.length} active derived alert{alerts.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-6 text-sm text-slate-500">
          No derived alerts were generated for the current result set.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {alerts.map((alert) => (
            <button
              key={alert.id}
              type="button"
              onClick={() => jumpToActor(alert.actor)}
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-left transition hover:border-cyan-500/40 hover:bg-slate-950"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {alert.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${badgeStyles(
                      alert.priority
                    )}`}
                  >
                    {alert.priority}
                  </span>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${badgeStyles(
                      alert.status
                    )}`}
                  >
                    {alert.status}
                  </span>
                </div>
              </div>

              <div className="mb-3 flex items-center gap-2 text-sm text-slate-300">
                <span className="font-medium text-slate-100">{alert.actor}</span>
                <span className="text-slate-600">•</span>
                <span>{alert.eventCount} related event{alert.eventCount === 1 ? "" : "s"}</span>
              </div>

              <p className="text-sm leading-6 text-slate-400">
                {alert.summary}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${badgeStyles(
                    alert.severity
                  )}`}
                >
                  {alert.severity}
                </span>

                <span className="text-xs font-medium uppercase tracking-wide text-cyan-300">
                  Investigate actor →
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}