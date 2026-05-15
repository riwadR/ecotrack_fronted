import { isAxiosError } from "axios";
import { AUTH_UI_MESSAGES } from "@/lib/api/authSession";

type ErrorBody = {
  message?: string;
};

/**
 * Maps an Axios (or unknown) failure to a French user-facing message when appropriate.
 */
export function extractApiErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  if (isAxiosError(error)) {
    if (error.response?.status === 401) {
      return AUTH_UI_MESSAGES.sessionExpired;
    }

    const data = error.response?.data;
    if (typeof data === "string" && data.trim()) {
      return data;
    }
    if (typeof data === "object" && data !== null) {
      const body = data as ErrorBody;
      if (typeof body.message === "string" && body.message.trim()) {
        return body.message;
      }
      const firstString = Object.values(data).find((v) => typeof v === "string");
      if (typeof firstString === "string" && firstString.trim()) {
        return firstString;
      }
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

export function toApiError(error: unknown, fallbackMessage: string): Error {
  return new Error(extractApiErrorMessage(error, fallbackMessage));
}
