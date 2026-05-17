import type { BackendContainerStatus } from "@/lib/containers/backendContainerStatus";

/** Mirrors backend `com.ingetis.ecotrack.entity.enums.container.ContainerType`. */
export type ContainerType = "GLASS" | "PLASTIC" | "PAPER" | "GENERAL";

/** @deprecated Prefer {@link ContainerType} aligned with the backend `Container.type` field. */
export type WasteType =
  | "PLASTIC"
  | "PAPER"
  | "GLASS"
  | "METAL"
  | "ORGANIC"
  | "MIXED"
  | "GENERAL";

export type ContainerStatus = "ACTIVE" | "INACTIVE" | "WARNING" | "CRITICAL";

export type ContainerMeasurement = {
  id?: string;
  fillLevel: number;
  temperature?: number | null;
  humidity?: number | null;
  batteryLevel?: number | null;
  measuredAt: string;
};

export type ContainerAlert = {
  id: string;
  type: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  createdAt: string;
  resolved?: boolean;
};

export type Container = {
  id: string;
  serialNumber?: string;
  code?: string;
  name: string;
  /** Backend field name (`ContainerResponseDTO.type`). */
  type?: ContainerType;
  wasteType?: WasteType;
  status: ContainerStatus;
  /** Threshold-derived status from the backend (`OK`, `WARNING`, `CRITICAL`, `MAINTENANCE`). */
  operationalStatus?: BackendContainerStatus;
  fillLevel?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  zoneId?: string;
  zoneName?: string;
  lastCollectionAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  /** Latest IoT reading timestamp from `lastSensorUpdate` (API root field). */
  lastSensorUpdate?: string | (number | string)[] | null;
  lastMeasurement?: ContainerMeasurement | null;
  measurementHistory?: ContainerMeasurement[];
  alerts?: ContainerAlert[];
};

export type CreateContainerPayload = {
  name: string;
  wasteType: WasteType;
  zoneId: string;
  latitude?: number;
  longitude?: number;
  address?: string;
};

export type IoTPayload = {
  containerId: string;
  fillLevel: number;
  temperature?: number;
  humidity?: number;
  batteryLevel?: number;
};