"use client";

import { useEffect, useId, useState } from "react";
import type { ChallengeCreatePayload } from "@/lib/api/challenges";
import type { Zone } from "@/models/zone";
import { datetimeLocalToIso } from "@/lib/challenges/challengeUtils";

export type ChallengeCreateModalProps = {
  isOpen: boolean;
  zones: Zone[];
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
  isSubmitting = false,
  onConfirm,
  onCancel,
}: ChallengeCreateModalProps) {
  const titleId = useId();
  const [form, setForm] = useState(defaultForm);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm(defaultForm);
      setValidationError(null);
    }
  }, [isOpen]);

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

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 id={titleId} className="text-lg font-semibold text-slate-900">
          Nouveau défi
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Publiez un objectif collectif pour une zone et une période définies.
        </p>

        <div className="mt-5 grid gap-4">
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Titre
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              disabled={isSubmitting}
            />
          </label>

          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="resize-y rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              disabled={isSubmitting}
            />
          </label>

          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Objectif (signalements)
            <input
              type="number"
              min={1}
              value={form.goalThreshold}
              onChange={(e) => setForm((prev) => ({ ...prev, goalThreshold: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              disabled={isSubmitting}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Date de début
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                disabled={isSubmitting}
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Date de fin
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                disabled={isSubmitting}
              />
            </label>
          </div>

          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Zone ciblée
            <select
              value={form.zoneId}
              onChange={(e) => setForm((prev) => ({ ...prev, zoneId: e.target.value }))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
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
        </div>

        {validationError ? (
          <p className="mt-3 text-sm font-medium text-red-600" role="alert">
            {validationError}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSubmitting ? "Création…" : "Créer le défi"}
          </button>
        </div>
      </div>
    </div>
  );
}
