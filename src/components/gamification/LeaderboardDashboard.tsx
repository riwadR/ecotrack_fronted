"use client";

import LeaderboardPanel from "@/components/gamification/LeaderboardPanel";
import GamificationMotionStyles from "@/components/gamification/GamificationMotionStyles";
import { LeaderboardSkeleton } from "@/components/gamification/GamificationSkeletons";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { PAGE_DESCRIPTION_CLASS, PAGE_TITLE_CLASS } from "@/lib/ui/appChrome";

export default function LeaderboardDashboard() {
  const { entries, loading, error } = useLeaderboard();

  return (
    <div className="grid gap-8">
      <GamificationMotionStyles />

      <header>
        <h1 className={PAGE_TITLE_CLASS}>Classement</h1>
        <p className={PAGE_DESCRIPTION_CLASS}>
          Les citoyens les plus engagés classés par points et impact CO₂.
        </p>
      </header>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
        >
          {error}
        </div>
      ) : loading ? (
        <LeaderboardSkeleton />
      ) : (
        <LeaderboardPanel entries={entries} />
      )}
    </div>
  );
}
