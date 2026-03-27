"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type EventFiltersProps = {
  initialQuery: string;
  initialSeverity: string;
  initialFlaggedOnly: boolean;
};

export default function EventFilters({
  initialQuery,
  initialSeverity,
  initialFlaggedOnly,
}: EventFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [severity, setSeverity] = useState(initialSeverity);
  const [flaggedOnly, setFlaggedOnly] = useState(initialFlaggedOnly);

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

    router.replace(`${pathname}?${params.toString()}`);
  }

  function resetFilters() {
    setQuery("");
    setSeverity("all");
    setFlaggedOnly(false);
    router.replace(pathname);
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-100">Filters</h2>
        <p className="mt-1 text-sm text-slate-400">
          Query the dataset using server-side filtering.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1">
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

        <div className="w-full lg:w-56">
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

        <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-200">
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