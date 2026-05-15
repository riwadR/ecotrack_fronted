import type { BackendContainerStatus } from "@/lib/containers/backendContainerStatus";

export const INFRASTRUCTURE_MARKER_COLORS = {
  maintenance: "#FACC15",
  fillLow: "#22c55e",
  fillModerate: "#f97316",
  fillHigh: "#ef4444",
} as const;

/**
 * Marker fill color: maintenance overrides fill-level bands.
 */
export function getInfrastructureMarkerColor(
  status: BackendContainerStatus,
  fillLevelPercent: number
): string {
  if (status === "MAINTENANCE") {
    return INFRASTRUCTURE_MARKER_COLORS.maintenance;
  }

  const fill = Math.min(100, Math.max(0, fillLevelPercent));
  if (fill < 50) {
    return INFRASTRUCTURE_MARKER_COLORS.fillLow;
  }
  if (fill <= 90) {
    return INFRASTRUCTURE_MARKER_COLORS.fillModerate;
  }
  return INFRASTRUCTURE_MARKER_COLORS.fillHigh;
}
