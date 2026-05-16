"use client";

import type { PathOptions } from "leaflet";
import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";
import type { ContainerType } from "@/models/container";
import type { Container, Zone } from "@/models/map";
import InteractiveMap from "@/components/map/InteractiveMap";
import { CONTAINER_TYPE_FORM_OPTIONS } from "@/lib/containers/containerTypeLabels";
import { TOUR_PLANNING_ZONE_PATH_OPTIONS } from "@/lib/tours/tourPlanningConstants";
import { typeFilterPillClass } from "@/lib/tours/tourMapTypeFilters";

const TourPlanningContainerLayer = dynamic(
  () => import("@/components/tours/TourPlanningContainerLayer"),
  { ssr: false }
);

export type TourPlanningMapProps = {
  containers: Container[];
  zones: Zone[];
  visibleTypes: Record<ContainerType, boolean>;
  onToggleType: (type: ContainerType) => void;
  selectionEnabled: boolean;
  selectedContainerIds: Set<string>;
  onToggleContainer: (container: Container) => void;
  isLoading?: boolean;
  loadError?: string | null;
};

/** Map is always mounted; layout does not depend on automatic vs manual mode. */
export default function TourPlanningMap({
  containers,
  zones,
  visibleTypes,
  onToggleType,
  selectionEnabled,
  selectedContainerIds,
  onToggleContainer,
  isLoading = false,
  loadError = null,
}: TourPlanningMapProps) {
  const filteredContainers = useMemo(
    () =>
      containers.filter((container) => {
        const type = container.containerType ?? "GENERAL";
        return visibleTypes[type];
      }),
    [containers, visibleTypes]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 150);
    return () => window.clearTimeout(timer);
  }, [selectionEnabled]);

  return (
    <div className="flex w-full flex-col gap-3 lg:h-full lg:min-h-0">
      <div className="shrink-0 rounded-xl border border-slate-200 bg-slate-50/90 p-3 shadow-sm">
        <p className="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Filtres d&apos;affichage sur la carte :
        </p>
        <div className="flex flex-wrap gap-2">
          {CONTAINER_TYPE_FORM_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onToggleType(value)}
              className={typeFilterPillClass(value, visibleTypes[value])}
              aria-pressed={visibleTypes[value]}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loadError ? (
        <p
          className="m-0 shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {loadError}
        </p>
      ) : null}

      <div className="relative z-0 h-[45vh] min-h-[220px] w-full shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 lg:h-full lg:min-h-0 lg:flex-1">
        {isLoading ? (
          <div className="flex h-full min-h-[220px] items-center justify-center text-sm text-slate-500">
            Chargement de la carte…
          </div>
        ) : (
          <InteractiveMap
            fillContainer
            containers={[]}
            zones={zones}
            viewerRole="MANAGER"
            showLocateMe
            compactLocateMe
            showZones
            zonePathOptions={TOUR_PLANNING_ZONE_PATH_OPTIONS as PathOptions}
            suppressDefaultContainers
            mapOverlay={
              <TourPlanningContainerLayer
                containers={filteredContainers}
                selectionEnabled={selectionEnabled}
                selectedContainerIds={selectedContainerIds}
                onToggleContainer={onToggleContainer}
              />
            }
          />
        )}
      </div>
    </div>
  );
}
