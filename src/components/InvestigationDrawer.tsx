"use client";

import { useEffect, useState } from "react";

type AuditEvent = {
  id: string;
  timestamp: string | Date;
  actor: string;
  actorType: string;
  action: string;
  resource: string;
  resourceType: string;
  ipAddress: string;
  location?: string | null;
  userAgent?: string | null;
  severity: string;
  status: string;
  outcome: string;
  riskScore: number;
  flagged: boolean;
  reason?: string | null;
  metadata?: string | null;
  createdAt: string | Date;
};

type AnalystNote = {
  id: string;
  eventId: string;
  content: string;
  author: string;
  createdAt: string;
};

type InvestigationDrawerProps = {
  event: AuditEvent | null;
  open: boolean;
  onClose: () => void;
};

export default function InvestigationDrawer({
  event,
  open,
  onClose,
}: InvestigationDrawerProps) {
  const [notes, setNotes] = useState<AnalystNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  useEffect(() => {
    if (!event?.id || !open) {
      setNotes([]);
      setNewNote("");
      setNotesError(null);
      return;
    }

    let cancelled = false;

    async function loadNotes() {
      try {
        setIsLoadingNotes(true);
        setNotesError(null);

        const res = await fetch(`/api/events/${event.id}/notes`, {
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

    loadNotes();

    return () => {
      cancelled = true;
    };
  }, [event?.id, open]);

  async function handleAddNote() {
    if (!event?.id || !newNote.trim()) return;

    try {
      setIsSavingNote(true);
      setNotesError(null);

      const res = await fetch(`/api/events/${event.id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newNote,
        }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.error || "Failed to save note.");
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

  if (!open || !event) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-xl overflow-y-auto border-l border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Investigation
            </p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-100">
              {event.action}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            Close
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <h3 className="mb-3 text-sm font-semibold text-zinc-100">
              Event Details
            </h3>

            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <Detail label="Actor" value={event.actor} />
              <Detail label="Actor Type" value={event.actorType} />
              <Detail label="Action" value={event.action} />
              <Detail label="Resource" value={event.resource} />
              <Detail label="Resource Type" value={event.resourceType} />
              <Detail label="IP Address" value={event.ipAddress} />
              <Detail label="Location" value={event.location || "—"} />
              <Detail label="User Agent" value={event.userAgent || "—"} />
              <Detail label="Severity" value={event.severity} />
              <Detail label="Status" value={event.status} />
              <Detail label="Outcome" value={event.outcome} />
              <Detail label="Risk Score" value={String(event.riskScore)} />
              <Detail
                label="Flagged"
                value={event.flagged ? "Yes" : "No"}
              />
              <Detail
                label="Timestamp"
                value={new Date(event.timestamp).toLocaleString()}
              />
            </div>

            {event.reason && (
              <div className="mt-4 rounded-lg border border-amber-900/40 bg-amber-950/30 p-3 text-sm text-amber-200">
                <span className="font-medium">Detection reason:</span>{" "}
                {event.reason}
              </div>
            )}

            {event.metadata && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Metadata
                </p>
                <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-300">
                  {event.metadata}
                </pre>
              </div>
            )}
          </section>

          <section className="border-t border-zinc-800 pt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-100">
                Analyst Notes
              </h3>
              <span className="text-xs text-zinc-500">
                {notes.length} {notes.length === 1 ? "note" : "notes"}
              </span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <label
                htmlFor="analyst-note"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500"
              >
                Add note
              </label>

              <textarea
                id="analyst-note"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={4}
                placeholder="Document findings, escalation context, next steps, or analyst observations..."
                className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
              />

              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-zinc-500">
                  Notes persist to this event.
                </p>

                <button
                  type="button"
                  onClick={handleAddNote}
                  disabled={isSavingNote || !newNote.trim()}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingNote ? "Saving..." : "Add Note"}
                </button>
              </div>
            </div>

            {notesError && (
              <div className="mt-3 rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2 text-sm text-red-300">
                {notesError}
              </div>
            )}

            <div className="mt-4 space-y-3">
              {isLoadingNotes ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-400">
                  Loading notes...
                </div>
              ) : notes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-4 text-sm text-zinc-500">
                  No analyst notes yet for this event.
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                        {note.author}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-200">
                      {note.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 break-words text-sm text-zinc-200">{value}</p>
    </div>
  );
}