"use client";

import { useEffect } from "react";

type UsePeriodicRefreshOptions = {
  intervalMs?: number;
  enabled?: boolean;
};

/**
 * Runs callback on mount, on a fixed interval, and when the tab becomes visible again.
 */
export function usePeriodicRefresh(
  callback: () => void | Promise<void>,
  { intervalMs = 30_000, enabled = true }: UsePeriodicRefreshOptions = {}
) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const run = () => {
      void callback();
    };

    run();

    const timer = window.setInterval(run, intervalMs);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        run();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [callback, intervalMs, enabled]);
}
