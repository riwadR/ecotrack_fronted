import { useCallback, useEffect, useState } from "react";
import type { Container } from "@/models/map";
import type { Zone } from "@/models/map";
import { mapApiContainerForTourPlanning } from "@/lib/tours/mapContainerForTourPlanning";
import { mapApiZoneToMapZone } from "@/lib/map/mapDtoMappers";
import { getContainers } from "@/services/api/containers";
import { fetchZonesForMap } from "@/services/api/mapDataSource";

export type UseTourPlanningMapDataResult = {
  containers: Container[];
  zones: Zone[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useTourPlanningMapData(enabled: boolean): UseTourPlanningMapDataResult {
  const [containers, setContainers] = useState<Container[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [apiContainers, rawZones] = await Promise.all([
        getContainers(),
        fetchZonesForMap(),
      ]);
      setContainers(
        apiContainers
          .map(mapApiContainerForTourPlanning)
          .filter((row): row is Container => row !== null)
      );
      setZones(rawZones.map(mapApiZoneToMapZone).filter((z): z is Zone => z !== null));
    } catch (err) {
      setContainers([]);
      setZones([]);
      setError(err instanceof Error ? err.message : "Impossible de charger la carte.");
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  return { containers, zones, isLoading, error, refetch: load };
}
