"use client";

import { useEffect, useState } from "react";
import type { TourResponseDTO } from "@/models/tour";
import {
  computeRealDurationMinutes,
  computeSuccessRateLabel,
  formatElapsedMinutes,
  formatTourCompletionIncidents,
  sumCollectedVolumeLiters,
} from "@/lib/tours/tourPerformanceReport";

export type TourPerformanceReportProps = {
  tour: TourResponseDTO;
};

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 lg:p-3.5">
      <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-slate-500 lg:text-xs">
        {label}
      </p>
      <p className="m-0 mt-1 text-sm font-bold text-slate-900 lg:text-base">{value}</p>
    </article>
  );
}

function ScheduleTimingBadge({ exceeded }: { exceeded: boolean }) {
  if (exceeded) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-800">
        <span aria-hidden>⚠️</span>
        Temps dépassé
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
      <span aria-hidden>⏱️</span>
      Timing respecté
    </span>
  );
}

export default function TourPerformanceReport({ tour }: TourPerformanceReportProps) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (tour.status !== "IN_PROGRESS" || !tour.actualStartTime) {
      return;
    }
    const intervalId = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [tour.actualStartTime, tour.status]);

  const durationMinutes = computeRealDurationMinutes(
    tour.actualStartTime,
    tour.actualEndTime,
    nowMs
  );

  const durationLabel =
    tour.status === "COMPLETED"
      ? tour.actualStartTime && tour.actualEndTime
        ? formatElapsedMinutes(durationMinutes)
        : "—"
      : tour.actualStartTime
        ? `${formatElapsedMinutes(durationMinutes)} (en cours)`
        : "Démarrage non enregistré";

  const volumeTotal = sumCollectedVolumeLiters(tour.steps);
  const showCompletionMetrics = tour.status === "COMPLETED";
  const exceededScheduled =
    tour.exceededScheduledTime === true ||
    (tour.exceededScheduledTime == null &&
      tour.estimatedDurationMinutes != null &&
      durationMinutes > tour.estimatedDurationMinutes);
  const completionIncidentsLabel = formatTourCompletionIncidents(tour);

  return (
    <section className="mb-4" aria-label="Rapport de performance">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:text-sm">
          Rapport de performance
        </h3>
        {showCompletionMetrics ? (
          <ScheduleTimingBadge exceeded={exceededScheduled} />
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard label="Durée réelle totale" value={durationLabel} />
        <KpiCard label="Taux de réussite" value={computeSuccessRateLabel(tour.steps)} />
        <KpiCard
          label="Volume total collecté"
          value={volumeTotal > 0 ? `${volumeTotal} L` : "—"}
        />
      </div>

      {showCompletionMetrics ? (
        <article className="mt-3 rounded-xl border border-slate-200 bg-white p-3 lg:p-3.5">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-slate-500 lg:text-xs">
            Incidents
          </p>
          <p className="m-0 mt-1 text-sm font-semibold text-slate-900 lg:text-base">
            {completionIncidentsLabel}
          </p>
        </article>
      ) : null}
    </section>
  );
}
