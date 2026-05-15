"use client";

import EcologicalImpactStats from "@/components/gamification/EcologicalImpactStats";
import BadgeProgressBar from "@/components/gamification/BadgeProgressBar";
import BadgeGrid from "@/components/gamification/BadgeGrid";
import MyBadgesPanel from "@/components/gamification/MyBadgesPanel";
import GamificationMotionStyles from "@/components/gamification/GamificationMotionStyles";
import {
  BadgeGridSkeleton,
  BadgeProgressSkeleton,
  EcologicalImpactStatsSkeleton,
  MyBadgesSkeleton,
} from "@/components/gamification/GamificationSkeletons";
import { useGamificationData } from "@/hooks/useGamificationData";
import { PAGE_DESCRIPTION_CLASS, PAGE_TITLE_CLASS } from "@/lib/ui/appChrome";

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
    <div className="grid gap-8">
      <GamificationMotionStyles />

      <header>
        <h1 className={PAGE_TITLE_CLASS}>Gamification</h1>
        <p className={PAGE_DESCRIPTION_CLASS}>Suis ton impact écologique et tes badges.</p>
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
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
    >
      {message}
    </div>
  );
}
