import Image from "next/image";
import type { Badge } from "@/models/gamification";
import { gamificationTheme } from "@/components/gamification/gamificationTheme";
import { enrichEarnedBadges } from "@/lib/gamification/badgeStatus";
import { resolveBadgeIconSrc } from "@/lib/gamification/formatters";
import BadgeTooltip from "@/components/gamification/BadgeTooltip";

type MyBadgesPanelProps = {
  earnedBadges: Badge[];
  catalog: Badge[];
};

export default function MyBadgesPanel({
  earnedBadges,
  catalog,
}: MyBadgesPanelProps) {
  const ownedBadges = enrichEarnedBadges(earnedBadges, catalog);

  return (
    <section aria-label="Mes badges">
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
          Mes badges
        </h3>
        <p style={{ margin: "0 0 16px", color: gamificationTheme.muted }}>
          Badges déjà débloqués sur ton profil EcoTrack.
        </p>

        {ownedBadges.length === 0 ? (
          <p style={{ margin: 0, color: gamificationTheme.muted }}>
            Aucun badge obtenu pour le moment.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: "16px",
              overflow: "visible",
            }}
          >
            {ownedBadges.map((badge, index) => (
              <BadgeTooltip
                key={badge.id}
                description={badge.description}
                className="gamification-fade-in"
                style={{
                  textAlign: "center",
                  padding: "12px 8px",
                  borderRadius: gamificationTheme.radiusSm,
                  background: gamificationTheme.softBackground,
                  border: `1px solid ${gamificationTheme.accentSoft}`,
                  animationDelay: `${index * 40}ms`,
                }}
              >
              <article
                style={{ margin: 0 }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    margin: "0 auto 10px",
                    position: "relative",
                  }}
                >
                  <Image
                    src={resolveBadgeIconSrc(badge.iconUrl)}
                    alt={badge.name}
                    width={64}
                    height={64}
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <p
                  style={{
                    margin: 0,
                    color: gamificationTheme.text,
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {badge.name}
                </p>
              </article>
              </BadgeTooltip>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
