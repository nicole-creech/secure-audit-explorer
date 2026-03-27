"use client";

import { useState } from "react";
import AnalyticsPanel from "./AnalyticsPanel";
import EventTable from "./EventTable";
import InvestigationDrawer from "./InvestigationDrawer";

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

type AuditDashboardProps = {
  events: AuditEvent[];
};

export default function AuditDashboard({ events }: AuditDashboardProps) {
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
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