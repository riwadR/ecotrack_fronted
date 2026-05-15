"use client";

import type { ReportListItem, ReportStatus, ReportUpdateStatus } from "@/models/report";
import { getReportTypeLabel } from "@/lib/reports/reportTypeLabels";
import { isReportToProcessStatus } from "@/lib/reports/reportStatusLabels";
import ReportStatusBadge from "@/components/reports/management/ReportStatusBadge";

const PHOTO_PLACEHOLDER =
  "https://dummyimage.com/640x360/e2e8f0/64748b&text=Aucune+photo";

export type ReportReviewDrawerProps = {
  report: ReportListItem | null;
  isUpdating: boolean;
  updateError: string | null;
  onClose: () => void;
  onStatusChange: (status: ReportUpdateStatus) => void;
};

function formatReportDate(iso?: string): string {
  if (!iso) {
    return "—";
  }
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) {
    return "—";
  }
  return new Date(parsed).toLocaleString("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  });
}

function canReopen(status: ReportStatus): boolean {
  return status !== "PENDING";
}

export default function ReportReviewDrawer({
  report,
  isUpdating,
  updateError,
  onClose,
  onStatusChange,
}: ReportReviewDrawerProps) {
  if (!report) {
    return null;
  }

  const isPending = report.status === "PENDING";
  const isToProcess = isReportToProcessStatus(report.status);
  const showReopen = canReopen(report.status);
  const photoSrc = report.photoUrl?.trim() ? report.photoUrl : PHOTO_PLACEHOLDER;
  const containerLabel =
    report.containerSerialNumber ?? report.containerId ?? "Conteneur inconnu";

  const hasActions = isPending || isToProcess || showReopen;

  return (
    <aside
      className="fixed inset-y-0 right-0 z-[1000] flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-review-title"
    >
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 id="report-review-title" className="text-base font-semibold text-slate-900">
          Examen du signalement
        </h2>
        <button
          type="button"
          onClick={onClose}
          disabled={isUpdating}
          className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          aria-label="Fermer"
        >
          ✕
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <ReportStatusBadge status={report.status} />
          <span className="text-xs text-slate-500">{formatReportDate(report.createdAt)}</span>
        </div>

        <dl className="m-0 grid gap-3 text-sm">
          <div>
            <dt className="font-medium text-slate-500">Type</dt>
            <dd className="m-0 font-semibold text-slate-900">{getReportTypeLabel(report.type)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Conteneur</dt>
            <dd className="m-0 font-mono font-semibold text-slate-900">{containerLabel}</dd>
          </div>
          {report.containerZoneName ? (
            <div>
              <dt className="font-medium text-slate-500">Secteur</dt>
              <dd className="m-0 text-slate-900">{report.containerZoneName}</dd>
            </div>
          ) : null}
          {report.reporterFirstName ? (
            <div>
              <dt className="font-medium text-slate-500">Signalé par</dt>
              <dd className="m-0 text-slate-900">{report.reporterFirstName}</dd>
            </div>
          ) : null}
        </dl>

        <section>
          <h3 className="m-0 text-sm font-semibold text-slate-800">Commentaire</h3>
          <p className="mt-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {report.comment?.trim() ? report.comment : "Aucun commentaire fourni."}
          </p>
        </section>

        <section>
          <h3 className="m-0 text-sm font-semibold text-slate-800">Photo</h3>
          <img
            src={photoSrc}
            alt="Preuve photographique du signalement"
            className="mt-2 w-full rounded-xl border border-slate-200 object-cover"
          />
          {!report.photoUrl?.trim() ? (
            <p className="mt-1 text-xs text-slate-500">Aucune photo jointe au signalement.</p>
          ) : null}
        </section>

        {updateError ? (
          <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {updateError}
          </p>
        ) : null}
      </div>

      {hasActions ? (
        <footer className="flex flex-col gap-2 border-t border-slate-100 p-4">
          {isPending ? (
            <>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStatusChange("VALIDATED")}
                className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                🟢 Valider — à traiter
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStatusChange("REJECTED")}
                className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50"
              >
                🔴 Rejeter
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStatusChange("RESOLVED")}
                className="w-full rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
              >
                🔵 Marquer comme résolu
              </button>
            </>
          ) : null}

          {isToProcess ? (
            <>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStatusChange("RESOLVED")}
                className="w-full rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
              >
                🔵 Marquer comme résolu
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStatusChange("REJECTED")}
                className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50"
              >
                🔴 Rejeter
              </button>
            </>
          ) : null}

          {showReopen ? (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onStatusChange("PENDING")}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            >
              ↩ Rouvrir (remettre en attente)
            </button>
          ) : null}
        </footer>
      ) : null}
    </aside>
  );
}
