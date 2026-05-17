import type { BackendContainerStatus } from "@/lib/containers/backendContainerStatus";

export const CONTAINER_STATUS_LABELS: Record<BackendContainerStatus, string> = {
  OK: "OK",
  WARNING: "Alerte",
  CRITICAL: "Critique",
  MAINTENANCE: "Maintenance",
};

export const FILL_BAR_CLASS_BY_STATUS: Record<BackendContainerStatus, string> = {
  OK: "bg-emerald-500",
  WARNING: "bg-orange-500",
  CRITICAL: "bg-red-500",
  MAINTENANCE: "bg-slate-400",
};

export const STATUS_BADGE_CLASS_BY_STATUS: Record<BackendContainerStatus, string> = {
  OK: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  WARNING: "bg-orange-50 text-orange-900 ring-orange-200",
  CRITICAL: "bg-red-50 text-red-800 ring-red-200",
  MAINTENANCE: "bg-slate-100 text-slate-700 ring-slate-200",
};

export const MARKER_COLOR_BY_STATUS: Record<BackendContainerStatus, string> = {
  OK: "#22c55e",
  WARNING: "#f97316",
  CRITICAL: "#ef4444",
  MAINTENANCE: "#94a3b8",
};

export function getContainerStatusLabel(status: BackendContainerStatus): string {
  return CONTAINER_STATUS_LABELS[status];
}
