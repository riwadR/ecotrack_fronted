"use client";

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
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="citizen-report-success-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-6 text-center shadow-2xl">
        <p className="text-4xl" aria-hidden>
          🎉
        </p>
        <h2
          id="citizen-report-success-title"
          className="mt-2 text-xl font-bold text-emerald-900"
        >
          Merci ! Signalement validé
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-emerald-800">
          Vous gagnez <strong>+10 points</strong> et contribuez à réduire les émissions de CO₂
          en aidant les équipes à intervenir plus vite.
        </p>
        <button
          type="button"
          className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          onClick={onClose}
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
