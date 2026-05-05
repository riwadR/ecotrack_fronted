import { useCallback, useEffect, useMemo, useState } from "react";
import type { Role } from "@/models/user";
import type { Container, Zone } from "@/models/map";
import {
  fetchContainersForMap,
  fetchZonesForMap,
} from "@/services/api/mapDataSource";
import { mapApiContainerToMapContainer, mapApiZoneToMapZone } from "@/lib/map/mapDtoMappers";

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

  const load = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    if (viewerRole === "AGENT") {
      setContainers([]);
      setZones([]);
      setIsLoading(false);
      return;
    }

    try {
      if (viewerRole === "ADMIN" || viewerRole === "MANAGER") {
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
      } else if (viewerRole === "CITIZEN") {
        const rawContainers = await fetchContainersForMap();
        const mappedContainers = rawContainers
          .map(mapApiContainerToMapContainer)
          .filter((c): c is Container => c !== null);
        setContainers(mappedContainers);
        setZones([]);
      } else {
        setContainers([]);
        setZones([]);
      }
    } catch (err) {
      setContainers([]);
      setZones([]);
      setError(err instanceof Error ? err.message : "Failed to load map data.");
    } finally {
      setIsLoading(false);
    }
  }, [viewerRole]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    containers,
    zones,
    isLoading,
    error,
    refetch: load,
    isAgentRouteMode,
    agentRouteStructure,
    citizenAugments,
  };
}
