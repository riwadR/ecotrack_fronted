import { isAxiosError } from "axios";
import { backendApiClient } from "@/lib/api/apiClient";
import { toApiError } from "@/lib/api/apiErrors";
import { DUPLICATE_REPORT_ERROR_MESSAGE } from "@/lib/reports/reportTypeLabels";
import type { CreateReportPayload, ReportResponse } from "@/models/report";

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
