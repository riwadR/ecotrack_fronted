export const TOUR_ESTIMATED_DURATION_HINT =
  "Calculé sur la base de 10 min/km et 10 min/bac";

export const TOUR_START_LEAD_MINUTES = 30;

export const TOUR_START_TOO_EARLY_HINT =
  "Accessible 30 minutes avant le début prévu";

export function getEarliestTourStartMs(plannedStartTime: string): number {
  const plannedMs = new Date(plannedStartTime).getTime();
  if (!Number.isFinite(plannedMs)) {
    return Number.POSITIVE_INFINITY;
  }
  return plannedMs - TOUR_START_LEAD_MINUTES * 60_000;
}

export function canAgentStartTourNow(
  plannedStartTime: string,
  nowMs: number = Date.now()
): boolean {
  return nowMs >= getEarliestTourStartMs(plannedStartTime);
}
