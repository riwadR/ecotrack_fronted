"use client";

import { useId, useState } from "react";
import type { Container } from "@/models/map";
import type { ReportType } from "@/models/report";
import {
  MOCK_PHOTO_UPLOAD_URL,
  REPORT_TYPE_FORM_OPTIONS,
  reportTypeRequiresComment,
} from "@/lib/reports/reportTypeLabels";

const PHOTO_UPLOAD_DELAY_MS = 1400;

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
    photoUrl: string;
  }) => void | Promise<void>;
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
}: ReportFormModalProps) {
  const formId = useId();
  const [issueType, setIssueType] = useState<ReportType>("FULL_CONTAINER");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  if (!isOpen || !container) {
    return null;
  }

  const displaySerial = container.serialNumber ?? container.id;
  const busy = isSubmitting || isUploadingPhoto;

  const handleSubmit = async () => {
    if (reportTypeRequiresComment(issueType) && !comment.trim()) {
      setValidationError("Un commentaire est obligatoire pour le type « Autre ».");
      return;
    }
    setValidationError(null);

    setIsUploadingPhoto(true);
    await new Promise((resolve) => setTimeout(resolve, PHOTO_UPLOAD_DELAY_MS));
    setIsUploadingPhoto(false);

    const photoUrl = photoFile ? MOCK_PHOTO_UPLOAD_URL : "";

    await onSubmit({
      containerId: container.id,
      type: issueType,
      comment: comment.trim(),
      photoUrl,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${formId}-title`}
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <header className="border-b border-slate-100 px-5 py-4">
          <h2 id={`${formId}-title`} className="text-lg font-semibold text-slate-900">
            Nouveau signalement
          </h2>
          <p className="mt-1 text-sm text-slate-600">
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
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!busy) {
              void handleSubmit();
            }
          }}
        >
          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-2 text-sm font-medium text-slate-700">Type de problème</legend>
            <div className="flex flex-col gap-2">
              {REPORT_TYPE_FORM_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer gap-3 rounded-xl border px-3 py-2.5 transition ${
                    issueType === option.value
                      ? "border-sky-500 bg-sky-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name={`${formId}-issue-type`}
                    value={option.value}
                    checked={issueType === option.value}
                    disabled={busy}
                    className="mt-1"
                    onChange={() => setIssueType(option.value)}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">{option.label}</span>
                    <span className="block text-xs text-slate-600">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor={`${formId}-comment`} className="block text-sm font-medium text-slate-700">
              Commentaire
            </label>
            <textarea
              id={`${formId}-comment`}
              rows={3}
              maxLength={500}
              value={comment}
              disabled={busy}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Décrivez le problème observé…"
              className="mt-1 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-sky-500 focus:border-sky-500 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor={`${formId}-photo`} className="block text-sm font-medium text-slate-700">
              Photo (optionnelle)
            </label>
            <input
              id={`${formId}-photo`}
              type="file"
              accept="image/*"
              disabled={busy}
              className="mt-1 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            />
            {isUploadingPhoto ? (
              <p className="mt-2 text-xs font-medium text-sky-700" role="status">
                Téléversement de la photo en cours…
              </p>
            ) : photoFile ? (
              <p className="mt-2 text-xs text-slate-500">{photoFile.name} — prêt à l&apos;envoi</p>
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

        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            disabled={busy}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={busy}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void handleSubmit()}
          >
            {isUploadingPhoto
              ? "Téléversement…"
              : isSubmitting
                ? "Envoi…"
                : "Envoyer le signalement"}
          </button>
        </footer>
      </div>
    </div>
  );
}
