import type { Badge } from "@/models/gamification";
import BadgeCard from "@/components/gamification/BadgeCard";
import { gamificationTheme } from "@/components/gamification/gamificationTheme";
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
    <section aria-label="Badges disponibles" style={{ display: "grid", gap: "16px" }}>
      <div>
        <h2
          style={{
            margin: 0,
            color: gamificationTheme.title,
            fontSize: "20px",
          }}
        >
          Badges disponibles
        </h2>
        <p style={{ margin: "6px 0 0", color: gamificationTheme.muted }}>
          {locked.length === 0
            ? "Tu as déjà débloqué tous les badges du catalogue."
            : "Ces badges restent à débloquer en accumulant des points."}
        </p>
      </div>

      {catalog.length === 0 ? (
        <p style={{ margin: 0, color: gamificationTheme.muted }}>
          Le catalogue de badges est indisponible pour le moment.
        </p>
      ) : locked.length === 0 ? null : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "16px",
          }}
        >
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
