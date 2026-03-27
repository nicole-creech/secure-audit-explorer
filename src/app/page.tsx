import { prisma } from "@/lib/prisma";
import EventTable from "@/components/EventTable";
import AnalyticsPanel from "@/components/AnalyticsPanel";
import EventFilters from "@/components/EventFilters";
import type { AuditEventView } from "@/lib/types";
import type { Prisma } from "@prisma/client";

type HomePageProps = {
  searchParams: Promise<{
    q?: string;
    severity?: string;
    flagged?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  const query = params.q?.trim() ?? "";
  const severity = params.severity ?? "all";
  const flaggedOnly = params.flagged === "true";

  const where: Prisma.AuditEventWhereInput = {
    AND: [
      query
        ? {
            OR: [
              { actor: { contains: query } },
              { action: { contains: query } },
              { resource: { contains: query } },
              { ipAddress: { contains: query } },
            ],
          }
        : {},
      severity !== "all" ? { severity } : {},
      flaggedOnly ? { flagged: true } : {},
    ],
  };

  const [events, totalEvents, flaggedEvents, openEvents, criticalEvents] =
    await Promise.all([
      prisma.auditEvent.findMany({
        where,
        orderBy: { timestamp: "desc" },
        take: 50,
      }),
      prisma.auditEvent.count({ where }),
      prisma.auditEvent.count({
        where: {
          ...where,
          flagged: true,
        },
      }),
      prisma.auditEvent.count({
        where: {
          ...where,
          status: { in: ["open", "investigating"] },
        },
      }),
      prisma.auditEvent.count({
        where: {
          ...where,
          severity: "critical",
        },
      }),
    ]);

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

        <EventFilters
          initialQuery={query}
          initialSeverity={severity}
          initialFlaggedOnly={flaggedOnly}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
            <p className="text-sm text-slate-400">Matching Events</p>
            <p className="mt-2 text-3xl font-semibold">{totalEvents}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
            <p className="text-sm text-slate-400">Flagged Matches</p>
            <p className="mt-2 text-3xl font-semibold">{flaggedEvents}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
            <p className="text-sm text-slate-400">Open Investigations</p>
            <p className="mt-2 text-3xl font-semibold">{openEvents}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
            <p className="text-sm text-slate-400">Critical Matches</p>
            <p className="mt-2 text-3xl font-semibold">{criticalEvents}</p>
          </div>
        </div>

        <AnalyticsPanel events={serializedEvents} />

        <section className="rounded-2xl border border-slate-800 bg-slate-900 shadow-sm">
          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="text-lg font-semibold">Recent Events</h2>
            <p className="mt-1 text-sm text-slate-400">
              Filtered audit activity returned directly from the server.
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