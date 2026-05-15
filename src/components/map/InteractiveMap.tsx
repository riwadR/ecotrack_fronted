"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, Polygon, TileLayer, Tooltip } from "react-leaflet";
import type { Container, Zone } from "@/models/map";
import type { Role } from "@/models/user";
import ContainerMarker from "./ContainerMarker";
import MapResizeBridge from "./MapResizeBridge";

/** Default viewport: Paris metropolitan area. */
export const DEFAULT_MAP_CENTER: [number, number] = [48.8566, 2.3522];
export const DEFAULT_MAP_ZOOM = 12;

const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export type InteractiveMapProps = {
  containers: Container[];
  zones?: Zone[];
  viewerRole: Role;
  center?: [number, number];
  zoom?: number;
  className?: string;
  /** Optional banner for role-specific UX (e.g. agent tour API pending). */
  operationalNotice?: string | null;
  /** When set, highlights the matching marker (e.g. list selection). */
  selectedContainerId?: string | null;
  /** Parent handler for “Signaler un problème” from marker popups. */
  onReportIssue?: (containerId: string) => void;
  /** Parent handler when a marker is opened or clicked. */
  onContainerSelect?: (container: Container) => void;
  onCreateRoute?: (containerId: string) => void;
  /** Hide zone polygons when only containers matter (signalements page). */
  showZones?: boolean;
};

const ZONE_PATH_OPTIONS = {
  color: "#0ea5e9",
  weight: 2,
  fillColor: "#38bdf8",
  fillOpacity: 0.18,
} as const;

/**
 * Leaflet map with OSM tiles, collection-zone polygons, and container markers.
 */
export default function InteractiveMap({
  containers,
  zones = [],
  viewerRole,
  center = DEFAULT_MAP_CENTER,
  zoom = DEFAULT_MAP_ZOOM,
  className,
  operationalNotice = null,
  selectedContainerId = null,
  onReportIssue,
  onContainerSelect,
  onCreateRoute,
  showZones = true,
}: InteractiveMapProps) {
  const handleReportIssue = (containerId: string) => {
    onReportIssue?.(containerId);
  };

  const handleCreateRoute = (containerId: string) => {
    onCreateRoute?.(containerId);
  };

  return (
    <div className="flex flex-col gap-2">
      {operationalNotice ? (
        <p className="m-0 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">{operationalNotice}</p>
      ) : null}
      <div
        className={["relative z-0 h-[min(70vh,560px)] w-full overflow-hidden rounded-xl", className]
          .filter(Boolean)
          .join(" ")}
      >
        <MapContainer
          center={center}
          zoom={zoom}
          className="h-full w-full rounded-xl [&_.leaflet-control-attribution]:text-[10px]"
          scrollWheelZoom
        >
          <MapResizeBridge />
          <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
          {showZones
            ? zones.map((zone) => (
                <Polygon key={zone.id} positions={zone.polygon} pathOptions={{ ...ZONE_PATH_OPTIONS }}>
                  <Tooltip direction="center" opacity={1}>
                    <span className="text-sm font-semibold text-slate-800">{zone.name}</span>
                  </Tooltip>
                </Polygon>
              ))
            : null}
          {containers.map((container) => (
            <ContainerMarker
              key={container.id}
              container={container}
              viewerRole={viewerRole}
              isSelected={selectedContainerId === container.id}
              onReportIssue={onReportIssue ? handleReportIssue : undefined}
              onCreateRoute={onCreateRoute ? handleCreateRoute : undefined}
              onContainerSelect={onContainerSelect}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
