"use client";

import { APP_MODAL_TITLE_CLASS, appModalBackdrop } from "@/lib/ui/appChrome";

export type CitizenReportSuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Celebratory confirmation for citizen report submissions (gamification feedback).
 */
export default function CitizenReportSuccessModal({
  isOpen,
  onClose,
}: CitizenReportSuccessModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={appModalBackdrop("z-[1100]")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="citizen-report-success-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-5 text-center shadow-xl sm:p-6">
        <p className="text-4xl" aria-hidden>
          🎉
        </p>
        <h2
          id="citizen-report-success-title"
          className={`${APP_MODAL_TITLE_CLASS} mt-2 text-emerald-900`}
        >
          Merci ! Signalement validé
        </h2>
        <p className="mt-3 text-xs leading-relaxed text-emerald-800 sm:text-sm">
          Vous gagnez <strong>+10 points</strong> et contribuez à réduire les émissions de CO₂
          en aidant les équipes à intervenir plus vite.
        </p>
        <button
          type="button"
          className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 sm:mt-6"
          onClick={onClose}
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
