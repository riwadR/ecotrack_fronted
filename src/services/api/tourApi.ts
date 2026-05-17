import { isAxiosError } from "axios";
import { backendApiClient } from "@/lib/api/apiClient";
import { toApiError } from "@/lib/api/apiErrors";
import type {
  StepCompletionDTO,
  TourCreateRequestDTO,
  TourResponseDTO,
  TourResponseWire,
  TourTelemetryUpdateDTO,
  TourUpdateRequestDTO,
} from "@/models/tour";

function mapTourZones(wire: TourResponseWire): TourResponseDTO["zones"] {
  if (wire.zoneIds?.length) {
    return wire.zoneIds.map((id, index) => ({
      id,
      name: wire.zoneNames?.[index] ?? wire.zoneName ?? "—",
    }));
  }
  return [{ id: wire.zoneId, name: wire.zoneName }];
}

function mapTourAgents(wire: TourResponseWire): TourResponseDTO["agents"] {
  return wire.agents.map((agent) => ({
    ...agent,
    currentLatitude:
      agent.currentLatitude ?? wire.currentLatitude ?? null,
    currentLongitude:
      agent.currentLongitude ?? wire.currentLongitude ?? null,
  }));
}

function mapTourResponse(wire: TourResponseWire): TourResponseDTO {
  const zones = mapTourZones(wire);
  return {
    id: wire.id,
    zone: zones[0],
    zones,
    startTime: wire.startTime,
    endTime: wire.endTime,
    actualStartTime: wire.actualStartTime ?? null,
    actualEndTime: wire.actualEndTime ?? null,
    status: wire.status,
    totalDistanceKm: wire.totalDistanceKm,
    estimatedDurationMinutes: wire.estimatedDurationMinutes,
    containerTypes: wire.containerTypes ?? [],
    exceededScheduledTime: wire.exceededScheduledTime ?? null,
    anomaliesReportedCount: wire.anomaliesReportedCount ?? null,
    createdAt: wire.createdAt,
    agents: mapTourAgents(wire),
    steps: wire.steps ?? [],
    stepCount: wire.stepCount,
    skippedStepsCount: wire.skippedStepsCount,
  };
}

export async function deleteTour(id: string): Promise<void> {
  try {
    await backendApiClient.delete(`tours/${encodeURIComponent(id)}`);
  } catch (error) {
    throw toApiError(error, "Impossible de supprimer la tournée.");
  }
}

export async function generateOptimizedTour(
  payload: TourCreateRequestDTO
): Promise<TourResponseDTO> {
  try {
    const { data } = await backendApiClient.post<TourResponseWire>(
      "tours/generate",
      payload
    );
    return mapTourResponse(data);
  } catch (error) {
    if (isAxiosError(error)) {
      throw error;
    }
    throw toApiError(error, "Impossible de générer la tournée.");
  }
}

export async function getTours(): Promise<TourResponseDTO[]> {
  try {
    const { data } = await backendApiClient.get<TourResponseWire[]>("tours");
    return data.map(mapTourResponse);
  } catch (error) {
    throw toApiError(error, "Impossible de charger les tournées.");
  }
}

export async function getTourById(id: string): Promise<TourResponseDTO> {
  try {
    const { data } = await backendApiClient.get<TourResponseWire>(
      `tours/${encodeURIComponent(id)}`
    );
    return mapTourResponse(data);
  } catch (error) {
    throw toApiError(error, "Impossible de charger la tournée.");
  }
}

export async function updateTour(
  id: string,
  payload: TourUpdateRequestDTO
): Promise<TourResponseDTO> {
  try {
    const { data } = await backendApiClient.patch<TourResponseWire>(
      `tours/${encodeURIComponent(id)}`,
      payload
    );
    return mapTourResponse(data);
  } catch (error) {
    if (isAxiosError(error)) {
      throw error;
    }
    throw toApiError(error, "Impossible de mettre à jour la tournée.");
  }
}

/** Returns null when the agent has no PENDING or IN_PROGRESS tour (404). */
export async function getMyCurrentTour(): Promise<TourResponseDTO | null> {
  try {
    const { data } = await backendApiClient.get<TourResponseWire>("tours/my-current");
    return mapTourResponse(data);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw toApiError(error, "Impossible de charger votre tournée.");
  }
}

export async function updateTourTelemetry(
  tourId: string,
  payload: TourTelemetryUpdateDTO
): Promise<void> {
  try {
    await backendApiClient.patch(
      `tours/${encodeURIComponent(tourId)}/telemetry`,
      payload
    );
  } catch {
    /* Silent background updates — callers may ignore failures. */
  }
}

export async function startTour(tourId: string): Promise<void> {
  try {
    await backendApiClient.patch(`tours/${encodeURIComponent(tourId)}/start`);
  } catch (error) {
    throw toApiError(error, "Impossible de démarrer la tournée.");
  }
}

export async function completeTourStep(
  stepId: string,
  payload: StepCompletionDTO
): Promise<void> {
  try {
    await backendApiClient.patch(
      `tours/steps/${encodeURIComponent(stepId)}/complete`,
      payload
    );
  } catch (error) {
    throw toApiError(error, "Impossible de valider cette collecte.");
  }
}
