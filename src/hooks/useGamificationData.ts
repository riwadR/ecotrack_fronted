"use client";

import { useCallback, useEffect, useState } from "react";
import type { Badge, GamificationProfile } from "@/models/gamification";
import { resolveBadgeCatalog } from "@/lib/gamification/badgeCatalog";
import {
  fetchBadgeCatalog,
  fetchGamificationProfile,
} from "@/services/api/gamification";

type GamificationDataState = {
  profile: GamificationProfile | null;
  catalog: Badge[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

export function useGamificationData(): GamificationDataState {
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [catalog, setCatalog] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [profileResult, catalogResult] = await Promise.allSettled([
        fetchGamificationProfile(),
        fetchBadgeCatalog(),
      ]);

      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value);
      } else {
        setProfile(null);
        setError(
          profileResult.reason instanceof Error
            ? profileResult.reason.message
            : "Impossible de charger ton profil de gamification."
        );
      }

      if (catalogResult.status === "fulfilled") {
        setCatalog(resolveBadgeCatalog(catalogResult.value));
      } else {
        setCatalog([]);
      }
    } catch (loadError) {
      setProfile(null);
      setCatalog(resolveBadgeCatalog([]));
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Impossible de charger la gamification."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    profile,
    catalog,
    loading,
    error,
    reload: load,
  };
}
