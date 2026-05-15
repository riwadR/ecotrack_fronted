import type { ReportManagementTabStatus, ReportStatus } from "@/models/report";

export type ReportManagementTab = {
  value: ReportManagementTabStatus;
  label: string;
  description: string;
};

export const REPORT_MANAGEMENT_TABS: ReportManagementTab[] = [
  {
    value: "PENDING",
    label: "En attente",
    description: "Signalements en attente de validation",
  },
  {
    value: "VALIDATED",
    label: "À traiter",
    description: "Signalements à traiter",
  },
  {
    value: "RESOLVED",
    label: "Résolus",
    description: "Signalements résolus",
  },
  {
    value: "REJECTED",
    label: "Rejetés",
    description: "Signalements rejetés",
  },
];

export function getReportManagementTabDescription(status: ReportManagementTabStatus): string {
  return REPORT_MANAGEMENT_TABS.find((t) => t.value === status)?.description ?? "";
}

const STATUS_TRANSLATIONS: Record<ReportStatus, { label: string; badgeClass: string }> = {
  PENDING: {
    label: "En attente",
    badgeClass: "bg-amber-100 text-amber-900 ring-amber-200",
  },
  VALIDATED: {
    label: "À traiter",
    badgeClass: "bg-sky-100 text-sky-900 ring-sky-200",
  },
  IN_PROGRESS: {
    label: "À traiter",
    badgeClass: "bg-sky-100 text-sky-900 ring-sky-200",
  },
  RESOLVED: {
    label: "Résolu",
    badgeClass: "bg-emerald-100 text-emerald-900 ring-emerald-200",
  },
  REJECTED: {
    label: "Rejeté",
    badgeClass: "bg-red-100 text-red-900 ring-red-200",
  },
};

export function getReportStatusLabel(status: ReportStatus): string {
  return STATUS_TRANSLATIONS[status]?.label ?? status;
}

export function getReportStatusBadgeClass(status: ReportStatus): string {
  return STATUS_TRANSLATIONS[status]?.badgeClass ?? "bg-slate-100 text-slate-800 ring-slate-200";
}

export function isReportToProcessStatus(status: ReportStatus): boolean {
  return status === "VALIDATED" || status === "IN_PROGRESS";
}
