import { Threshold, UpdateThresholdPayload } from "@/models/threshold";
import { WasteType } from "@/models/container";
import { backendApiClient } from "@/lib/api/apiClient";
import { toApiError } from "@/lib/api/apiErrors";

export async function getThresholds(): Promise<Threshold[]> {
  try {
    const { data } = await backendApiClient.get<Threshold[]>("thresholds");
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible de charger les seuils.");
  }
}

export async function updateThreshold(
  type: WasteType,
  payload: UpdateThresholdPayload
): Promise<Threshold> {
  try {
    const { data } = await backendApiClient.put<Threshold>(
      `thresholds/${encodeURIComponent(type)}`,
      payload
    );
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible de mettre à jour le seuil.");
  }
}
