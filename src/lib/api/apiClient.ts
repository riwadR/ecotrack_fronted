import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { applyCsrfHeader } from "@/lib/api/csrf";
import {
  handleUnauthorizedAndRetry,
  shouldAttemptSilentRefresh,
  type RetryableRequestConfig,
} from "@/lib/api/silentRefresh";
import { handleSessionExpired } from "@/lib/api/authSession";

/**
 * Relative base URL for the Next.js BFF (browser sends HttpOnly cookies via withCredentials).
 */
function resolveAppBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "");
  return configured ?? "";
}

function createAuthenticatedClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Access and refresh tokens live in HttpOnly cookies — never set Authorization here.
    const headers = applyCsrfHeader(
      (config.headers ?? {}) as Record<string, string>
    );
    Object.entries(headers).forEach(([key, value]) => {
      config.headers.set(key, value);
    });
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalConfig = error.config as RetryableRequestConfig | undefined;

      if (originalConfig?.url?.includes("/api/auth/refresh")) {
        await handleSessionExpired();
        return Promise.reject(error);
      }

      if (!shouldAttemptSilentRefresh(error, originalConfig)) {
        return Promise.reject(error);
      }

      return handleUnauthorizedAndRetry(error, originalConfig!, (config) =>
        client.request(config)
      );
    }
  );

  return client;
}

const appBase = resolveAppBaseUrl();

/**
 * Browser-only Axios client for same-origin Next.js API routes.
 * Use in Client Components and client-side services — not in Server Components.
 */
export const apiClient = createAuthenticatedClient(appBase);

/** BFF proxy to Spring Boot (`/api/backend/*`). Prefer this for domain API calls. */
export const backendApiClient = createAuthenticatedClient(`${appBase}/api/backend`);

export default apiClient;
