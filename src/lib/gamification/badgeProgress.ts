import type { Badge } from "@/models/gamification";

export type BadgeProgressState = {
  nextBadge: Badge | null;
  previousThreshold: number;
  nextThreshold: number;
  progressPercent: number;
  pointsRemaining: number;
  isMaxLevel: boolean;
  isCatalogMissing: boolean;
};

export function sortBadgesByRequiredPoints(catalog: Badge[]): Badge[] {
  return [...catalog].sort((left, right) => left.requiredPoints - right.requiredPoints);
}

export function computeBadgeProgress(
  totalPoints: number,
  catalog: Badge[]
): BadgeProgressState {
  const sortedCatalog = sortBadgesByRequiredPoints(catalog);

  if (sortedCatalog.length === 0) {
    return {
      nextBadge: null,
      previousThreshold: 0,
      nextThreshold: 0,
      progressPercent: 0,
      pointsRemaining: 0,
      isMaxLevel: false,
      isCatalogMissing: true,
    };
  }

  const nextBadge =
    sortedCatalog.find((badge) => badge.requiredPoints > totalPoints) ?? null;

  if (!nextBadge) {
    const highestBadge = sortedCatalog[sortedCatalog.length - 1];
    const hasReachedMaxLevel = totalPoints >= highestBadge.requiredPoints;

    return {
      nextBadge: null,
      previousThreshold: highestBadge.requiredPoints,
      nextThreshold: highestBadge.requiredPoints,
      progressPercent: hasReachedMaxLevel ? 100 : 0,
      pointsRemaining: 0,
      isMaxLevel: hasReachedMaxLevel,
      isCatalogMissing: false,
    };
  }

  const previousThreshold =
    [...sortedCatalog]
      .reverse()
      .find((badge) => badge.requiredPoints <= totalPoints)?.requiredPoints ?? 0;

  const nextThreshold = nextBadge.requiredPoints;
  const range = nextThreshold - previousThreshold;
  const progressPercent =
    range > 0
      ? Math.min(
          100,
          Math.max(0, ((totalPoints - previousThreshold) / range) * 100)
        )
      : 0;

  return {
    nextBadge,
    previousThreshold,
    nextThreshold,
    progressPercent,
    pointsRemaining: Math.max(0, nextThreshold - totalPoints),
    isMaxLevel: false,
    isCatalogMissing: false,
  };
}

export function buildEarnedBadgeIdSet(earnedBadges: Badge[]): Set<string> {
  return new Set(earnedBadges.map((badge) => badge.id));
}
