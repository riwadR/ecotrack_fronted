import type { TourResponseDTO, TourStepDTO } from "@/models/tour";
import { sortTourSteps } from "@/lib/tours/tourRouteMap";

export function formatElapsedMinutes(totalMinutes: number): string {
  if (totalMinutes < 1) {
    return "moins d'une minute";
  }
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
}

export function computeRealDurationMinutes(
  actualStartTime: string | null | undefined,
  actualEndTime: string | null | undefined,
  nowMs: number = Date.now()
): number {
  if (!actualStartTime) {
    return 0;
  }
  const start = new Date(actualStartTime).getTime();
  const end = actualEndTime ? new Date(actualEndTime).getTime() : nowMs;
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return 0;
  }
  return Math.floor((end - start) / 60_000);
}

export function computeSuccessRateLabel(steps: TourStepDTO[]): string {
  const ordered = sortTourSteps(steps);
  if (ordered.length === 0) {
    return "—";
  }
  const completed = ordered.filter((s) => s.status === "COMPLETED").length;
  const skipped = ordered.filter((s) => s.status === "SKIPPED").length;
  const executed = completed + skipped;
  const denominator = executed > 0 ? executed : ordered.length;
  const rate = Math.round((completed / denominator) * 100);
  return `${completed}/${denominator} exécutés · ${rate} %`;
}

export function sumCollectedVolumeLiters(steps: TourStepDTO[]): number {
  return sortTourSteps(steps).reduce((sum, step) => {
    const volume = step.collectedVolume;
    return sum + (typeof volume === "number" && volume > 0 ? volume : 0);
  }, 0);
}

export function formatStepIntervalLabel(
  previousCompletedAt: string | null,
  currentCompletedAt: string | null
): string | null {
  if (!previousCompletedAt || !currentCompletedAt) {
    return null;
  }
  const prev = new Date(previousCompletedAt).getTime();
  const curr = new Date(currentCompletedAt).getTime();
  if (!Number.isFinite(prev) || !Number.isFinite(curr) || curr < prev) {
    return null;
  }
  const minutes = Math.floor((curr - prev) / 60_000);
  if (minutes < 1) {
    return "validée moins d'une minute après l'étape précédente";
  }
  return `validée +${minutes} min après l'étape précédente`;
}

export function buildStepTimelineNotes(steps: TourStepDTO[]): Map<string, string | null> {
  const ordered = sortTourSteps(steps);
  const notes = new Map<string, string | null>();
  let lastCompletedAt: string | null = null;

  for (const step of ordered) {
    if (step.status === "COMPLETED" || step.status === "SKIPPED") {
      const interval =
        lastCompletedAt && step.completedAt
          ? formatStepIntervalLabel(lastCompletedAt, step.completedAt)
          : null;
      notes.set(step.id, interval);
      if (step.completedAt) {
        lastCompletedAt = step.completedAt;
      }
    } else {
      notes.set(step.id, null);
    }
  }

  return notes;
}

export function shouldShowPerformanceReport(tour: TourResponseDTO): boolean {
  return tour.status === "IN_PROGRESS" || tour.status === "COMPLETED";
}

export function formatTourCompletionIncidents(tour: TourResponseDTO): string {
  const skipped = tour.skippedStepsCount ?? 0;
  const anomalies = tour.anomaliesReportedCount ?? 0;
  const parts: string[] = [];

  if (skipped > 0) {
    parts.push(
      `${skipped} bac${skipped > 1 ? "s" : ""} ignoré${skipped > 1 ? "s" : ""}`
    );
  }
  if (anomalies > 0) {
    parts.push(
      `${anomalies} signalement${anomalies > 1 ? "s" : ""}`
    );
  }

  if (parts.length === 0) {
    return "Aucun incident signalé";
  }
  return parts.join(" / ");
}
