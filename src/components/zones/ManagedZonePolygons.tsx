"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { PathOptions } from "leaflet";
import L from "leaflet";
import { useMap } from "react-leaflet";
import type { ZonePolygonLayer } from "@/components/zones/ZoneManagementMap";

function buildRenderKey(zone: ZonePolygonLayer): string {
  const epoch = zone.geometryEpoch ?? 0;
  const first = zone.positions[0];
  const last = zone.positions[zone.positions.length - 1];
  const head = first ? `${first[0].toFixed(5)},${first[1].toFixed(5)}` : "";
  const tail = last ? `${last[0].toFixed(5)},${last[1].toFixed(5)}` : "";
  return `${zone.id}:${epoch}:${zone.positions.length}:${head}:${tail}`;
}

export type ManagedZonePolygonsProps = {
  zones: ZonePolygonLayer[];
  featureGroupRef: RefObject<L.FeatureGroup | null>;
  pathOptions: PathOptions;
  /** When true, Leaflet layers are left untouched (active Leaflet.draw session). */
  syncSuspended: boolean;
};

/**
 * Imperative zone polygons for Leaflet.draw — avoids react-leaflet fighting the edit handler.
 */
export default function ManagedZonePolygons({
  zones,
  featureGroupRef,
  pathOptions,
  syncSuspended,
}: ManagedZonePolygonsProps) {
  const map = useMap();
  const layersRef = useRef<Map<string, { layer: L.Polygon; renderKey: string }>>(new Map());

  useEffect(() => {
    if (syncSuspended) {
      return;
    }

    const fg = featureGroupRef.current;
    if (!fg) {
      return;
    }

    const nextIds = new Set(zones.map((zone) => zone.id));

    for (const [zoneId, entry] of layersRef.current.entries()) {
      if (!nextIds.has(zoneId)) {
        fg.removeLayer(entry.layer);
        layersRef.current.delete(zoneId);
      }
    }

    for (const zone of zones) {
      if (zone.positions.length < 3) {
        continue;
      }

      const renderKey = buildRenderKey(zone);
      const existing = layersRef.current.get(zone.id);
      if (existing?.renderKey === renderKey) {
        continue;
      }

      if (existing) {
        fg.removeLayer(existing.layer);
      }

      const layer = L.polygon(zone.positions, pathOptions);
      (layer as L.Polygon & { ecotrackZoneId?: string }).ecotrackZoneId = zone.id;
      fg.addLayer(layer);
      layersRef.current.set(zone.id, { layer, renderKey });
    }
  }, [zones, featureGroupRef, pathOptions, syncSuspended, map]);

  useEffect(() => {
    const fg = featureGroupRef.current;
    return () => {
      if (!fg) {
        layersRef.current.clear();
        return;
      }
      for (const entry of layersRef.current.values()) {
        fg.removeLayer(entry.layer);
      }
      layersRef.current.clear();
    };
  }, [featureGroupRef]);

  return null;
}
