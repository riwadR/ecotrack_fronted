"use client";

import { useCallback, useEffect, useState } from "react";

type UseChallengeClockOptions = {
  /** Fallback tick interval when no boundary is scheduled. */
  intervalMs?: number;
};

/**
 * Provides a ticking "now" for challenge lifecycle UI, plus a manual tick for boundary sync.
 */
export function useChallengeClock({ intervalMs = 15_000 }: UseChallengeClockOptions = {}) {
  const [now, setNow] = useState(() => new Date());

  const tick = useCallback(() => {
    setNow(new Date());
  }, []);

  useEffect(() => {
    const timer = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs, tick]);

  return { now, tick };
}
