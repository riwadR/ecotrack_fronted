"use client";

import { useEffect, useRef } from "react";
import type { Challenge } from "@/lib/api/challenges";

const BOUNDARY_BUFFER_MS = 1_000;

type UseChallengeBoundaryWatchOptions = {
  challenges: Challenge[];
  onBoundary: () => void;
  enabled?: boolean;
};

/**
 * Schedules a callback when the next challenge start or end date is reached.
 */
export function useChallengeBoundaryWatch({
  challenges,
  onBoundary,
  enabled = true,
}: UseChallengeBoundaryWatchOptions) {
  const onBoundaryRef = useRef(onBoundary);
  onBoundaryRef.current = onBoundary;

  useEffect(() => {
    if (!enabled || challenges.length === 0) {
      return;
    }

    const currentTime = Date.now();
    let nextDelayMs = Number.POSITIVE_INFINITY;

    for (const challenge of challenges) {
      const startMs = new Date(challenge.startDate).getTime();
      const endMs = new Date(challenge.endDate).getTime();

      if (startMs > currentTime) {
        nextDelayMs = Math.min(nextDelayMs, startMs - currentTime);
      }
      if (endMs > currentTime) {
        nextDelayMs = Math.min(nextDelayMs, endMs - currentTime);
      }
    }

    if (!Number.isFinite(nextDelayMs)) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onBoundaryRef.current();
    }, nextDelayMs + BOUNDARY_BUFFER_MS);

    return () => window.clearTimeout(timeoutId);
  }, [challenges, enabled]);
}
