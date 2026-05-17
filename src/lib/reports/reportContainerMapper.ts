import type { Container as ApiContainer } from "@/models/container";
import type { Container as MapContainer } from "@/models/map";
import { parseBackendContainerStatus } from "@/lib/containers/backendContainerStatus";
import { resolveContainerType } from "@/lib/containers/containerTypeLabels";
import {
  normalizeSensorTimestampToIso,
  type SensorTimestampInput,
} from "@/lib/datetime/sensorTimestamp";

function resolveLastMeasurementIso(record: ApiContainer): string {
  const candidates: SensorTimestampInput[] = [
    record.lastSensorUpdate,
    record.lastMeasurement?.measuredAt,
    record.updatedAt,
    record.createdAt,
  ];

  for (const candidate of candidates) {
    const iso = normalizeSensorTimestampToIso(candidate);
    if (iso) {
      return iso;
    }
  }

  return new Date(0).toISOString();
}

/**
 * Maps a REST container row into a map marker model for the signalements page.
 */
export function mapApiContainerToReportMapContainer(
  record: ApiContainer
): MapContainer | null {
  const lat = record.latitude;
  const lng = record.longitude;
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const fill = record.fillLevel ?? record.lastMeasurement?.fillLevel ?? 0;
  const clampedFill = Math.min(100, Math.max(0, fill));

  const serialNumber =
    record.serialNumber?.trim() ||
    record.code?.trim() ||
    record.name?.trim() ||
    record.id;

  const containerType = resolveContainerType(record.type, record.wasteType);

  return {
    id: String(record.id),
    latitude: lat,
    longitude: lng,
    fillLevelPercent: clampedFill,
    lastMeasurementAt: resolveLastMeasurementIso(record),
    serialNumber,
    zoneName: record.zoneName,
    operationalStatus:
      record.operationalStatus ?? parseBackendContainerStatus(record.status),
    containerType,
  };
}
