import { Threshold, UpdateThresholdPayload } from "@/models/threshold";
import { WasteType } from "@/models/container";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

export async function getThresholds(): Promise<Threshold[]> {
  const response = await fetch(`${API_URL}/thresholds`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  return handleResponse<Threshold[]>(response);
}

export async function updateThreshold(
  type: WasteType,
  payload: UpdateThresholdPayload
): Promise<Threshold> {
  const response = await fetch(`${API_URL}/thresholds/${type}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<Threshold>(response);
}