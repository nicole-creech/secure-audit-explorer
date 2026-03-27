import { prisma } from "@/lib/prisma";
import EventTable from "@/components/EventTable";
import AnalyticsPanel from "@/components/AnalyticsPanel";
import type { AuditEventView } from "@/lib/types";

export default async function HomePage() {
  const events = await prisma.auditEvent.findMany({
    orderBy: { timestamp: "desc" },
    take: 20,
  });

  const totalEvents = await prisma.auditEvent.count();
  const flaggedEvents = await prisma.auditEvent.count({
    where: { flagged: true },
  });
  const openEvents = await prisma.auditEvent.count({
    where: { status: { in: ["open", "investigating"] } },
  });
  const criticalEvents = await prisma.auditEvent.count({
    where: { severity: "critical" },
  });

  const serializedEvents: AuditEventView[] = events.map((event) => ({
    ...event,
    timestamp: event.timestamp.toISOString(),
    createdAt: event.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">
            Secure Audit Log Explorer
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Investigate suspicious activity across audit events
          </h1>
          <p className="max-w-3xl text-base text-slate-400 sm:text-lg">
            A full-stack investigation workspace for analyzing authentication,
            access, and privilege events across enterprise systems.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
            <p className="text-sm text-slate-400">Total Events</p>
            <p className="mt-2 text-3xl font-semibold">{totalEvents}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
            <p className="text-sm text-slate-400">Flagged Events</p>
            <p className="mt-2 text-3xl font-semibold">{flaggedEvents}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
            <p className="text-sm text-slate-400">Open Investigations</p>
            <p className="mt-2 text-3xl font-semibold">{openEvents}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
            <p className="text-sm text-slate-400">Critical Events</p>
            <p className="mt-2 text-3xl font-semibold">{criticalEvents}</p>
          </div>
        </div>

        <AnalyticsPanel events={serializedEvents} />

        <section className="rounded-2xl border border-slate-800 bg-slate-900 shadow-sm">
          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="text-lg font-semibold">Recent Events</h2>
            <p className="mt-1 text-sm text-slate-400">
              Latest normalized audit activity across monitored systems.
            </p>
          </div>

          <div className="p-5">
            <EventTable events={serializedEvents} />
          </div>
        </section>
      </div>
    </main>
  );
}