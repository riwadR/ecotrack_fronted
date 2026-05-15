"use client";

import { useMemo, useRef } from "react";
import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import type { AdminMapContainer } from "@/lib/map/adminMapContainer";
import { BACKEND_CONTAINER_STATUS_OPTIONS } from "@/lib/containers/backendContainerStatus";
import { useBelowLgViewport } from "@/hooks/useBelowLgViewport";
import { usePointerCoarse } from "@/hooks/usePointerCoarse";
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
  const markerRef = useRef<L.Marker | null>(null);
  const belowLg = useBelowLgViewport();
  const pointerCoarse = usePointerCoarse();

  const color = getInfrastructureMarkerColor(container.status, container.fillLevelPercent);
  const icon = useMemo(() => buildMarkerIcon(color, isRelocating), [color, isRelocating]);

  const statusLabel = STATUS_LABEL_BY_VALUE[container.status] ?? container.status;
  const typeLabel = getContainerTypeLabel(container.type);

  const moveHint = pointerCoarse
    ? "Touchez « Déplacer », puis l’emplacement voulu sur la carte."
    : "Glissez le marqueur ou utilisez « Déplacer » puis cliquez sur la carte.";

  const runAndClosePopup = (action: () => void) => {
    markerRef.current?.closePopup();
    action();
  };

  return (
    <Marker
      ref={markerRef}
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
      <Popup maxWidth={belowLg ? 260 : 320}>
        <div className="min-w-0 max-w-full px-0.5 py-0 text-xs text-slate-800 sm:px-0.5 sm:text-sm">
          <p className="m-0 font-mono text-sm font-bold leading-tight text-slate-900">
            {container.serialNumber}
          </p>
          {container.zoneName ? (
            <p className="m-0 mt-1 leading-snug text-slate-600">Secteur : {container.zoneName}</p>
          ) : null}
          <p className="m-0 mt-0.5 leading-snug text-slate-600">Type : {typeLabel}</p>
          <p className="m-0 mt-0.5 leading-snug text-slate-600">Statut : {statusLabel}</p>
          <p className="m-0 mt-0.5 leading-snug text-slate-600">
            Remplissage : {container.fillLevelPercent} %
          </p>
          {canManage ? (
            <div className="mt-2 flex flex-col gap-1.5 border-t border-slate-200 pt-2">
              <p className="m-0 text-[11px] leading-snug text-slate-500">{moveHint}</p>
              <button
                type="button"
                className="min-h-[40px] w-full rounded-md bg-emerald-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 sm:min-h-0 sm:py-2"
                onClick={() => runAndClosePopup(() => onRequestRelocation(container))}
              >
                Déplacer
              </button>
              <button
                type="button"
                className="min-h-[40px] w-full rounded-md border border-emerald-600 bg-white px-2 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 sm:min-h-0 sm:py-2"
                onClick={() => runAndClosePopup(() => onRequestEdit(container))}
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
