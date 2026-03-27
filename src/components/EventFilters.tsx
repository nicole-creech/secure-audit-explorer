"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type EventFiltersProps = {
  initialQuery: string;
  initialSeverity: string;
  initialFlaggedOnly: boolean;
  initialSortBy: string;
  initialSortDir: string;
  initialPageSize: number;
};

export default function EventFilters({
  initialQuery,
  initialSeverity,
  initialFlaggedOnly,
  initialSortBy,
  initialSortDir,
  initialPageSize,
}: EventFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [severity, setSeverity] = useState(initialSeverity);
  const [flaggedOnly, setFlaggedOnly] = useState(initialFlaggedOnly);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDir, setSortDir] = useState(initialSortDir);
  const [pageSize, setPageSize] = useState(String(initialPageSize));

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());

    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }

    if (severity && severity !== "all") {
      params.set("severity", severity);
    } else {
      params.delete("severity");
    }

    if (flaggedOnly) {
      params.set("flagged", "true");
    } else {
      params.delete("flagged");
    }

    if (sortBy !== "timestamp") {
      params.set("sortBy", sortBy);
    } else {
      params.delete("sortBy");
    }

    if (sortDir !== "desc") {
      params.set("sortDir", sortDir);
    } else {
      params.delete("sortDir");
    }

    if (pageSize !== "25") {
      params.set("pageSize", pageSize);
    } else {
      params.delete("pageSize");
    }

    params.delete("page");

    router.replace(`${pathname}?${params.toString()}`);
  }

  function resetFilters() {
    setQuery("");
    setSeverity("all");
    setFlaggedOnly(false);
    setSortBy("timestamp");
    setSortDir("desc");
    setPageSize("25");
    router.replace(pathname);
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-100">Filters</h2>
        <p className="mt-1 text-sm text-slate-400">
          Query, sort, and paginate the dataset from the server.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-6">
        <div className="xl:col-span-2">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Search
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Actor, action, resource, or IP..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Severity
          </label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
          >
            <option value="timestamp">Timestamp</option>
            <option value="severity">Severity</option>
            <option value="riskScore">Risk Score</option>
            <option value="actor">Actor</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Direction
          </label>
          <select
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Page Size
          </label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={flaggedOnly}
            onChange={(e) => setFlaggedOnly(e.target.checked)}
            className="h-4 w-4 rounded border-slate-600 bg-slate-900"
          />
          Flagged only
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-medium text-slate-950 hover:bg-cyan-400"
          >
            Apply
          </button>

          <button
            type="button"
            onClick={resetFilters}
            className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}