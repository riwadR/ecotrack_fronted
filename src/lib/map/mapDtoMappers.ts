import type { Container, Zone } from "@/models/map";
import type { ContainerApiRecord, ZoneApiRecord } from "@/services/api/mapDataSource";
import { wktPolygonOuterRingToLatLngTuples } from "@/lib/map/wktToLeafletRing";

/**
 * Normalizes Spring/Jackson `LocalDateTime` payloads (ISO string or numeric array) to ISO-8601 UTC text.
 */
export function normalizeLastSensorUpdateToIso(value: ContainerApiRecord["lastSensorUpdate"]): string {
  if (value == null) {
    return new Date(0).toISOString();
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? new Date(parsed).toISOString() : new Date(0).toISOString();
  }
  if (Array.isArray(value) && value.length >= 3) {
    const year = Number(value[0]);
    const monthIndex = Number(value[1]) - 1;
    const day = Number(value[2]);
    const hour = value.length > 3 ? Number(value[3]) : 0;
    const minute = value.length > 4 ? Number(value[4]) : 0;
    const second = value.length > 5 ? Number(value[5]) : 0;
    if ([year, monthIndex, day, hour, minute, second].every((n) => Number.isFinite(n))) {
      return new Date(Date.UTC(year, monthIndex, day, hour, minute, second)).toISOString();
    }
  }
  return new Date(0).toISOString();
}

export function mapApiContainerToMapContainer(record: ContainerApiRecord): Container | null {
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
    lastMeasurementAt: normalizeLastSensorUpdateToIso(record.lastSensorUpdate),
  };
}

/**
 * If `coordinates` is present, each pair is interpreted as [latitude, longitude] when the first value's absolute value does not exceed 90 (heuristic for mixed API versions).
 */
export function mapApiZoneToMapZone(record: ZoneApiRecord): Zone | null {
  let polygon: [number, number][] = [];

  if (Array.isArray(record.coordinates) && record.coordinates.length > 0) {
    const first = record.coordinates[0];
    if (Array.isArray(first) && first.length >= 2) {
      polygon = record.coordinates
        .map((pair) => {
          if (!Array.isArray(pair) || pair.length < 2) return null;
          const x = Number(pair[0]);
          const y = Number(pair[1]);
          if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
          // Heuristic for mixed backends: smaller absolute value is often longitude near France/Europe.
          const latLng: [number, number] =
            Math.abs(x) < Math.abs(y) ? [y, x] : [x, y];
          return latLng;
        })
        .filter((p): p is [number, number] => p !== null);
    }
  } else if (record.wktPolygon) {
    polygon = wktPolygonOuterRingToLatLngTuples(record.wktPolygon);
  }

  if (polygon.length < 3) {
    return null;
  }

  return {
    id: String(record.id),
    name: record.name,
    polygon,
  };
}
