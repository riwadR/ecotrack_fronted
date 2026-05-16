"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { isAxiosError } from "axios";
import type { TourResponseDTO } from "@/models/tour";
import type { User } from "@/models/user";
import { datetimeLocalToIso, isoToDatetimeLocal } from "@/lib/challenges/challengeUtils";
import { TOUR_AGENT_SCHEDULE_CONFLICT_MESSAGE } from "@/lib/tours/tourFormConstants";
import {
  APP_FORM_CONTROL_CLASS,
  APP_FORM_LABEL_CLASS,
  APP_MODAL_BODY_CLASS,
  APP_MODAL_FOOTER_CLASS,
  APP_MODAL_HEADER_CLASS,
  APP_MODAL_PANEL_CLASS,
  APP_MODAL_SUBTITLE_CLASS,
  APP_MODAL_TITLE_CLASS,
  appModalBackdrop,
} from "@/lib/ui/appChrome";
import { updateTour } from "@/services/api/tourApi";
import { getActiveAgents } from "@/services/api/usersClient";

export type TourEditModalProps = {
  tour: TourResponseDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tour: TourResponseDTO) => void;
  onError?: (message: string) => void;
};

const FIELD_CONTROL_CLASS = `${APP_FORM_CONTROL_CLASS} h-11 min-h-11 py-2.5`;

export default function TourEditModal({
  tour,
  isOpen,
  onClose,
  onSuccess,
  onError,
}: TourEditModalProps) {
  const formId = useId();
  const titleId = `${formId}-title`;
  const startFieldId = `${formId}-start`;
  const endFieldId = `${formId}-end`;

  const [agents, setAgents] = useState<User[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !tour) {
      return;
    }

    setStartTime(isoToDatetimeLocal(tour.startTime));
    setEndTime(isoToDatetimeLocal(tour.endTime));
    setSelectedAgentIds(new Set(tour.agents.map((a) => a.id)));
    setValidationError(null);

    let cancelled = false;
    async function loadAgents() {
      setLoadingOptions(true);
      try {
        const list = await getActiveAgents();
        if (!cancelled) {
          setAgents(list);
        }
      } catch {
        if (!cancelled) {
          setAgents([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    }
    void loadAgents();
    return () => {
      cancelled = true;
    };
  }, [isOpen, tour]);

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tour) {
      return;
    }
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

    setIsSubmitting(true);
    try {
      const updated = await updateTour(tour.id, {
        startTime: startIso,
        endTime: endIso,
        agentIds: Array.from(selectedAgentIds),
      });
      onSuccess(updated);
      onClose();
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        const message = TOUR_AGENT_SCHEDULE_CONFLICT_MESSAGE;
        onError?.(message);
        setValidationError(message);
        return;
      }
      const message =
        error instanceof Error ? error.message : "Impossible de mettre à jour la tournée.";
      onError?.(message);
      setValidationError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !tour) {
    return null;
  }

  return (
    <div
      className={appModalBackdrop("z-[1100]")}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
    >
      <form
        className={APP_MODAL_PANEL_CLASS}
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={APP_MODAL_HEADER_CLASS}>
          <h2 id={titleId} className={APP_MODAL_TITLE_CLASS}>
            Modifier la tournée
          </h2>
          <p className={APP_MODAL_SUBTITLE_CLASS}>Créneau et agents — {tour.zone.name}</p>
        </header>

        <div className={`${APP_MODAL_BODY_CLASS} flex flex-col gap-4`}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label htmlFor={startFieldId} className={APP_FORM_LABEL_CLASS}>
              Début
              <input
                id={startFieldId}
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={FIELD_CONTROL_CLASS}
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </label>
          </div>

          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="mb-2 text-sm font-medium text-slate-700">Agents assignés</legend>
            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white">
              {loadingOptions ? (
                <p className="m-0 px-3 py-3 text-sm text-slate-500">Chargement…</p>
              ) : (
                <ul className="m-0 list-none divide-y divide-slate-100 p-0">
                  {agents.map((agent) => {
                    const inputId = `${formId}-agent-${agent.id}`;
                    return (
                      <li key={agent.id}>
                        <label
                          htmlFor={inputId}
                          className="flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50"
                        >
                          <input
                            id={inputId}
                            type="checkbox"
                            checked={selectedAgentIds.has(agent.id)}
                            onChange={() => toggleAgent(agent.id)}
                            disabled={isSubmitting}
                            className="h-5 w-5 rounded border-slate-300 text-emerald-600"
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
        </div>

        <footer className={`${APP_MODAL_FOOTER_CLASS} gap-3`}>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loadingOptions}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 sm:flex-none sm:px-6"
          >
            {isSubmitting ? "Enregistrement…" : "Enregistrer"}
          </button>
        </footer>
      </form>
    </div>
  );
}
