import type { TourResponseDTO } from "@/models/tour";

/** Step count from list/detail payloads (list may omit full `steps`). */
export function getTourStepCount(tour: TourResponseDTO): number {
  if (typeof tour.stepCount === "number") {
    return tour.stepCount;
  }
  return tour.steps?.length ?? 0;
}
