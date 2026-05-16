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
export type TourAgent = Pick<User, "id" | "username">;

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
};

/** Mirrors backend `TourResponseDTO` (zone normalized to a partial object). */
export type TourResponseDTO = {
  id: string;
  zone: TourZoneRef;
  startTime: string;
  endTime: string;
  status: TourStatus;
  totalDistanceKm: number | null;
  estimatedDurationMinutes: number | null;
  containerTypes: ContainerType[];
  createdAt: string | null;
  agents: TourAgent[];
  steps: TourStepDTO[];
  /** Populated on list responses when `steps` is omitted. */
  stepCount?: number;
};

/** Mirrors backend `TourCreateRequestDTO`. */
export type TourCreateRequestDTO = {
  zoneId: string;
  startTime: string;
  endTime: string;
  agentIds: string[];
  minFillLevel: number;
  /** Omit or pass an empty array to include all container types. */
  containerTypes?: ContainerType[];
  /** Manual map selection — when non-empty, zone fill/type filters are skipped on the backend. */
  explicitContainerIds?: string[];
};

/** Mirrors backend `TourUpdateRequestDTO` (partial update). */
export type TourUpdateRequestDTO = {
  startTime?: string;
  endTime?: string;
  agentIds?: string[];
};

/**
 * Raw JSON shape from Spring Boot before client-side normalization.
 * @internal
 */
export type TourResponseWire = {
  id: string;
  zoneId: string;
  zoneName: string;
  startTime: string;
  endTime: string;
  status: TourStatus;
  totalDistanceKm: number | null;
  estimatedDurationMinutes: number | null;
  containerTypes?: ContainerType[];
  createdAt: string | null;
  agents: TourAgent[];
  steps: TourStepDTO[];
  stepCount?: number;
};
