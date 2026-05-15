"use client";

import { useMemo } from "react";
import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import type { Container } from "@/models/map";
import type { Role } from "@/models/user";
import { getContainerTypeLabel } from "@/lib/containers/containerTypeLabels";
import { formatSensorTimestampFr } from "@/lib/datetime/sensorTimestamp";
import { getFillLevelCategory } from "@/lib/map/fillLevelCategory";
import { canShowCreateRouteAction } from "@/lib/map/mapActionPermissions";

const FILL_COLOR_BY_CATEGORY = {
  low: "#22c55e",
  moderate: "#f97316",
  high: "#ef4444",
} as const;

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  WARNING: "Alerte",
  CRITICAL: "Critique",
};

function buildMarkerIcon(fillLevelPercent: number, isSelected: boolean): L.DivIcon {
  const category = getFillLevelCategory(fillLevelPercent);
  const color = FILL_COLOR_BY_CATEGORY[category];
  const sizePx = isSelected ? 32 : 26;
  const boxShadow = isSelected
    ? "0 0 0 3px #0ea5e9, 0 2px 8px rgba(15,23,42,0.35)"
    : "0 2px 8px rgba(15,23,42,0.35)";

  return L.divIcon({
    className: "ecotrack-map-marker",
    html: `<div style="
      width:${sizePx}px;
      height:${sizePx}px;
      border-radius:9999px;
      background:${color};
      border:3px solid #ffffff;
      box-shadow:${boxShadow};
    "></div>`,
    iconSize: [sizePx, sizePx],
    iconAnchor: [sizePx / 2, sizePx / 2],
    popupAnchor: [0, -sizePx / 2],
  });
}

export type ContainerMarkerProps = {
  container: Container;
  viewerRole: Role;
  isSelected?: boolean;
  onReportIssue?: (containerId: string) => void;
  onCreateRoute?: (containerId: string) => void;
  onContainerSelect?: (container: Container) => void;
};

/**
 * Single waste-container marker with fill-based coloring and a role-aware popup.
 */
export default function ContainerMarker({
  container,
  viewerRole,
  isSelected = false,
  onReportIssue,
  onCreateRoute,
  onContainerSelect,
}: ContainerMarkerProps) {
  const icon = useMemo(
    () => buildMarkerIcon(container.fillLevelPercent, isSelected),
    [container.fillLevelPercent, isSelected]
  );

  const lastMeasuredLabel = formatSensorTimestampFr(container.lastMeasurementAt, {
    dateStyle: "short",
    timeStyle: "short",
  });

  const displaySerial = container.serialNumber ?? container.id;
  const statusLabel = container.status ? STATUS_LABELS[container.status] ?? container.status : null;

  const showReport = Boolean(onReportIssue);
  const showRoute = Boolean(onCreateRoute) && canShowCreateRouteAction(viewerRole);

  return (
    <Marker
      position={[container.latitude, container.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => onContainerSelect?.(container),
        popupopen: () => onContainerSelect?.(container),
      }}
    >
      <Popup>
        <div className="flex min-w-[220px] flex-col gap-2 p-1 text-slate-800">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">Conteneur</p>
            <p className="m-0 font-mono text-sm font-bold text-slate-900">{displaySerial}</p>
            {container.containerType ? (
              <p className="m-0 mt-0.5 text-xs text-slate-600">
                Type : {getContainerTypeLabel(container.containerType)}
              </p>
            ) : null}
            {container.zoneName ? (
              <p className="m-0 mt-0.5 text-xs text-slate-600">Secteur : {container.zoneName}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-0.5 text-sm">
            {statusLabel ? (
              <span>
                <span className="font-medium text-slate-600">Statut : </span>
                <span className="font-semibold text-slate-900">{statusLabel}</span>
              </span>
            ) : null}
            <span>
              <span className="font-medium text-slate-600">Remplissage : </span>
              <span className="font-semibold text-slate-900">{container.fillLevelPercent}%</span>
            </span>
            <span>
              <span className="font-medium text-slate-600">Dernière mesure : </span>
              <span className="text-slate-900">{lastMeasuredLabel}</span>
            </span>
          </div>
          {(showReport || showRoute) && (
            <div className="mt-1 flex flex-wrap gap-2 border-t border-slate-200 pt-2">
              {showReport && (
                <button
                  type="button"
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                  onClick={() => onReportIssue?.(container.id)}
                >
                  Signaler un problème
                </button>
              )}
              {showRoute && (
                <button
                  type="button"
                  className="rounded-md border border-sky-600 bg-white px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-50"
                  onClick={() => onCreateRoute?.(container.id)}
                >
                  Créer une tournée
                </button>
              )}
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
