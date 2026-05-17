import type { TourStatus } from "@/models/tour";

export function getTourPrimaryActionLabel(status: TourStatus): string {
  return status === "COMPLETED" ? "Compte rendu" : "Voir l'itinéraire";
}
