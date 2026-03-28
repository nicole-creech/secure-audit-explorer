"use client";

import AnalyticsPanel from "./AnalyticsPanel";
import EventTable from "./EventTable";

import type { AuditEventView } from "@/lib/types";

type AuditDashboardProps = {
  events: AuditEventView[];
};

export default function AuditDashboard({ events }: AuditDashboardProps) {
  return (
    <div className="space-y-6">
      <AnalyticsPanel events={events} />
      <EventTable events={events} />
    </div>
  );
}