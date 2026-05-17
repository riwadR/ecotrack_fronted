import type { Container as ApiContainer } from "@/models/container";
import type { Container as MapContainer } from "@/models/map";
import { resolveContainerType } from "@/lib/containers/containerTypeLabels";
import { normalizeSensorTimestampToIso } from "@/lib/datetime/sensorTimestamp";

/**
 * Maps a REST container row to the operational map model for tour planning.
 * Excludes units in maintenance (not eligible for tours).
 */
export function mapApiContainerForTourPlanning(record: ApiContainer): MapContainer | null {
  const lat = record.latitude;
  const lng = record.longitude;
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  if (record.operationalStatus === "MAINTENANCE") {
    return null;
  }

  const fill = record.fillLevel ?? 0;
  const containerType = resolveContainerType(record.type, record.wasteType);

  return {
    id: record.id,
    latitude: lat,
    longitude: lng,
    fillLevelPercent: Math.min(100, Math.max(0, fill)),
    lastMeasurementAt:
      normalizeSensorTimestampToIso(record.lastSensorUpdate) ?? new Date(0).toISOString(),
    serialNumber: record.serialNumber?.trim() || record.name?.trim() || record.id,
    zoneId: record.zoneId,
    zoneName: record.zoneName,
    operationalStatus: record.operationalStatus,
    containerType,
  };
}
