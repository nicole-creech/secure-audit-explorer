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
  tags?: string[];
  relatedEvents?: { id: string; action: string; }[];
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
  const [status, setStatus] = useState(event?.status || "open");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>(event?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [isUpdatingTags, setIsUpdatingTags] = useState(false);
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<{ id: string; action: string }[]>(event?.relatedEvents || []);
  const [relatedIdInput, setRelatedIdInput] = useState("");
  const [isUpdatingRelated, setIsUpdatingRelated] = useState(false);
  const [relatedError, setRelatedError] = useState<string | null>(null);

  useEffect(() => {
    setStatus(event?.status || "open");
    setTags(event?.tags || []);
    setRelatedEvents(event?.relatedEvents || []);
  }, [event]);
  async function handleStatusChange(newStatus: string) {
    if (!event?.id || newStatus === status) return;
    setIsUpdatingStatus(true);
    setStatusError(null);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, tags, relatedEventIds: relatedEvents.map(e => e.id) }),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.error || "Failed to update status.");
      }
      setStatus(newStatus);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Failed to update status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleAddTag() {
    if (!event?.id || !newTag.trim() || tags.includes(newTag.trim())) return;
    setIsUpdatingTags(true);
    setTagsError(null);
    const updatedTags = [...tags, newTag.trim()];
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: updatedTags, status, relatedEventIds: relatedEvents.map(e => e.id) }),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.error || "Failed to update tags.");
      }
      setTags(updatedTags);
      setNewTag("");
    } catch (error) {
      setTagsError(error instanceof Error ? error.message : "Failed to update tags.");
    } finally {
      setIsUpdatingTags(false);
    }
  }

  async function handleRemoveTag(tag: string) {
    if (!event?.id) return;
    setIsUpdatingTags(true);
    setTagsError(null);
    const updatedTags = tags.filter(t => t !== tag);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: updatedTags, status, relatedEventIds: relatedEvents.map(e => e.id) }),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.error || "Failed to update tags.");
      }
      setTags(updatedTags);
    } catch (error) {
      setTagsError(error instanceof Error ? error.message : "Failed to update tags.");
    } finally {
      setIsUpdatingTags(false);
    }
  }

  async function handleAddRelatedEvent() {
    if (!event?.id || !relatedIdInput.trim() || relatedEvents.some(e => e.id === relatedIdInput.trim()) || relatedIdInput.trim() === event.id) return;
    setIsUpdatingRelated(true);
    setRelatedError(null);
    const updatedRelated = [...relatedEvents, { id: relatedIdInput.trim(), action: "" }];
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relatedEventIds: updatedRelated.map(e => e.id), status, tags }),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.error || "Failed to update related events.");
      }
      setRelatedEvents(updatedRelated);
      setRelatedIdInput("");
    } catch (error) {
      setRelatedError(error instanceof Error ? error.message : "Failed to update related events.");
    } finally {
      setIsUpdatingRelated(false);
    }
  }

  async function handleRemoveRelatedEvent(id: string) {
    if (!event?.id) return;
    setIsUpdatingRelated(true);
    setRelatedError(null);
    const updatedRelated = relatedEvents.filter(e => e.id !== id);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relatedEventIds: updatedRelated.map(e => e.id), status, tags }),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.error || "Failed to update related events.");
      }
      setRelatedEvents(updatedRelated);
    } catch (error) {
      setRelatedError(error instanceof Error ? error.message : "Failed to update related events.");
    } finally {
      setIsUpdatingRelated(false);
    }
  }

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

        if (!event?.id) return;
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
            {/* Tag management */}
            <div className="mb-4">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Tags</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center rounded bg-blue-900/40 px-2 py-1 text-xs text-blue-200">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="ml-1 text-blue-300 hover:text-red-400" disabled={isUpdatingTags}>×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-100"
                  placeholder="Add tag"
                  disabled={isUpdatingTags}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddTag(); }}
                />
                <button onClick={handleAddTag} disabled={isUpdatingTags || !newTag.trim()} className="rounded bg-blue-700 px-2 py-1 text-xs text-white">Add</button>
              </div>
              {isUpdatingTags && <span className="text-xs text-blue-400 ml-2">Updating...</span>}
              {tagsError && <span className="text-xs text-red-400 ml-2">{tagsError}</span>}
            </div>

            {/* Related events management */}
            <div className="mb-4">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Related Events</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {relatedEvents.map(ev => (
                  <span key={ev.id} className="inline-flex items-center rounded bg-green-900/40 px-2 py-1 text-xs text-green-200">
                    {ev.id}
                    <button onClick={() => handleRemoveRelatedEvent(ev.id)} className="ml-1 text-green-300 hover:text-red-400" disabled={isUpdatingRelated}>×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={relatedIdInput}
                  onChange={e => setRelatedIdInput(e.target.value)}
                  className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-100"
                  placeholder="Add related event ID"
                  disabled={isUpdatingRelated}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddRelatedEvent(); }}
                />
                <button onClick={handleAddRelatedEvent} disabled={isUpdatingRelated || !relatedIdInput.trim()} className="rounded bg-green-700 px-2 py-1 text-xs text-white">Add</button>
              </div>
              {isUpdatingRelated && <span className="text-xs text-green-400 ml-2">Updating...</span>}
              {relatedError && <span className="text-xs text-red-400 ml-2">{relatedError}</span>}
            </div>
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
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase tracking-wide text-zinc-500">Status</label>
                <select
                  className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                  value={status}
                  onChange={e => handleStatusChange(e.target.value)}
                  disabled={isUpdatingStatus}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
                {isUpdatingStatus && <span className="text-xs text-blue-400">Updating...</span>}
                {statusError && <span className="text-xs text-red-400">{statusError}</span>}
              </div>
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