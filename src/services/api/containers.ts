import {
  Container,
  CreateContainerPayload,
  IoTPayload,
} from "@/models/container";
import { backendApiClient } from "@/lib/api/apiClient";
import { toApiError } from "@/lib/api/apiErrors";

export async function getContainers(): Promise<Container[]> {
  try {
    const { data } = await backendApiClient.get<Container[]>("containers");
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible de charger les conteneurs.");
  }
}

export async function getContainerById(id: string): Promise<Container> {
  try {
    const { data } = await backendApiClient.get<Container>(
      `containers/${encodeURIComponent(id)}`
    );
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible de charger le conteneur.");
  }
}

export async function createContainer(
  payload: CreateContainerPayload
): Promise<Container> {
  try {
    const { data } = await backendApiClient.post<Container>(
      "containers",
      payload
    );
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible de créer le conteneur.");
  }
}

export async function deleteContainer(id: string): Promise<void> {
  try {
    await backendApiClient.delete(`containers/${encodeURIComponent(id)}`);
  } catch (error) {
    throw toApiError(error, "Impossible de supprimer le conteneur.");
  }
}

export async function sendIoTPayload(
  payload: IoTPayload
): Promise<{ success: boolean; message?: string }> {
  try {
    const { data } = await backendApiClient.post<{
      success: boolean;
      message?: string;
    }>("containers/iot/payload", payload);
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible d'envoyer la charge IoT.");
  }
}
