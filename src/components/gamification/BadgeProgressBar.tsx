import type { Badge } from "@/models/gamification";
import { gamificationTheme } from "@/components/gamification/gamificationTheme";
import { computeBadgeProgress } from "@/lib/gamification/badgeProgress";
import { formatPointsLabel } from "@/lib/gamification/formatters";

type BadgeProgressBarProps = {
  totalPoints: number;
  catalog: Badge[];
};

export default function BadgeProgressBar({
  totalPoints,
  catalog,
}: BadgeProgressBarProps) {
  const progress = computeBadgeProgress(totalPoints, catalog);

  return (
    <section aria-label="Progression vers le prochain badge">
      <div
        style={{
          background: gamificationTheme.cardBackground,
          borderRadius: gamificationTheme.radiusMd,
          padding: "20px",
          boxShadow: gamificationTheme.shadow,
          border: `1px solid ${gamificationTheme.border}`,
        }}
        className="gamification-fade-in"
      >
        <h3
          style={{
            margin: "0 0 6px",
            color: gamificationTheme.title,
            fontSize: "18px",
          }}
        >
          Prochain badge
        </h3>

        {progress.isCatalogMissing ? (
          <p style={{ margin: 0, color: gamificationTheme.muted }}>
            Le catalogue de badges est indisponible pour le moment.
          </p>
        ) : progress.isMaxLevel ? (
          <p style={{ margin: 0, color: gamificationTheme.muted }}>
            Tu as débloqué tous les badges du catalogue EcoTrack.
          </p>
        ) : (
          <>
            <p style={{ margin: "0 0 8px", color: gamificationTheme.muted }}>
              Tu as {formatPointsLabel(totalPoints)} point
              {totalPoints > 1 ? "s" : ""}. Encore{" "}
              {formatPointsLabel(progress.pointsRemaining)} point
              {progress.pointsRemaining > 1 ? "s" : ""} pour débloquer le badge{" "}
              <strong style={{ color: gamificationTheme.text }}>
                {progress.nextBadge?.name}
              </strong>
              .
            </p>
            {progress.nextBadge?.description ? (
              <p
                style={{
                  margin: "0 0 14px",
                  color: gamificationTheme.muted,
                  fontSize: "13px",
                }}
              >
                {progress.nextBadge.description}
              </p>
            ) : null}

            <div
              style={{
                width: "100%",
                height: "12px",
                borderRadius: "999px",
                background: "#ecfdf5",
                overflow: "hidden",
              }}
            >
              <div
                className="gamification-progress-fill"
                style={{
                  height: "100%",
                  width: `${progress.progressPercent}%`,
                  borderRadius: "999px",
                  background: `linear-gradient(90deg, ${gamificationTheme.accentDeep}, ${gamificationTheme.accent})`,
                  transition: "width 0.9s ease",
                }}
              />
            </div>

            <p
              style={{
                margin: "10px 0 0",
                color: gamificationTheme.muted,
                fontSize: "13px",
              }}
            >
              {formatPointsLabel(totalPoints)} /{" "}
              {formatPointsLabel(progress.nextThreshold)} points
            </p>
          </>
        )}
      </div>
    </section>
  );
}
