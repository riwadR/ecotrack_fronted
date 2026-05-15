"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import type { Zone } from "@/models/zone";
import type { ContainerFullEditValues } from "@/lib/zones/containerFullEditValues";
import {
  BACKEND_CONTAINER_STATUS_OPTIONS,
  type BackendContainerStatus,
} from "@/lib/containers/backendContainerStatus";
import { CONTAINER_TYPE_FORM_OPTIONS } from "@/lib/containers/containerTypeLabels";
import type { ContainerType } from "@/models/container";

export type ContainerFullEditModalProps = {
  values: ContainerFullEditValues | null;
  isOpen: boolean;
  zones: Zone[];
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (next: ContainerFullEditValues) => void;
};

type FormState = Omit<ContainerFullEditValues, "id">;

function toForm(values: ContainerFullEditValues): FormState {
  return {
    serialNumber: values.serialNumber,
    type: values.type,
    zoneId: values.zoneId,
    latitude: values.latitude,
    longitude: values.longitude,
    status: values.status,
    fillLevel: values.fillLevel,
  };
}

export default function ContainerFullEditModal({
  values,
  isOpen,
  zones,
  isSubmitting,
  error,
  onClose,
  onSave,
}: ContainerFullEditModalProps) {
  const titleId = useId();
  const [form, setForm] = useState<FormState | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (values && isOpen) {
      setForm(toForm(values));
      setValidationError(null);
    }
  }, [values, isOpen]);

  if (!isOpen || !values || !form) {
    return null;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const serialNumber = form.serialNumber.trim();
    if (!serialNumber) {
      setValidationError("Le numéro de série est obligatoire.");
      return;
    }
    if (!form.zoneId) {
      setValidationError("Veuillez sélectionner un secteur.");
      return;
    }
    if (!Number.isFinite(form.latitude) || !Number.isFinite(form.longitude)) {
      setValidationError("Latitude et longitude doivent être des nombres valides.");
      return;
    }
    if (
      typeof form.fillLevel !== "number" ||
      Number.isNaN(form.fillLevel) ||
      form.fillLevel < 0 ||
      form.fillLevel > 100
    ) {
      setValidationError("Le niveau de remplissage doit être entre 0 et 100 %.");
      return;
    }

    setValidationError(null);
    onSave({
      id: values.id,
      serialNumber,
      type: form.type,
      zoneId: form.zoneId,
      latitude: form.latitude,
      longitude: form.longitude,
      status: form.status,
      fillLevel: Math.round(form.fillLevel),
    });
  };

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30";

  return (
    <div className="fixed inset-0 z-[1100] flex items-end justify-center p-0 sm:items-center sm:p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        aria-label="Fermer"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-xl sm:max-h-[85vh] sm:rounded-2xl"
      >
        <header className="border-b border-slate-200 px-4 py-4 sm:px-6">
          <h2 id={titleId} className="m-0 text-lg font-bold text-slate-900">
            Modifier le conteneur
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Numéro de série, type, secteur, position GPS, statut et niveau de remplissage.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Numéro de série
              <input
                type="text"
                value={form.serialNumber}
                onChange={(event) =>
                  setForm((prev) => prev && { ...prev, serialNumber: event.target.value })
                }
                disabled={isSubmitting}
                className={inputCls}
                autoComplete="off"
              />
            </label>

            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Type de collecte
              <select
                value={form.type}
                onChange={(event) =>
                  setForm((prev) =>
                    prev ? { ...prev, type: event.target.value as ContainerType } : prev
                  )
                }
                disabled={isSubmitting}
                className={`${inputCls} bg-white`}
              >
                {CONTAINER_TYPE_FORM_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Statut
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          status: event.target.value as BackendContainerStatus,
                        }
                      : prev
                  )
                }
                disabled={isSubmitting}
                className={`${inputCls} bg-white`}
              >
                {BACKEND_CONTAINER_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Secteur
              <select
                value={form.zoneId}
                onChange={(event) =>
                  setForm((prev) =>
                    prev ? { ...prev, zoneId: event.target.value } : prev
                  )
                }
                disabled={isSubmitting || zones.length === 0}
                className={`${inputCls} bg-white`}
              >
                <option value="">Sélectionner un secteur</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Latitude
                <input
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev ? { ...prev, latitude: Number(event.target.value) } : prev
                    )
                  }
                  disabled={isSubmitting}
                  className={inputCls}
                />
              </label>
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Longitude
                <input
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev ? { ...prev, longitude: Number(event.target.value) } : prev
                    )
                  }
                  disabled={isSubmitting}
                  className={inputCls}
                />
              </label>
            </div>

            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Niveau de remplissage (%)
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={Number.isFinite(form.fillLevel) ? form.fillLevel : ""}
                onChange={(event) =>
                  setForm((prev) =>
                    prev ? { ...prev, fillLevel: Number(event.target.value) } : prev
                  )
                }
                disabled={isSubmitting}
                className={inputCls}
              />
            </label>

            <p className="m-0 text-xs leading-relaxed text-slate-500">
              Pour déplacer rapidement uniquement la position, utilisez le bouton « Déplacer » sur la carte.
            </p>

            {validationError ? (
              <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                {validationError}
              </p>
            ) : null}
            {error ? (
              <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <footer className="flex flex-col-reverse gap-2 border-t border-slate-200 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enregistrement…" : "Enregistrer"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
