import { isAxiosError } from "axios";
import { backendApiClient } from "@/lib/api/apiClient";
import { toApiError } from "@/lib/api/apiErrors";
import { DUPLICATE_REPORT_ERROR_MESSAGE } from "@/lib/reports/reportTypeLabels";
import type {
  CreateReportPayload,
  ReportListItem,
  ReportManagementTabStatus,
  ReportOrigin,
  ReportResponse,
  UpdateReportStatusPayload,
} from "@/models/report";
import { buildDateRangeParams, type DateRangeQueryInput } from "@/lib/api/dateRangeParams";
import {
  buildPdfExportFilename,
  parseContentDispositionFilename,
} from "@/lib/reports/pdfExportFilename";

export type CreateReportInput = {
  containerId: string;
  type: CreateReportPayload["type"];
  comment?: string;
  latitude?: number;
  longitude?: number;
  imageFile?: File | null;
};

export async function createReport(input: CreateReportInput): Promise<ReportResponse> {
  const formData = new FormData();
  const reportJson = JSON.stringify({
    containerId: input.containerId,
    type: input.type,
    comment: input.comment?.trim() || undefined,
    latitude: input.latitude,
    longitude: input.longitude,
  });
  formData.append(
    "report",
    new Blob([reportJson], { type: "application/json" })
  );
  if (input.imageFile) {
    formData.append("image", input.imageFile);
  }

  try {
    const { data } = await backendApiClient.post<ReportResponse>("reports", formData, {
      transformRequest: [
        (data, headers) => {
          if (data instanceof FormData) {
            delete headers["Content-Type"];
          }
          return data;
        },
      ],
    });
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 409) {
      throw toApiError(error, DUPLICATE_REPORT_ERROR_MESSAGE);
    }
    throw toApiError(error, "Impossible d'envoyer le signalement.");
  }
}

export type GetReportsParams = {
  status?: ReportManagementTabStatus;
  origin?: ReportOrigin;
  dateRange?: DateRangeQueryInput;
};

export async function getReports(params?: GetReportsParams): Promise<ReportListItem[]> {
  try {
    const { data } = await backendApiClient.get<ReportListItem[]>("reports", {
      params: {
        status: params?.status,
        origin: params?.origin,
        ...buildDateRangeParams(params?.dateRange),
      },
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

export type PdfExportResult = {
  blob: Blob;
  filename: string;
};

/**
 * Downloads the UC-G03 consolidated activity report as a PDF blob and resolved filename.
 */
export async function exportPdfReport(
  startDate?: string,
  endDate?: string
): Promise<PdfExportResult> {
  try {
    const params: Record<string, string> = {};
    if (startDate) {
      params.startDate = startDate;
    }
    if (endDate) {
      params.endDate = endDate;
    }

    const response = await backendApiClient.get<Blob>("reports/export-pdf", {
      params,
      responseType: "blob",
      headers: { Accept: "application/pdf" },
    });

    const headerFilename = parseContentDispositionFilename(
      response.headers["content-disposition"]
    );
    const filename =
      headerFilename ?? buildPdfExportFilename(startDate, endDate);

    return { blob: response.data, filename };
  } catch (error) {
    throw toApiError(error, "Impossible de générer le rapport PDF.");
  }
}
