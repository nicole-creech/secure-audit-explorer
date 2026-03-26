"use client";

import { useMemo, useState } from "react";
import type { AuditEvent } from "@prisma/client";
import { getDetectionLabels } from "@/lib/detection";

function severityBadge(severity: string) {
  const styles: Record<string, string> = {
    low: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
    medium: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30",
    high: "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/30",
    critical: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30",
  };

  return styles[severity] ?? "bg-white/10 text-white ring-1 ring-white/20";
}

function anomalyBadge(label: string) {
  const styles: Record<string, string> = {
    "Impossible travel":
      "bg-fuchsia-500/15 text-fuchsia-300 ring-1 ring-fuchsia-500/30",
    "Privilege escalation":
      "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/30",
    "Repeated auth failures":
      "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30",
    "Large export":
      "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/30",
    "Unauthorized service access":
      "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30",
    "Suspicious activity":
      "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30",
  };

  return styles[label] ?? "bg-white/10 text-white ring-1 ring-white/20";
}

export default function EventTable({ events }: { events: AuditEvent[] }) {
  const [selected, setSelected] = useState<AuditEvent | null>(null);
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return events.filter((event) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        event.actor.toLowerCase().includes(normalizedQuery) ||
        event.action.toLowerCase().includes(normalizedQuery) ||
        event.resource.toLowerCase().includes(normalizedQuery) ||
        event.ipAddress.toLowerCase().includes(normalizedQuery);

      const matchesSeverity =
        severity === "all" ? true : event.severity === severity;

      const matchesFlagged = flaggedOnly ? event.flagged : true;

      return matchesQuery && matchesSeverity && matchesFlagged;
    });
  }, [events, query, severity, flaggedOnly]);

  return (
    <div className="relative">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by actor, action, resource, or IP..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={flaggedOnly}
              onChange={(e) => setFlaggedOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900"
            />
            Flagged only
          </label>
        </div>
      </div>

      <div className="mb-3 text-sm text-slate-400">
        Showing <span className="font-medium text-slate-200">{filteredEvents.length}</span> of{" "}
        <span className="font-medium text-slate-200">{events.length}</span> events
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-900/80">
            <tr className="text-left text-sm text-slate-400">
              <th className="px-5 py-3 font-medium">Timestamp</th>
              <th className="px-5 py-3 font-medium">Actor</th>
              <th className="px-5 py-3 font-medium">Action</th>
              <th className="px-5 py-3 font-medium">Resource</th>
              <th className="px-5 py-3 font-medium">Anomaly</th>
              <th className="px-5 py-3 font-medium">Severity</th>
              <th className="px-5 py-3 font-medium">Risk</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {filteredEvents.map((event) => {
              const detections = getDetectionLabels(event);

              return (
                <tr
                  key={event.id}
                  onClick={() => setSelected(event)}
                  className="cursor-pointer hover:bg-slate-800/40"
                >
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-300">
                    {new Date(event.timestamp).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-100">
                    <div>{event.actor}</div>
                    <div className="text-xs text-slate-500">{event.ipAddress}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-300">
                    {event.action}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-300">
                    <div>{event.resource}</div>
                    <div className="text-xs text-slate-500">{event.resourceType}</div>
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                      {detections.length > 0 ? (
                        detections.map((label) => (
                          <span
                            key={label}
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${anomalyBadge(
                              label
                            )}`}
                          >
                            {label}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${severityBadge(
                        event.severity
                      )}`}
                    >
                      {event.severity}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-300">
                    {event.riskScore}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-300 capitalize">
                    {event.status}
                  </td>
                </tr>
              );
            })}

            {filteredEvents.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  No events match your current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-100">Event Details</h2>
            <button
              onClick={() => setSelected(null)}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
            >
              Close
            </button>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <div>
              <p className="text-slate-500">Timestamp</p>
              <p>{new Date(selected.timestamp).toLocaleString()}</p>
            </div>

            <div>
              <p className="text-slate-500">Actor</p>
              <p>{selected.actor}</p>
            </div>

            <div>
              <p className="text-slate-500">Actor Type</p>
              <p className="capitalize">{selected.actorType.replaceAll("_", " ")}</p>
            </div>

            <div>
              <p className="text-slate-500">Action</p>
              <p>{selected.action}</p>
            </div>

            <div>
              <p className="text-slate-500">Resource</p>
              <p>{selected.resource}</p>
              <p className="text-xs text-slate-500">{selected.resourceType}</p>
            </div>

            <div>
              <p className="text-slate-500">IP Address</p>
              <p>{selected.ipAddress}</p>
            </div>

            <div>
              <p className="text-slate-500">Location</p>
              <p>{selected.location ?? "Unknown"}</p>
            </div>

            <div>
              <p className="text-slate-500">User Agent</p>
              <p>{selected.userAgent ?? "Unknown"}</p>
            </div>

            <div>
              <p className="mb-2 text-slate-500">Detections</p>
              <div className="flex flex-wrap gap-2">
                {getDetectionLabels(selected).length > 0 ? (
                  getDetectionLabels(selected).map((label) => (
                    <span
                      key={label}
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${anomalyBadge(
                        label
                      )}`}
                    >
                      {label}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">None</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500">Severity</p>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${severityBadge(
                    selected.severity
                  )}`}
                >
                  {selected.severity}
                </span>
              </div>

              <div>
                <p className="text-slate-500">Risk Score</p>
                <p>{selected.riskScore}</p>
              </div>

              <div>
                <p className="text-slate-500">Status</p>
                <p className="capitalize">{selected.status}</p>
              </div>

              <div>
                <p className="text-slate-500">Outcome</p>
                <p className="capitalize">{selected.outcome}</p>
              </div>
            </div>

            <div>
              <p className="text-slate-500">Flagged</p>
              <p>{selected.flagged ? "Yes" : "No"}</p>
            </div>

            {selected.reason && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rose-300">
                  Flag Reason
                </p>
                <p className="text-sm text-rose-100">{selected.reason}</p>
              </div>
            )}

            {selected.metadata && (
              <div>
                <p className="mb-2 text-slate-500">Metadata</p>
                <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300">
                  {JSON.stringify(JSON.parse(selected.metadata), null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}