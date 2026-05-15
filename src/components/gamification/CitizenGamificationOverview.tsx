"use client";

import Link from "next/link";
import EcologicalImpactStats from "@/components/gamification/EcologicalImpactStats";
import BadgeProgressBar from "@/components/gamification/BadgeProgressBar";
import {
  BadgeProgressSkeleton,
  EcologicalImpactStatsSkeleton,
} from "@/components/gamification/GamificationSkeletons";
import { gamificationTheme } from "@/components/gamification/gamificationTheme";
import { useGamificationData } from "@/hooks/useGamificationData";

export default function CitizenGamificationOverview() {
  const { profile, catalog, loading, error } = useGamificationData();
  const totalPoints = profile?.totalPoints ?? 0;

  return (
    <section
      style={{
        background: gamificationTheme.cardBackground,
        borderRadius: gamificationTheme.radiusLg,
        padding: "24px",
        boxShadow: gamificationTheme.shadow,
        border: `1px solid ${gamificationTheme.border}`,
        display: "grid",
        gap: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: gamificationTheme.title }}>
            Ton parcours écologique
          </h2>
          <p style={{ margin: "6px 0 0", color: gamificationTheme.muted }}>
            Consulte tes points et ton prochain badge.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Link
            href="/dashboard/gamification"
            style={{
              textDecoration: "none",
              background: gamificationTheme.accent,
              color: "#fff",
              borderRadius: gamificationTheme.radiusSm,
              padding: "10px 14px",
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            Voir la gamification
          </Link>
          <Link
            href="/dashboard/classement"
            style={{
              textDecoration: "none",
              background: "#fff",
              color: gamificationTheme.accentDeep,
              border: `1px solid ${gamificationTheme.border}`,
              borderRadius: gamificationTheme.radiusSm,
              padding: "10px 14px",
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            Voir le classement
          </Link>
        </div>
      </div>

      {error ? (
        <p style={{ margin: 0, color: "#b91c1c", fontWeight: 600 }}>{error}</p>
      ) : loading ? (
        <>
          <EcologicalImpactStatsSkeleton />
          <BadgeProgressSkeleton />
        </>
      ) : (
        <>
          <EcologicalImpactStats
            totalPoints={totalPoints}
            co2Saved={profile?.co2Saved}
          />
          <BadgeProgressBar totalPoints={totalPoints} catalog={catalog} />
        </>
      )}
    </section>
  );
}
