"use client";

import { useMemo } from "react";
import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import type { Container } from "@/models/map";
import { getContainerTypeLabel } from "@/lib/containers/containerTypeLabels";
import { getFillLevelCategory } from "@/lib/map/fillLevelCategory";
import { useBelowLgViewport } from "@/hooks/useBelowLgViewport";

const FILL_COLOR_BY_CATEGORY = {
  low: "#22c55e",
  moderate: "#f97316",
  high: "#ef4444",
} as const;

function buildMarkerIcon(fillLevelPercent: number, isSelected: boolean): L.DivIcon {
  const category = getFillLevelCategory(fillLevelPercent);
  const color = FILL_COLOR_BY_CATEGORY[category];
  const sizePx = isSelected ? 22 : 18;
  const boxShadow = isSelected
    ? "0 0 0 2px #0ea5e9, 0 1px 6px rgba(15,23,42,0.35)"
    : "0 1px 5px rgba(15,23,42,0.3)";

  return L.divIcon({
    className: "ecotrack-map-marker",
    html: `<div style="
      width:${sizePx}px;
      height:${sizePx}px;
      border-radius:9999px;
      background:${color};
      border:2px solid #ffffff;
      box-shadow:${boxShadow};
    "></div>`,
    iconSize: [sizePx, sizePx],
    iconAnchor: [sizePx / 2, sizePx / 2],
    popupAnchor: [0, -sizePx / 2],
  });
}

export type TourPlanningContainerMarkerProps = {
  container: Container;
  isSelected: boolean;
  selectionEnabled: boolean;
  onToggle: (container: Container) => void;
};

export default function TourPlanningContainerMarker({
  container,
  isSelected,
  selectionEnabled,
  onToggle,
}: TourPlanningContainerMarkerProps) {
  const belowLg = useBelowLgViewport();
  const icon = useMemo(
    () => buildMarkerIcon(container.fillLevelPercent, isSelected),
    [container.fillLevelPercent, isSelected]
  );

  const displaySerial = container.serialNumber ?? container.id;

  return (
    <Marker
      key={`${container.id}-${isSelected ? "sel" : "norm"}`}
      position={[container.latitude, container.longitude]}
      icon={icon}
    >
      <Popup maxWidth={belowLg ? 300 : 360}>
        <div className="flex min-w-0 flex-col gap-2 px-0.5 py-0.5 text-slate-800">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Conteneur
            </p>
            <p className="m-0 font-mono text-sm font-bold text-slate-900">{displaySerial}</p>
            <p className="m-0 mt-1 text-sm text-slate-700">
              <span className="font-medium text-slate-600">Remplissage : </span>
              {container.fillLevelPercent} %
            </p>
            {container.containerType ? (
              <p className="m-0 mt-0.5 text-sm text-slate-600">
                <span className="font-medium">Type : </span>
                {getContainerTypeLabel(container.containerType)}
              </p>
            ) : null}
          </div>

          {selectionEnabled ? (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                onToggle(container);
              }}
              className={
                isSelected
                  ? "inline-flex min-h-11 w-full items-center justify-center rounded-lg border-2 border-red-500 bg-white px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  : "inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              }
            >
              {isSelected ? "Retirer de la tournée" : "Ajouter à la tournée"}
            </button>
          ) : null}
        </div>
      </Popup>
    </Marker>
  );
}
