import { backendApiClient } from "@/lib/api/apiClient";
import { toApiError } from "@/lib/api/apiErrors";

/**
 * Raw container row as returned by GET /api/containers (Jackson field names).
 */
export type ContainerApiRecord = {
  id: string;
  serialNumber?: string | null;
  type?: string | null;
  status?: string | null;
  fillLevel?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  zoneName?: string | null;
  lastSensorUpdate?: string | (number | string)[] | null;
};

/**
 * Raw zone row as returned by GET /api/zones.
 * Prefer `coordinates` when the backend adds it; otherwise `wktPolygon` is parsed client-side.
 */
export type ZoneApiRecord = {
  id: string;
  name: string;
  description?: string | null;
  wktPolygon?: string | null;
  /** Optional future shape: rings of [lat, lng] or [lng, lat] — mapper normalizes to Leaflet [lat, lng]. */
  coordinates?: number[][] | null;
};

export async function fetchContainersForMap(): Promise<ContainerApiRecord[]> {
  try {
    const { data } =
      await backendApiClient.get<ContainerApiRecord[]>("containers");
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible de charger les conteneurs pour la carte.");
  }
}

export async function fetchZonesForMap(): Promise<ZoneApiRecord[]> {
  try {
    const { data } = await backendApiClient.get<ZoneApiRecord[]>("zones");
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible de charger les zones pour la carte.");
  }
}
