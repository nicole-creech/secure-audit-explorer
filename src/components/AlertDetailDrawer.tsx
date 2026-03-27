"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

type AlertNote = {
  id: string;
  eventId: string;
  content: string;
  author: string;
  createdAt: string;
};

export default function AlertDetailDrawer({
  alert,
  events,
  open,
  onClose,
}: AlertDetailDrawerProps) {
  const [alertNotes, setAlertNotes] = useState<AlertNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  // Get events related to this alert
  const relatedEvents = useMemo(() => 
    alert ? events.filter(event => alert.sourceEventIds.includes(event.id)) : [],
    [alert, events]
  );

  const loadAlertNotes = useCallback(async () => {
    if (!alert) return;

    setIsLoadingNotes(true);
    setNotesError(null);

    try {
      // For now, we'll use the existing notes API but filter by alert-related events
      // TODO: Create a dedicated alert notes API
      const notesPromises = relatedEvents.map(event =>
        fetch(`/api/events/${event.id}/notes`).then(res => res.json())
      );

      const allNotes = await Promise.all(notesPromises);
      const flattenedNotes = allNotes.flat();

      setAlertNotes(flattenedNotes);
    } catch (error) {
      setNotesError("Failed to load alert notes");
      console.error("Error loading alert notes:", error);
    } finally {
      setIsLoadingNotes(false);
    }
  }, [alert, relatedEvents]);

  // Load alert notes when alert changes
  useEffect(() => {
    if (alert && open) {
      loadAlertNotes();
    }
  }, [alert, open, loadAlertNotes]);

  const saveNote = async () => {
    if (!newNote.trim() || !alert) return;

    setIsSavingNote(true);

    try {
      // For now, save to the first related event
      // TODO: Create dedicated alert notes API
      const firstEvent = relatedEvents[0];
      if (!firstEvent) return;

      const response = await fetch(`/api/events/${firstEvent.id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newNote }),
      });

      if (response.ok) {
        setNewNote("");
        await loadAlertNotes(); // Refresh notes
      } else {
        setNotesError("Failed to save note");
      }
    } catch (error) {
      setNotesError("Failed to save note");
      console.error("Error saving note:", error);
    } finally {
      setIsSavingNote(false);
    }
  };

  if (!open || !alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative ml-auto h-full w-full max-w-2xl bg-slate-900 shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 p-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">
                Alert Investigation
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {alert.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Alert Summary */}
            <div className="mb-6 rounded-lg border border-slate-800 bg-slate-950 p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Actor:</span>
                  <span className="ml-2 text-slate-200">{alert.actor}</span>
                </div>
                <div>
                  <span className="text-slate-400">Detection:</span>
                  <span className="ml-2 text-slate-200">{alert.detectionType}</span>
                </div>
                <div>
                  <span className="text-slate-400">Severity:</span>
                  <span className="ml-2 text-slate-200 capitalize">{alert.severity}</span>
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>
                  <span className="ml-2 text-slate-200 capitalize">{alert.status}</span>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-slate-300">{alert.summary}</p>
              </div>
            </div>

            {/* Related Events */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-medium text-slate-200">
                Related Events ({relatedEvents.length})
              </h3>
              <div className="space-y-2">
                {relatedEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="rounded border border-slate-800 bg-slate-950 p-3 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200">
                        {event.action} on {event.resource}
                      </span>
                      <span className="text-slate-400">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
                {relatedEvents.length > 5 && (
                  <p className="text-center text-sm text-slate-500">
                    And {relatedEvents.length - 5} more events...
                  </p>
                )}
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <h3 className="mb-3 text-lg font-medium text-slate-200">
                Investigation Notes
              </h3>

              {notesError && (
                <div className="mb-3 rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                  {notesError}
                </div>
              )}

              {/* Add Note */}
              <div className="mb-4">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add investigation note..."
                  className="w-full rounded border border-slate-700 bg-slate-950 p-3 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  rows={3}
                />
                <button
                  onClick={saveNote}
                  disabled={!newNote.trim() || isSavingNote}
                  className="mt-2 rounded bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50"
                >
                  {isSavingNote ? "Saving..." : "Add Note"}
                </button>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                {isLoadingNotes ? (
                  <p className="text-sm text-slate-500">Loading notes...</p>
                ) : alertNotes.length === 0 ? (
                  <p className="text-sm text-slate-500">No investigation notes yet.</p>
                ) : (
                  alertNotes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded border border-slate-800 bg-slate-950 p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-slate-200">{note.content}</p>
                          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                            <span>{note.author}</span>
                            <span>•</span>
                            <span>{new Date(note.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}