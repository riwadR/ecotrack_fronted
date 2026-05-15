"use client";

import { useId, useState } from "react";
import {
  APP_MODAL_BODY_CLASS,
  APP_MODAL_FOOTER_CLASS,
  APP_MODAL_HEADER_CLASS,
  APP_MODAL_PANEL_COMPACT_CLASS,
  APP_MODAL_SUBTITLE_CLASS,
  APP_MODAL_TITLE_CLASS,
  APP_FORM_CONTROL_CLASS,
  appModalBackdrop,
} from "@/lib/ui/appChrome";

export type ZoneDetailsEditModalProps = {
  isOpen: boolean;
  initialName: string;
  initialDescription: string;
  isSubmitting: boolean;
  onSave: (name: string, description: string) => void | Promise<void>;
  onClose: () => void;
};

/**
 * Modal for editing zone display fields (name + description) without touching geometry.
 *
 * Parent should remount via `key` when switching zones.
 */
export default function ZoneDetailsEditModal({
  isOpen,
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

  const control = `${APP_FORM_CONTROL_CLASS} disabled:opacity-60`;

  return (
    <div
      className={appModalBackdrop("z-[1000]")}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div className={APP_MODAL_PANEL_COMPACT_CLASS} onClick={(e) => e.stopPropagation()}>
        <header className={APP_MODAL_HEADER_CLASS}>
          <h2 id={labelId} className={APP_MODAL_TITLE_CLASS}>
            Modifier la zone
          </h2>
          <p className={APP_MODAL_SUBTITLE_CLASS}>
            Ajustez le nom et la description affichés pour ce secteur.
          </p>
        </header>

        <div className={APP_MODAL_BODY_CLASS}>
          <div>
            <label htmlFor={`${labelId}-name`} className="block text-xs font-medium text-slate-700 sm:text-sm">
              Nom
            </label>
            <input
              id={`${labelId}-name`}
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              disabled={isSubmitting}
              className={`${control} mt-1 bg-white`}
            />
          </div>

          <div>
            <label htmlFor={`${labelId}-desc`} className="block text-xs font-medium text-slate-700 sm:text-sm">
              Description
            </label>
            <textarea
              id={`${labelId}-desc`}
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
              disabled={isSubmitting}
              rows={4}
              className={`${control} mt-1 resize-y bg-white`}
            />
          </div>
        </div>

        <footer className={APP_MODAL_FOOTER_CLASS}>
          <button
            type="button"
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:px-4 sm:text-sm"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={!canSave}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
            onClick={() => {
              if (canSave) {
                void onSave(trimmedName, draftDescription);
              }
            }}
          >
            {isSubmitting ? "Enregistrement…" : "Enregistrer"}
          </button>
        </footer>
      </div>
    </div>
  );
}
