"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { isAxiosError } from "axios";
import type { ContainerType } from "@/models/container";
import type { TourCreateRequestDTO, TourResponseDTO } from "@/models/tour";
import type { User } from "@/models/user";
import type { Zone } from "@/models/zone";
import { datetimeLocalToIso } from "@/lib/challenges/challengeUtils";
import { CONTAINER_TYPE_FORM_OPTIONS, CONTAINER_TYPE_VALUES } from "@/lib/containers/containerTypeLabels";
import { TOUR_AGENT_SCHEDULE_CONFLICT_MESSAGE } from "@/lib/tours/tourFormConstants";
import {
  fillLevelAccentColor,
  fillLevelTrackStyle,
} from "@/lib/tours/tourDisplay";
import {
  APP_FORM_CONTROL_CLASS,
  APP_FORM_LABEL_CLASS,
  SECTION_DESCRIPTION_CLASS,
  SECTION_TITLE_CLASS,
} from "@/lib/ui/appChrome";
import { generateOptimizedTour } from "@/services/api/tourApi";
import { getZones } from "@/services/api/zones";
import { getActiveAgents } from "@/services/api/usersClient";

export type TourCreateFormProps = {
  onSuccess: (tour: TourResponseDTO) => void;
  onError?: (message: string) => void;
  className?: string;
  /** When false, hides the in-form title block (e.g. drawer provides its own header). */
  showIntro?: boolean;
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

export default function TourCreateForm({
  onSuccess,
  onError,
  className = "",
  showIntro = true,
}: TourCreateFormProps) {
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setValidationError(null);

    if (!zoneId) {
      setValidationError("Veuillez sélectionner une zone.");
      return;
    }
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

    const selectedTypes = CONTAINER_TYPE_VALUES.filter((type) => containerTypes[type]);
    if (selectedTypes.length === 0) {
      setValidationError("Sélectionnez au moins un type de conteneur.");
      return;
    }

    const payload: TourCreateRequestDTO = {
      zoneId,
      startTime: startIso,
      endTime: endIso,
      agentIds: Array.from(selectedAgentIds),
      minFillLevel,
      containerTypes:
        selectedTypes.length === CONTAINER_TYPE_VALUES.length
          ? undefined
          : selectedTypes,
    };

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
        error instanceof Error
          ? error.message
          : "Impossible de générer la tournée.";
      onError?.(message);
      setValidationError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-4 ${className}`.trim()}
      noValidate
    >
      {showIntro ? (
        <div>
          <h2 className={SECTION_TITLE_CLASS}>Planifier une tournée</h2>
          <p className={SECTION_DESCRIPTION_CLASS}>
            Définissez le créneau, les agents et les critères de sélection des conteneurs.
          </p>
        </div>
      ) : null}

      {optionsError ? (
        <p
          className="m-0 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
          role="alert"
        >
          {optionsError}
        </p>
      ) : null}

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

      <div className="grid gap-4 sm:grid-cols-2">
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
        <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white">
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
                      {(agent.firstName || agent.lastName) && (
                        <span className="truncate text-slate-500">
                          {[agent.firstName, agent.lastName].filter(Boolean).join(" ")}
                        </span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </fieldset>

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
            className="mt-2 h-11 min-h-11 w-full cursor-pointer rounded-lg appearance-none"
            style={fillLevelTrackStyle(minFillLevel)}
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

      {validationError ? (
        <p className="m-0 text-sm font-medium text-red-600" role="alert">
          {validationError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loadingOptions || isSubmitting || Boolean(optionsError)}
        className="inline-flex h-11 min-h-11 w-full items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[16rem]"
      >
        {isSubmitting ? "Génération en cours…" : "Générer la tournée optimisée"}
      </button>
    </form>
  );
}
