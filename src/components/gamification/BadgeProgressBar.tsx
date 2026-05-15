import Image from "next/image";
import type { Badge } from "@/models/gamification";
import GamificationCard from "@/components/gamification/GamificationCard";
import { SparkleIcon } from "@/components/gamification/GamificationIcons";
import { computeBadgeProgress, sortBadgesByRequiredPoints } from "@/lib/gamification/badgeProgress";
import { formatPointsLabel, resolveBadgeIconSrc } from "@/lib/gamification/formatters";

type BadgeProgressBarProps = {
  totalPoints: number;
  catalog: Badge[];
};

export default function BadgeProgressBar({
  totalPoints,
  catalog,
}: BadgeProgressBarProps) {
  const progress = computeBadgeProgress(totalPoints, catalog);
  const sortedCatalog = sortBadgesByRequiredPoints(catalog);
  const ultimateBadge = sortedCatalog[sortedCatalog.length - 1] ?? null;

  return (
    <section aria-label="Progression vers le prochain badge">
      {progress.isCatalogMissing ? (
        <GamificationCard animate className="bg-slate-50">
          <p className="m-0 text-sm text-slate-500">
            Le catalogue de badges est indisponible pour le moment.
          </p>
        </GamificationCard>
      ) : progress.isMaxLevel ? (
        <CatalogueConqueredCard ultimateBadge={ultimateBadge} />
      ) : (
        <NextBadgeCard totalPoints={totalPoints} progress={progress} />
      )}
    </section>
  );
}

function CatalogueConqueredCard({ ultimateBadge }: { ultimateBadge: Badge | null }) {
  return (
    <GamificationCard
      animate
      className="relative overflow-hidden border-green-200 bg-gradient-to-br from-white via-green-50/40 to-emerald-50/60 p-8"
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-green-100/60 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-8 left-8 h-24 w-24 rounded-full bg-amber-100/50 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-2 border-green-200 bg-white shadow-md transition-transform duration-300 hover:scale-105">
          {ultimateBadge ? (
            <Image
              src={resolveBadgeIconSrc(ultimateBadge.iconUrl)}
              alt={ultimateBadge.name}
              width={72}
              height={72}
              className="object-contain"
            />
          ) : (
            <SparkleIcon size={40} color="#16a34a" />
          )}
          <div className="absolute -right-2 -top-2">
            <SparkleIcon size={22} color="#f59e0b" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="m-0 text-xs font-bold uppercase tracking-widest text-green-600">
            Félicitations
          </p>
          <h3 className="mt-1 mb-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Catalogue conquis !
          </h3>
          <p className="m-0 text-sm leading-relaxed text-slate-600">
            Tu as débloqué tous les badges EcoTrack. Continue à agir pour la planète et
            grimpe dans le classement.
          </p>
        </div>
      </div>
    </GamificationCard>
  );
}

function NextBadgeCard({
  totalPoints,
  progress,
}: {
  totalPoints: number;
  progress: ReturnType<typeof computeBadgeProgress>;
}) {
  const nextBadge = progress.nextBadge;

  return (
    <GamificationCard animate className="bg-slate-50/80 p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex shrink-0 flex-col items-center gap-3 sm:w-28">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-white opacity-70 grayscale transition-all duration-300">
            {nextBadge ? (
              <Image
                src={resolveBadgeIconSrc(nextBadge.iconUrl)}
                alt={nextBadge.name}
                width={56}
                height={56}
                className="object-contain"
              />
            ) : null}
          </div>
          <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Prochain badge
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="m-0 text-lg font-bold text-slate-800">
            {nextBadge?.name ?? "Badge suivant"}
          </h3>
          {nextBadge?.description ? (
            <p className="mt-1 mb-0 text-sm text-slate-500">{nextBadge.description}</p>
          ) : null}

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-slate-700">
                Encore {formatPointsLabel(progress.pointsRemaining)} point
                {progress.pointsRemaining > 1 ? "s" : ""}
              </span>
              <span className="shrink-0 text-slate-400">
                {formatPointsLabel(totalPoints)} / {formatPointsLabel(progress.nextThreshold)}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-700 to-green-500 transition-all duration-700 ease-out"
                style={{ width: `${progress.progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </GamificationCard>
  );
}
