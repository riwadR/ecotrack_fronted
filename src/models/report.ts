/**
 * Mirrors backend `com.ingetis.ecotrack.entity.enums.report.ReportType`.
 * Keep values in sync with the Java enum.
 */
export const REPORT_TYPE_VALUES = [
  "FULL_CONTAINER",
  "DAMAGED_CONTAINER",
  "ACCESS_BLOCKED",
  "VANDALISM",
  "OTHER",
] as const;

export type ReportType = (typeof REPORT_TYPE_VALUES)[number];

export function isReportType(value: string): value is ReportType {
  return (REPORT_TYPE_VALUES as readonly string[]).includes(value);
}

export type CreateReportPayload = {
  containerId: string;
  type: ReportType;
  comment: string;
  photoUrl: string;
};

/** Mirrors backend `ReportStatus` enum (management dashboard). */
export const REPORT_STATUS_VALUES = [
  "PENDING",
  "VALIDATED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
] as const;

export type ReportStatus = (typeof REPORT_STATUS_VALUES)[number];

/** Statuses exposed in management tabs. */
export type ReportManagementTabStatus =
  | "PENDING"
  | "VALIDATED"
  | "RESOLVED"
  | "REJECTED";

export type ReportUpdateStatus =
  | "VALIDATED"
  | "REJECTED"
  | "RESOLVED"
  | "PENDING";

export type ReportListItem = {
  id: string;
  type: ReportType;
  status: ReportStatus;
  latitude?: number | null;
  longitude?: number | null;
  photoUrl?: string | null;
  comment?: string | null;
  createdAt?: string;
  reporterId?: string;
  reporterUsername?: string;
  /** Admin/agent verification fields */
  reporterFirstName?: string;
  reporterLastName?: string;
  reporterEmail?: string;
  containerId?: string;
  containerSerialNumber?: string;
  containerZoneName?: string;
};

export type ReportResponse = ReportListItem;

export type UpdateReportStatusPayload = {
  status: ReportUpdateStatus;
};
