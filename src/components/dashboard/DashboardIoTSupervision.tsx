"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FastForward, Loader2, RotateCcw } from "lucide-react";
import type { Container as MapContainer } from "@/models/map";
import { getContainers } from "@/services/api/containers";
import { resetIotSensors, simulateIotTick } from "@/services/api/iot";
import { mapContainerToMapMarker } from "@/lib/containers/normalizeContainerFromApi";
import { parseBackendContainerStatus } from "@/lib/containers/backendContainerStatus";
import ReportToast from "@/components/reports/ReportToast";
import { notifyDashboardKpisRefresh } from "@/lib/dashboard/dashboardEvents";
import { SECTION_TITLE_CLASS } from "@/lib/ui/appChrome";

const IotSupervisionMap = dynamic(
  () => import("@/components/dashboard/IotSupervisionMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(52dvh,28rem)] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
        Chargement de la carte…
      </div>
    ),
  }
);

export default function DashboardIoTSupervision() {
  const [mapContainers, setMapContainers] = useState<MapContainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "neutral";
  } | null>(null);

  const loadData = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const rows = await getContainers();
      const markers = rows
        .map(mapContainerToMapMarker)
        .filter((c): c is MapContainer => c !== null);
      setMapContainers(markers);
    } catch (error) {
      setMapContainers([]);
      setLoadError(
        error instanceof Error ? error.message : "Impossible de charger la supervision."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const statusCounts = useMemo(() => {
    const tally = { OK: 0, WARNING: 0, CRITICAL: 0, MAINTENANCE: 0 };
    for (const c of mapContainers) {
      const status = parseBackendContainerStatus(c.operationalStatus);
      tally[status] += 1;
    }
    return tally;
  }, [mapContainers]);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      await simulateIotTick();
      setToast({ message: "Simulation réussie", variant: "success" });
      await loadData();
      notifyDashboardKpisRefresh();
    } catch (error) {
      setToast({
        message:
          error instanceof Error ? error.message : "Échec de la simulation IoT.",
        variant: "neutral",
      });
    } finally {
      setSimulating(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      const result = await resetIotSensors();
      setToast({ message: result.message, variant: "success" });
      await loadData();
      notifyDashboardKpisRefresh();
    } catch (error) {
      setToast({
        message:
          error instanceof Error ? error.message : "Impossible de remettre les capteurs à zéro.",
        variant: "neutral",
      });
    } finally {
      setResetting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className={SECTION_TITLE_CLASS}>Supervision temps réel</h2>
          <p className="m-0 mt-1 text-sm text-slate-600">
            {loading
              ? "Actualisation des capteurs…"
              : `${mapContainers.length} conteneurs · ${statusCounts.OK} OK · ${statusCounts.WARNING} alerte · ${statusCounts.CRITICAL} critique`}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            type="button"
            disabled={simulating || resetting || loading}
            onClick={() => void handleSimulate()}
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {simulating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <FastForward className="h-4 w-4" aria-hidden />
            )}
            Simuler +15 min
          </button>
          <button
            type="button"
            disabled={simulating || resetting || loading}
            onClick={() => void handleReset()}
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {resetting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <RotateCcw className="h-4 w-4" aria-hidden />
            )}
            Remettre à 0
          </button>
        </div>
      </div>

      {loadError ? (
        <p className="m-0 mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {loadError}
        </p>
      ) : null}

      <IotSupervisionMap containers={mapContainers} loading={loading} />

      {toast ? (
        <ReportToast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      ) : null}
    </section>
  );
}
