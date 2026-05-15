"use client";

import type { ReportStatus } from "@/models/report";
import {
  getReportStatusBadgeClass,
  getReportStatusLabel,
} from "@/lib/reports/reportStatusLabels";

export type ReportStatusBadgeProps = {
  status: ReportStatus;
};

export default function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${getReportStatusBadgeClass(status)}`}
    >
      {getReportStatusLabel(status)}
    </span>
  );
}
