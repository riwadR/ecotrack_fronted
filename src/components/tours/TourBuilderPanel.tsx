"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { ContainerType } from "@/models/container";
import type { Container } from "@/models/map";
import type { TourCreateRequestDTO, TourResponseDTO, TourUpdateRequestDTO } from "@/models/tour";
import type { User } from "@/models/user";
import type { Zone } from "@/models/zone";
import { datetimeLocalToIso, isoToDatetimeLocal } from "@/lib/challenges/challengeUtils";
import {
  CONTAINER_TYPE_FORM_OPTIONS,
  CONTAINER_TYPE_VALUES,
} from "@/lib/containers/containerTypeLabels";
import { resolveTourSubmitErrorMessage } from "@/lib/tours/tourSubmitErrors";
import { fillLevelAccentColor } from "@/lib/tours/tourDisplay";
import TourOptimizationConfirmModal from "@/components/tours/TourOptimizationConfirmModal";
import type { SelectedTourContainer } from "@/lib/tours/tourPlanningConstants";
import {
  buildPreviewItemsFromOrderedIds,
  filterAutoPreviewContainers,
  groupTargetedContainersPreservingOrder,
  moveOrderedContainerIds,
  orderedIdsMatchFilterPreview,
} from "@/lib/tours/tourTargetedContainersPreview";
import TourTargetedContainersPreview from "@/components/tours/TourTargetedContainersPreview";
import {
  APP_FORM_CONTROL_CLASS,
  APP_FORM_LABEL_CLASS,
} from "@/lib/ui/appChrome";
import { generateOptimizedTour, updateTour } from "@/services/api/tourApi";
import { getZones } from "@/services/api/zones";
import { getActiveAgents } from "@/services/api/usersClient";

export type TourBuilderPanelProps = {
  selectedContainers: SelectedTourContainer[];
  mapContainers: Container[];
  onDeselectContainer: (containerId: string) => void;
  onRouteOrderSync: (orderedContainerIds: string[]) => void;
  editingTour?: TourResponseDTO | null;
  onSuccess: (tour: TourResponseDTO) => void;
  onError?: (message: string) => void;
};

const FIELD_CONTROL_CLASS = `${APP_FORM_CONTROL_CLASS} h-11 min-h-11 py-2.5`;

type EditOptimizationChoice = "preserve" | "reoptimize";
type ContainerTypeSelection = Record<ContainerType, boolean>;

function buildDefaultContainerTypes(): ContainerTypeSelection {
  return CONTAINER_TYPE_VALUES.reduce(
    (acc, type) => {
      acc[type] = true;
      return acc;
    },
    {} as ContainerTypeSelection
  );
}

function buildContainerTypesFromTour(tour: TourResponseDTO): ContainerTypeSelection {
  const defaults = buildDefaultContainerTypes();
  if (!tour.containerTypes.length) {
    return defaults;
  }
  return CONTAINER_TYPE_VALUES.reduce(
    (acc, type) => {
      acc[type] = tour.containerTypes.includes(type);
      return acc;
    },
    {} as ContainerTypeSelection
  );
}

function mergeOrderedIdsWithSource(
  currentOrdered: string[],
  sourceIds: string[]
): string[] {
  const sourceSet = new Set(sourceIds);
  const kept = currentOrdered.filter((id) => sourceSet.has(id));
  const keptSet = new Set(kept);
  const appended = sourceIds.filter((id) => !keptSet.has(id));
  return [...kept, ...appended];
}

export default function TourBuilderPanel({
  selectedContainers,
  mapContainers,
  onDeselectContainer,
  onRouteOrderSync,
  editingTour = null,
  onSuccess,
  onError,
}: TourBuilderPanelProps) {
  const isEditMode = editingTour != null;
  const formId = useId();
  const startFieldId = `${formId}-start`;
  const endFieldId = `${formId}-end`;
  const fillFieldId = `${formId}-fill`;

  const [zones, setZones] = useState<Zone[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [selectedZoneIds, setSelectedZoneIds] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());
  const [minFillLevel, setMinFillLevel] = useState(70);
  const [containerTypes, setContainerTypes] = useState<ContainerTypeSelection>(
    buildDefaultContainerTypes
  );
  const [orderedContainerIds, setOrderedContainerIds] = useState<string[]>([]);
  const [hasManuallyReordered, setHasManuallyReordered] = useState(false);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [optimizationModalOpen, setOptimizationModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      setLoadingOptions(true);
      setOptionsError(null);
      try {
        const [zoneList, agentList] = await Promise.all([getZones(), getActiveAgents()]);
        if (cancelled) {
          return;
        }
        setZones(zoneList);
        setAgents(agentList);
        if (agentList.length === 0) {
          setOptionsError("Aucun agent de collecte disponible.");
        }
      } catch (error) {
        if (!cancelled) {
          setOptionsError(
            error instanceof Error
              ? error.message
              : "Impossible de charger les données du formulaire."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    }

    void loadOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!editingTour) {
      return;
    }
    setStartTime(isoToDatetimeLocal(editingTour.startTime));
    setEndTime(isoToDatetimeLocal(editingTour.endTime));
    setSelectedAgentIds(new Set(editingTour.agents.map((agent) => agent.id)));
    setSelectedZoneIds(new Set(editingTour.zones.map((zone) => zone.id)));
    setContainerTypes(buildContainerTypesFromTour(editingTour));
    setValidationError(null);
    if (editingTour.steps.length > 0) {
      setOrderedContainerIds(editingTour.steps.map((step) => step.containerId));
      setHasManuallyReordered(false);
    }
  }, [editingTour]);

  const toggleAgent = useCallback((agentId: string) => {
    setSelectedAgentIds((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  }, []);

  const toggleZone = useCallback((zoneId: string) => {
    setSelectedZoneIds((prev) => {
      const next = new Set(prev);
      if (next.has(zoneId)) {
        next.delete(zoneId);
      } else {
        next.add(zoneId);
      }
      return next;
    });
  }, []);

  const toggleContainerType = useCallback((type: ContainerType) => {
    setContainerTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  }, []);

  const resolveSelectedZoneIdList = (): string[] => Array.from(selectedZoneIds);

  const selectedTypes = useMemo(
    () => CONTAINER_TYPE_VALUES.filter((type) => containerTypes[type]),
    [containerTypes]
  );

  const useMapSelection = selectedContainers.length > 0;

  const filterPreviewItems = useMemo(
    () =>
      filterAutoPreviewContainers(
        mapContainers,
        selectedZoneIds,
        minFillLevel,
        selectedTypes
      ),
    [mapContainers, minFillLevel, selectedTypes, selectedZoneIds]
  );

  const zoneNameById = useMemo(
    () => new Map(zones.map((zone) => [zone.id, zone.name])),
    [zones]
  );

  useEffect(() => {
    if (useMapSelection) {
      const mapIds = selectedContainers.map((container) => container.id);
      if (hasManuallyReordered) {
        setOrderedContainerIds((prev) => mergeOrderedIdsWithSource(prev, mapIds));
        return;
      }
      setOrderedContainerIds(mapIds);
      return;
    }

    const filterIds = filterPreviewItems.map((item) => item.id);
    if (hasManuallyReordered) {
      setOrderedContainerIds((prev) => mergeOrderedIdsWithSource(prev, filterIds));
      return;
    }
    setOrderedContainerIds(filterIds);
  }, [filterPreviewItems, hasManuallyReordered, selectedContainers, useMapSelection]);

  const routePreviewItems = useMemo(
    () => buildPreviewItemsFromOrderedIds(orderedContainerIds, mapContainers, zoneNameById),
    [mapContainers, orderedContainerIds, zoneNameById]
  );

  const previewGroups = useMemo(
    () => groupTargetedContainersPreservingOrder(routePreviewItems),
    [routePreviewItems]
  );

  const handleMoveUp = useCallback(
    (containerId: string) => {
      setHasManuallyReordered(true);
      setOrderedContainerIds((prev) => {
        const next = moveOrderedContainerIds(prev, containerId, "up");
        if (useMapSelection) {
          onRouteOrderSync(next);
        }
        return next;
      });
    },
    [onRouteOrderSync, useMapSelection]
  );

  const handleMoveDown = useCallback(
    (containerId: string) => {
      setHasManuallyReordered(true);
      setOrderedContainerIds((prev) => {
        const next = moveOrderedContainerIds(prev, containerId, "down");
        if (useMapSelection) {
          onRouteOrderSync(next);
        }
        return next;
      });
    },
    [onRouteOrderSync, useMapSelection]
  );

  const handleRemoveFromRoute = useCallback(
    (containerId: string) => {
      setOrderedContainerIds((prev) => {
        const nextOrdered = prev.filter((id) => id !== containerId);
        if (useMapSelection) {
          onDeselectContainer(containerId);
          onRouteOrderSync(nextOrdered);
        }
        return nextOrdered;
      });
    },
    [onDeselectContainer, onRouteOrderSync, useMapSelection]
  );

  const validateForm = useCallback((): string | null => {
    if (!startTime || !endTime) {
      return "Les dates et heures de début et de fin sont obligatoires.";
    }

    const startIso = datetimeLocalToIso(startTime);
    const endIso = datetimeLocalToIso(endTime);
    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      return "L'heure de fin doit être postérieure à l'heure de début.";
    }

    if (selectedAgentIds.size === 0) {
      return "Sélectionnez au moins un agent de collecte.";
    }

    if (resolveSelectedZoneIdList().length === 0) {
      return "Sélectionnez au moins une zone.";
    }

    if (selectedTypes.length === 0) {
      return "Sélectionnez au moins un type de conteneur.";
    }

    if (useMapSelection) {
      const outOfZone = selectedContainers.some(
        (container) => container.zoneId && !selectedZoneIds.has(container.zoneId)
      );
      if (outOfZone) {
        return "Tous les conteneurs sélectionnés doivent appartenir aux zones choisies.";
      }
    }

    if (orderedContainerIds.length === 0) {
      return "Aucun conteneur ne correspond aux filtres. Ajustez les critères ou sélectionnez des conteneurs sur la carte.";
    }

    return null;
  }, [
    endTime,
    orderedContainerIds.length,
    selectedAgentIds.size,
    selectedContainers,
    selectedTypes.length,
    selectedZoneIds,
    startTime,
    useMapSelection,
  ]);

  const performSubmit = useCallback(
    async (editOptimizationChoice?: EditOptimizationChoice) => {
      const validationMessage = validateForm();
      if (validationMessage) {
        setValidationError(validationMessage);
        return;
      }

      const startIso = datetimeLocalToIso(startTime);
      const endIso = datetimeLocalToIso(endTime);
      const zoneIds = resolveSelectedZoneIdList();
      const normalizedContainerTypes =
        selectedTypes.length === CONTAINER_TYPE_VALUES.length ? undefined : selectedTypes;

      const routeDiffersFromFilter = !orderedIdsMatchFilterPreview(
        orderedContainerIds,
        filterPreviewItems
      );
      const useExplicitRoute =
        useMapSelection || hasManuallyReordered || routeDiffersFromFilter;

      setIsSubmitting(true);
      try {
        if (isEditMode && editingTour) {
          let skipOptimization: boolean;
          let explicitContainerIds: string[];

          if (hasManuallyReordered || editOptimizationChoice === "preserve") {
            skipOptimization = true;
            explicitContainerIds = orderedContainerIds;
          } else {
            skipOptimization = false;
            explicitContainerIds = useExplicitRoute ? orderedContainerIds : [];
          }

          const updatePayload: TourUpdateRequestDTO = {
            zoneIds,
            startTime: startIso,
            endTime: endIso,
            agentIds: Array.from(selectedAgentIds),
            minFillLevel,
            containerTypes: normalizedContainerTypes,
            explicitContainerIds,
            skipOptimization,
          };
          const updated = await updateTour(editingTour.id, updatePayload);
          setOptimizationModalOpen(false);
          onSuccess(updated);
          return;
        }

        const createPayload: TourCreateRequestDTO = {
          zoneIds,
          startTime: startIso,
          endTime: endIso,
          agentIds: Array.from(selectedAgentIds),
          minFillLevel,
          containerTypes: normalizedContainerTypes,
          explicitContainerIds: useExplicitRoute ? orderedContainerIds : undefined,
          skipOptimization: hasManuallyReordered ? true : undefined,
        };
        const created = await generateOptimizedTour(createPayload);
        onSuccess(created);
      } catch (error) {
        onError?.(resolveTourSubmitErrorMessage(error));
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      editingTour,
      endTime,
      filterPreviewItems,
      hasManuallyReordered,
      isEditMode,
      minFillLevel,
      onError,
      onSuccess,
      orderedContainerIds,
      selectedAgentIds,
      selectedTypes,
      startTime,
      useMapSelection,
      validateForm,
    ]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setValidationError(null);

    const validationMessage = validateForm();
    if (validationMessage) {
      setValidationError(validationMessage);
      return;
    }

    if (isEditMode && editingTour && !hasManuallyReordered) {
      setOptimizationModalOpen(true);
      return;
    }

    await performSubmit();
  };

  const handlePreserveOrder = () => {
    void performSubmit("preserve");
  };

  const handleReoptimize = () => {
    void performSubmit("reoptimize");
  };

  const submitLabel = (() => {
    if (isSubmitting) {
      return isEditMode ? "Mise à jour…" : hasManuallyReordered ? "Création…" : "Génération…";
    }
    if (hasManuallyReordered) {
      return isEditMode ? "Mettre à jour avec cet ordre" : "Créer la tournée avec cet ordre";
    }
    return isEditMode ? "Mettre à jour la tournée" : "Générer la tournée optimisée";
  })();

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-col gap-4" noValidate>
      {optionsError ? (
        <p
          className="m-0 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
          role="alert"
        >
          {optionsError}
        </p>
      ) : null}

      <h3 className="m-0 text-lg font-semibold text-slate-900">Sélection des critères</h3>

      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="mb-2 text-sm font-medium text-slate-700">Zones</legend>
        <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-white">
          {loadingOptions ? (
            <p className="m-0 px-3 py-3 text-sm text-slate-500">Chargement des zones…</p>
          ) : zones.length === 0 ? (
            <p className="m-0 px-3 py-3 text-sm text-slate-500">Aucune zone disponible.</p>
          ) : (
            <ul className="m-0 list-none divide-y divide-slate-100 p-0">
              {zones.map((zone) => {
                const inputId = `${formId}-zone-${zone.id}`;
                return (
                  <li key={zone.id}>
                    <label
                      htmlFor={inputId}
                      className="flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
                    >
                      <input
                        id={inputId}
                        type="checkbox"
                        checked={selectedZoneIds.has(zone.id)}
                        onChange={() => toggleZone(zone.id)}
                        disabled={isSubmitting}
                        className="h-5 w-5 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-medium">{zone.name}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <p className="m-0 mt-1 text-xs text-slate-500">Sélectionnez les zones à couvrir.</p>
      </fieldset>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <label htmlFor={fillFieldId} className={APP_FORM_LABEL_CLASS}>
          <span className="flex items-center justify-between gap-2">
            <span>Seuil de remplissage minimal</span>
            <span
              className="tabular-nums font-semibold"
              style={{ color: fillLevelAccentColor(minFillLevel) }}
            >
              {minFillLevel} %
            </span>
          </span>
          <input
            id={fillFieldId}
            type="range"
            min={0}
            max={100}
            step={1}
            value={minFillLevel}
            onChange={(e) => setMinFillLevel(Number(e.target.value))}
            className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600"
            disabled={isSubmitting}
          />
        </label>

        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="mb-2 text-sm font-medium text-slate-700">Types de conteneurs</legend>
          <div className="flex flex-col gap-2">
            {CONTAINER_TYPE_FORM_OPTIONS.map(({ value, label }) => {
              const inputId = `${formId}-type-${value}`;
              return (
                <label
                  key={value}
                  htmlFor={inputId}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                >
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={containerTypes[value]}
                    onChange={() => toggleContainerType(value)}
                    disabled={isSubmitting}
                    className="h-5 w-5 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  {label}
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      <TourTargetedContainersPreview
        groups={previewGroups}
        orderedContainerIds={orderedContainerIds}
        emptyMessage="Ajustez les filtres ou sélectionnez des conteneurs sur la carte."
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onRemove={handleRemoveFromRoute}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <label htmlFor={startFieldId} className={APP_FORM_LABEL_CLASS}>
          Début
          <input
            id={startFieldId}
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={FIELD_CONTROL_CLASS}
            disabled={loadingOptions || isSubmitting}
          />
        </label>
        <label htmlFor={endFieldId} className={APP_FORM_LABEL_CLASS}>
          Fin
          <input
            id={endFieldId}
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={FIELD_CONTROL_CLASS}
            disabled={loadingOptions || isSubmitting}
          />
        </label>
      </div>

      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="mb-2 text-sm font-medium text-slate-700">Agents assignés</legend>
        <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white">
          {loadingOptions ? (
            <p className="m-0 px-3 py-3 text-sm text-slate-500">Chargement des agents…</p>
          ) : agents.length === 0 ? (
            <p className="m-0 px-3 py-3 text-sm text-slate-500">Aucun agent disponible.</p>
          ) : (
            <ul className="m-0 list-none divide-y divide-slate-100 p-0">
              {agents.map((agent) => {
                const checked = selectedAgentIds.has(agent.id);
                const inputId = `${formId}-agent-${agent.id}`;
                return (
                  <li key={agent.id}>
                    <label
                      htmlFor={inputId}
                      className="flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
                    >
                      <input
                        id={inputId}
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAgent(agent.id)}
                        disabled={isSubmitting}
                        className="h-5 w-5 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-medium">{agent.username}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </fieldset>

      {validationError ? (
        <p className="m-0 text-sm font-medium text-red-600" role="alert">
          {validationError}
        </p>
      ) : null}

      {hasManuallyReordered ? (
        <div
          className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950"
          role="status"
        >
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
            strokeWidth={2}
            aria-hidden
          />
          <p className="m-0">
            Ordre modifié manuellement. L&apos;optimisation algorithmique est désactivée.
          </p>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loadingOptions || isSubmitting || Boolean(optionsError)}
        className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitLabel}
      </button>

      <TourOptimizationConfirmModal
        isOpen={optimizationModalOpen}
        isSubmitting={isSubmitting}
        onPreserveOrder={handlePreserveOrder}
        onReoptimize={handleReoptimize}
        onCancel={() => setOptimizationModalOpen(false)}
      />
    </form>
  );
}
