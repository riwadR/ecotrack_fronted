"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { isAxiosError } from "axios";
import type { ContainerType } from "@/models/container";
import type { TourCreateRequestDTO, TourResponseDTO } from "@/models/tour";
import type { User } from "@/models/user";
import type { Zone } from "@/models/zone";
import { datetimeLocalToIso } from "@/lib/challenges/challengeUtils";
import {
  CONTAINER_TYPE_FORM_OPTIONS,
  CONTAINER_TYPE_VALUES,
} from "@/lib/containers/containerTypeLabels";
import { TOUR_AGENT_SCHEDULE_CONFLICT_MESSAGE } from "@/lib/tours/tourFormConstants";
import {
  fillLevelAccentColor,
  fillLevelTrackStyle,
} from "@/lib/tours/tourDisplay";
import type { SelectedTourContainer, TourPlanningMode } from "@/lib/tours/tourPlanningConstants";
import {
  APP_FORM_CONTROL_CLASS,
  APP_FORM_LABEL_CLASS,
  SECTION_TITLE_CLASS,
} from "@/lib/ui/appChrome";
import { generateOptimizedTour } from "@/services/api/tourApi";
import { getZones } from "@/services/api/zones";
import { getActiveAgents } from "@/services/api/usersClient";

export type TourBuilderPanelProps = {
  mode: TourPlanningMode;
  onModeChange: (mode: TourPlanningMode) => void;
  selectedContainers: SelectedTourContainer[];
  onRemoveSelected: (containerId: string) => void;
  onSuccess: (tour: TourResponseDTO) => void;
  onError?: (message: string) => void;
};

const FIELD_CONTROL_CLASS = `${APP_FORM_CONTROL_CLASS} h-11 min-h-11 py-2.5`;

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

function modeTabClass(active: boolean) {
  return active
    ? "min-h-11 flex-1 rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white"
    : "min-h-11 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50";
}

export default function TourBuilderPanel({
  mode,
  onModeChange,
  selectedContainers,
  onRemoveSelected,
  onSuccess,
  onError,
}: TourBuilderPanelProps) {
  const formId = useId();
  const zoneFieldId = `${formId}-zone`;
  const startFieldId = `${formId}-start`;
  const endFieldId = `${formId}-end`;
  const fillFieldId = `${formId}-fill`;

  const [zones, setZones] = useState<Zone[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [zoneId, setZoneId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());
  const [minFillLevel, setMinFillLevel] = useState(70);
  const [containerTypes, setContainerTypes] = useState<ContainerTypeSelection>(
    buildDefaultContainerTypes
  );

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const toggleContainerType = useCallback((type: ContainerType) => {
    setContainerTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  }, []);

  const resolveManualZoneId = (): string | null => {
    if (selectedContainers.length === 0) {
      return null;
    }
    const zoneIds = new Set(
      selectedContainers.map((c) => c.zoneId).filter((id): id is string => Boolean(id))
    );
    if (zoneIds.size !== 1) {
      return null;
    }
    return Array.from(zoneIds)[0];
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setValidationError(null);

    if (!startTime || !endTime) {
      setValidationError("Les dates et heures de début et de fin sont obligatoires.");
      return;
    }

    const startIso = datetimeLocalToIso(startTime);
    const endIso = datetimeLocalToIso(endTime);
    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      setValidationError("L'heure de fin doit être postérieure à l'heure de début.");
      return;
    }

    if (selectedAgentIds.size === 0) {
      setValidationError("Sélectionnez au moins un agent de collecte.");
      return;
    }

    let payload: TourCreateRequestDTO;

    if (mode === "manual") {
      if (selectedContainers.length === 0) {
        setValidationError("Sélectionnez au moins un conteneur sur la carte.");
        return;
      }
      const manualZoneId = resolveManualZoneId();
      if (!manualZoneId) {
        setValidationError(
          "Tous les conteneurs sélectionnés doivent appartenir à la même zone."
        );
        return;
      }
      payload = {
        zoneId: manualZoneId,
        startTime: startIso,
        endTime: endIso,
        agentIds: Array.from(selectedAgentIds),
        minFillLevel: 0,
        explicitContainerIds: selectedContainers.map((c) => c.id),
      };
    } else {
      if (!zoneId) {
        setValidationError("Veuillez sélectionner une zone.");
        return;
      }
      const selectedTypes = CONTAINER_TYPE_VALUES.filter((type) => containerTypes[type]);
      if (selectedTypes.length === 0) {
        setValidationError("Sélectionnez au moins un type de conteneur.");
        return;
      }
      payload = {
        zoneId,
        startTime: startIso,
        endTime: endIso,
        agentIds: Array.from(selectedAgentIds),
        minFillLevel,
        containerTypes:
          selectedTypes.length === CONTAINER_TYPE_VALUES.length ? undefined : selectedTypes,
      };
    }

    setIsSubmitting(true);
    try {
      const created = await generateOptimizedTour(payload);
      onSuccess(created);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        onError?.(TOUR_AGENT_SCHEDULE_CONFLICT_MESSAGE);
        setValidationError(TOUR_AGENT_SCHEDULE_CONFLICT_MESSAGE);
        return;
      }
      const message =
        error instanceof Error ? error.message : "Impossible d'optimiser l'itinéraire.";
      onError?.(message);
      setValidationError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-col gap-4" noValidate>
      <div className="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          className={modeTabClass(mode === "automatic")}
          onClick={() => onModeChange("automatic")}
        >
          Mode automatique
        </button>
        <button
          type="button"
          className={modeTabClass(mode === "manual")}
          onClick={() => onModeChange("manual")}
        >
          Mode manuel
        </button>
      </div>

      {optionsError ? (
        <p
          className="m-0 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
          role="alert"
        >
          {optionsError}
        </p>
      ) : null}

      {mode === "automatic" ? (
        <>
          <label htmlFor={zoneFieldId} className={APP_FORM_LABEL_CLASS}>
            Zone
            <select
              id={zoneFieldId}
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className={FIELD_CONTROL_CLASS}
              disabled={loadingOptions || isSubmitting || zones.length === 0}
            >
              <option value="">Sélectionner une zone</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <p className={`m-0 ${SECTION_TITLE_CLASS} text-sm`}>Filtres de conteneurs</p>

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
                className="mt-2 h-11 min-h-11 w-full cursor-pointer appearance-none rounded-lg"
                style={fillLevelTrackStyle(minFillLevel)}
                disabled={isSubmitting}
              />
            </label>

            <fieldset className="m-0 min-w-0 border-0 p-0">
              <legend className="mb-2 text-sm font-medium text-slate-700">
                Types de conteneurs
              </legend>
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
        </>
      ) : (
        <section className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className={`m-0 ${SECTION_TITLE_CLASS} text-sm`}>Conteneurs sélectionnés</p>
          <p className="m-0 mt-1 text-sm font-semibold text-emerald-700">
            {selectedContainers.length} conteneur{selectedContainers.length > 1 ? "s" : ""}{" "}
            sélectionné{selectedContainers.length > 1 ? "s" : ""}
          </p>
          {selectedContainers.length === 0 ? (
            <p className="m-0 mt-3 text-sm text-slate-500">
              Cliquez sur les marqueurs de la carte pour constituer votre tournée.
            </p>
          ) : (
            <ul className="m-0 mt-3 max-h-40 list-none divide-y divide-slate-200 overflow-y-auto rounded-lg border border-slate-200 bg-white p-0">
              {selectedContainers.map((container) => (
                <li
                  key={container.id}
                  className="flex min-h-11 items-center justify-between gap-2 px-3 py-2 text-sm"
                >
                  <span className="font-mono font-medium text-slate-900">
                    {container.serialNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveSelected(container.id)}
                    className="min-h-11 shrink-0 rounded-lg px-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Retirer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

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

      <button
        type="submit"
        disabled={loadingOptions || isSubmitting || Boolean(optionsError)}
        className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Optimisation en cours…" : "Optimiser l'itinéraire"}
      </button>
    </form>
  );
}
