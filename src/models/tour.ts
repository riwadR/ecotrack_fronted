import type { ContainerType } from "@/models/container";
import type { User } from "@/models/user";

/** Mirrors backend `com.ingetis.ecotrack.entity.enums.tour.TourStatus`. */
export const TOUR_STATUS_VALUES = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

export type TourStatus = (typeof TOUR_STATUS_VALUES)[number];

/** Mirrors backend `com.ingetis.ecotrack.entity.enums.tour.StepStatus`. */
export const STEP_STATUS_VALUES = [
  "PENDING",
  "COMPLETED",
  "SKIPPED",
] as const;

export type StepStatus = (typeof STEP_STATUS_VALUES)[number];

/** Zone summary embedded in tour responses (maps from `zoneId` / `zoneName`). */
export type TourZoneRef = {
  id: string;
  name: string;
};

/**
 * Assigned collection agent on a tour (`TourAgentDTO` on the backend).
 * Uses {@link User} fields available on the wire (`id`, public `username` pseudonym).
 */
export type TourAgent = Pick<User, "id" | "username"> & {
  currentLatitude?: number | null;
  currentLongitude?: number | null;
};

/** Mirrors backend `TourStepDTO`. */
export type TourStepDTO = {
  id: string;
  stepOrder: number;
  containerId: string;
  serialNumber: string;
  latitude: number | null;
  longitude: number | null;
  status: StepStatus;
  completedAt: string | null;
  collectedVolume?: number | null;
};

/** Mirrors backend `TourResponseDTO` (zones normalized from wire lists). */
export type TourResponseDTO = {
  id: string;
  /** Primary zone (first in list) for compact displays. */
  zone: TourZoneRef;
  zones: TourZoneRef[];
  startTime: string;
  endTime: string;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  status: TourStatus;
  totalDistanceKm: number | null;
  estimatedDurationMinutes: number | null;
  containerTypes: ContainerType[];
  exceededScheduledTime?: boolean | null;
  anomaliesReportedCount?: number | null;
  createdAt: string | null;
  agents: TourAgent[];
  steps: TourStepDTO[];
  /** Populated on list responses when `steps` is omitted. */
  stepCount?: number;
  skippedStepsCount?: number;
};

/** Mirrors backend `TourCreateRequestDTO`. */
export type TourCreateRequestDTO = {
  zoneIds: string[];
  startTime: string;
  endTime: string;
  agentIds: string[];
  minFillLevel: number;
  /** Omit or pass an empty array to include all container types. */
  containerTypes?: ContainerType[];
  /** Manual map selection — when non-empty, zone fill/type filters are skipped on the backend. */
  explicitContainerIds?: string[];
  skipOptimization?: boolean;
};

/** Mirrors backend `TourUpdateRequestDTO` (partial update). */
export type TourUpdateRequestDTO = {
  zoneIds?: string[];
  startTime?: string;
  endTime?: string;
  agentIds?: string[];
  minFillLevel?: number;
  containerTypes?: ContainerType[];
  explicitContainerIds?: string[];
  skipOptimization?: boolean;
};

/** Mirrors backend `StepCompletionDTO` (agent step validation). */
export type StepCompletionDTO = {
  collectedVolume?: number;
};

/**
 * Raw JSON shape from Spring Boot before client-side normalization.
 * @internal
 */
export type TourResponseWire = {
  id: string;
  zoneId: string;
  zoneName: string;
  zoneIds?: string[];
  zoneNames?: string[];
  startTime: string;
  endTime: string;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  status: TourStatus;
  totalDistanceKm: number | null;
  estimatedDurationMinutes: number | null;
  containerTypes?: ContainerType[];
  exceededScheduledTime?: boolean | null;
  anomaliesReportedCount?: number | null;
  createdAt: string | null;
  agents: TourAgent[];
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  steps: TourStepDTO[];
  stepCount?: number;
  skippedStepsCount?: number;
};

/** Mirrors backend `TourTelemetryUpdateDTO`. */
export type TourTelemetryUpdateDTO = {
  latitude: number;
  longitude: number;
};
