"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Challenge } from "@/lib/api/challenges";
import { getChallenges, joinChallenge } from "@/lib/api/challenges";
import {
  computeChallengeAdminStats,
  filterHistoryByStatsFilter,
  HISTORY_STATS_EMPTY_MESSAGES,
  isChallengeActiveOrUpcoming,
  isChallengeExpired,
  type HistoryStatsFilter,
  withResolvedOutcome,
} from "@/lib/challenges/challengeUtils";
import ChallengeAdminStatsCards from "@/components/challenges/ChallengeAdminStatsCards";
import ChallengeCard from "@/components/challenges/ChallengeCard";
import ChallengeDetailDrawer from "@/components/challenges/ChallengeDetailDrawer";
import ChallengeEmptyState from "@/components/challenges/ChallengeEmptyState";
import ChallengeGalleryTabs, {
  type ChallengeGalleryTabId,
} from "@/components/challenges/ChallengeGalleryTabs";
import { ChallengeGallerySkeleton } from "@/components/challenges/ChallengeSkeletons";
import ReportToast from "@/components/reports/ReportToast";
import GamificationMotionStyles from "@/components/gamification/GamificationMotionStyles";
import { useChallengeBoundaryWatch } from "@/hooks/useChallengeBoundaryWatch";
import { PAGE_DESCRIPTION_CLASS, PAGE_TITLE_CLASS } from "@/lib/ui/appChrome";
import { useChallengeClock } from "@/hooks/useChallengeClock";
import { usePeriodicRefresh } from "@/hooks/usePeriodicRefresh";

export default function ChallengesGalleryPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ChallengeGalleryTabId>("active");
  const [historyFilter, setHistoryFilter] = useState<HistoryStatsFilter>("total");
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const { now, tick } = useChallengeClock();

  const loadChallenges = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setIsLoading(true);
    }
    setLoadError(null);
    try {
      const data = await getChallenges();
      setChallenges(data);
    } catch (err) {
      if (!options?.silent) {
        setChallenges([]);
      }
      setLoadError(err instanceof Error ? err.message : "Impossible de charger les défis.");
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  }, []);

  const silentRefresh = useCallback(() => loadChallenges({ silent: true }), [loadChallenges]);

  useEffect(() => {
    void loadChallenges();
  }, [loadChallenges]);

  usePeriodicRefresh(silentRefresh, { intervalMs: 30_000 });

  const handleBoundary = useCallback(() => {
    tick();
    void silentRefresh();
  }, [tick, silentRefresh]);

  useChallengeBoundaryWatch({
    challenges,
    onBoundary: handleBoundary,
    enabled: challenges.length > 0,
  });

  const handleTabChange = useCallback((tab: ChallengeGalleryTabId) => {
    setActiveTab(tab);
    if (tab === "history") {
      setHistoryFilter("total");
    }
  }, []);

  const activeChallenges = useMemo(() => {
    return challenges
      .filter((challenge) =>
        isChallengeActiveOrUpcoming(challenge.startDate, challenge.endDate, now)
      )
      .map((challenge) => withResolvedOutcome(challenge, now));
  }, [challenges, now]);

  const historyChallenges = useMemo(() => {
    return challenges
      .filter(
        (challenge) =>
          isChallengeExpired(challenge.startDate, challenge.endDate, now) && challenge.hasJoined
      )
      .map((challenge) => withResolvedOutcome(challenge, now));
  }, [challenges, now]);

  const filteredHistoryChallenges = useMemo(
    () => filterHistoryByStatsFilter(historyChallenges, historyFilter, now),
    [historyChallenges, historyFilter, now]
  );

  const historyStats = useMemo(
    () => computeChallengeAdminStats(historyChallenges),
    [historyChallenges]
  );

  const handleJoin = useCallback(async (challengeId: string) => {
    await joinChallenge(challengeId);
    setChallenges((current) =>
      current.map((challenge) =>
        challenge.id === challengeId ? { ...challenge, hasJoined: true } : challenge
      )
    );
    setToastMessage("Vous avez rejoint le défi avec succès !");
  }, []);

  const renderChallengeGrid = (
    items: Challenge[],
    options: { showJoinActions: boolean },
    emptyMessage: ReactNode
  ) => {
    if (items.length === 0) {
      return emptyMessage;
    }
    return (
      <div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        role="tabpanel"
      >
        {items.map((challenge) => (
          <ChallengeCard
            key={`${challenge.id}-${challenge.currentProgress}-${challenge.outcome}`}
            challenge={challenge}
            now={now}
            onJoin={handleJoin}
            onOpenDetail={setSelectedChallenge}
            showJoinActions={options.showJoinActions}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="grid gap-8">
      <GamificationMotionStyles />

      <header>
        <h1 className={PAGE_TITLE_CLASS}>Défis communautaires</h1>
        <p className={PAGE_DESCRIPTION_CLASS}>
          Rejoignez des défis en cours ou consultez l&apos;historique de vos participations.
        </p>
      </header>

      {loadError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
        >
          {loadError}
        </div>
      ) : null}

      <ChallengeGalleryTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        activeCount={activeChallenges.length}
        historyCount={historyChallenges.length}
      />

      {isLoading ? (
        <ChallengeGallerySkeleton />
      ) : activeTab === "active" ? (
        renderChallengeGrid(
          activeChallenges,
          { showJoinActions: true },
          <ChallengeEmptyState />
        )
      ) : (
        <div className="grid gap-6" role="tabpanel">
          <ChallengeAdminStatsCards
            stats={historyStats}
            variant="history"
            selectable
            activeHistoryFilter={historyFilter}
            onHistoryFilterChange={setHistoryFilter}
          />
          {renderChallengeGrid(
            filteredHistoryChallenges,
            { showJoinActions: false },
            <p className="rounded-xl border border-dashed border-slate-300 bg-white px-8 py-12 text-center text-slate-600 shadow-sm">
              {HISTORY_STATS_EMPTY_MESSAGES[historyFilter]}
            </p>
          )}
        </div>
      )}

      <ChallengeDetailDrawer
        challenge={selectedChallenge}
        onClose={() => setSelectedChallenge(null)}
        splitContributions
      />

      {toastMessage ? (
        <ReportToast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      ) : null}
    </div>
  );
}
