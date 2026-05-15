import Image from "next/image";
import type { Badge } from "@/models/gamification";
import BadgeTooltip from "@/components/gamification/BadgeTooltip";
import { resolveBadgeIconSrc } from "@/lib/gamification/formatters";

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
  const statusLabel = isEarned
    ? "Obtenu"
    : isNextTarget
      ? "Prochain objectif"
      : "À débloquer";

  const borderClass = isEarned
    ? "border-green-200 ring-1 ring-green-100"
    : isNextTarget
      ? "border-green-400 ring-2 ring-green-100"
      : "border-slate-200";

  return (
    <BadgeTooltip
      description={badge.description}
      className={[
        "gamification-fade-in group flex h-full w-[150px] flex-col items-center rounded-2xl border bg-white p-5 text-center shadow-sm",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
        borderClass,
        isEarned ? "opacity-100" : "opacity-60 grayscale hover:grayscale-[0.35]",
      ].join(" ")}
      style={{ animationDelay: `${animationDelayMs}ms` }}
    >
      <article className="m-0 flex h-full w-full flex-col items-center">
        <div className="relative mb-4 flex h-16 w-16 items-center justify-center transition-transform duration-300 group-hover:scale-110">
          <Image
            src={resolveBadgeIconSrc(badge.iconUrl)}
            alt={badge.name}
            width={64}
            height={64}
            className="object-contain"
          />
        </div>

        <h4 className="m-0 text-sm font-semibold text-slate-800">{badge.name}</h4>

        <p className="mt-1.5 mb-0 text-xs text-slate-400">
          {badge.requiredPoints} points
        </p>

        <span
          className={[
            "mt-auto pt-3 text-xs font-bold",
            isEarned ? "text-green-700" : isNextTarget ? "text-green-600" : "text-slate-400",
          ].join(" ")}
        >
          {statusLabel}
        </span>
      </article>
    </BadgeTooltip>
  );
}
