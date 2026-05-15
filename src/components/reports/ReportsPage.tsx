"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Container, Zone } from "@/models/map";
import type { Role } from "@/models/user";
import { mapApiZoneToMapZone } from "@/lib/map/mapDtoMappers";
import { mapApiContainerToReportMapContainer } from "@/lib/reports/reportContainerMapper";
import { CITIZEN_ZONE_PATH_OPTIONS } from "@/components/map/InteractiveMap";
import { fetchZonesForMap } from "@/services/api/mapDataSource";
import { getContainers } from "@/services/api/containers";
import { createReport } from "@/services/api/reports";
import { usePeriodicRefresh } from "@/hooks/usePeriodicRefresh";
import ContainerSearchCombobox from "@/components/reports/ContainerSearchCombobox";

const MAP_CONTAINERS_REFRESH_MS = 15_000;
import ContainerDetailsDrawer from "@/components/reports/ContainerDetailsDrawer";
import ReportFormModal from "@/components/reports/ReportFormModal";
import CitizenReportSuccessModal from "@/components/reports/CitizenReportSuccessModal";
import ReportToast from "@/components/reports/ReportToast";

const InteractiveMap = dynamic(() => import("@/components/map/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-[min(70vh,560px)] w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600"
      role="status"
    >
      Chargement de la carte…
    </div>
  ),
});

export type ReportsPageProps = {
  viewerRole: Role;
};

function normalizeSearchTerm(value: string): string {
  return value.trim().toLowerCase();
}

function containerMatchesSearch(container: Container, term: string): boolean {
  if (!term) {
    return true;
  }
  const serial = (container.serialNumber ?? container.id).toLowerCase();
  const zone = (container.zoneName ?? "").toLowerCase();
  return serial.includes(term) || zone.includes(term);
}

/**
 * Signalements page: map selection, search fallback, and report submission flow.
 */
export default function ReportsPage({ viewerRole }: ReportsPageProps) {
  const [containers, setContainers] = useState<Container[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const showCitizenMapFeatures = viewerRole === "CITIZEN";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [citizenSuccessOpen, setCitizenSuccessOpen] = useState(false);
  const [agentToastMessage, setAgentToastMessage] = useState<string | null>(null);

  const loadMapData = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoadError(null);
      setIsLoading(true);
    }
    try {
      if (options?.silent) {
        const rows = await getContainers();
        const mapped = rows
          .map(mapApiContainerToReportMapContainer)
          .filter((c): c is Container => c !== null);
        setContainers(mapped);
        return;
      }

      const [rows, rawZones] = await Promise.all([getContainers(), fetchZonesForMap()]);
      const mapped = rows
        .map(mapApiContainerToReportMapContainer)
        .filter((c): c is Container => c !== null);
      const mappedZones = rawZones.map(mapApiZoneToMapZone).filter((z): z is Zone => z !== null);
      setContainers(mapped);
      setZones(mappedZones);
    } catch (err) {
      if (!options?.silent) {
        setContainers([]);
        setZones([]);
        setLoadError(err instanceof Error ? err.message : "Impossible de charger les conteneurs.");
      }
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  }, []);

  const silentRefresh = useCallback(() => loadMapData({ silent: true }), [loadMapData]);

  useEffect(() => {
    void loadMapData();
  }, [loadMapData]);

  usePeriodicRefresh(silentRefresh, { intervalMs: MAP_CONTAINERS_REFRESH_MS });

  const normalizedSearch = normalizeSearchTerm(searchTerm);

  const filteredContainers = useMemo(
    () => containers.filter((c) => containerMatchesSearch(c, normalizedSearch)),
    [containers, normalizedSearch]
  );

  const activeSelectedContainer = useMemo(() => {
    if (!selectedContainer) {
      return null;
    }
    return containers.find((c) => c.id === selectedContainer.id) ?? selectedContainer;
  }, [containers, selectedContainer]);

  const openContainerDetails = useCallback((container: Container) => {
    setSelectedContainer(container);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const openReportForm = useCallback((containerId: string) => {
    const target = containers.find((c) => c.id === containerId) ?? selectedContainer;
    if (target) {
      setSelectedContainer(target);
    }
    setIsDrawerOpen(false);
    setSubmitError(null);
    setIsFormOpen(true);
  }, [containers, selectedContainer]);

  const closeReportForm = useCallback(() => {
    if (isSubmitting) {
      return;
    }
    setIsFormOpen(false);
    setSubmitError(null);
  }, [isSubmitting]);

  const handleReportSuccess = useCallback(() => {
    setIsFormOpen(false);
    setSubmitError(null);
    setSelectedContainer(null);
    setIsDrawerOpen(false);

    if (viewerRole === "CITIZEN") {
      setCitizenSuccessOpen(true);
    } else {
      setAgentToastMessage("Signalement enregistré avec succès.");
    }
  }, [viewerRole]);

  const handleReportSubmit = useCallback(
    async (payload: {
      containerId: string;
      type: import("@/models/report").ReportType;
      comment: string;
      photoUrl: string;
    }) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await createReport(payload);
        handleReportSuccess();
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Échec de l'envoi du signalement.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [handleReportSuccess]
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Carte & Signalements</h1>
        <p className="text-sm text-slate-600">
          Consultez les secteurs, sélectionnez un conteneur sur la carte ou via la recherche, puis
          décrivez le problème constaté sur le terrain.
        </p>
      </header>

      {loadError ? (
        <div
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          <p className="m-0 font-medium">{loadError}</p>
          <button
            type="button"
            className="self-start rounded-md bg-red-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800"
            onClick={() => void loadMapData()}
          >
            Réessayer
          </button>
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <ContainerSearchCombobox
          containers={containers}
          value={searchTerm}
          onChange={setSearchTerm}
          selectedContainerId={selectedContainer?.id ?? null}
          onSelect={openContainerDetails}
        />

        <section className="mt-4">
          {isLoading ? (
            <div
              className="flex h-[min(70vh,560px)] w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600"
              role="status"
            >
              Chargement des conteneurs…
            </div>
          ) : (
            <InteractiveMap
              containers={filteredContainers}
              zones={zones}
              viewerRole={viewerRole}
              showZones
              zonePathOptions={showCitizenMapFeatures ? CITIZEN_ZONE_PATH_OPTIONS : undefined}
              selectedContainerId={selectedContainer?.id ?? null}
              onContainerSelect={openContainerDetails}
              onReportIssue={openReportForm}
            />
          )}
        </section>
      </section>

      {isDrawerOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[999] bg-slate-900/30"
            aria-label="Fermer le panneau"
            onClick={closeDrawer}
          />
          <ContainerDetailsDrawer
            container={activeSelectedContainer}
            onClose={closeDrawer}
            onReport={openReportForm}
          />
        </>
      ) : null}

      <ReportFormModal
        key={activeSelectedContainer?.id ?? "report-form"}
        isOpen={isFormOpen}
        container={activeSelectedContainer}
        isSubmitting={isSubmitting}
        submitError={submitError}
        onClose={closeReportForm}
        onSubmit={handleReportSubmit}
      />

      <CitizenReportSuccessModal
        isOpen={citizenSuccessOpen}
        onClose={() => setCitizenSuccessOpen(false)}
      />

      {agentToastMessage ? (
        <ReportToast
          message={agentToastMessage}
          onDismiss={() => setAgentToastMessage(null)}
        />
      ) : null}
    </div>
  );
}
