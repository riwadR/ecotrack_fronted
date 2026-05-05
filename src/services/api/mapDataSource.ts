const API_URL = "/api/backend";

async function handleJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "Request failed.";
    try {
      const errorData: unknown = await response.json();
      if (
        typeof errorData === "object" &&
        errorData !== null &&
        "message" in errorData &&
        typeof (errorData as { message: unknown }).message === "string"
      ) {
        message = (errorData as { message: string }).message;
      }
    } catch {
      //
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

/**
 * Raw container row as returned by GET /api/containers (Jackson field names).
 */
export type ContainerApiRecord = {
  id: string;
  fillLevel?: number | null;
  latitude?: number | null;
  longitude?: number | null;
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
  const response = await fetch(`${API_URL}/containers`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  return handleJsonResponse<ContainerApiRecord[]>(response);
}

export async function fetchZonesForMap(): Promise<ZoneApiRecord[]> {
  const response = await fetch(`${API_URL}/zones`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  return handleJsonResponse<ZoneApiRecord[]>(response);
}
