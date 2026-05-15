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

export type ReportResponse = {
  id: string;
  type: ReportType;
  status: string;
  containerId?: string;
  createdAt?: string;
};
