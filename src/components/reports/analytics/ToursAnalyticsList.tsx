"use client";

import { useEffect, useMemo, useState } from "react";
import type { TourSummary } from "@/models/reportMetrics";
import { formatMetricNumber } from "@/components/reports/analytics/reportAnalyticsUi";

const BATCH_SIZE = 100;

function parseTourDate(date: string): number {
  const parts = date.split("/");
  if (parts.length !== 3) {
    return 0;
  }
  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const year = Number(parts[2]);
  if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) {
    return 0;
  }
  return new Date(year, month - 1, day).getTime();
}

function sortToursByDateDesc(tours: TourSummary[]): TourSummary[] {
  return [...tours].sort((a, b) => parseTourDate(b.date) - parseTourDate(a.date));
}

function statusBadgeClass(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized.includes("termin") || normalized.includes("compl")) {
    return "bg-emerald-100 text-emerald-800";
  }
  if (normalized.includes("cours") || normalized.includes("planif")) {
    return "bg-sky-100 text-sky-800";
  }
  if (normalized.includes("annul") || normalized.includes("échou")) {
    return "bg-red-100 text-red-800";
  }
  return "bg-slate-100 text-slate-700";
}

type ToursAnalyticsListProps = {
  tours: TourSummary[];
};

export default function ToursAnalyticsList({ tours }: ToursAnalyticsListProps) {
  const sortedTours = useMemo(() => sortToursByDateDesc(tours), [tours]);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [tours]);

  if (!sortedTours.length) {
    return (
      <p className="m-0 rounded-lg bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        Aucune tournée sur cette période.
      </p>
    );
  }

  const visibleTours = sortedTours.slice(0, visibleCount);
  const hasMore = visibleCount < sortedTours.length;
  const remaining = sortedTours.length - visibleCount;
  const nextBatch = Math.min(BATCH_SIZE, remaining);

  return (
    <div className="flex flex-col gap-3">
      <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white">
        <ul className="m-0 flex list-none flex-col gap-3 p-3 md:hidden">
          {visibleTours.map((tour) => (
            <li
              key={tour.ref}
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="m-0 font-semibold text-slate-900">{tour.ref}</p>
                  <p className="m-0 mt-0.5 text-xs text-slate-500">{tour.date}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(tour.statusLabel)}`}
                >
                  {tour.statusLabel}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-slate-500">Zone</dt>
                  <dd className="m-0 font-medium text-slate-800">{tour.zoneName}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Ponctualité</dt>
                  <dd className="m-0 font-medium text-slate-800">{tour.onTimeLabel}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Distance</dt>
                  <dd className="m-0 font-medium text-slate-800">
                    {tour.distanceKm != null
                      ? `${formatMetricNumber(tour.distanceKm, 1)} km`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Durée réelle</dt>
                  <dd className="m-0 font-medium text-slate-800">{tour.actualDuration}</dd>
                </div>
              </dl>
              {tour.agentNames.length > 0 ? (
                <p className="m-0 mt-2 text-xs text-slate-600">
                  Agents : {tour.agentNames.join(", ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Réf.</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Zone</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Ponctualité</th>
                <th className="px-3 py-2">Distance</th>
                <th className="px-3 py-2">Agents</th>
              </tr>
            </thead>
            <tbody>
              {visibleTours.map((tour, index) => (
                <tr
                  key={tour.ref}
                  className={index % 2 === 0 ? "bg-white" : "bg-slate-50/80"}
                >
                  <td className="px-3 py-2.5 font-medium text-slate-900">
                    {tour.ref}
                  </td>
                  <td className="px-3 py-2.5 text-slate-700">{tour.date}</td>
                  <td className="px-3 py-2.5 text-slate-700">{tour.zoneName}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(tour.statusLabel)}`}
                    >
                      {tour.statusLabel}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-700">{tour.onTimeLabel}</td>
                  <td className="px-3 py-2.5 tabular-nums text-slate-700">
                    {tour.distanceKm != null
                      ? `${formatMetricNumber(tour.distanceKm, 1)} km`
                      : "—"}
                  </td>
                  <td className="max-w-[12rem] truncate px-3 py-2.5 text-slate-700">
                    {tour.agentNames.join(", ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {hasMore ? (
        <button
          type="button"
          onClick={() => setVisibleCount((count) => count + BATCH_SIZE)}
          className="self-center text-sm font-semibold text-emerald-700 underline-offset-2 transition hover:text-emerald-800 hover:underline"
        >
          Charger les {nextBatch} suivantes
          <span className="font-normal text-slate-500">
            {" "}
            ({formatMetricNumber(remaining)} restantes)
          </span>
        </button>
      ) : (
        <p className="m-0 text-center text-xs text-slate-500">
          {formatMetricNumber(sortedTours.length)} tournée
          {sortedTours.length > 1 ? "s" : ""} au total
        </p>
      )}
    </div>
  );
}
