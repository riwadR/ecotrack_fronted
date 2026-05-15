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

export type ZoneNameModalProps = {
  isOpen: boolean;
  initialName?: string;
  isSubmitting?: boolean;
  onConfirm: (zoneName: string) => void | Promise<void>;
  onCancel: () => void;
};

/**
 * Lightweight naming step after a polygon sketch is finished.
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
      className={appModalBackdrop("z-[1000]")}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
      onClick={() => {
        if (!isSubmitting) onCancel();
      }}
    >
      <div className={APP_MODAL_PANEL_COMPACT_CLASS} onClick={(e) => e.stopPropagation()}>
        <header className={APP_MODAL_HEADER_CLASS}>
          <h2 id={labelId} className={APP_MODAL_TITLE_CLASS}>
            Nom de la zone
          </h2>
          <p className={APP_MODAL_SUBTITLE_CLASS}>
            Saisissez le libellé administratif du secteur (ex.&nbsp;: Zone Nord).
          </p>
        </header>

        <div className={APP_MODAL_BODY_CLASS}>
          <div>
            <label
              htmlFor={`${labelId}-input`}
              className="block text-xs font-medium text-slate-700 sm:text-sm"
            >
              Nom
            </label>
            <input
              id={`${labelId}-input`}
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className={`${APP_FORM_CONTROL_CLASS} mt-1`}
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
          </div>
        </div>

        <footer className={APP_MODAL_FOOTER_CLASS}>
          <button
            type="button"
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:px-4 sm:text-sm"
            onClick={onCancel}
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={!canSubmit || isSubmitting}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
            onClick={() => {
              if (canSubmit && !isSubmitting) {
                void onConfirm(trimmed);
              }
            }}
          >
            {isSubmitting ? "Enregistrement…" : "Valider"}
          </button>
        </footer>
      </div>
    </div>
  );
}
