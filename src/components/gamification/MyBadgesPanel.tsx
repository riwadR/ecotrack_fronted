import Image from "next/image";
import type { Badge } from "@/models/gamification";
import GamificationCard from "@/components/gamification/GamificationCard";
import BadgeTooltip from "@/components/gamification/BadgeTooltip";
import { enrichEarnedBadges } from "@/lib/gamification/badgeStatus";
import { resolveBadgeIconSrc } from "@/lib/gamification/formatters";

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
      <GamificationCard className="p-4 sm:p-6 lg:p-6">
        <h3 className="m-0 text-lg font-bold text-slate-900">Mes badges</h3>
        <p className="mt-1.5 mb-4 text-sm text-slate-500 sm:mb-6">
          Badges déjà débloqués sur ton profil EcoTrack.
        </p>

        {ownedBadges.length === 0 ? (
          <p className="m-0 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Aucun badge obtenu pour le moment. Accumule des points pour débloquer ton
            premier badge !
          </p>
        ) : (
          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6 lg:justify-items-start lg:gap-5 xl:grid-cols-7 xl:gap-5 2xl:grid-cols-8 2xl:gap-5">
            {ownedBadges.map((badge, index) => (
              <BadgeTooltip
                key={badge.id}
                description={badge.description}
                className="gamification-fade-in group flex aspect-square w-full min-h-0 min-w-0 flex-col items-center justify-center gap-1 rounded-xl border border-green-100 bg-green-50/50 p-2.5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:bg-green-50 hover:shadow-md sm:p-3 lg:min-w-[118px] lg:gap-1 lg:p-3 xl:min-w-[128px]"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <article className="m-0 flex min-h-0 w-full flex-col items-center justify-center gap-1 text-center">
                  <div className="relative flex size-12 shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-110 sm:size-14 lg:size-11">
                    <Image
                      src={resolveBadgeIconSrc(badge.iconUrl)}
                      alt={badge.name}
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>
                  <p className="m-0 line-clamp-2 text-xs font-semibold leading-tight text-slate-800">
                    {badge.name}
                  </p>
                </article>
              </BadgeTooltip>
            ))}
          </div>
        )}
      </GamificationCard>
    </section>
  );
}
