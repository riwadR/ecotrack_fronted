"use client";

import type { ReportListItem } from "@/models/report";
import { getReportTypeLabel } from "@/lib/reports/reportTypeLabels";
import ReportStatusBadge from "@/components/reports/management/ReportStatusBadge";

export type ReportCardProps = {
  report: ReportListItem;
  onClick: () => void;
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
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ReportCard({ report, onClick }: ReportCardProps) {
  const containerLabel =
    report.containerSerialNumber ?? report.containerId ?? "Conteneur inconnu";
  const locationLabel = report.containerZoneName
    ? `${containerLabel} · ${report.containerZoneName}`
    : containerLabel;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-sky-200 hover:shadow-md"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="m-0 text-xs font-medium uppercase tracking-wide text-slate-500">Date</p>
          <p className="m-0 text-sm font-semibold text-slate-900">{formatReportDate(report.createdAt)}</p>
        </div>
        <ReportStatusBadge status={report.status} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <p className="m-0 text-xs font-medium uppercase tracking-wide text-slate-500">Type</p>
          <p className="m-0 text-sm font-semibold text-slate-900">{getReportTypeLabel(report.type)}</p>
        </div>
        <div>
          <p className="m-0 text-xs font-medium uppercase tracking-wide text-slate-500">Conteneur</p>
          <p className="m-0 font-mono text-sm font-semibold text-slate-900">{locationLabel}</p>
        </div>
      </div>

      {report.comment ? (
        <p className="m-0 line-clamp-2 text-sm text-slate-600">{report.comment}</p>
      ) : null}
    </button>
  );
}
