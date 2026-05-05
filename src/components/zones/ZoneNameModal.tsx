"use client";

import { useId, useState } from "react";

export type ZoneNameModalProps = {
  isOpen: boolean;
  initialName?: string;
  isSubmitting?: boolean;
  onConfirm: (zoneName: string) => void | Promise<void>;
  onCancel: () => void;
};

/**
 * Lightweight naming step after a polygon sketch is finished (Tailwind-styled).
 */
export default function ZoneNameModal({
  isOpen,
  initialName = "",
  isSubmitting = false,
  onConfirm,
  onCancel,
}: ZoneNameModalProps) {
  const labelId = useId();
  const [draftName, setDraftName] = useState(initialName);

  if (!isOpen) {
    return null;
  }

  const trimmed = draftName.trim();
  const canSubmit = trimmed.length > 0;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 id={labelId} className="text-lg font-semibold text-slate-900">
          Nom de la zone
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Saisissez le libellé administratif du secteur (ex.&nbsp;: Zone Nord).
        </p>
        <label htmlFor={`${labelId}-input`} className="mt-4 block text-sm font-medium text-slate-700">
          Nom
        </label>
        <input
          id={`${labelId}-input`}
          type="text"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-sky-500 focus:border-sky-500 focus:ring-2"
          placeholder="Zone Nord"
          autoFocus
          disabled={isSubmitting}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canSubmit && !isSubmitting) {
              e.preventDefault();
              void onConfirm(trimmed);
            }
            if (e.key === "Escape" && !isSubmitting) {
              e.preventDefault();
              onCancel();
            }
          }}
        />
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            onClick={onCancel}
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={!canSubmit || isSubmitting}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              if (canSubmit && !isSubmitting) {
                void onConfirm(trimmed);
              }
            }}
          >
            {isSubmitting ? "Enregistrement…" : "Valider"}
          </button>
        </div>
      </div>
    </div>
  );
}
