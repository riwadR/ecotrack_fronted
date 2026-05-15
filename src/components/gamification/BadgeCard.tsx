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
        "gamification-fade-in group flex aspect-square w-full min-h-0 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl border bg-white px-2.5 py-2.5 text-center shadow-sm sm:px-3 sm:py-3",
        "lg:min-w-[118px] lg:gap-1 lg:p-3 xl:min-w-[128px]",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
        borderClass,
        isEarned ? "opacity-100" : "opacity-60 grayscale hover:grayscale-[0.35]",
      ].join(" ")}
      style={{ animationDelay: `${animationDelayMs}ms` }}
    >
      <article className="m-0 flex min-h-0 w-full flex-col items-center justify-center gap-1 text-center lg:gap-1">
        <div className="relative flex size-12 shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-110 sm:size-14 lg:size-12">
          <Image
            src={resolveBadgeIconSrc(badge.iconUrl)}
            alt={badge.name}
            width={56}
            height={56}
            className="object-contain"
          />
        </div>

        <h4 className="m-0 line-clamp-2 text-xs font-semibold leading-tight text-slate-800 sm:text-sm">
          {badge.name}
        </h4>

        <p className="m-0 text-[11px] leading-tight text-slate-400 sm:text-xs lg:text-xs">
          {badge.requiredPoints} points
        </p>

        <span
          className={[
            "m-0 line-clamp-2 text-center text-[10px] font-bold leading-tight sm:text-xs lg:text-xs",
            isEarned ? "text-green-700" : isNextTarget ? "text-green-600" : "text-slate-400",
          ].join(" ")}
        >
          {statusLabel}
        </span>
      </article>
    </BadgeTooltip>
  );
}
