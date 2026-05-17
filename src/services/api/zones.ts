import { isAxiosError } from "axios";
import {
  CreateZonePayload,
  PatchZoneDetailsPayload,
  UpdateZonePayload,
  Zone,
} from "@/models/zone";
import { backendApiClient } from "@/lib/api/apiClient";
import { extractApiErrorMessage, toApiError } from "@/lib/api/apiErrors";

export async function getZones(): Promise<Zone[]> {
  try {
    const { data } = await backendApiClient.get<Zone[]>("zones");
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible de charger les zones.");
  }
}

function appendZoneAssignmentFields(
  body: Record<string, unknown>,
  payload: {
    managerId?: string | null;
    notificationReceiverIds?: string[];
  }
) {
  if (payload.managerId) {
    body.managerId = payload.managerId;
  }
  if (payload.notificationReceiverIds !== undefined) {
    body.notificationReceiverIds = payload.notificationReceiverIds;
  }
}

export async function createZone(payload: CreateZonePayload): Promise<Zone> {
  const body: Record<string, unknown> = {
    name: payload.name,
    wktPolygon: payload.wktPolygon,
  };
  if (payload.description !== undefined) {
    body.description = payload.description;
  }
  appendZoneAssignmentFields(body, payload);

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
  const body: Record<string, unknown> = {
    name: payload.name,
    wktPolygon: payload.wktPolygon,
  };
  if (payload.description !== undefined) {
    body.description = payload.description ?? "";
  }
  appendZoneAssignmentFields(body, payload);

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
  const body: Record<string, unknown> = {
    name: payload.name,
    description: payload.description,
  };
  appendZoneAssignmentFields(body, payload);

  try {
    await backendApiClient.patch(`zones/${encodeURIComponent(id)}`, body);
  } catch (error) {
    throw toApiError(error, "Impossible de mettre à jour la zone.");
  }
}

export type ZoneDeletionChallengeItem = {
  id: string;
  title: string;
};

export type ZoneDeletionTourItem = {
  id: string;
  descriptor: string;
};

export type ZoneDeletionContainerItem = {
  id: string;
  serialNumber: string;
};

export type ZoneDeletionPreview = {
  zoneId: string;
  zoneName: string;
  affectedChallengesCount: number;
  affectedToursCount: number;
  containerCount: number;
  reportCount: number;
  affectedChallenges: ZoneDeletionChallengeItem[];
  affectedTours: ZoneDeletionTourItem[];
  containers: ZoneDeletionContainerItem[];
};

export async function getZoneDeletionPreview(id: string): Promise<ZoneDeletionPreview> {
  try {
    const { data } = await backendApiClient.get<ZoneDeletionPreview>(
      `zones/${encodeURIComponent(id)}/deletion-preview`
    );
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible d'analyser les éléments liés à la zone.");
  }
}

export type DeleteZoneOptions = {
  cascade?: boolean;
};

export async function deleteZone(id: string, options?: DeleteZoneOptions): Promise<void> {
  try {
    const cascade = options?.cascade === true;
    await backendApiClient.delete(`zones/${encodeURIComponent(id)}`, {
      params: cascade ? { cascade: true } : undefined,
    });
  } catch (error) {
    if (isAxiosError(error)) {
      throw error;
    }
    throw toApiError(error, "Impossible de supprimer la zone.");
  }
}

export function resolveZoneDeleteErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    return extractApiErrorMessage(error, "Impossible de supprimer la zone.");
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "Impossible de supprimer la zone.";
}
