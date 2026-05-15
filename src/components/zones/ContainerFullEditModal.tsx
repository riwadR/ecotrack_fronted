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
import {
  APP_MODAL_BODY_CLASS,
  APP_MODAL_FOOTER_CLASS,
  APP_MODAL_HEADER_CLASS,
  APP_MODAL_PANEL_COMPACT_CLASS,
  APP_MODAL_SUBTITLE_CLASS,
  APP_MODAL_TITLE_CLASS,
  APP_FORM_CONTROL_COMPACT_CLASS,
  APP_FORM_LABEL_COMPACT_CLASS,
  appModalBackdrop,
} from "@/lib/ui/appChrome";

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

  const inputCls = `${APP_FORM_CONTROL_COMPACT_CLASS} bg-white`;

  return (
    <div
      role="presentation"
      className={appModalBackdrop("z-[1100]")}
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative ${APP_MODAL_PANEL_COMPACT_CLASS} max-h-[min(88dvh,32rem)] lg:max-w-lg max-[480px]:max-h-[min(85dvh,30rem)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={APP_MODAL_HEADER_CLASS}>
          <h2 id={titleId} className={APP_MODAL_TITLE_CLASS}>
            Modifier le conteneur
          </h2>
          <p className={APP_MODAL_SUBTITLE_CLASS}>
            Numéro de série, type, secteur, position GPS, statut et niveau de remplissage.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className={`${APP_MODAL_BODY_CLASS} space-y-2.5 sm:space-y-3`}>
            <label className={APP_FORM_LABEL_COMPACT_CLASS}>
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

            <label className={APP_FORM_LABEL_COMPACT_CLASS}>
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

            <label className={APP_FORM_LABEL_COMPACT_CLASS}>
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

            <label className={APP_FORM_LABEL_COMPACT_CLASS}>
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

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
              <label className={APP_FORM_LABEL_COMPACT_CLASS}>
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
              <label className={APP_FORM_LABEL_COMPACT_CLASS}>
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

            <label className={APP_FORM_LABEL_COMPACT_CLASS}>
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
              Pour ne modifier que la position, fermez cette fenêtre et utilisez « Déplacer » depuis la fiche du
              conteneur sur la carte.
            </p>

            {validationError ? (
              <p
                className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                role="alert"
              >
                {validationError}
              </p>
            ) : null}
            {error ? (
              <p
                className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                role="alert"
              >
                {error}
              </p>
            ) : null}
          </div>

          <footer className={`${APP_MODAL_FOOTER_CLASS} flex-col-reverse sm:flex-row`}>
            <button
              type="button"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto sm:text-sm"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 sm:w-auto sm:text-sm"
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
