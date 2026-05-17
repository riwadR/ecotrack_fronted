import { backendApiClient } from "@/lib/api/apiClient";
import { toApiError } from "@/lib/api/apiErrors";

export type IotSimulationTickResponse = {
  message: string;
};

export async function simulateIotTick(): Promise<IotSimulationTickResponse> {
  try {
    const { data } = await backendApiClient.post<IotSimulationTickResponse>(
      "iot/simulate-tick"
    );
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible d'exécuter la simulation IoT.");
  }
}

export async function resetIotSensors(): Promise<IotSimulationTickResponse> {
  try {
    const { data } = await backendApiClient.post<IotSimulationTickResponse>(
      "iot/reset-sensors"
    );
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible de remettre les capteurs à zéro.");
  }
}
