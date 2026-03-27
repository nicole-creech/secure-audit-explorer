import { prisma } from "@/lib/prisma";
import EventTable from "@/components/EventTable";
import AnalyticsPanel from "@/components/AnalyticsPanel";
import EventFilters from "@/components/EventFilters";
import PaginationControls from "@/components/PaginationControls";
import type { AuditEventView } from "@/lib/types";
import type { Prisma } from "@prisma/client";

type HomePageProps = {
  searchParams: Promise<{
    q?: string;
    severity?: string;
    flagged?: string;
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortDir?: string;
  }>;
};

const ALLOWED_SORT_FIELDS = new Set([
  "timestamp",
  "severity",
  "riskScore",
  "actor",
  "status",
]);

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  const query = params.q?.trim() ?? "";
  const severity = params.severity ?? "all";
  const flaggedOnly = params.flagged === "true";
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = [10, 25, 50].includes(Number(params.pageSize))
    ? Number(params.pageSize)
    : 25;
  const sortBy = ALLOWED_SORT_FIELDS.has(params.sortBy ?? "")
    ? (params.sortBy as "timestamp" | "severity" | "riskScore" | "actor" | "status")
    : "timestamp";
  const sortDir = params.sortDir === "asc" ? "asc" : "desc";

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

  const totalMatchingEvents = await prisma.auditEvent.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalMatchingEvents / pageSize));
  const safePage = Math.min(page, totalPages);
  const skip = (safePage - 1) * pageSize;

  const [events, flaggedEvents, openEvents, criticalEvents] = await Promise.all([
    prisma.auditEvent.findMany({
      where,
      orderBy: {
        [sortBy]: sortDir,
      },
      skip,
      take: pageSize,
    }),
    prisma.auditEvent.count({
      where: {
        AND: [...(where.AND ?? []), { flagged: true }],
      },
    }),
    prisma.auditEvent.count({
      where: {
        AND: [...(where.AND ?? []), { status: { in: ["open", "investigating"] } }],
      },
    }),
    prisma.auditEvent.count({
      where: {
        AND: [...(where.AND ?? []), { severity: "critical" }],
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
          initialSortBy={sortBy}
          initialSortDir={sortDir}
          initialPageSize={pageSize}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
            <p className="text-sm text-slate-400">Matching Events</p>
            <p className="mt-2 text-3xl font-semibold">{totalMatchingEvents}</p>
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
              Filtered, sorted, and paginated audit activity returned directly from the server.
            </p>
          </div>

          <div className="space-y-5 p-5">
            <PaginationControls
              currentPage={safePage}
              totalPages={totalPages}
            />

            <EventTable events={serializedEvents} />

            <PaginationControls
              currentPage={safePage}
              totalPages={totalPages}
            />
          </div>
        </section>
      </div>
    </main>
  );
}