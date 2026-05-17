"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { Container } from "@/models/map";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
} from "@/components/map/InteractiveMap";
import MapResizeBridge from "@/components/map/MapResizeBridge";
import { parseBackendContainerStatus } from "@/lib/containers/backendContainerStatus";
import { MARKER_COLOR_BY_STATUS } from "@/lib/containers/containerOperationalStatus";
import { getContainerTypeLabel } from "@/lib/containers/containerTypeLabels";

const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function buildStatusMarkerIcon(status: string): L.DivIcon {
  const resolved = parseBackendContainerStatus(status);
  const color = MARKER_COLOR_BY_STATUS[resolved];
  const sizePx = 18;

  return L.divIcon({
    className: "ecotrack-iot-marker",
    html: `<div style="
      width:${sizePx}px;
      height:${sizePx}px;
      border-radius:9999px;
      background:${color};
      border:2px solid #ffffff;
      box-shadow:0 1px 5px rgba(15,23,42,0.3);
    "></div>`,
    iconSize: [sizePx, sizePx],
    iconAnchor: [sizePx / 2, sizePx / 2],
    popupAnchor: [0, -sizePx / 2],
  });
}

export type IotSupervisionMapProps = {
  containers: Container[];
  loading?: boolean;
};

export default function IotSupervisionMap({
  containers,
  loading = false,
}: IotSupervisionMapProps) {
  const markers = useMemo(
    () =>
      containers.map((container) => ({
        container,
        icon: buildStatusMarkerIcon(container.operationalStatus ?? "OK"),
      })),
    [containers]
  );

  if (loading) {
    return (
      <div className="flex h-[min(52dvh,28rem)] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
        Chargement de la carte…
      </div>
    );
  }

  if (containers.length === 0) {
    return (
      <div className="flex h-[min(52dvh,28rem)] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-600">
        Aucun conteneur géolocalisé à afficher.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-inner">
      <MapContainer
        center={DEFAULT_MAP_CENTER}
        zoom={DEFAULT_MAP_ZOOM}
        scrollWheelZoom
        className="h-[min(52dvh,28rem)] w-full"
      >
        <MapResizeBridge />
        <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />
        {markers.map(({ container, icon }) => (
          <Marker
            key={`${container.id}-${container.fillLevelPercent}-${container.operationalStatus}`}
            position={[container.latitude, container.longitude]}
            icon={icon}
          >
            <Popup>
              <div className="min-w-[10rem] text-sm text-slate-800">
                <p className="m-0 font-mono font-bold text-slate-900">
                  {container.serialNumber ?? container.id}
                </p>
                {container.containerType ? (
                  <p className="m-0 mt-1 text-slate-600">
                    Type : {getContainerTypeLabel(container.containerType)}
                  </p>
                ) : null}
                <p className="m-0 mt-1 font-semibold text-slate-900">
                  Remplissage : {container.fillLevelPercent} %
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
