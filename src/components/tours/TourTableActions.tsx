"use client";

import type { TourResponseDTO } from "@/models/tour";
import { IconEye, IconPencil, IconTrash } from "@/components/icons/TourActionIcons";

const iconButtonClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

type TourTableActionsProps = {
  tour: TourResponseDTO;
  isDeleting?: boolean;
  onView: (tour: TourResponseDTO) => void;
  onEdit?: (tour: TourResponseDTO) => void;
  onDelete?: (tourId: string) => void;
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
  const wrapClass = layout === "stack" ? "flex flex-col gap-2" : "flex flex-wrap items-center gap-2";

  return (
    <div className={wrapClass}>
      <button
        type="button"
        onClick={() => onView(tour)}
        className={`${iconButtonClass} text-slate-700`}
        aria-label="Voir l'itinéraire"
        title="Voir l'itinéraire"
      >
        <IconEye />
      </button>
      {isPending && onEdit ? (
        <button
          type="button"
          onClick={() => onEdit(tour)}
          className={`${iconButtonClass} text-violet-700 hover:border-violet-200 hover:bg-violet-50`}
          aria-label="Modifier la tournée"
          title="Modifier"
        >
          <IconPencil />
        </button>
      ) : null}
      {isPending && onDelete ? (
        <button
          type="button"
          onClick={() => onDelete(tour.id)}
          disabled={isDeleting}
          className={`${iconButtonClass} border-red-200 text-red-600 hover:bg-red-50`}
          aria-label="Supprimer la tournée"
          title="Supprimer"
        >
          <IconTrash />
        </button>
      ) : null}
    </div>
  );
}
