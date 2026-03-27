"use client";

import type { AuditEventView } from "@/lib/types";
import { deriveAlerts, type DerivedAlert } from "@/lib/alerts";
import { useMemo, useState } from "react";
import AlertDetailDrawer from "./AlertDetailDrawer";

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
  const [updatingAlerts, setUpdatingAlerts] = useState<Set<string>>(new Set());
  const [selectedAlert, setSelectedAlert] = useState<DerivedAlert | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function jumpToActor(actor: string) {
    const params = new URLSearchParams(window.location.search);
    params.set("q", actor);
    params.delete("page");
    window.location.href = `${window.location.pathname}?${params.toString()}`;
  }

  function openAlertDetail(alert: DerivedAlert) {
    setSelectedAlert(alert);
    setDrawerOpen(true);
  }

  function closeAlertDetail() {
    setSelectedAlert(null);
    setDrawerOpen(false);
  }

  async function updateAlertStatus(alertId: string, status: string, owner?: string) {
    setUpdatingAlerts(prev => new Set(prev).add(alertId));

    try {
      const alert = alerts.find(a => a.id === alertId);
      if (!alert) return;

      const response = await fetch("/api/alert-cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alertKey: alertId,
          title: alert.title,
          actor: alert.actor,
          detectionType: alert.detectionType,
          status,
          owner,
        }),
      });

      if (response.ok) {
        // Refresh the page to show updated status
        window.location.reload();
      } else {
        console.error("Failed to update alert status");
      }
    } catch (error) {
      console.error("Error updating alert:", error);
    } finally {
      setUpdatingAlerts(prev => {
        const newSet = new Set(prev);
        newSet.delete(alertId);
        return newSet;
      });
    }
  }

  return (
    <>
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
            <div
              key={alert.id}
              onClick={() => openAlertDetail(alert)}
              className="cursor-pointer rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-left transition hover:border-cyan-500/40 hover:bg-slate-950"
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
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${badgeStyles(
                      alert.severity
                    )}`}
                  >
                    {alert.severity}
                  </span>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${badgeStyles(
                      alert.status
                    )}`}
                  >
                    {alert.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateAlertStatus(alert.id, "triaged");
                    }}
                    disabled={updatingAlerts.has(alert.id) || alert.status === "triaged" || alert.status === "resolved"}
                    className="inline-flex items-center rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 transition hover:bg-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark Triaged
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateAlertStatus(alert.id, "resolved");
                    }}
                    disabled={updatingAlerts.has(alert.id) || alert.status === "resolved"}
                    className="inline-flex items-center rounded-lg border border-slate-500/30 bg-slate-500/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Resolve
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateAlertStatus(alert.id, "open", "Analyst");
                    }}
                    disabled={updatingAlerts.has(alert.id)}
                    className="inline-flex items-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Assign to Analyst
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    jumpToActor(alert.actor);
                  }}
                  className="text-xs font-medium uppercase tracking-wide text-cyan-300 hover:text-cyan-200"
                >
                  Investigate Actor →
                </button>
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  View Details →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>

    <AlertDetailDrawer
      alert={selectedAlert}
      events={events}
      open={drawerOpen}
      onClose={closeAlertDetail}
    />
  </>
  );
}