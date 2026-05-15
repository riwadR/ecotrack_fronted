import type { Badge } from "@/models/gamification";
import BadgeCard from "@/components/gamification/BadgeCard";
import {
  buildBadgeCollectionState,
  isSameBadge,
} from "@/lib/gamification/badgeStatus";

type BadgeGridProps = {
  catalog: Badge[];
  earnedBadges: Badge[];
  totalPoints: number;
};

export default function BadgeGrid({
  catalog,
  earnedBadges,
  totalPoints,
}: BadgeGridProps) {
  const { locked, nextBadge } = buildBadgeCollectionState(
    catalog,
    earnedBadges,
    totalPoints
  );

  return (
    <section aria-label="Badges disponibles" className="grid gap-5">
      <div>
        <h2 className="m-0 text-xl font-bold tracking-tight text-slate-900">
          Badges disponibles
        </h2>
        <p className="mt-1.5 mb-0 text-sm text-slate-500">
          {locked.length === 0
            ? "Tu as déjà débloqué tous les badges du catalogue."
            : "Ces badges restent à débloquer en accumulant des points."}
        </p>
      </div>

      {catalog.length === 0 ? (
        <p className="m-0 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Le catalogue de badges est indisponible pour le moment.
        </p>
      ) : locked.length === 0 ? null : (
        <div className="flex w-full flex-wrap justify-start gap-4 sm:gap-5">
          {locked.map((badge, index) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              isEarned={false}
              isNextTarget={nextBadge != null && isSameBadge(badge, nextBadge)}
              animationDelayMs={index * 40}
            />
          ))}
        </div>
      )}
    </section>
  );
}
