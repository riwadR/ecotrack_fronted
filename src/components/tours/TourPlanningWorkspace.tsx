"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ContainerType } from "@/models/container";
import type { Container } from "@/models/map";
import type { TourResponseDTO } from "@/models/tour";
import { CONTAINER_TYPE_VALUES } from "@/lib/containers/containerTypeLabels";
import type { SelectedTourContainer, TourPlanningMode } from "@/lib/tours/tourPlanningConstants";
import { useTourPlanningMapData } from "@/hooks/useTourPlanningMapData";
import TourBuilderPanel from "@/components/tours/TourBuilderPanel";
import { APP_MODAL_TITLE_CLASS } from "@/lib/ui/appChrome";

const TourPlanningMap = dynamic(() => import("@/components/tours/TourPlanningMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[220px] w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
      Chargement de la carte…
    </div>
  ),
});

export type TourPlanningWorkspaceProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tour: TourResponseDTO) => void;
  onError?: (message: string) => void;
};

function buildDefaultVisibleTypes(): Record<ContainerType, boolean> {
  return CONTAINER_TYPE_VALUES.reduce(
    (acc, type) => {
      acc[type] = true;
      return acc;
    },
    {} as Record<ContainerType, boolean>
  );
}

export default function TourPlanningWorkspace({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: TourPlanningWorkspaceProps) {
  const [mode, setMode] = useState<TourPlanningMode>("automatic");
  const [visibleTypes, setVisibleTypes] = useState(buildDefaultVisibleTypes);
  const [selectedContainers, setSelectedContainers] = useState<SelectedTourContainer[]>([]);

  const { containers, zones, isLoading, error } = useTourPlanningMapData(isOpen);

  const selectedContainerIds = useMemo(
    () => new Set(selectedContainers.map((c) => c.id)),
    [selectedContainers]
  );

  const handleToggleType = useCallback((type: ContainerType) => {
    setVisibleTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  }, []);

  const handleToggleContainer = useCallback((container: Container) => {
    setSelectedContainers((prev) => {
      const exists = prev.some((c) => c.id === container.id);
      if (exists) {
        return prev.filter((c) => c.id !== container.id);
      }
      return [
        ...prev,
        {
          id: container.id,
          serialNumber: container.serialNumber ?? container.id,
          zoneId: container.zoneId,
        },
      ];
    });
  }, []);

  const handleRemoveSelected = useCallback((containerId: string) => {
    setSelectedContainers((prev) => prev.filter((c) => c.id !== containerId));
  }, []);

  const handleSuccess = useCallback(
    (tour: TourResponseDTO) => {
      onSuccess(tour);
      onClose();
    },
    [onClose, onSuccess]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[1100] flex h-full flex-col bg-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-planning-workspace-title"
    >
      <header className="z-20 flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <h2 id="tour-planning-workspace-title" className={APP_MODAL_TITLE_CLASS}>
            Planifier une tournée
          </h2>
          <p className="m-0 text-sm text-slate-500">
            Sélectionnez les conteneurs sur la carte ou appliquez des filtres automatiques.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Fermer
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain lg:flex-row lg:overflow-hidden">
        <section className="flex w-full shrink-0 flex-col border-b border-slate-200 lg:min-h-0 lg:flex-1 lg:border-b-0 lg:border-r">
          <div className="relative z-0 flex w-full shrink-0 flex-col p-4 sm:p-5 lg:h-full lg:min-h-0 lg:flex-1">
            <TourPlanningMap
              containers={containers}
              zones={zones}
              visibleTypes={visibleTypes}
              onToggleType={handleToggleType}
              selectionEnabled={mode === "manual"}
              selectedContainerIds={selectedContainerIds}
              onToggleContainer={handleToggleContainer}
              isLoading={isLoading}
              loadError={error}
            />
          </div>
        </section>

        <aside className="relative z-10 w-full shrink-0 bg-white lg:flex lg:min-h-0 lg:w-[400px] lg:flex-col xl:w-[450px]">
          <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <TourBuilderPanel
              mode={mode}
              onModeChange={setMode}
              selectedContainers={selectedContainers}
              onRemoveSelected={handleRemoveSelected}
              onSuccess={handleSuccess}
              onError={onError}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
