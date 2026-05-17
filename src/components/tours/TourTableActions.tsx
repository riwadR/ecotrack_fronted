"use client";

import { Eye, Pencil, X } from "lucide-react";
import type { TourResponseDTO } from "@/models/tour";
import { getTourPrimaryActionLabel } from "@/lib/tours/tourActionLabels";

const iconButtonClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

const stackActionClass =
  "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

type TourTableActionsProps = {
  tour: TourResponseDTO;
  isDeleting?: boolean;
  onView: (tour: TourResponseDTO) => void;
  onEdit: (tour: TourResponseDTO) => void;
  onDelete: (tourId: string) => void;
  layout?: "row" | "stack";
};

export default function TourTableActions({
  tour,
  isDeleting = false,
  onView,
  onEdit,
  onDelete,
  layout = "row",
}: TourTableActionsProps) {
  const isPending = tour.status === "PENDING";
  const primaryLabel = getTourPrimaryActionLabel(tour.status);
  const wrapClass = layout === "stack" ? "flex flex-col gap-2" : "flex flex-wrap items-center gap-2";

  if (layout === "stack") {
    return (
      <div className={wrapClass}>
        <button
          type="button"
          onClick={() => onView(tour)}
          className={`${stackActionClass} border-slate-300 bg-white text-slate-800 hover:bg-slate-50`}
        >
          <Eye className="h-4 w-4 shrink-0" aria-hidden />
          {primaryLabel}
        </button>
        {isPending ? (
          <>
            <button
              type="button"
              onClick={() => onEdit(tour)}
              className={`${stackActionClass} border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100`}
            >
              <Pencil className="h-4 w-4 shrink-0" aria-hidden />
              Modifier
            </button>
            <button
              type="button"
              onClick={() => onDelete(tour.id)}
              disabled={isDeleting}
              className={`${stackActionClass} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
            >
              <X className="h-4 w-4 shrink-0 text-red-600" aria-hidden />
              {isDeleting ? "Suppression…" : "Supprimer"}
            </button>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className={wrapClass}>
      <button
        type="button"
        onClick={() => onView(tour)}
        className={`${iconButtonClass} max-w-[11rem] gap-1.5 px-2.5 text-slate-700 xl:max-w-none xl:px-3`}
        aria-label={primaryLabel}
        title={primaryLabel}
      >
        <Eye className="h-4 w-4 shrink-0" aria-hidden />
        <span className="truncate text-xs font-semibold">{primaryLabel}</span>
      </button>
      {isPending ? (
        <>
          <button
            type="button"
            onClick={() => onEdit(tour)}
            className={`${iconButtonClass} text-violet-700 hover:border-violet-200 hover:bg-violet-50`}
            aria-label="Modifier la tournée"
            title="Modifier"
          >
            <Pencil className="h-4 w-4 shrink-0" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onDelete(tour.id)}
            disabled={isDeleting}
            className={`${iconButtonClass} border-red-200 text-red-600 hover:bg-red-50`}
            aria-label="Supprimer la tournée"
            title="Supprimer"
          >
            <X className="h-4 w-4 shrink-0" aria-hidden />
          </button>
        </>
      ) : null}
    </div>
  );
}
