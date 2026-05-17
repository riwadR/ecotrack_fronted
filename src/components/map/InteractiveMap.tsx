"use client";

import "leaflet/dist/leaflet.css";
import type { PathOptions } from "leaflet";
import { Fragment, type ReactNode } from "react";
import { MapContainer, Polygon, TileLayer } from "react-leaflet";
import type { Container, Zone } from "@/models/map";
import type { Role } from "@/models/user";
import { MAP_FRAME_CLASS_CITIZEN } from "@/lib/map/mapShellLayout";
import ContainerMarker from "./ContainerMarker";
import MapLocateMeKit from "./MapLocateMeKit";
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
  /** When set, highlights every marker whose id is in the set (takes precedence over `selectedContainerId`). */
  selectedContainerIds?: ReadonlySet<string> | null;
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
  /** Smaller icon-only locate control (embedded maps). */
  compactLocateMe?: boolean;
  /** Optional layer rendered inside the map (e.g. admin container CRUD) without altering zone polygons. */
  mapOverlay?: ReactNode;
  /** When true, default container markers are not rendered (use with mapOverlay). */
  suppressDefaultContainers?: boolean;
  /**
   * Fills the parent height (tour workspace). Skips default citizen viewport heights
   * so Leaflet can size correctly inside flex layouts.
   */
  fillContainer?: boolean;
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
 * Leaflet operational map: zones, citizen markers, locate-me, optional overlays.
 * Frame sizing uses `@/lib/map/mapShellLayout` (`MAP_FRAME_CLASS_CITIZEN`) for responsive viewports.
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
  selectedContainerIds = null,
  onReportIssue,
  onContainerSelect,
  onCreateRoute,
  showZones = true,
  zonePathOptions = OPERATIONAL_ZONE_PATH_OPTIONS,
  showLocateMe = true,
  compactLocateMe = false,
  mapOverlay = null,
  suppressDefaultContainers = false,
  fillContainer = false,
}: InteractiveMapProps) {
  const handleReportIssue = (containerId: string) => {
    onReportIssue?.(containerId);
  };

  const handleCreateRoute = (containerId: string) => {
    onCreateRoute?.(containerId);
  };

  const mapFrameClass = fillContainer
    ? [
        "relative z-0 h-full min-h-0 w-full overflow-hidden rounded-xl touch-manipulation",
        className,
      ]
        .filter(Boolean)
        .join(" ")
    : [MAP_FRAME_CLASS_CITIZEN, className].filter(Boolean).join(" ");

  return (
    <div
      className={fillContainer ? "flex h-full min-h-0 w-full flex-col" : "flex flex-col gap-2"}
    >
      {operationalNotice ? (
        <p className="m-0 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">{operationalNotice}</p>
      ) : null}
      <div className={mapFrameClass}>
        <MapContainer
          center={center}
          zoom={zoom}
          className={
            "h-full min-h-0 min-w-0 w-full rounded-xl [&_.leaflet-control-attribution]:max-sm:text-[9px] " +
            "[&_.leaflet-control-attribution]:text-[10px] [&_.ecotrack-locate-wrapper]:mr-[max(0.75rem,env(safe-area-inset-right))] " +
            "[&_.ecotrack-locate-wrapper]:mt-[max(0.75rem,env(safe-area-inset-top))]"
          }
          scrollWheelZoom
        >
          <MapResizeBridge />
          {showLocateMe ? <MapLocateMeKit compact={compactLocateMe} /> : null}
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
          {mapOverlay}
          {!suppressDefaultContainers
            ? containers.map((container) => (
                <ContainerMarker
                  key={container.id}
                  container={container}
                  viewerRole={viewerRole}
                  isSelected={
                    selectedContainerIds
                      ? selectedContainerIds.has(container.id)
                      : selectedContainerId === container.id
                  }
                  onReportIssue={onReportIssue ? handleReportIssue : undefined}
                  onCreateRoute={onCreateRoute ? handleCreateRoute : undefined}
                  onContainerSelect={onContainerSelect}
                />
              ))
            : null}
        </MapContainer>
      </div>
    </div>
  );
}
