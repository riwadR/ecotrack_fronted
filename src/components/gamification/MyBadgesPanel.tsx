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
      <GamificationCard className="p-8">
        <h3 className="m-0 text-lg font-bold text-slate-900">Mes badges</h3>
        <p className="mt-1.5 mb-6 text-sm text-slate-500">
          Badges déjà débloqués sur ton profil EcoTrack.
        </p>

        {ownedBadges.length === 0 ? (
          <p className="m-0 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Aucun badge obtenu pour le moment. Accumule des points pour débloquer ton
            premier badge !
          </p>
        ) : (
          <div className="flex w-full flex-wrap justify-start gap-4">
            {ownedBadges.map((badge, index) => (
              <BadgeTooltip
                key={badge.id}
                description={badge.description}
                className="gamification-fade-in group w-[120px] rounded-xl border border-green-100 bg-green-50/50 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:bg-green-50 hover:shadow-md"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <article className="m-0 flex flex-col items-center">
                  <div className="relative mx-auto mb-3 flex h-14 w-14 items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <Image
                      src={resolveBadgeIconSrc(badge.iconUrl)}
                      alt={badge.name}
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>
                  <p className="m-0 text-xs font-semibold leading-snug text-slate-800">
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
