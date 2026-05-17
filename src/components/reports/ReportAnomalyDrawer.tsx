"use client";

import { type FormEvent, useEffect, useId, useState } from "react";
import type { ReportType } from "@/models/report";
import {
  REPORT_TYPE_FORM_OPTIONS,
  reportTypeRequiresComment,
} from "@/lib/reports/reportTypeLabels";
import {
  isReportImageTooLarge,
  REPORT_IMAGE_MAX_SIZE_HELPER,
  REPORT_IMAGE_TOO_LARGE_TOAST,
} from "@/lib/reports/reportImageLimits";
import { APP_FORM_CONTROL_CLASS, APP_FORM_LABEL_CLASS } from "@/lib/ui/appChrome";

export type ReportAnomalyDrawerContext = {
  containerId: string;
  serialNumber: string;
  zoneName?: string | null;
};

export type ReportAnomalyDrawerProps = {
  context: ReportAnomalyDrawerContext | null;
  isOpen: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  onClose: () => void;
  onSubmit: (payload: {
    containerId: string;
    type: ReportType;
    comment: string;
    imageFile: File | null;
  }) => void | Promise<void>;
  onFileTooLarge?: () => void;
};

export default function ReportAnomalyDrawer({
  context,
  isOpen,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
  onFileTooLarge,
}: ReportAnomalyDrawerProps) {
  const formId = useId();
  const [issueType, setIssueType] = useState<ReportType>("FULL_CONTAINER");
  const [comment, setComment] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIssueType("FULL_CONTAINER");
      setComment("");
      setPhotoFile(null);
      setValidationError(null);
    }
  }, [isOpen, context?.containerId]);

  if (!isOpen || !context) {
    return null;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (reportTypeRequiresComment(issueType) && !comment.trim()) {
      setValidationError("Un commentaire est obligatoire pour le type « Autre ».");
      return;
    }
    if (isReportImageTooLarge(photoFile)) {
      setValidationError(REPORT_IMAGE_TOO_LARGE_TOAST);
      onFileTooLarge?.();
      return;
    }
    setValidationError(null);
    void onSubmit({
      containerId: context.containerId,
      type: issueType,
      comment: comment.trim(),
      imageFile: photoFile,
    });
  };

  const zoneLabel = context.zoneName?.trim() || "—";

  return (
    <div
      className="fixed inset-0 z-[1100] flex flex-col justify-end bg-slate-900/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${formId}-title`}
      onClick={onClose}
    >
      <div
        className="max-h-[92dvh] overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-slate-300" aria-hidden />
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5"
        >
          <div>
            <h2 id={`${formId}-title`} className="m-0 text-base font-semibold text-slate-900 sm:text-lg">
              Nouveau signalement
            </h2>
            <p className="m-0 mt-1 text-sm leading-snug text-slate-600">
              Conteneur{" "}
              <span className="font-mono font-semibold text-slate-900">{context.serialNumber}</span>
              {" · "}secteur <span className="font-medium">{zoneLabel}</span>
            </p>
          </div>

          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-2 text-sm font-medium text-slate-700">Type de problème</legend>
            <div className="flex flex-col gap-2">
              {REPORT_TYPE_FORM_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex min-h-[52px] cursor-pointer gap-3 rounded-xl border px-3.5 py-3 transition ${
                    issueType === option.value
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name={`${formId}-issue-type`}
                    value={option.value}
                    checked={issueType === option.value}
                    disabled={isSubmitting}
                    className="mt-1 shrink-0 accent-emerald-600"
                    onChange={() => setIssueType(option.value)}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug text-slate-900">
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-slate-600">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className={APP_FORM_LABEL_CLASS}>
            Commentaire
            <textarea
              rows={3}
              maxLength={500}
              value={comment}
              disabled={isSubmitting}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Décrivez le problème observé…"
              className={`${APP_FORM_CONTROL_CLASS} mt-2 min-h-[88px] resize-y`}
            />
          </label>

          <div>
            <label
              htmlFor={`${formId}-photo`}
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Photo (optionnelle)
            </label>
            <input
              id={`${formId}-photo`}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={isSubmitting}
              className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2.5 file:text-sm file:font-semibold file:text-emerald-900"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            />
            <p className="m-0 mt-1.5 text-xs text-slate-500">{REPORT_IMAGE_MAX_SIZE_HELPER}</p>
            {photoFile ? (
              <p className="m-0 mt-2 text-xs text-slate-500">{photoFile.name}</p>
            ) : null}
          </div>

          {validationError ? (
            <p
              className="m-0 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
              role="alert"
            >
              {validationError}
            </p>
          ) : null}
          {submitError ? (
            <p
              className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {submitError}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting ? "Envoi…" : "Envoyer le signalement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
