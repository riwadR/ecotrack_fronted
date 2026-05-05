"use client";

import { useId, useState } from "react";

export type ZoneDetailsEditModalProps = {
  isOpen: boolean;
  zoneId: string;
  initialName: string;
  initialDescription: string;
  isSubmitting: boolean;
  onSave: (name: string, description: string) => void | Promise<void>;
  onClose: () => void;
};

/**
 * Modal for editing zone display fields (name + description) without touching geometry.
 *
 * Note: this component intentionally keeps its own local draft state. The parent should remount
 * the modal (via `key`) when switching zones to edit.
 */
export default function ZoneDetailsEditModal({
  isOpen,
  zoneId,
  initialName,
  initialDescription,
  isSubmitting,
  onSave,
  onClose,
}: ZoneDetailsEditModalProps) {
  const labelId = useId();
  const [draftName, setDraftName] = useState(initialName);
  const [draftDescription, setDraftDescription] = useState(initialDescription);

  if (!isOpen) {
    return null;
  }

  const trimmedName = draftName.trim();
  const canSave = trimmedName.length > 0 && !isSubmitting;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 id={labelId} className="text-lg font-semibold text-slate-900">
          Modifier la zone
        </h2>
        <p className="mt-1 font-mono text-xs text-slate-500">{zoneId}</p>

        <label
          htmlFor={`${labelId}-name`}
          className="mt-4 block text-sm font-medium text-slate-700"
        >
          Nom
        </label>
        <input
          id={`${labelId}-name`}
          type="text"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          disabled={isSubmitting}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-sky-500 focus:border-sky-500 focus:ring-2 disabled:opacity-60"
        />

        <label
          htmlFor={`${labelId}-desc`}
          className="mt-4 block text-sm font-medium text-slate-700"
        >
          Description
        </label>
        <textarea
          id={`${labelId}-desc`}
          value={draftDescription}
          onChange={(e) => setDraftDescription(e.target.value)}
          disabled={isSubmitting}
          rows={4}
          className="mt-1 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-sky-500 focus:border-sky-500 focus:ring-2 disabled:opacity-60"
        />

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={!canSave}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              if (canSave) {
                void onSave(trimmedName, draftDescription);
              }
            }}
          >
            {isSubmitting ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

