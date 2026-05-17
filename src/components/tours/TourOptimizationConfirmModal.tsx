"use client";

import {
  APP_MODAL_BODY_CLASS,
  APP_MODAL_FOOTER_CLASS,
  APP_MODAL_HEADER_CLASS,
  APP_MODAL_PANEL_COMPACT_CLASS,
  APP_MODAL_TITLE_CLASS,
  appModalBackdrop,
} from "@/lib/ui/appChrome";

export type TourOptimizationConfirmModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  onPreserveOrder: () => void;
  onReoptimize: () => void;
  onCancel: () => void;
};

export default function TourOptimizationConfirmModal({
  isOpen,
  isSubmitting,
  onPreserveOrder,
  onReoptimize,
  onCancel,
}: TourOptimizationConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={appModalBackdrop("z-[1100]")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-optimization-confirm-title"
      onClick={() => {
        if (!isSubmitting) {
          onCancel();
        }
      }}
    >
      <div
        className={APP_MODAL_PANEL_COMPACT_CLASS}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={APP_MODAL_HEADER_CLASS}>
          <h2 id="tour-optimization-confirm-title" className={APP_MODAL_TITLE_CLASS}>
            Mise à jour de l&apos;itinéraire
          </h2>
        </header>

        <div className={APP_MODAL_BODY_CLASS}>
          <p className="m-0 text-sm leading-relaxed text-slate-600">
            Souhaitez-vous ré-optimiser l&apos;ordre de passage avec l&apos;algorithme, ou
            conserver l&apos;ordre actuellement défini à l&apos;écran ?
          </p>
        </div>

        <footer className={`${APP_MODAL_FOOTER_CLASS} flex-col-reverse sm:flex-row sm:justify-end`}>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onPreserveOrder}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isSubmitting ? "Mise à jour…" : "Conserver l'ordre"}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onReoptimize}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isSubmitting ? "Mise à jour…" : "Ré-optimiser"}
          </button>
        </footer>
      </div>
    </div>
  );
}
