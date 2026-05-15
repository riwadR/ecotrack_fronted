"use client";

import "leaflet/dist/leaflet.css";
import type { PathOptions } from "leaflet";
import { Fragment } from "react";
import { MapContainer, Polygon, TileLayer } from "react-leaflet";
import type { Container, Zone } from "@/models/map";
import type { Role } from "@/models/user";
import ContainerMarker from "./ContainerMarker";
import LocateMeControl from "./LocateMeControl";
import MapResizeBridge from "./MapResizeBridge";
import ZoneNameLabel from "./ZoneNameLabel";

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
  /** Hide zone polygons when only containers matter. */
  showZones?: boolean;
  /** Override default zone polygon styling (e.g. subtle citizen boundaries). */
  zonePathOptions?: PathOptions;
  /** Show a control that flies the map to the user's geolocation. */
  showLocateMe?: boolean;
};

const OPERATIONAL_ZONE_PATH_OPTIONS: PathOptions = {
  color: "#0ea5e9",
  weight: 2,
  fillColor: "#38bdf8",
  fillOpacity: 0.18,
};

export const CITIZEN_ZONE_PATH_OPTIONS: PathOptions = {
  color: "green",
  weight: 1,
  fillColor: "green",
  fillOpacity: 0.1,
};

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
  zonePathOptions = OPERATIONAL_ZONE_PATH_OPTIONS,
  showLocateMe = true,
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
          className="h-full w-full rounded-xl [&_.leaflet-control-attribution]:text-[10px] [&_.ecotrack-locate-wrapper]:mr-3 [&_.ecotrack-locate-wrapper]:mt-3"
          scrollWheelZoom
        >
          <MapResizeBridge />
          {showLocateMe ? <LocateMeControl /> : null}
          <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
          {showZones
            ? zones.map((zone) => (
                <Fragment key={zone.id}>
                  <Polygon
                    positions={zone.polygon}
                    pathOptions={{ ...zonePathOptions, interactive: false }}
                  />
                  <ZoneNameLabel name={zone.name} polygon={zone.polygon} />
                </Fragment>
              ))
            : null}
          {containers.map((container) => (
            <ContainerMarker
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
