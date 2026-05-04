import { CreateZonePayload, Zone } from "@/models/zone";

const API_URL = "/api/backend";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "Une erreur est survenue.";

    try {
      const errorData = await response.json();
      message = errorData?.message || message;
    } catch {
      //
    }

    throw new Error(message);
  }

  return response.json();
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
  const response = await fetch(`${API_URL}/zones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<Zone>(response);
}

export async function deleteZone(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/zones/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let message = "Impossible de supprimer la zone.";

    try {
      const errorData = await response.json();
      message = errorData?.message || message;
    } catch {
      //
    }

    throw new Error(message);
  }
}