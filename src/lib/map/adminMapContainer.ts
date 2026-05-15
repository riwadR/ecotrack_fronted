import type { Container, ContainerType } from "@/models/container";
import { parseBackendContainerStatus, type BackendContainerStatus } from "@/lib/containers/backendContainerStatus";
import { resolveContainerType } from "@/lib/containers/containerTypeLabels";

/** Container row used by the admin map layer (independent from zone drawing). */
export type AdminMapContainer = {
  id: string;
  serialNumber: string;
  type: ContainerType;
  latitude: number;
  longitude: number;
  zoneId: string;
  zoneName?: string;
  status: BackendContainerStatus;
  fillLevelPercent: number;
};

export function toAdminMapContainer(record: Container): AdminMapContainer | null {
  const lat = record.latitude;
  const lng = record.longitude;
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  if (!record.zoneId) {
    return null;
  }

  const fill = record.fillLevel ?? 0;
  return {
    id: record.id,
    serialNumber: record.serialNumber?.trim() || record.name?.trim() || record.id,
    type: resolveContainerType(record.type, record.wasteType) ?? "GENERAL",
    latitude: lat,
    longitude: lng,
    zoneId: record.zoneId,
    zoneName: record.zoneName,
    status: parseBackendContainerStatus(record.status),
    fillLevelPercent: Math.min(100, Math.max(0, fill)),
  };
}
