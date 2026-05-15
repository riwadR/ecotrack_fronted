import type { Container as ApiContainer } from "@/models/container";
import type { Container as MapContainer } from "@/models/map";

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
  const measuredAt =
    record.lastMeasurement?.measuredAt ??
    record.updatedAt ??
    record.createdAt ??
    new Date(0).toISOString();

  const serialNumber =
    record.serialNumber?.trim() ||
    record.code?.trim() ||
    record.name?.trim() ||
    record.id;

  return {
    id: String(record.id),
    latitude: lat,
    longitude: lng,
    fillLevelPercent: clampedFill,
    lastMeasurementAt: measuredAt,
    serialNumber,
    zoneName: record.zoneName,
    status: record.status,
  };
}
