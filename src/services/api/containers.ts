import {
  Container,
  CreateContainerPayload,
  IoTPayload,
} from "@/models/container";

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

export async function getContainers(): Promise<Container[]> {
  const response = await fetch(`${API_URL}/containers`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  return handleResponse<Container[]>(response);
}

export async function getContainerById(id: string): Promise<Container> {
  const response = await fetch(`${API_URL}/containers/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  return handleResponse<Container>(response);
}

export async function createContainer(
  payload: CreateContainerPayload
): Promise<Container> {
  const response = await fetch(`${API_URL}/containers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<Container>(response);
}

export async function deleteContainer(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/containers/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let message = "Impossible de supprimer le container.";
    try {
      const errorData = await response.json();
      message = errorData?.message || message;
    } catch {
      //
    }
    throw new Error(message);
  }
}

export async function sendIoTPayload(payload: IoTPayload): Promise<{
  success: boolean;
  message?: string;
}> {
  const response = await fetch(`${API_URL}/containers/iot/payload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<{ success: boolean; message?: string }>(response);
}