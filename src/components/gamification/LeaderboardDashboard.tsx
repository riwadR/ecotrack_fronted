"use client";

import LeaderboardPanel from "@/components/gamification/LeaderboardPanel";
import { LeaderboardSkeleton } from "@/components/gamification/GamificationSkeletons";
import { gamificationTheme } from "@/components/gamification/gamificationTheme";
import { useLeaderboard } from "@/hooks/useLeaderboard";

export default function LeaderboardDashboard() {
  const { entries, loading, error } = useLeaderboard();

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <header>
        <h1 style={{ margin: "0 0 4px", color: gamificationTheme.text }}>
          Classement
        </h1>
        <p style={{ margin: 0, color: gamificationTheme.muted }}>
          Les citoyens les plus engagés classés par points et impact CO2.
        </p>
      </header>

      {error ? (
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
