import { isAxiosError } from "axios";
import { extractApiErrorMessage } from "@/lib/api/apiErrors";
import { TOUR_AGENT_SCHEDULE_CONFLICT_MESSAGE } from "@/lib/tours/tourFormConstants";

export const TOUR_GENERIC_TECHNICAL_ERROR =
  "Une erreur technique est survenue lors de l'enregistrement de la tournée.";

export function resolveTourSubmitErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return TOUR_GENERIC_TECHNICAL_ERROR;
  }

  const status = error.response?.status;

  if (status === 409) {
    return TOUR_AGENT_SCHEDULE_CONFLICT_MESSAGE;
  }

  if (status === 400) {
    return extractApiErrorMessage(error, TOUR_GENERIC_TECHNICAL_ERROR);
  }

  return TOUR_GENERIC_TECHNICAL_ERROR;
}
