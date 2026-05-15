import type { Container as ApiContainer } from "@/models/container";
import type { Container as MapContainer } from "@/models/map";
import { normalizeSensorTimestampToIso } from "@/lib/datetime/sensorTimestamp";
import { containerDisplayName } from "@/lib/zones/zoneContainerUtils";

/** Maps a REST container into a map marker for zone administration views. */
export function mapApiContainerForZoneAdmin(record: ApiContainer): MapContainer | null {
  const lat = record.latitude;
  const lng = record.longitude;
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const fill = record.fillLevel ?? 0;
  const clampedFill = Math.min(100, Math.max(0, fill));

  return {
    id: String(record.id),
    latitude: lat,
    longitude: lng,
    fillLevelPercent: clampedFill,
    lastMeasurementAt:
      normalizeSensorTimestampToIso(record.lastSensorUpdate) ?? new Date(0).toISOString(),
    serialNumber: containerDisplayName(record),
    zoneId: record.zoneId,
    zoneName: record.zoneName,
    status: record.status,
    containerType: record.type,
  };
}
