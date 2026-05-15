import type { Badge } from "@/models/gamification";
import {
  computeBadgeProgress,
  sortBadgesByRequiredPoints,
} from "@/lib/gamification/badgeProgress";

export type BadgeCollectionState = {
  earned: Badge[];
  locked: Badge[];
  nextBadge: Badge | null;
};

function normalizeBadgeName(name: string): string {
  return name.trim().toLowerCase();
}

function badgesMatch(left: Badge, right: Badge): boolean {
  if (left.id && right.id && left.id === right.id) {
    return true;
  }

  return (
    left.requiredPoints === right.requiredPoints &&
    normalizeBadgeName(left.name) === normalizeBadgeName(right.name)
  );
}

export function isSameBadge(left: Badge, right: Badge): boolean {
  return badgesMatch(left, right);
}

export function isBadgeEarnedByUser(
  badge: Badge,
  earnedBadges: Badge[]
): boolean {
  return earnedBadges.some((earnedBadge) => badgesMatch(earnedBadge, badge));
}

export function enrichEarnedBadges(
  earnedBadges: Badge[],
  catalog: Badge[]
): Badge[] {
  return earnedBadges.map((earnedBadge) => {
    const catalogMatch = catalog.find((catalogBadge) =>
      badgesMatch(catalogBadge, earnedBadge)
    );

    if (!catalogMatch) {
      return earnedBadge;
    }

    return {
      ...catalogMatch,
      id: earnedBadge.id,
    };
  });
}

export function buildBadgeCollectionState(
  catalog: Badge[],
  earnedBadges: Badge[],
  totalPoints: number
): BadgeCollectionState {
  const sortedCatalog = sortBadgesByRequiredPoints(catalog);
  const earned = enrichEarnedBadges(earnedBadges, sortedCatalog);
  const locked = sortedCatalog.filter(
    (badge) => !isBadgeEarnedByUser(badge, earned)
  );
  const { nextBadge } = computeBadgeProgress(totalPoints, sortedCatalog);

  return {
    earned,
    locked,
    nextBadge,
  };
}
