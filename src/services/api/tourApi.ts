import { isAxiosError } from "axios";
import { backendApiClient } from "@/lib/api/apiClient";
import { toApiError } from "@/lib/api/apiErrors";
import type {
  TourCreateRequestDTO,
  TourResponseDTO,
  TourResponseWire,
  TourUpdateRequestDTO,
} from "@/models/tour";

function mapTourResponse(wire: TourResponseWire): TourResponseDTO {
  return {
    id: wire.id,
    zone: {
      id: wire.zoneId,
      name: wire.zoneName,
    },
    startTime: wire.startTime,
    endTime: wire.endTime,
    status: wire.status,
    totalDistanceKm: wire.totalDistanceKm,
    estimatedDurationMinutes: wire.estimatedDurationMinutes,
    containerTypes: wire.containerTypes ?? [],
    createdAt: wire.createdAt,
    agents: wire.agents,
    steps: wire.steps ?? [],
    stepCount: wire.stepCount,
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
    if (isAxiosError(error) && error.response?.status === 409) {
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
    if (isAxiosError(error) && error.response?.status === 409) {
      throw error;
    }
    throw toApiError(error, "Impossible de mettre à jour la tournée.");
  }
}
