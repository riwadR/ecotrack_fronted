import type { Badge } from "@/models/gamification";
import { sortBadgesByRequiredPoints } from "@/lib/gamification/badgeProgress";
import { normalizeBadge } from "@/lib/gamification/profileMapper";

export function resolveBadgeCatalog(catalog: Badge[] | null | undefined): Badge[] {
  if (!Array.isArray(catalog) || catalog.length === 0) {
    return [];
  }

  const normalizedCatalog = catalog
    .map((badge) => normalizeBadge(badge))
    .filter((badge): badge is Badge => badge !== null);

  return sortBadgesByRequiredPoints(normalizedCatalog);
}
