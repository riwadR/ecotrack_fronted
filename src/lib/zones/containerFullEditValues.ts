import type { Container, ContainerType } from "@/models/container";
import type { BackendContainerStatus } from "@/lib/containers/backendContainerStatus";
import { parseBackendContainerStatus } from "@/lib/containers/backendContainerStatus";
import { resolveContainerType } from "@/lib/containers/containerTypeLabels";
import { containerDisplayName } from "@/lib/zones/zoneContainerUtils";
import type { AdminMapContainer } from "@/lib/map/adminMapContainer";

/** Values for full container PUT (matching backend ContainerPutDTO). */
export type ContainerFullEditValues = {
  id: string;
  serialNumber: string;
  type: ContainerType;
  zoneId: string;
  latitude: number;
  longitude: number;
  status: BackendContainerStatus;
  fillLevel: number;
};

export function containerApiRowToFullEdit(row: Container): ContainerFullEditValues | null {
  const lat = row.latitude;
  const lng = row.longitude;
  const zoneId = row.zoneId;
  if (
    zoneId == null ||
    lat == null ||
    lng == null ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return null;
  }
  return {
    id: row.id,
    serialNumber: containerDisplayName(row),
    type: resolveContainerType(row.type, row.wasteType) ?? "GENERAL",
    zoneId,
    latitude: lat,
    longitude: lng,
    status: parseBackendContainerStatus(row.status),
    fillLevel: Math.min(100, Math.max(0, Math.round(row.fillLevel ?? 0))),
  };
}

export function adminMarkerToFullEdit(marker: AdminMapContainer): ContainerFullEditValues {
  return {
    id: marker.id,
    serialNumber: marker.serialNumber,
    type: marker.type,
    zoneId: marker.zoneId,
    latitude: marker.latitude,
    longitude: marker.longitude,
    status: marker.status,
    fillLevel: Math.min(100, Math.max(0, Math.round(marker.fillLevelPercent))),
  };
}
