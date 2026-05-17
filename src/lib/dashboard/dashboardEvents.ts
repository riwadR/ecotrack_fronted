/** Dispatched after IoT simulation or reset so KPI tiles reload without a full page refresh. */
export const DASHBOARD_KPIS_REFRESH_EVENT = "ecotrack:dashboard-kpis-refresh";

export function notifyDashboardKpisRefresh(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(DASHBOARD_KPIS_REFRESH_EVENT));
}
