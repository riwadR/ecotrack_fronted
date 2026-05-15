import { useCallback, useEffect, useMemo, useState } from "react";
import type { Role } from "@/models/user";
import type { Container, Zone } from "@/models/map";
import {
  fetchContainersForMap,
  fetchZonesForMap,
} from "@/services/api/mapDataSource";
import { mapApiContainerToMapContainer, mapApiZoneToMapZone } from "@/lib/map/mapDtoMappers";
import { usePeriodicRefresh } from "@/hooks/usePeriodicRefresh";

const MAP_CONTAINERS_REFRESH_MS = 15_000;

export type AgentRouteStructure = {
  /** Ordered stop coordinates for the assigned daily tour (future GET /tours/...). */
  orderedStopCoordinates: [number, number][];
  /** 1-based stage indices aligned with `orderedStopCoordinates`. */
  stageNumbers: number[];
};

export type CitizenMapAugment = {
  /**
   * Placeholder for collection schedule rows (opening hours, frequencies, etc.).
   * Will be populated when the citizen schedules API exists.
   */
  collectionSchedules: readonly Record<string, never>[];
};

export type UseMapDataResult = {
  containers: Container[];
  zones: Zone[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  /** When true, map markers/zones should eventually be driven by tour APIs instead of bulk lists. */
  isAgentRouteMode: boolean;
  /** Empty scaffold until the tour service is wired; consumers may draw a polyline + numbered stops later. */
  agentRouteStructure: AgentRouteStructure;
  /** Citizen-only extension points (nearby filter + schedules) — not backed by HTTP yet. */
  citizenAugments: CitizenMapAugment;
};

function emptyAgentRoute(): AgentRouteStructure {
  return { orderedStopCoordinates: [], stageNumbers: [] };
}

function emptyCitizenAugments(): CitizenMapAugment {
  return { collectionSchedules: [] };
}

/**
 * Loads map entities from the backend with role-aware composition rules.
 */
export function useMapData(viewerRole: Role): UseMapDataResult {
  const [containers, setContainers] = useState<Container[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAgentRouteMode = viewerRole === "AGENT";

  const citizenAugments = useMemo(() => emptyCitizenAugments(), []);
  const agentRouteStructure = useMemo(() => emptyAgentRoute(), []);

  const canLoadOperationalMap = viewerRole === "ADMIN" || viewerRole === "MANAGER";

  const load = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setError(null);
        setIsLoading(true);
      }

      try {
        if (!canLoadOperationalMap) {
          if (!options?.silent) {
            setContainers([]);
            setZones([]);
          }
          return;
        }

        if (options?.silent) {
          const rawContainers = await fetchContainersForMap();
          const mappedContainers = rawContainers
            .map(mapApiContainerToMapContainer)
            .filter((c): c is Container => c !== null);
          setContainers(mappedContainers);
          return;
        }

        const [rawContainers, rawZones] = await Promise.all([
          fetchContainersForMap(),
          fetchZonesForMap(),
        ]);
        const mappedContainers = rawContainers
          .map(mapApiContainerToMapContainer)
          .filter((c): c is Container => c !== null);
        const mappedZones = rawZones.map(mapApiZoneToMapZone).filter((z): z is Zone => z !== null);
        setContainers(mappedContainers);
        setZones(mappedZones);
      } catch (err) {
        if (!options?.silent) {
          setContainers([]);
          setZones([]);
          setError(err instanceof Error ? err.message : "Failed to load map data.");
        }
      } finally {
        if (!options?.silent) {
          setIsLoading(false);
        }
      }
    },
    [canLoadOperationalMap]
  );

  const silentRefresh = useCallback(() => load({ silent: true }), [load]);

  useEffect(() => {
    void load();
  }, [load]);

  usePeriodicRefresh(silentRefresh, {
    intervalMs: MAP_CONTAINERS_REFRESH_MS,
    enabled: canLoadOperationalMap,
  });

  return {
    containers,
    zones,
    isLoading,
    error,
    refetch: () => load(),
    isAgentRouteMode,
    agentRouteStructure,
    citizenAugments,
  };
}
