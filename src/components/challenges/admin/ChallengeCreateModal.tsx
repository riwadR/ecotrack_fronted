"use client";

import { useEffect, useId, useState } from "react";
import type { Challenge, ChallengeCreatePayload } from "@/lib/api/challenges";
import type { Zone } from "@/models/zone";
import { datetimeLocalToIso, isoToDatetimeLocal } from "@/lib/challenges/challengeUtils";
import {
  APP_MODAL_BODY_CLASS,
  APP_MODAL_FOOTER_CLASS,
  APP_MODAL_HEADER_CLASS,
  APP_MODAL_PANEL_CLASS,
  APP_MODAL_SUBTITLE_CLASS,
  APP_MODAL_TITLE_CLASS,
  APP_FORM_CONTROL_COMPACT_CLASS,
  APP_FORM_LABEL_COMPACT_CLASS,
  appModalBackdrop,
} from "@/lib/ui/appChrome";

export type ChallengeCreateModalProps = {
  isOpen: boolean;
  zones: Zone[];
  editingChallenge?: Challenge | null;
  isSubmitting?: boolean;
  onConfirm: (payload: ChallengeCreatePayload) => void | Promise<void>;
  onCancel: () => void;
};

const defaultForm = {
  title: "",
  description: "",
  goalThreshold: "50",
  startDate: "",
  endDate: "",
  zoneId: "",
};

export default function ChallengeCreateModal({
  isOpen,
  zones,
  editingChallenge = null,
  isSubmitting = false,
  onConfirm,
  onCancel,
}: ChallengeCreateModalProps) {
  const titleId = useId();
  const isEditMode = editingChallenge !== null;
  const [form, setForm] = useState(defaultForm);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (editingChallenge) {
      setForm({
        title: editingChallenge.title,
        description: editingChallenge.description ?? "",
        goalThreshold: String(editingChallenge.goalThreshold),
        startDate: isoToDatetimeLocal(editingChallenge.startDate),
        endDate: isoToDatetimeLocal(editingChallenge.endDate),
        zoneId: editingChallenge.zone.id,
      });
    } else {
      setForm(defaultForm);
    }
    setValidationError(null);
  }, [isOpen, editingChallenge]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    const title = form.title.trim();
    const goal = Number(form.goalThreshold);

    if (!title) {
      setValidationError("Le titre est obligatoire.");
      return;
    }
    if (!form.zoneId) {
      setValidationError("Veuillez sélectionner une zone.");
      return;
    }
    if (!form.startDate || !form.endDate) {
      setValidationError("Les dates de début et de fin sont obligatoires.");
      return;
    }
    if (Number.isNaN(goal) || goal < 1) {
      setValidationError("L'objectif doit être un nombre supérieur ou égal à 1.");
      return;
    }

    const startIso = datetimeLocalToIso(form.startDate);
    const endIso = datetimeLocalToIso(form.endDate);
    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      setValidationError("La date de fin doit être postérieure à la date de début.");
      return;
    }

    setValidationError(null);
    void onConfirm({
      title,
      description: form.description.trim(),
      goalThreshold: goal,
      startDate: startIso,
      endDate: endIso,
      zoneId: form.zoneId,
    });
  };

  const control = `${APP_FORM_CONTROL_COMPACT_CLASS} bg-white`;

  return (
    <div
      className={appModalBackdrop("z-[1000]")}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={() => {
        if (!isSubmitting) onCancel();
      }}
    >
      <div className={APP_MODAL_PANEL_CLASS} onClick={(e) => e.stopPropagation()}>
        <header className={APP_MODAL_HEADER_CLASS}>
          <h2 id={titleId} className={APP_MODAL_TITLE_CLASS}>
            {isEditMode ? "Modifier le défi" : "Nouveau défi"}
          </h2>
          <p className={APP_MODAL_SUBTITLE_CLASS}>
            {isEditMode
              ? "Mettez à jour l'objectif, la zone ou la période du défi."
              : "Publiez un objectif collectif pour une zone et une période définies."}
          </p>
        </header>

        <div className={`${APP_MODAL_BODY_CLASS} gap-3`}>
          <label className={APP_FORM_LABEL_COMPACT_CLASS}>
            Titre
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className={control}
              disabled={isSubmitting}
            />
          </label>

          <label className={APP_FORM_LABEL_COMPACT_CLASS}>
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={`${control} resize-y`}
              disabled={isSubmitting}
            />
          </label>

          <label className={APP_FORM_LABEL_COMPACT_CLASS}>
            Objectif (signalements)
            <input
              type="number"
              min={1}
              value={form.goalThreshold}
              onChange={(e) => setForm((prev) => ({ ...prev, goalThreshold: e.target.value }))}
              className={control}
              disabled={isSubmitting}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className={APP_FORM_LABEL_COMPACT_CLASS}>
              Date de début
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                className={control}
                disabled={isSubmitting}
              />
            </label>
            <label className={APP_FORM_LABEL_COMPACT_CLASS}>
              Date de fin
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                className={control}
                disabled={isSubmitting}
              />
            </label>
          </div>

          <label className={APP_FORM_LABEL_COMPACT_CLASS}>
            Zone ciblée
            <select
              value={form.zoneId}
              onChange={(e) => setForm((prev) => ({ ...prev, zoneId: e.target.value }))}
              className={control}
              disabled={isSubmitting || zones.length === 0}
            >
              <option value="">Sélectionner une zone</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </label>

          {validationError ? (
            <p className="m-0 text-xs font-medium text-red-600 sm:text-sm" role="alert">
              {validationError}
            </p>
          ) : null}
        </div>

        <footer className={APP_MODAL_FOOTER_CLASS}>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:px-4 sm:text-sm"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 sm:px-4 sm:text-sm"
          >
            {isSubmitting
              ? isEditMode
                ? "Enregistrement…"
                : "Création…"
              : isEditMode
                ? "Enregistrer"
                : "Créer le défi"}
          </button>
        </footer>
      </div>
    </div>
  );
}
