import type { Challenge, ChallengeOutcome } from "@/lib/api/challenges";

export type ChallengeLifecycleStatus = "active" | "upcoming" | "expired";

export type ChallengeAdminStats = {
  total: number;
  completed: number;
  succeeded: number;
  failed: number;
  inProgress: number;
  upcoming: number;
};

export function isChallengeActiveOrUpcoming(
  startDate: string,
  endDate: string,
  now: Date = new Date()
): boolean {
  const status = getChallengeLifecycleStatus(startDate, endDate, now);
  return status === "active" || status === "upcoming";
}

export function isChallengeExpired(
  startDate: string,
  endDate: string,
  now: Date = new Date()
): boolean {
  return getChallengeLifecycleStatus(startDate, endDate, now) === "expired";
}

export function getChallengeLifecycleStatus(
  startDate: string,
  endDate: string,
  now: Date = new Date()
): ChallengeLifecycleStatus {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const current = now.getTime();

  if (current < start) {
    return "upcoming";
  }
  if (current > end) {
    return "expired";
  }
  return "active";
}

export const CHALLENGE_STATUS_LABELS: Record<ChallengeLifecycleStatus, string> = {
  active: "Ouvert",
  upcoming: "À venir",
  expired: "Fermé",
};

export function getChallengeProgressPercent(
  currentProgress: number,
  goalThreshold: number
): number {
  if (goalThreshold <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((currentProgress / goalThreshold) * 100));
}

export function formatChallengeDateRange(startDate: string, endDate: string): string {
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${formatter.format(new Date(startDate))} — ${formatter.format(new Date(endDate))}`;
}

function formatRelativeDuration(diffMs: number, prefix: string): string {
  if (diffMs <= 0) {
    return "";
  }

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days >= 1) {
    return days === 1 ? `${prefix} 1 jour` : `${prefix} ${days} jours`;
  }

  if (hours >= 1) {
    return hours === 1 ? `${prefix} 1 heure` : `${prefix} ${hours} heures`;
  }

  const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  return minutes === 1 ? `${prefix} 1 minute` : `${prefix} ${minutes} minutes`;
}

/**
 * French label for challenge timing (open / close) based on lifecycle.
 */
export function getChallengeTimeLabel(
  startDate: string,
  endDate: string,
  now: Date = new Date()
): string {
  const status = getChallengeLifecycleStatus(startDate, endDate, now);

  if (status === "expired") {
    return "Défi fermé";
  }

  if (status === "upcoming") {
    const untilOpen = new Date(startDate).getTime() - now.getTime();
    return formatRelativeDuration(untilOpen, "Ouvre dans") || "Ouverture imminente";
  }

  const untilClose = new Date(endDate).getTime() - now.getTime();
  return formatRelativeDuration(untilClose, "Expire dans") || "Expire bientôt";
}

export function toDatetimeLocalValue(isoDate: string): string {
  const date = new Date(isoDate);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function datetimeLocalToIso(value: string): string {
  return new Date(value).toISOString();
}

export const CHALLENGE_OUTCOME_LABELS: Record<ChallengeOutcome, string> = {
  UPCOMING: "À venir",
  IN_PROGRESS: "En cours",
  SUCCEEDED: "Réussi",
  FAILED: "Échoué",
};

export const CHALLENGE_OUTCOME_BADGE_CLASS: Record<ChallengeOutcome, string> = {
  UPCOMING: "bg-sky-50 text-sky-800 ring-sky-200",
  IN_PROGRESS: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  SUCCEEDED: "bg-emerald-100 text-emerald-900 ring-emerald-300",
  FAILED: "bg-red-50 text-red-800 ring-red-200",
};

export type HistoryStatsFilter = "total" | "completed" | "succeeded" | "failed";

/** Resolves outcome from dates and progress (matches backend rules, works without API refresh). */
export function resolveChallengeOutcome(
  challenge: Pick<Challenge, "startDate" | "endDate" | "currentProgress" | "goalThreshold">,
  now: Date = new Date()
): ChallengeOutcome {
  const start = new Date(challenge.startDate).getTime();
  const end = new Date(challenge.endDate).getTime();
  const current = now.getTime();

  if (current < start) {
    return "UPCOMING";
  }
  if (current > end) {
    return challenge.currentProgress >= challenge.goalThreshold ? "SUCCEEDED" : "FAILED";
  }
  return "IN_PROGRESS";
}

export function withResolvedOutcome(challenge: Challenge, now: Date = new Date()): Challenge {
  return {
    ...challenge,
    outcome: resolveChallengeOutcome(challenge, now),
  };
}

export function filterHistoryByStatsFilter(
  challenges: Challenge[],
  filter: HistoryStatsFilter,
  now: Date = new Date()
): Challenge[] {
  const resolved = challenges.map((challenge) => withResolvedOutcome(challenge, now));

  switch (filter) {
    case "succeeded":
      return resolved.filter((challenge) => challenge.outcome === "SUCCEEDED");
    case "failed":
      return resolved.filter((challenge) => challenge.outcome === "FAILED");
    case "completed":
      return resolved.filter(
        (challenge) => challenge.outcome === "SUCCEEDED" || challenge.outcome === "FAILED"
      );
    case "total":
    default:
      return resolved;
  }
}

export const HISTORY_STATS_EMPTY_MESSAGES: Record<HistoryStatsFilter, string> = {
  total: "Aucun défi terminé dans votre historique pour le moment.",
  completed: "Aucun défi terminé dans cette catégorie.",
  succeeded: "Aucun défi réussi dans votre historique.",
  failed: "Aucun défi échoué dans votre historique.",
};

export type CitizenOutcomeFilter = "ALL" | ChallengeOutcome;

export const CITIZEN_OUTCOME_FILTERS: {
  id: CitizenOutcomeFilter;
  label: string;
}[] = [
  { id: "ALL", label: "Tous" },
  { id: "IN_PROGRESS", label: "En cours" },
  { id: "UPCOMING", label: "À venir" },
  { id: "SUCCEEDED", label: "Réussis" },
  { id: "FAILED", label: "Échoués" },
];

export function filterChallengesByOutcome(
  challenges: Challenge[],
  filter: CitizenOutcomeFilter
): Challenge[] {
  if (filter === "ALL") {
    return challenges;
  }
  return challenges.filter((challenge) => challenge.outcome === filter);
}

export function computeChallengeAdminStats(challenges: Challenge[]): ChallengeAdminStats {
  return challenges.reduce<ChallengeAdminStats>(
    (stats, challenge) => {
      stats.total += 1;
      switch (challenge.outcome) {
        case "UPCOMING":
          stats.upcoming += 1;
          break;
        case "IN_PROGRESS":
          stats.inProgress += 1;
          break;
        case "SUCCEEDED":
          stats.completed += 1;
          stats.succeeded += 1;
          break;
        case "FAILED":
          stats.completed += 1;
          stats.failed += 1;
          break;
        default:
          break;
      }
      return stats;
    },
    {
      total: 0,
      completed: 0,
      succeeded: 0,
      failed: 0,
      inProgress: 0,
      upcoming: 0,
    }
  );
}

export function formatContributionDateTime(iso: string): string {
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) {
    return "—";
  }
  return new Date(parsed).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
