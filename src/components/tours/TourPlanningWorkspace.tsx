"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ContainerType } from "@/models/container";
import type { Container } from "@/models/map";
import type { TourResponseDTO } from "@/models/tour";
import { CONTAINER_TYPE_VALUES } from "@/lib/containers/containerTypeLabels";
import { TOUR_EMBEDDED_PANEL_CLASS } from "@/lib/tours/tourEmbeddedShell";
import type { SelectedTourContainer } from "@/lib/tours/tourPlanningConstants";
import { useTourPlanningMapData } from "@/hooks/useTourPlanningMapData";
import TourBuilderPanel from "@/components/tours/TourBuilderPanel";
import { APP_MODAL_TITLE_CLASS } from "@/lib/ui/appChrome";
import { getTourById } from "@/services/api/tourApi";

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
  editingTour?: TourResponseDTO | null;
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

function stepsToSelectedContainers(
  tour: TourResponseDTO,
  mapContainers: Container[]
): SelectedTourContainer[] {
  const containerById = new Map(mapContainers.map((container) => [container.id, container]));

  return tour.steps.map((step) => {
    const mapRow = containerById.get(step.containerId);
    return {
      id: step.containerId,
      serialNumber: step.serialNumber,
      zoneId: mapRow?.zoneId,
      zoneName: mapRow?.zoneName,
    };
  });
}

function orderMapSelection(
  selected: SelectedTourContainer[],
  orderedIds: string[]
): SelectedTourContainer[] {
  const byId = new Map(selected.map((container) => [container.id, container]));
  return orderedIds
    .map((id) => byId.get(id))
    .filter((container): container is SelectedTourContainer => container != null);
}

export default function TourPlanningWorkspace({
  isOpen,
  editingTour = null,
  onClose,
  onSuccess,
  onError,
}: TourPlanningWorkspaceProps) {
  const isEditMode = editingTour != null;
  const [visibleTypes, setVisibleTypes] = useState(buildDefaultVisibleTypes);
  const [selectedContainers, setSelectedContainers] = useState<SelectedTourContainer[]>([]);
  const [loadedEditingTour, setLoadedEditingTour] = useState<TourResponseDTO | null>(
    editingTour
  );
  const [loadingEditTour, setLoadingEditTour] = useState(false);

  const { containers, zones, isLoading, error } = useTourPlanningMapData(isOpen);

  useEffect(() => {
    if (!isOpen) {
      setSelectedContainers([]);
      setLoadedEditingTour(null);
      return;
    }

    if (!editingTour) {
      setLoadedEditingTour(null);
      setSelectedContainers([]);
      return;
    }

    let cancelled = false;
    setLoadingEditTour(true);

    void (async () => {
      try {
        const fullTour =
          editingTour.steps.length > 0 ? editingTour : await getTourById(editingTour.id);
        if (cancelled) {
          return;
        }
        setLoadedEditingTour(fullTour);
        setSelectedContainers(
          fullTour.steps.length > 0
            ? stepsToSelectedContainers(fullTour, containers)
            : []
        );
        if (fullTour.containerTypes.length > 0) {
          setVisibleTypes(
            CONTAINER_TYPE_VALUES.reduce(
              (acc, type) => {
                acc[type] = fullTour.containerTypes.includes(type);
                return acc;
              },
              {} as Record<ContainerType, boolean>
            )
          );
        }
      } catch (loadError) {
        if (!cancelled) {
          onError?.(
            loadError instanceof Error
              ? loadError.message
              : "Impossible de charger la tournée à modifier."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingEditTour(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [containers, editingTour, isOpen, onError]);

  const selectedContainerIds = useMemo(
    () => new Set(selectedContainers.map((container) => container.id)),
    [selectedContainers]
  );

  useEffect(() => {
    if (!loadedEditingTour || loadedEditingTour.steps.length === 0 || containers.length === 0) {
      return;
    }
    setSelectedContainers(stepsToSelectedContainers(loadedEditingTour, containers));
  }, [containers, loadedEditingTour]);

  const handleToggleType = useCallback((type: ContainerType) => {
    setVisibleTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  }, []);

  const handleToggleContainer = useCallback((container: Container) => {
    setSelectedContainers((prev) => {
      const exists = prev.some((item) => item.id === container.id);
      if (exists) {
        return prev.filter((item) => item.id !== container.id);
      }
      return [
        ...prev,
        {
          id: container.id,
          serialNumber: container.serialNumber ?? container.id,
          zoneId: container.zoneId,
          zoneName: container.zoneName,
        },
      ];
    });
  }, []);

  const handleDeselectContainer = useCallback((containerId: string) => {
    setSelectedContainers((prev) => prev.filter((item) => item.id !== containerId));
  }, []);

  const handleRouteOrderSync = useCallback((orderedContainerIds: string[]) => {
    setSelectedContainers((prev) => orderMapSelection(prev, orderedContainerIds));
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

  const title = isEditMode ? "Modifier la tournée" : "Planifier une tournée";
  const subtitle = isEditMode
    ? "Ajustez les zones, le créneau, les agents et l'itinéraire."
    : "Affinez les critères, cliquez sur la carte ou combinez les deux pour constituer la tournée.";

  return (
    <div className={TOUR_EMBEDDED_PANEL_CLASS}>
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <h2 className={APP_MODAL_TITLE_CLASS}>{title}</h2>
          <p className="m-0 text-sm text-slate-500">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Retour à la liste
        </button>
      </header>

      {loadingEditTour ? (
        <p className="m-0 px-4 py-8 text-sm text-slate-500 sm:px-6">
          Chargement de la tournée…
        </p>
      ) : (
        <div className="flex min-h-[min(70vh,40rem)] flex-1 flex-col overflow-hidden lg:min-h-[32rem] lg:flex-row">
          <section className="flex w-full shrink-0 flex-col border-b border-slate-200 lg:min-h-0 lg:flex-1 lg:border-b-0 lg:border-r">
            <div className="relative z-0 flex w-full shrink-0 flex-col p-4 sm:p-5 lg:h-full lg:min-h-0 lg:flex-1">
              <TourPlanningMap
                containers={containers}
                zones={zones}
                visibleTypes={visibleTypes}
                onToggleType={handleToggleType}
                selectionEnabled
                selectedContainerIds={selectedContainerIds}
                onToggleContainer={handleToggleContainer}
                isLoading={isLoading}
                loadError={error}
              />
            </div>
          </section>

          <aside className="relative z-10 flex min-h-0 w-full flex-1 flex-col bg-white lg:max-h-none lg:w-[400px] lg:shrink-0 lg:flex-none xl:w-[450px]">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5">
              <TourBuilderPanel
                selectedContainers={selectedContainers}
                mapContainers={containers}
                onDeselectContainer={handleDeselectContainer}
                onRouteOrderSync={handleRouteOrderSync}
                editingTour={loadedEditingTour}
                onSuccess={handleSuccess}
                onError={onError}
              />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
