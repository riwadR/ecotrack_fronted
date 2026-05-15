"use client";

import { useCallback, useEffect, useState } from "react";
import type { LeaderboardEntry } from "@/models/gamification";
import { fetchLeaderboard } from "@/services/api/gamification";

type LeaderboardState = {
  entries: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

export function useLeaderboard(): LeaderboardState {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const leaderboard = await fetchLeaderboard();
      setEntries(leaderboard);
    } catch (loadError) {
      setEntries([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Impossible de charger le classement."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    entries,
    loading,
    error,
    reload: load,
  };
}
