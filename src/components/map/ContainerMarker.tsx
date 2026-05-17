"use client";

import { useMemo } from "react";
import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import type { Container } from "@/models/map";
import type { Role } from "@/models/user";
import { getContainerTypeLabel } from "@/lib/containers/containerTypeLabels";
import { formatSensorTimestampFr } from "@/lib/datetime/sensorTimestamp";
import { parseBackendContainerStatus } from "@/lib/containers/backendContainerStatus";
import { MARKER_COLOR_BY_STATUS } from "@/lib/containers/containerOperationalStatus";
import { getFillLevelCategory } from "@/lib/map/fillLevelCategory";
import { useBelowLgViewport } from "@/hooks/useBelowLgViewport";
import { canShowCreateRouteAction } from "@/lib/map/mapActionPermissions";

const FILL_COLOR_BY_CATEGORY = {
  low: "#22c55e",
  moderate: "#f97316",
  high: "#ef4444",
} as const;

const OPERATIONAL_STATUS_LABELS: Record<string, string> = {
  OK: "OK",
  WARNING: "Alerte",
  CRITICAL: "Critique",
  MAINTENANCE: "Maintenance",
};

function resolveMarkerColor(
  fillLevelPercent: number,
  operationalStatus?: string | null
): string {
  if (operationalStatus) {
    const status = parseBackendContainerStatus(operationalStatus);
    return MARKER_COLOR_BY_STATUS[status];
  }
  const category = getFillLevelCategory(fillLevelPercent);
  return FILL_COLOR_BY_CATEGORY[category];
}

function buildMarkerIcon(
  fillLevelPercent: number,
  isSelected: boolean,
  operationalStatus?: string | null
): L.DivIcon {
  const color = resolveMarkerColor(fillLevelPercent, operationalStatus);
  const sizePx = isSelected ? 22 : 18;
  const borderPx = 2;
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
      border:${borderPx}px solid #ffffff;
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
  const belowLg = useBelowLgViewport();
  const icon = useMemo(
    () =>
      buildMarkerIcon(
        container.fillLevelPercent,
        isSelected,
        container.operationalStatus
      ),
    [container.fillLevelPercent, container.operationalStatus, isSelected]
  );

  const lastMeasuredLabel = formatSensorTimestampFr(container.lastMeasurementAt, {
    dateStyle: "short",
    timeStyle: "short",
  });

  const displaySerial = container.serialNumber ?? container.id;
  const statusLabel = container.operationalStatus
    ? OPERATIONAL_STATUS_LABELS[container.operationalStatus] ?? container.operationalStatus
    : null;

  const showReport = Boolean(onReportIssue);
  const showRoute = Boolean(onCreateRoute) && canShowCreateRouteAction(viewerRole);

  return (
    <Marker
      key={`${container.id}-${container.fillLevelPercent}-${isSelected ? "sel" : "norm"}`}
      position={[container.latitude, container.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => onContainerSelect?.(container),
        popupopen: () => onContainerSelect?.(container),
      }}
    >
      <Popup maxWidth={belowLg ? 280 : 400}>
        <div className="flex min-w-0 max-w-full flex-col gap-1.5 px-0.5 py-0.5 text-slate-800 sm:gap-2 sm:px-1 sm:py-1">
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
            <div className="mt-1 flex flex-col gap-2 border-t border-slate-200 pt-2 sm:flex-row sm:flex-wrap">
              {showReport && (
                <button
                  type="button"
                  className="min-h-[44px] w-full shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto sm:min-h-0 sm:rounded-md sm:py-2 sm:text-xs"
                  onClick={() => onReportIssue?.(container.id)}
                >
                  Signaler un problème
                </button>
              )}
              {showRoute && (
                <button
                  type="button"
                  className="min-h-[44px] w-full shrink-0 rounded-lg border border-sky-600 bg-white px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 sm:w-auto sm:min-h-0 sm:rounded-md sm:py-2 sm:text-xs"
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
