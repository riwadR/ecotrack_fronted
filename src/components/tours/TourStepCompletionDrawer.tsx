"use client";

import { type FormEvent, useEffect, useId, useState } from "react";
import type { TourStepDTO } from "@/models/tour";
import { APP_FORM_CONTROL_CLASS, APP_FORM_LABEL_CLASS } from "@/lib/ui/appChrome";

export type TourStepCompletionDrawerProps = {
  step: TourStepDTO | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (collectedVolume: number | undefined) => void;
};

export default function TourStepCompletionDrawer({
  step,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: TourStepCompletionDrawerProps) {
  const titleId = useId();
  const [volume, setVolume] = useState("");

  useEffect(() => {
    if (isOpen) {
      setVolume("");
    }
  }, [isOpen, step?.id]);

  if (!isOpen || !step) {
    return null;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = volume.trim();
    if (trimmed === "") {
      onSubmit(undefined);
      return;
    }
    const parsed = Number.parseInt(trimmed, 10);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 1000) {
      return;
    }
    onSubmit(parsed);
  };

  return (
    <div
      className="fixed inset-0 z-[1100] flex flex-col justify-end bg-slate-900/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="max-h-[85dvh] overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-slate-300" aria-hidden />
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5"
        >
          <div>
            <h2 id={titleId} className="m-0 text-base font-semibold text-slate-900">
              Valider la collecte
            </h2>
            <p className="m-0 mt-1 text-sm text-slate-600">
              Étape {step.stepOrder} · conteneur {step.serialNumber}
            </p>
          </div>

          <label className={APP_FORM_LABEL_CLASS}>
            Volume collecté (L)
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={1000}
              step={1}
              value={volume}
              onChange={(event) => setVolume(event.target.value)}
              placeholder="Optionnel"
              className={APP_FORM_CONTROL_CLASS}
              disabled={isSubmitting}
            />
            <span className="text-xs font-normal text-slate-500">
              Laissez vide si vous ne souhaitez pas renseigner le volume.
            </span>
          </label>

          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {isSubmitting ? "Validation…" : "Confirmer la collecte"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
