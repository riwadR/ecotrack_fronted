"use client";

import EcologicalImpactStats from "@/components/gamification/EcologicalImpactStats";
import BadgeProgressBar from "@/components/gamification/BadgeProgressBar";
import BadgeGrid from "@/components/gamification/BadgeGrid";
import MyBadgesPanel from "@/components/gamification/MyBadgesPanel";
import {
  BadgeGridSkeleton,
  BadgeProgressSkeleton,
  EcologicalImpactStatsSkeleton,
  MyBadgesSkeleton,
} from "@/components/gamification/GamificationSkeletons";
import { gamificationTheme } from "@/components/gamification/gamificationTheme";
import { useGamificationData } from "@/hooks/useGamificationData";
import { BadgeTooltipStyles } from "@/components/gamification/BadgeTooltip";

export default function GamificationDashboard() {
  const {
    profile,
    catalog,
    loading: profileLoading,
    error: profileError,
  } = useGamificationData();

  const totalPoints = profile?.totalPoints ?? 0;
  const earnedBadges = profile?.earnedBadges ?? [];

  return (
    <div style={{ display: "grid", gap: "28px" }}>
      <GamificationMotionStyles />
      <BadgeTooltipStyles />

      <header>
        <h1 style={{ margin: "0 0 4px", color: gamificationTheme.text }}>
          Gamification
        </h1>
        <p style={{ margin: 0, color: gamificationTheme.muted }}>
          Suis ton impact écologique et tes badges.
        </p>
      </header>

      {profileError ? (
        <ErrorBanner message={profileError} />
      ) : profileLoading ? (
        <EcologicalImpactStatsSkeleton />
      ) : (
        <EcologicalImpactStats
          totalPoints={totalPoints}
          co2Saved={profile?.co2Saved}
        />
      )}

      {profileError ? null : profileLoading ? (
        <BadgeProgressSkeleton />
      ) : (
        <BadgeProgressBar totalPoints={totalPoints} catalog={catalog} />
      )}

      {profileError ? null : profileLoading ? (
        <MyBadgesSkeleton />
      ) : (
        <MyBadgesPanel earnedBadges={earnedBadges} catalog={catalog} />
      )}

      {profileError ? null : profileLoading ? (
        <BadgeGridSkeleton />
      ) : (
        <BadgeGrid
          catalog={catalog}
          earnedBadges={earnedBadges}
          totalPoints={totalPoints}
        />
      )}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      style={{
        background: "#fee2e2",
        color: "#b91c1c",
        borderRadius: gamificationTheme.radiusSm,
        padding: "12px 14px",
        fontWeight: 600,
      }}
    >
      {message}
    </div>
  );
}

function GamificationMotionStyles() {
  return (
    <style>{`
      @keyframes gamification-shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      @keyframes gamification-fade-in-keyframes {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .gamification-fade-in {
        opacity: 0;
        animation: gamification-fade-in-keyframes 0.45s ease forwards;
      }

      .gamification-progress-fill {
        transform-origin: left center;
      }
    `}</style>
  );
}
