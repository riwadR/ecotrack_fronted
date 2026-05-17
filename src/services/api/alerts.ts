import { backendApiClient } from "@/lib/api/apiClient";
import { toApiError } from "@/lib/api/apiErrors";
import { buildDateRangeParams, type DateRangeQueryInput } from "@/lib/api/dateRangeParams";

export type AlertStatus = "ACTIVE" | "RESOLVED";

export type AlertListItem = {
  id: string;
  type: "CAPACITY_WARNING" | "CAPACITY_CRITICAL";
  status: AlertStatus;
  description: string;
  createdAt: string;
  resolvedAt?: string | null;
  containerId: string;
  containerSerialNumber: string;
  zoneName?: string | null;
  severity: "warning" | "critical";
};

export type ListAlertsParams = {
  dateRange?: DateRangeQueryInput;
  status?: AlertStatus;
};

export async function getAlerts(params?: ListAlertsParams): Promise<AlertListItem[]> {
  try {
    const { data } = await backendApiClient.get<AlertListItem[]>("alerts", {
      params: {
        ...buildDateRangeParams(params?.dateRange),
        status: params?.status,
      },
    });
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible de charger les alertes.");
  }
}

export async function resolveAlert(alertId: string): Promise<AlertListItem> {
  try {
    const { data } = await backendApiClient.patch<AlertListItem>(
      `alerts/${encodeURIComponent(alertId)}/resolve`
    );
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible de résoudre l'alerte.");
  }
}
