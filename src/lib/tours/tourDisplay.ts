import type { CSSProperties } from "react";
import type { TourResponseDTO, TourStatus } from "@/models/tour";

export type TourFilterId = "all" | "completed" | "in_progress" | "pending";

export const TOUR_FILTER_OPTIONS: {
  id: TourFilterId;
  label: string;
  statuses: TourStatus[] | null;
}[] = [
  { id: "all", label: "Tous", statuses: null },
  { id: "completed", label: "Terminée", statuses: ["COMPLETED"] },
  { id: "in_progress", label: "En cours", statuses: ["IN_PROGRESS"] },
  { id: "pending", label: "Planifiée", statuses: ["PENDING"] },
];

export const TOUR_STATUS_LABELS: Record<TourStatus, string> = {
  PENDING: "Planifiée",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

export const TOUR_STATUS_STYLES: Record<TourStatus, { bg: string; color: string }> = {
  PENDING: { bg: "#f1f5f9", color: "#64748b" },
  IN_PROGRESS: { bg: "#dbeafe", color: "#2563eb" },
  COMPLETED: { bg: "#dcfce7", color: "#16a34a" },
  CANCELLED: { bg: "#fee2e2", color: "#dc2626" },
};

export function filterToursByStatus(
  tours: TourResponseDTO[],
  filterId: TourFilterId
): TourResponseDTO[] {
  const option = TOUR_FILTER_OPTIONS.find((item) => item.id === filterId);
  if (!option?.statuses) {
    return tours;
  }
  return tours.filter((tour) => option.statuses!.includes(tour.status));
}

export function formatTourSchedule(startTime: string, endTime: string): string {
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formatter.format(new Date(startTime))} → ${formatter.format(new Date(endTime))}`;
}

export function formatTourAgents(tour: TourResponseDTO): string {
  if (!tour.agents.length) {
    return "—";
  }
  return tour.agents.map((agent) => agent.username).join(", ");
}

export function formatTourDistance(km: number | null): string {
  if (km == null) {
    return "—";
  }
  return `${km.toFixed(1)} km`;
}

export function formatTourDuration(minutes: number | null): string {
  if (minutes == null) {
    return "—";
  }
  return `${minutes} min`;
}

export function shortTourId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

export function fillLevelAccentColor(value: number): string {
  if (value <= 40) {
    return "#16a34a";
  }
  if (value <= 70) {
    return "#ca8a04";
  }
  return "#dc2626";
}

export function fillLevelTrackStyle(value: number): CSSProperties {
  const accent = fillLevelAccentColor(value);
  return {
    accentColor: accent,
    background: `linear-gradient(to right, ${accent} 0%, ${accent} ${value}%, #e2e8f0 ${value}%, #e2e8f0 100%)`,
  };
}
