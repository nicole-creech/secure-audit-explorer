"use client";

import { useState } from "react";
import AnalyticsPanel from "./AnalyticsPanel";
import EventTable from "./EventTable";
import InvestigationDrawer from "./InvestigationDrawer";

import type { AuditEventView } from "@/lib/types";

type AuditDashboardProps = {
  events: AuditEventView[];
};

export default function AuditDashboard({ events }: AuditDashboardProps) {
  const [selectedEvent, setSelectedEvent] = useState<AuditEventView | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleSelectEvent(event: AuditEvent) {
    setSelectedEvent(event);
    setDrawerOpen(true);
  }

  function handleCloseDrawer() {
    setDrawerOpen(false);
    setSelectedEvent(null);
  }

  return (
    <>
      <div className="space-y-6">
        <AnalyticsPanel events={events} />
        <EventTable events={events} onSelectEvent={handleSelectEvent} />
      </div>

      <InvestigationDrawer
        event={selectedEvent}
        open={drawerOpen}
        onClose={handleCloseDrawer}
      />
    </>
  );
}