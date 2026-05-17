import type { Container } from "@/models/container";
import type { Container as MapContainer } from "@/models/map";
import {
  parseBackendContainerStatus,
  type BackendContainerStatus,
} from "@/lib/containers/backendContainerStatus";
import { resolveContainerType } from "@/lib/containers/containerTypeLabels";

/** Raw row shape from GET /api/containers (Jackson). */
export type ContainerApiRow = {
  id: string;
  serialNumber?: string | null;
  type?: string | null;
  status?: string | null;
  fillLevel?: number | null;
  temperature?: number | null;
  lastSensorUpdate?: string | (number | string)[] | null;
  latitude?: number | null;
  longitude?: number | null;
  zoneId?: string | null;
  zoneName?: string | null;
};

function mapLegacyUiStatus(
  operationalStatus: BackendContainerStatus
): Container["status"] {
  switch (operationalStatus) {
    case "WARNING":
      return "WARNING";
    case "CRITICAL":
      return "CRITICAL";
    case "MAINTENANCE":
      return "INACTIVE";
    default:
      return "ACTIVE";
  }
}

export function normalizeContainerFromApi(raw: ContainerApiRow): Container {
  const operationalStatus = parseBackendContainerStatus(raw.status);
  const containerType = resolveContainerType(raw.type ?? undefined);

  return {
    id: String(raw.id),
    name: raw.serialNumber?.trim() || String(raw.id),
    serialNumber: raw.serialNumber ?? undefined,
    type: containerType,
    operationalStatus,
    status: mapLegacyUiStatus(operationalStatus),
    fillLevel: raw.fillLevel ?? 0,
    latitude: raw.latitude ?? undefined,
    longitude: raw.longitude ?? undefined,
    zoneId: raw.zoneId ?? undefined,
    zoneName: raw.zoneName ?? undefined,
    lastSensorUpdate: raw.lastSensorUpdate ?? undefined,
    lastMeasurement:
      raw.fillLevel != null
        ? {
            fillLevel: raw.fillLevel,
            temperature: raw.temperature ?? null,
            measuredAt: "",
          }
        : null,
  };
}

export function mapContainerToMapMarker(container: Container): MapContainer | null {
  const lat = container.latitude;
  const lng = container.longitude;
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const fill = container.fillLevel ?? 0;
  const clampedFill = Math.min(100, Math.max(0, fill));

  return {
    id: container.id,
    latitude: lat,
    longitude: lng,
    fillLevelPercent: clampedFill,
    lastMeasurementAt:
      typeof container.lastSensorUpdate === "string"
        ? container.lastSensorUpdate
        : new Date(0).toISOString(),
    serialNumber: container.serialNumber,
    zoneName: container.zoneName,
    operationalStatus: container.operationalStatus,
    containerType: container.type,
  };
}
