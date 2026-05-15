"use client";

import { useEffect, useState } from "react";
import type { Container } from "@/models/container";
import { containerDisplayName } from "@/lib/zones/zoneContainerUtils";

export type ContainerSerialEditModalProps = {
  container: Container | null;
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (serialNumber: string) => void;
};

export default function ContainerSerialEditModal({
  container,
  isOpen,
  isSubmitting,
  error,
  onClose,
  onSave,
}: ContainerSerialEditModalProps) {
  const [serialNumber, setSerialNumber] = useState("");

  useEffect(() => {
    if (container && isOpen) {
      setSerialNumber(containerDisplayName(container));
    }
  }, [container, isOpen]);

  if (!isOpen || !container) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4" role="presentation">
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
        aria-labelledby="container-edit-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <h2 id="container-edit-title" className="m-0 text-lg font-bold text-slate-900">
          Renommer le conteneur
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Modifiez le numéro de série affiché sur la carte et dans les listes.
        </p>
        <form
          className="mt-4 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = serialNumber.trim();
            if (trimmed) onSave(trimmed);
          }}
        >
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Numéro de série
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              autoFocus
              required
            />
          </label>
          {error ? (
            <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              disabled={isSubmitting || !serialNumber.trim()}
            >
              {isSubmitting ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
