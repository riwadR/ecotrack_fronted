"use client";

import { useMemo } from "react";
import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import type { AdminMapContainer } from "@/lib/map/adminMapContainer";
import { BACKEND_CONTAINER_STATUS_OPTIONS } from "@/lib/containers/backendContainerStatus";
import { getInfrastructureMarkerColor } from "@/lib/map/containerMarkerColor";
import { getContainerTypeLabel } from "@/lib/containers/containerTypeLabels";

const STATUS_LABEL_BY_VALUE = Object.fromEntries(
  BACKEND_CONTAINER_STATUS_OPTIONS.map((option) => [option.value, option.label])
) as Record<string, string>;

function buildMarkerIcon(color: string, isRelocating: boolean): L.DivIcon {
  const sizePx = 20;
  const ring = isRelocating ? "0 0 0 3px #0369a1" : "0 0 0 2px #0369a1";

  return L.divIcon({
    className: "ecotrack-map-marker ecotrack-map-marker--draggable",
    html: `<div style="width:${sizePx}px;height:${sizePx}px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:${ring},0 1px 6px rgba(15,23,42,0.35);cursor:grab;"></div>`,
    iconSize: [sizePx, sizePx],
    iconAnchor: [sizePx / 2, sizePx / 2],
    popupAnchor: [0, -sizePx / 2],
  });
}

export type InfrastructureContainerMarkerProps = {
  container: AdminMapContainer;
  canManage: boolean;
  isRelocating: boolean;
  onDragEnd: (container: AdminMapContainer, latitude: number, longitude: number) => void;
  onRequestRelocation: (container: AdminMapContainer) => void;
  onRequestEdit: (container: AdminMapContainer) => void;
};

export default function InfrastructureContainerMarker({
  container,
  canManage,
  isRelocating,
  onDragEnd,
  onRequestRelocation,
  onRequestEdit,
}: InfrastructureContainerMarkerProps) {
  const color = getInfrastructureMarkerColor(container.status, container.fillLevelPercent);
  const icon = useMemo(
    () => buildMarkerIcon(color, isRelocating),
    [color, isRelocating]
  );

  const statusLabel = STATUS_LABEL_BY_VALUE[container.status] ?? container.status;
  const typeLabel = getContainerTypeLabel(container.type);

  return (
    <Marker
      position={[container.latitude, container.longitude]}
      icon={icon}
      draggable={canManage}
      eventHandlers={{
        dragend: (event) => {
          if (!canManage) {
            return;
          }
          const target = event.target;
          if (!(target instanceof L.Marker)) {
            return;
          }
          const { lat, lng } = target.getLatLng();
          onDragEnd(container, lat, lng);
        },
      }}
    >
      <Popup>
        <div className="min-w-[200px] p-1 text-sm text-slate-800">
          <p className="m-0 font-mono font-bold text-slate-900">{container.serialNumber}</p>
          {container.zoneName ? (
            <p className="m-0 mt-1 text-slate-600">Secteur : {container.zoneName}</p>
          ) : null}
          <p className="m-0 mt-1 text-slate-600">Type : {typeLabel}</p>
          <p className="m-0 mt-1 text-slate-600">Statut : {statusLabel}</p>
          <p className="m-0 mt-1 text-slate-600">Remplissage : {container.fillLevelPercent} %</p>
          {canManage ? (
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-200 pt-2">
              <p className="m-0 text-xs text-slate-500">
                Sur ordinateur : glissez le marqueur. Sur mobile : utilisez Déplacer.
              </p>
              <button
                type="button"
                className="w-full rounded-md bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-700"
                onClick={() => onRequestRelocation(container)}
              >
                Déplacer
              </button>
              <button
                type="button"
                className="w-full rounded-md bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-900"
                onClick={() => onRequestEdit(container)}
              >
                Éditer
              </button>
            </div>
          ) : null}
        </div>
      </Popup>
    </Marker>
  );
}
