import Image from "next/image";
import type { Badge } from "@/models/gamification";
import { gamificationTheme } from "@/components/gamification/gamificationTheme";
import { resolveBadgeIconSrc } from "@/lib/gamification/formatters";
import BadgeTooltip from "@/components/gamification/BadgeTooltip";

type BadgeCardProps = {
  badge: Badge;
  isEarned: boolean;
  isNextTarget?: boolean;
  animationDelayMs?: number;
};

export default function BadgeCard({
  badge,
  isEarned,
  isNextTarget = false,
  animationDelayMs = 0,
}: BadgeCardProps) {
  return (
    <BadgeTooltip
      description={badge.description}
      className="gamification-fade-in"
      style={{
        background: gamificationTheme.cardBackground,
        borderRadius: gamificationTheme.radiusMd,
        padding: "18px 16px",
        boxShadow: gamificationTheme.shadow,
        border: `1px solid ${
          isEarned
            ? gamificationTheme.accentSoft
            : isNextTarget
              ? gamificationTheme.accent
              : "#e2e8f0"
        }`,
        textAlign: "center",
        opacity: isEarned ? 1 : 0.55,
        filter: isEarned ? "none" : "grayscale(1)",
        transform: isEarned ? "translateY(0)" : "translateY(2px)",
        transition: "opacity 0.35s ease, filter 0.35s ease, transform 0.35s ease",
        animationDelay: `${animationDelayMs}ms`,
      }}
    >
      <article style={{ margin: 0 }}>
      <div
        style={{
          width: "64px",
          height: "64px",
          margin: "0 auto 12px",
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
      <h4
        style={{
          margin: "0 0 6px",
          color: gamificationTheme.text,
          fontSize: "14px",
        }}
      >
        {badge.name}
      </h4>
      <p style={{ margin: 0, color: gamificationTheme.muted, fontSize: "12px" }}>
        {badge.requiredPoints} points
      </p>
      <p
        style={{
          margin: "8px 0 0",
          color: isEarned ? gamificationTheme.accentDeep : gamificationTheme.muted,
          fontSize: "12px",
          fontWeight: 600,
        }}
      >
        {isEarned ? "Obtenu" : isNextTarget ? "Prochain objectif" : "À débloquer"}
      </p>
      </article>
    </BadgeTooltip>
  );
}
