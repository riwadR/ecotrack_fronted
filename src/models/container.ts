export type WasteType =
  | "PLASTIC"
  | "PAPER"
  | "GLASS"
  | "METAL"
  | "ORGANIC"
  | "MIXED";

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
  wasteType: WasteType;
  status: ContainerStatus;
  fillLevel?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  zoneId?: string;
  zoneName?: string;
  lastCollectionAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
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