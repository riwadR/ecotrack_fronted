import type { Badge, GamificationProfile, LeaderboardEntry } from "@/models/gamification";

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeBadge(value: unknown): Badge | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const id = String(raw.id ?? "");
  const name = String(raw.name ?? "");
  const description = String(raw.description ?? "");
  const iconUrl = String(raw.iconUrl ?? "");
  const requiredPoints = toNumber(raw.requiredPoints);

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    description,
    iconUrl,
    requiredPoints,
  };
}

export function normalizeGamificationProfile(
  value: unknown
): GamificationProfile {
  if (!value || typeof value !== "object") {
    return {
      totalPoints: 0,
      co2Saved: 0,
      earnedBadges: [],
    };
  }

  const raw = value as Record<string, unknown>;
  const totalPoints = toNumber(raw.totalPoints);
  const co2Saved = toNumber(raw.co2Saved);
  const earnedBadges = Array.isArray(raw.earnedBadges)
    ? raw.earnedBadges
        .map(normalizeBadge)
        .filter((badge): badge is Badge => badge !== null)
    : [];

  return {
    userId: raw.userId ? String(raw.userId) : undefined,
    totalPoints,
    co2Saved,
    earnedBadges,
  };
}

export function normalizeLeaderboardEntries(value: unknown): LeaderboardEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const entries: LeaderboardEntry[] = [];

  value.forEach((entry, index) => {
    if (!entry || typeof entry !== "object") {
      return;
    }

    const raw = entry as Record<string, unknown>;
    const firstName = String(raw.firstName ?? "").trim();
    const lastName = String(raw.lastName ?? "").trim();

    entries.push({
      rank: toNumber(raw.rank) || index + 1,
      firstName,
      lastName,
      totalPoints: toNumber(raw.totalPoints),
      co2Saved: toNumber(raw.co2Saved),
    });
  });

  return entries;
}
