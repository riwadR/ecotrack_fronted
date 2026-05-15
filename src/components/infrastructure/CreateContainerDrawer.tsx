"use client";

import { useEffect, useId, useState } from "react";
import type { Zone } from "@/models/zone";
import type { ContainerType } from "@/models/container";
import {
  BACKEND_CONTAINER_STATUS_OPTIONS,
  type BackendContainerStatus,
} from "@/lib/containers/backendContainerStatus";
import { CONTAINER_TYPE_FORM_OPTIONS } from "@/lib/containers/containerTypeLabels";

export type CreateContainerDrawerFormValues = {
  serialNumber: string;
  type: ContainerType;
  status: BackendContainerStatus;
  zoneId: string;
};

export type CreateContainerDrawerProps = {
  isOpen: boolean;
  latitude: number;
  longitude: number;
  /** If set and present in `zones`, preselects the sector (e.g. from map point-in-polygon). */
  suggestedZoneId?: string | null;
  /** When true, show a short FR hint that the sector was inferred from the click. */
  zoneInferredFromMap?: boolean;
  zones: Zone[];
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (values: CreateContainerDrawerFormValues) => void | Promise<void>;
  onClose: () => void;
};

type DrawerFormDraft = {
  serialNumber: string;
  type: ContainerType | "";
  status: BackendContainerStatus;
  zoneId: string;
};

const emptyDraftForm: DrawerFormDraft = {
  serialNumber: "",
  type: "",
  status: "OK",
  zoneId: "",
};

export default function CreateContainerDrawer({
  isOpen,
  latitude,
  longitude,
  suggestedZoneId = null,
  zoneInferredFromMap = false,
  zones,
  isSubmitting = false,
  errorMessage = null,
  onSubmit,
  onClose,
}: CreateContainerDrawerProps) {
  const titleId = useId();
  const [form, setForm] = useState<DrawerFormDraft>(emptyDraftForm);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const zoneId =
      suggestedZoneId &&
      zones.some((z) => z.id === suggestedZoneId)
        ? suggestedZoneId
        : "";
    setForm({ ...emptyDraftForm, zoneId });
    setValidationError(null);
  }, [isOpen, latitude, longitude, suggestedZoneId, zones]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    const serialNumber = form.serialNumber.trim();
    if (!serialNumber) {
      setValidationError("Le numéro de série est obligatoire.");
      return;
    }
    if (!form.zoneId) {
      setValidationError("Veuillez sélectionner un secteur.");
      return;
    }
    if (!form.type) {
      setValidationError("Veuillez sélectionner un type de conteneur.");
      return;
    }
    setValidationError(null);
    void onSubmit({ serialNumber, type: form.type, status: form.status, zoneId: form.zoneId });
  };

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[1000] bg-slate-900/40"
        aria-label="Fermer"
        onClick={() => {
          if (!isSubmitting) {
            onClose();
          }
        }}
      />
      <aside
        className="fixed right-0 top-0 z-[1001] flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="border-b border-slate-200 px-5 py-4">
          <h2 id={titleId} className="m-0 text-lg font-semibold text-slate-900">
            Nouveau conteneur
          </h2>
          <p className="m-0 mt-1 text-sm text-slate-600">
            Position choisie sur la carte.
          </p>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid gap-4">
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Latitude
              <input
                type="text"
                readOnly
                value={latitude.toFixed(6)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Longitude
              <input
                type="text"
                readOnly
                value={longitude.toFixed(6)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Numéro de série
              <input
                type="text"
                value={form.serialNumber}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, serialNumber: event.target.value }))
                }
                disabled={isSubmitting}
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Type de collecte
              <select
                value={form.type}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    type: event.target.value as ContainerType | "",
                  }))
                }
                disabled={isSubmitting}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="">Sélectionner un type</option>
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
                  setForm((prev) => ({
                    ...prev,
                    status: event.target.value as BackendContainerStatus,
                  }))
                }
                disabled={isSubmitting}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
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
                  setForm((prev) => ({ ...prev, zoneId: event.target.value }))
                }
                disabled={isSubmitting || zones.length === 0}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="">Sélectionner un secteur</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
              {zoneInferredFromMap && suggestedZoneId && form.zoneId === suggestedZoneId ? (
                <span className="text-xs font-normal text-slate-500">
                  Secteur proposé automatiquement d&apos;après la position sur la carte.
                </span>
              ) : null}
            </label>
          </div>

          {validationError ? (
            <p className="mt-3 text-sm font-medium text-red-600" role="alert">
              {validationError}
            </p>
          ) : null}
          {errorMessage ? (
            <p className="mt-3 text-sm font-medium text-red-600" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
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
            {isSubmitting ? "Création…" : "Créer le conteneur"}
          </button>
        </footer>
      </aside>
    </>
  );
}
