"use client";

import "leaflet/dist/leaflet.css";
import { useCallback, useRef } from "react";
import L from "leaflet";
import { FeatureGroup, MapContainer, Polygon, TileLayer, Tooltip } from "react-leaflet";
import MapResizeBridge from "@/components/map/MapResizeBridge";
import PolygonDrawController, {
  type PersistedPolygonEdit,
} from "@/components/zones/PolygonDrawController";

/** Default viewport for metropolitan zone planning (Paris). */
export const ZONE_MANAGEMENT_MAP_CENTER: [number, number] = [48.8566, 2.3522];
export const ZONE_MANAGEMENT_MAP_ZOOM = 11;

const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export type ZonePolygonLayer = {
  id: string;
  name: string;
  positions: [number, number][];
};

const EXISTING_ZONE_STYLE = {
  color: "#0369a1",
  weight: 2,
  fillColor: "#0ea5e9",
  fillOpacity: 0.12,
} as const;

export type ZoneManagementMapProps = {
  initialPolygons: ZonePolygonLayer[];
  spatialEditingEnabled: boolean;
  onPolygonSketchCommitted: (layer: L.Polygon, discardFromGroup: () => void) => void;
  onPersistedPolygonEditsCommitted?: (edits: PersistedPolygonEdit[]) => Promise<void>;
  onPersistedPolygonDeletesCommitted?: (zoneIds: string[]) => Promise<void>;
};

/**
 * Leaflet map for administrative sector review; optional Leaflet.draw polygon tooling.
 */
export default function ZoneManagementMap({
  initialPolygons,
  spatialEditingEnabled,
  onPolygonSketchCommitted,
  onPersistedPolygonEditsCommitted,
  onPersistedPolygonDeletesCommitted,
}: ZoneManagementMapProps) {
  const editableFeatureGroupRef = useRef<L.FeatureGroup | null>(null);

  const handleSketchCommitted = useCallback(
    (layer: L.Polygon, discardFromGroup: () => void) => {
      onPolygonSketchCommitted(layer, discardFromGroup);
    },
    [onPolygonSketchCommitted]
  );

  return (
    <div className="flex h-[min(72vh,620px)] w-full flex-col overflow-hidden rounded-xl border border-slate-200 shadow-sm">
      <MapContainer
        center={ZONE_MANAGEMENT_MAP_CENTER}
        zoom={ZONE_MANAGEMENT_MAP_ZOOM}
        className="h-full w-full min-h-[420px] flex-1 rounded-xl [&_.leaflet-control]:z-[400] [&_.leaflet-top]:top-2 [&_.leaflet-top]:left-2 [&_.leaflet-control-attribution]:text-[10px]"
        scrollWheelZoom
      >
        <MapResizeBridge />
        <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
        <FeatureGroup ref={editableFeatureGroupRef}>
          {initialPolygons.map((zone) => (
            <Polygon
              key={zone.id}
              positions={zone.positions}
              pathOptions={{ ...EXISTING_ZONE_STYLE }}
              eventHandlers={{
                add(e) {
                  const layer = e.target;
                  if (layer instanceof L.Polygon) {
                    (layer as L.Polygon & { ecotrackZoneId?: string }).ecotrackZoneId = zone.id;
                  }
                },
              }}
            >
              <Tooltip direction="center" opacity={1}>
                <span className="text-xs font-semibold text-slate-800">{zone.name}</span>
              </Tooltip>
            </Polygon>
          ))}
        </FeatureGroup>
        {spatialEditingEnabled ? (
          <PolygonDrawController
            spatialEditingEnabled={spatialEditingEnabled}
            editableFeatureGroupRef={editableFeatureGroupRef}
            editableLayerRevision={initialPolygons.length}
            onPolygonSketchCommitted={handleSketchCommitted}
            onPersistedPolygonEditsCommitted={onPersistedPolygonEditsCommitted}
            onPersistedPolygonDeletesCommitted={onPersistedPolygonDeletesCommitted}
          />
        ) : null}
      </MapContainer>
    </div>
  );
}
