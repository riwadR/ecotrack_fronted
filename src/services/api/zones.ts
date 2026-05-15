import {
  CreateZonePayload,
  PatchZoneDetailsPayload,
  UpdateZonePayload,
  Zone,
} from "@/models/zone";
import { backendApiClient } from "@/lib/api/apiClient";
import { toApiError } from "@/lib/api/apiErrors";

export async function getZones(): Promise<Zone[]> {
  try {
    const { data } = await backendApiClient.get<Zone[]>("zones");
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible de charger les zones.");
  }
}

export async function createZone(payload: CreateZonePayload): Promise<Zone> {
  const body: Record<string, string> = {
    name: payload.name,
    wktPolygon: payload.wktPolygon,
  };
  if (payload.description !== undefined) {
    body.description = payload.description;
  }

  try {
    const { data } = await backendApiClient.post<Zone>("zones", body);
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible de créer la zone.");
  }
}

export async function updateZone(
  id: string,
  payload: UpdateZonePayload
): Promise<void> {
  const body: Record<string, string> = {
    name: payload.name,
    wktPolygon: payload.wktPolygon,
  };
  if (payload.description !== undefined) {
    body.description = payload.description ?? "";
  }

  try {
    await backendApiClient.put(`zones/${encodeURIComponent(id)}`, body);
  } catch (error) {
    throw toApiError(error, "Impossible de mettre à jour la zone.");
  }
}

export async function patchZoneDetails(
  id: string,
  payload: PatchZoneDetailsPayload
): Promise<void> {
  try {
    await backendApiClient.patch(
      `zones/${encodeURIComponent(id)}`,
      payload
    );
  } catch (error) {
    throw toApiError(error, "Impossible de mettre à jour la zone.");
  }
}

export async function deleteZone(id: string): Promise<void> {
  try {
    await backendApiClient.delete(`zones/${encodeURIComponent(id)}`);
  } catch (error) {
    throw toApiError(error, "Impossible de supprimer la zone.");
  }
}
