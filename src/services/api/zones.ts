import {
  CreateZonePayload,
  PatchZoneDetailsPayload,
  UpdateZonePayload,
  Zone,
} from "@/models/zone";

const API_URL = "/api/backend";

async function handleResponse<T>(response: Response): Promise<T> {
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
      } else if (typeof errorData === "object" && errorData !== null) {
        const firstString = Object.values(errorData).find((v) => typeof v === "string");
        if (typeof firstString === "string") {
          message = firstString;
        }
      }
    } catch {
      //
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function getZones(): Promise<Zone[]> {
  const response = await fetch(`${API_URL}/zones`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  return handleResponse<Zone[]>(response);
}

export async function createZone(payload: CreateZonePayload): Promise<Zone> {
  const body: Record<string, string> = {
    name: payload.name,
    wktPolygon: payload.wktPolygon,
  };
  if (payload.description !== undefined) {
    body.description = payload.description;
  }

  const response = await fetch(`${API_URL}/zones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleResponse<Zone>(response);
}

export async function updateZone(id: string, payload: UpdateZonePayload): Promise<void> {
  const body: Record<string, string> = {
    name: payload.name,
    wktPolygon: payload.wktPolygon,
  };
  if (payload.description !== undefined) {
    body.description = payload.description ?? "";
  }

  const response = await fetch(`${API_URL}/zones/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let message = "Unable to update zone.";
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
}

export async function patchZoneDetails(id: string, payload: PatchZoneDetailsPayload): Promise<void> {
  const response = await fetch(`${API_URL}/zones/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Unable to update zone.";
    try {
      const errorData: unknown = await response.json();
      if (
        typeof errorData === "object" &&
        errorData !== null &&
        "message" in errorData &&
        typeof (errorData as { message: unknown }).message === "string"
      ) {
        message = (errorData as { message: string }).message;
      } else if (typeof errorData === "object" && errorData !== null) {
        const firstString = Object.values(errorData).find((v) => typeof v === "string");
        if (typeof firstString === "string") {
          message = firstString;
        }
      }
    } catch {
      //
    }
    throw new Error(message);
  }
}

export async function deleteZone(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/zones/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // DELETE returns 204 (no content). Some proxies may also normalize to 200 with an empty body.
  if (response.ok) {
    return;
  }

  let message = "Impossible de supprimer la zone.";
  try {
    const raw = await response.text();
    if (raw) {
      try {
        const errorData: unknown = JSON.parse(raw);
        if (
          typeof errorData === "object" &&
          errorData !== null &&
          "message" in errorData &&
          typeof (errorData as { message: unknown }).message === "string"
        ) {
          message = (errorData as { message: string }).message;
        } else if (typeof errorData === "object" && errorData !== null) {
          const firstString = Object.values(errorData).find((v) => typeof v === "string");
          if (typeof firstString === "string") {
            message = firstString;
          }
        }
      } catch {
        message = raw;
      }
    }
  } catch {
    //
  }

  throw new Error(message);
}
