"use client";

import { useEffect, useMemo, useState } from "react";
import type { AuditEventView } from "@/lib/types";
import {
  getDetectionLabels,
  getInvestigationPriority,
  getPriorityScore,
} from "@/lib/detection";

type AnalystNote = {
  id: string;
  eventId: string;
  content: string;
  author: string;
  createdAt: string;
};

type EventTableProps = {
  events: AuditEventView[];
};

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

function priorityBadge(priority: string) {
  const styles: Record<string, string> = {
    low: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
    medium: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30",
    high: "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/30",
    critical: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30",
  };

  return styles[priority] ?? "bg-white/10 text-white ring-1 ring-white/20";
}

function rowPriorityStyle(priority: string) {
  if (priority === "critical") return "bg-rose-500/5 hover:bg-rose-500/10";
  if (priority === "high") return "bg-orange-500/5 hover:bg-orange-500/10";
  return "hover:bg-slate-800/40";
}

function getInvestigationSummary(
  event: AuditEventView,
  relatedEvents: AuditEventView[]
) {
  const detections = getDetectionLabels(event);
  const flaggedCount = relatedEvents.filter((item) => item.flagged).length;
  const criticalCount = relatedEvents.filter(
    (item) => item.severity === "critical"
  ).length;

  if (detections.includes("Impossible travel")) {
    return "This actor has activity associated with impossible travel indicators. Review authentication origin, session history, and recent access changes for possible account compromise.";
  }

  if (detections.includes("Privilege escalation")) {
    return "This actor performed a privilege-related action. Validate whether the access change was approved and whether any sensitive systems were touched afterward.";
  }

  if (detections.includes("Repeated auth failures")) {
    return "This actor shows failed authentication behavior that may indicate password spraying, brute force attempts, or stolen credential testing.";
  }

  if (flaggedCount >= 2 || criticalCount >= 1) {
    return "This actor has multiple elevated events in the current timeline. The pattern suggests the account should be reviewed as part of an active investigation.";
  }

  return `This actor has ${relatedEvents.length} related events in the current dataset. Review the event sequence to understand whether the selected activity is isolated or part of a broader pattern.`;
}

export default function EventTable({ events }: EventTableProps) {
  const [selected, setSelected] = useState<AuditEventView | null>(null);
  const [notes, setNotes] = useState<AnalystNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  const selectedId = selected?.id ?? null;
  const selectedActor = selected?.actor ?? null;

  const selectedRelatedEvents = useMemo(() => {
    if (!selectedActor) return [];

    return [...events]
      .filter((event) => event.actor === selectedActor)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
  }, [events, selectedActor]);

  useEffect(() => {
    if (!selectedId) {
      setNotes([]);
      setNewNote("");
      setNotesError(null);
      setIsLoadingNotes(false);
      return;
    }

    let cancelled = false;

    async function loadNotes() {
      try {
        setIsLoadingNotes(true);
        setNotesError(null);

        const res = await fetch(`/api/events/${selectedId}/notes`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to load notes.");
        }

        const data: AnalystNote[] = await res.json();

        if (!cancelled) {
          setNotes(data);
        }
      } catch (error) {
        if (!cancelled) {
          setNotesError(
            error instanceof Error ? error.message : "Failed to load notes."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingNotes(false);
        }
      }
    }

    void loadNotes();

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  async function handleAddNote() {
    if (!selectedId || !newNote.trim()) return;

    try {
      setIsSavingNote(true);
      setNotesError(null);

      const res = await fetch(`/api/events/${selectedId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newNote.trim(),
        }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(
          errorBody?.error && typeof errorBody.error === "string"
            ? errorBody.error
            : "Failed to save note."
        );
      }

      const created: AnalystNote = await res.json();
      setNotes((prev) => [created, ...prev]);
      setNewNote("");
    } catch (error) {
      setNotesError(
        error instanceof Error ? error.message : "Failed to save note."
      );
    } finally {
      setIsSavingNote(false);
    }
  }

  return (
    <div className="relative">
      <div className="mb-3 text-sm text-slate-400">
        Returned{" "}
        <span className="font-medium text-slate-200">{events.length}</span>{" "}
        events from the server
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
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">Severity</th>
              <th className="px-5 py-3 font-medium">Risk</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {events.map((event) => {
              const detections = getDetectionLabels(event);
              const priority = getInvestigationPriority(event);

              return (
                <tr
                  key={event.id}
                  onClick={() => setSelected(event)}
                  className={`cursor-pointer ${rowPriorityStyle(priority)}`}
                >
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-300">
                    {new Date(event.timestamp).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-100">
                    <div>{event.actor}</div>
                    <div className="text-xs text-slate-500">
                      {event.ipAddress}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-300">
                    {event.action}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-300">
                    <div>{event.resource}</div>
                    <div className="text-xs text-slate-500">
                      {event.resourceType}
                    </div>
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
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${priorityBadge(
                        priority
                      )}`}
                    >
                      {priority}
                    </span>
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

            {events.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  No events matched the current server-side filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setSelected(null)}
          />

          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl overflow-y-auto border-l border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-100">
                Investigation Workspace
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="mb-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
                Investigation Summary
              </p>
              <p className="text-sm text-cyan-50">
                {getInvestigationSummary(selected, selectedRelatedEvents)}
              </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
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
                  <p className="text-slate-500">Action</p>
                  <p>{selected.action}</p>
                </div>

                <div>
                  <p className="text-slate-500">Resource</p>
                  <p>{selected.resource}</p>
                </div>

                <div>
                  <p className="text-slate-500">IP Address</p>
                  <p>{selected.ipAddress}</p>
                </div>

                <div>
                  <p className="mb-2 text-slate-500">Detections</p>
                  <div className="flex flex-wrap gap-2">
                    {getDetectionLabels(selected).map((label) => (
                      <span
                        key={label}
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${anomalyBadge(
                          label
                        )}`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-slate-500">Investigation Priority</p>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${priorityBadge(
                        getInvestigationPriority(selected)
                      )}`}
                    >
                      {getInvestigationPriority(selected)}
                    </span>
                    <span className="text-xs text-slate-400">
                      Score: {getPriorityScore(selected)}/100
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-100">
                      Analyst Notes
                    </h3>
                    <span className="text-xs text-slate-500">
                      {notes.length} {notes.length === 1 ? "note" : "notes"}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={4}
                      placeholder="Document findings, next steps, escalation context, or analyst observations..."
                      className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                    />

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        Notes persist to this audit event.
                      </p>

                      <button
                        type="button"
                        onClick={handleAddNote}
                        disabled={isSavingNote || !newNote.trim()}
                        className="rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSavingNote ? "Saving..." : "Add Note"}
                      </button>
                    </div>
                  </div>

                  {notesError && (
                    <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                      {notesError}
                    </div>
                  )}

                  <div className="mt-4 space-y-3">
                    {isLoadingNotes ? (
                      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
                        Loading notes...
                      </div>
                    ) : notes.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-500">
                        No analyst notes yet for this event.
                      </div>
                    ) : (
                      notes.map((note) => (
                        <div
                          key={note.id}
                          className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                        >
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              {note.author}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(note.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">
                            {note.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-slate-100">
                    Actor Timeline
                  </h3>
                  <p className="text-sm text-slate-400">
                    Related activity for{" "}
                    <span className="font-medium text-slate-200">
                      {selected.actor}
                    </span>
                  </p>
                </div>

                <div className="space-y-4">
                  {selectedRelatedEvents.map((relatedEvent, index) => {
                    const detections = getDetectionLabels(relatedEvent);
                    const isSelected = relatedEvent.id === selected.id;
                    const priority = getInvestigationPriority(relatedEvent);

                    return (
                      <div key={relatedEvent.id} className="relative pl-6">
                        {index < selectedRelatedEvents.length - 1 && (
                          <div className="absolute left-[10px] top-6 h-full w-px bg-slate-800" />
                        )}

                        <div
                          className={`absolute left-0 top-1.5 h-5 w-5 rounded-full border-2 ${
                            isSelected
                              ? "border-cyan-400 bg-cyan-400/20"
                              : "border-slate-600 bg-slate-900"
                          }`}
                        />

                        <div
                          className={`rounded-2xl border p-4 ${
                            isSelected
                              ? "border-cyan-500/30 bg-cyan-500/10"
                              : priority === "critical"
                                ? "border-rose-500/20 bg-rose-500/5"
                                : priority === "high"
                                  ? "border-orange-500/20 bg-orange-500/5"
                                  : "border-slate-800 bg-slate-950/60"
                          }`}
                        >
                          <div className="mb-2 flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium text-slate-100">
                                {relatedEvent.action}
                              </p>
                              <p className="text-xs text-slate-500">
                                {new Date(
                                  relatedEvent.timestamp
                                ).toLocaleString()}
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${priorityBadge(
                                  priority
                                )}`}
                              >
                                {priority}
                              </span>
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${severityBadge(
                                  relatedEvent.severity
                                )}`}
                              >
                                {relatedEvent.severity}
                              </span>
                            </div>
                          </div>

                          <div className="mb-2 text-sm text-slate-300">
                            <div>{relatedEvent.resource}</div>
                            <div className="text-xs text-slate-500">
                              {relatedEvent.resourceType} •{" "}
                              {relatedEvent.ipAddress}
                            </div>
                          </div>

                          {detections.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {detections.map((label) => (
                                <span
                                  key={label}
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${anomalyBadge(
                                    label
                                  )}`}
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {selectedRelatedEvents.length === 0 && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-500">
                      No related timeline events found for this actor.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}