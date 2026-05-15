import { isAxiosError } from "axios";
import { backendApiClient } from "@/lib/api/apiClient";
import { toApiError } from "@/lib/api/apiErrors";
import { DUPLICATE_REPORT_ERROR_MESSAGE } from "@/lib/reports/reportTypeLabels";
import type {
  CreateReportPayload,
  ReportListItem,
  ReportManagementTabStatus,
  ReportResponse,
  UpdateReportStatusPayload,
} from "@/models/report";

export async function createReport(
  payload: CreateReportPayload
): Promise<ReportResponse> {
  try {
    const { data } = await backendApiClient.post<ReportResponse>(
      "reports",
      payload
    );
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 409) {
      throw toApiError(error, DUPLICATE_REPORT_ERROR_MESSAGE);
    }
    throw toApiError(error, "Impossible d'envoyer le signalement.");
  }
}

export async function getReports(
  status?: ReportManagementTabStatus
): Promise<ReportListItem[]> {
  try {
    const { data } = await backendApiClient.get<ReportListItem[]>("reports", {
      params: status ? { status } : undefined,
    });
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible de charger les signalements.");
  }
}

export async function updateReportStatus(
  reportId: string,
  payload: UpdateReportStatusPayload
): Promise<ReportListItem> {
  try {
    const { data } = await backendApiClient.patch<ReportListItem>(
      `reports/${encodeURIComponent(reportId)}/status`,
      payload
    );
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible de mettre à jour le signalement.");
  }
}
