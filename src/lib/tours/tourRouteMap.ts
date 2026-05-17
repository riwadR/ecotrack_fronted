import type { TourStepDTO } from "@/models/tour";

export type LatLngTuple = [number, number];

export function sortTourSteps(steps: TourStepDTO[]): TourStepDTO[] {
  return [...steps].sort((a, b) => a.stepOrder - b.stepOrder);
}

export function isValidStepCoordinate(
  latitude: number | null,
  longitude: number | null
): boolean {
  return (
    latitude != null &&
    longitude != null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  );
}

export function hasStepCoordinates(
  step: TourStepDTO
): step is TourStepDTO & { latitude: number; longitude: number } {
  return isValidStepCoordinate(step.latitude, step.longitude);
}

/** Ordered [lat, lng] pairs for steps that have coordinates. */
export function tourStepsToRouteCoordinates(steps: TourStepDTO[]): LatLngTuple[] {
  return sortTourSteps(steps)
    .filter(hasStepCoordinates)
    .map((step) => [step.latitude, step.longitude]);
}

/** Route polyline for remaining PENDING steps only (agent execution). */
export function tourPendingStepsToRouteCoordinates(steps: TourStepDTO[]): LatLngTuple[] {
  return sortTourSteps(steps)
    .filter((step) => step.status === "PENDING")
    .filter(hasStepCoordinates)
    .map((step) => [step.latitude, step.longitude]);
}

export function findFirstPendingStep(steps: TourStepDTO[]): TourStepDTO | null {
  return sortTourSteps(steps).find((step) => step.status === "PENDING") ?? null;
}

export function areAllTourStepsCompleted(steps: TourStepDTO[]): boolean {
  const ordered = sortTourSteps(steps);
  return (
    ordered.length > 0 &&
    ordered.every((step) => step.status === "COMPLETED" || step.status === "SKIPPED")
  );
}

/** 1-based position of the current pending step in the ordered itinerary. */
export function getTourStepProgress(
  steps: TourStepDTO[]
): { current: number; total: number } | null {
  const ordered = sortTourSteps(steps);
  if (ordered.length === 0) {
    return null;
  }
  const pendingIndex = ordered.findIndex((step) => step.status === "PENDING");
  if (pendingIndex < 0) {
    return null;
  }
  return { current: pendingIndex + 1, total: ordered.length };
}

/** Stable key so map fit-bounds ignores referentially new coordinate arrays. */
export function tourRoutePositionsKey(positions: LatLngTuple[]): string {
  if (positions.length === 0) {
    return "";
  }
  return positions
    .map(([lat, lng]) => `${lat.toFixed(6)},${lng.toFixed(6)}`)
    .join("|");
}
