import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { handleSessionExpired } from "@/lib/api/authSession";

export type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type QueueEntry = {
  resolve: () => void;
  reject: (reason?: unknown) => void;
};

const REFRESH_PATH = "/api/auth/refresh";

/** Axios instance without response interceptors (prevents refresh loops). */
const refreshClient = axios.create({
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue: QueueEntry[] = [];

function processQueue(error: Error | null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
}

function isRefreshRequest(config: RetryableRequestConfig | undefined): boolean {
  if (!config?.url) return false;
  return config.url.includes(REFRESH_PATH);
}

export async function runSilentRefresh(): Promise<void> {
  await refreshClient.post(REFRESH_PATH);
}

export function shouldAttemptSilentRefresh(
  error: AxiosError,
  config: RetryableRequestConfig | undefined
): boolean {
  if (error.response?.status !== 401) return false;
  if (!config) return false;
  if (config._retry) return false;
  if (isRefreshRequest(config)) return false;
  return true;
}

/**
 * Queues concurrent 401s behind a single refresh, then replays the original request.
 */
export async function handleUnauthorizedAndRetry<T>(
  error: AxiosError,
  originalConfig: RetryableRequestConfig,
  replay: (config: RetryableRequestConfig) => Promise<T>
): Promise<T> {
  if (isRefreshing) {
    return new Promise<T>((resolve, reject) => {
      failedQueue.push({
        resolve: () => {
          replay({ ...originalConfig, _retry: true }).then(resolve).catch(reject);
        },
        reject,
      });
    });
  }

  originalConfig._retry = true;
  isRefreshing = true;

  try {
    await runSilentRefresh();
    processQueue(null);
    return replay(originalConfig);
  } catch (refreshError) {
    const err =
      refreshError instanceof Error
        ? refreshError
        : new Error("Token refresh failed");
    processQueue(err);
    await handleSessionExpired();
    return Promise.reject(refreshError);
  } finally {
    isRefreshing = false;
  }
}
