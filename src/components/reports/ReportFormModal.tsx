"use client";

import { useId, useState } from "react";
import type { Container } from "@/models/map";
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
import {
  APP_FORM_CONTROL_CLASS,
  APP_MODAL_BODY_CLASS,
  APP_MODAL_FOOTER_CLASS,
  APP_MODAL_HEADER_CLASS,
  APP_MODAL_PANEL_CLASS,
  APP_MODAL_SUBTITLE_CLASS,
  APP_MODAL_TITLE_CLASS,
  appModalBackdrop,
} from "@/lib/ui/appChrome";

export type ReportFormModalProps = {
  isOpen: boolean;
  container: Container | null;
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

/**
 * Modal form to submit an anomaly report for a selected container.
 */
export default function ReportFormModal({
  isOpen,
  container,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
  onFileTooLarge,
}: ReportFormModalProps) {
  const formId = useId();
  const [issueType, setIssueType] = useState<ReportType>("FULL_CONTAINER");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  if (!isOpen || !container) {
    return null;
  }

  const displaySerial = container.serialNumber ?? container.id;
  const busy = isSubmitting;

  const handleSubmit = async () => {
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

    await onSubmit({
      containerId: container.id,
      type: issueType,
      comment: comment.trim(),
      imageFile: photoFile,
    });
  };

  return (
    <div
      className={appModalBackdrop("z-[1050]")}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${formId}-title`}
    >
      <div className={APP_MODAL_PANEL_CLASS}>
        <header className={APP_MODAL_HEADER_CLASS}>
          <h2 id={`${formId}-title`} className={APP_MODAL_TITLE_CLASS}>
            Nouveau signalement
          </h2>
          <p className={APP_MODAL_SUBTITLE_CLASS}>
            Conteneur <span className="font-mono font-semibold text-slate-800">{displaySerial}</span>
            {container.zoneName ? (
              <>
                {" "}
                · secteur <span className="font-medium">{container.zoneName}</span>
              </>
            ) : null}
          </p>
        </header>

        <form
          className={APP_MODAL_BODY_CLASS}
          onSubmit={(e) => {
            e.preventDefault();
            if (!busy) {
              void handleSubmit();
            }
          }}
        >
          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-2 text-sm font-medium text-slate-700">
              Type de problème
            </legend>
            <div className="flex flex-col gap-2">
              {REPORT_TYPE_FORM_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer gap-3 rounded-xl border px-3.5 py-3 transition sm:px-4 sm:py-3.5 ${
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
                    disabled={busy}
                    className="mt-1 shrink-0 accent-emerald-600"
                    onChange={() => setIssueType(option.value)}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug text-slate-900">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-slate-600">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor={`${formId}-comment`}
              className="mb-0 block text-sm font-medium text-slate-700"
            >
              Commentaire
            </label>
            <textarea
              id={`${formId}-comment`}
              rows={2}
              maxLength={500}
              value={comment}
              disabled={busy}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Décrivez le problème observé…"
              className={`${APP_FORM_CONTROL_CLASS} mt-2 resize-y`}
            />
          </div>

          <div>
            <label
              htmlFor={`${formId}-photo`}
              className="mb-0 block text-sm font-medium text-slate-700"
            >
              Photo (optionnelle)
            </label>
            <input
              id={`${formId}-photo`}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={busy}
              className="mt-2 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-emerald-900"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            />
            <p className="m-0 mt-1.5 text-xs text-slate-500">{REPORT_IMAGE_MAX_SIZE_HELPER}</p>
            {photoFile ? (
              <p className="mt-2 text-xs text-slate-500">{photoFile.name}</p>
            ) : null}
          </div>

          {validationError ? (
            <p className="m-0 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="alert">
              {validationError}
            </p>
          ) : null}
          {submitError ? (
            <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {submitError}
            </p>
          ) : null}
        </form>

        <footer className={APP_MODAL_FOOTER_CLASS}>
          <button
            type="button"
            disabled={busy}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:px-4 sm:text-sm"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={busy}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? "Envoi…" : "Envoyer le signalement"}
          </button>
        </footer>
      </div>
    </div>
  );
}
