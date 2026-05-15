/**
 * Domain types for the operational waste-collection map.
 * These types describe map rendering only and are intentionally decoupled from REST API models.
 */

import type { ContainerStatus, ContainerType } from "@/models/container";

/** IoT-enabled waste container rendered as a map marker. */
export interface Container {
  id: string;
  latitude: number;
  longitude: number;
  /** Fill level from 0 to 100 (percentage). */
  fillLevelPercent: number;
  /** ISO 8601 timestamp of the latest IoT measurement. */
  lastMeasurementAt: string;
  /** Hardware serial when provided by the containers API (issue reporting). */
  serialNumber?: string;
  zoneName?: string;
  status?: ContainerStatus;
  containerType?: ContainerType;
}

/**
 * Geographic collection zone represented as a closed polygon on the map.
 * Vertices are ordered [latitude, longitude] to match Leaflet LatLng tuples.
 */
export interface Zone {
  id: string;
  name: string;
  /** Closed outer ring; first and last point should match for a closed polygon. */
  polygon: [number, number][];
}
