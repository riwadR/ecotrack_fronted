"use client";

import { useMemo } from "react";
import type { TourStepDTO } from "@/models/tour";
import { STEP_STATUS_LABELS } from "@/lib/tours/tourDisplay";
import { buildStepTimelineNotes } from "@/lib/tours/tourPerformanceReport";

export type TourItineraryStepListProps = {
  steps: TourStepDTO[];
  showTimelineMetrics?: boolean;
};

export default function TourItineraryStepList({
  steps,
  showTimelineMetrics = false,
}: TourItineraryStepListProps) {
  const timelineNotes = useMemo(
    () => (showTimelineMetrics ? buildStepTimelineNotes(steps) : new Map()),
    [showTimelineMetrics, steps]
  );

  if (steps.length === 0) {
    return (
      <p className="m-0 text-sm text-slate-500">Aucune étape enregistrée pour cette tournée.</p>
    );
  }

  return (
    <ol className="m-0 list-none space-y-0 p-0">
      {steps.map((step, index) => {
        const isDone = step.status === "COMPLETED" || step.status === "SKIPPED";
        const intervalNote = timelineNotes.get(step.id);

        return (
          <li key={step.id} className="relative flex gap-3 pb-6 last:pb-0">
            {index < steps.length - 1 ? (
              <span
                className="absolute left-[1.125rem] top-9 bottom-0 w-0.5 bg-emerald-200"
                aria-hidden
              />
            ) : null}
            <span
              className={
                isDone
                  ? "relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white"
                  : "relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700"
              }
            >
              {step.stepOrder}
            </span>
            <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
              <p className="m-0 text-sm font-semibold text-slate-900">
                Étape {step.stepOrder} : conteneur {step.serialNumber}
              </p>
              <p className="m-0 mt-0.5 text-xs text-slate-600">{STEP_STATUS_LABELS[step.status]}</p>
              {step.collectedVolume != null && step.collectedVolume > 0 ? (
                <p className="m-0 mt-1 text-xs text-slate-600">
                  Volume collecté : {step.collectedVolume} L
                </p>
              ) : null}
              {showTimelineMetrics && intervalNote ? (
                <p className="m-0 mt-1 text-xs font-medium text-violet-700">{intervalNote}</p>
              ) : null}
              {showTimelineMetrics && step.completedAt ? (
                <p className="m-0 mt-0.5 text-[11px] text-slate-400">
                  {new Intl.DateTimeFormat("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(step.completedAt))}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
