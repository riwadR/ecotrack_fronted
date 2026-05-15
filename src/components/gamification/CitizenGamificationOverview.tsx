"use client";

import Link from "next/link";
import EcologicalImpactStats from "@/components/gamification/EcologicalImpactStats";
import BadgeProgressBar from "@/components/gamification/BadgeProgressBar";
import GamificationMotionStyles from "@/components/gamification/GamificationMotionStyles";
import {
  BadgeProgressSkeleton,
  EcologicalImpactStatsSkeleton,
} from "@/components/gamification/GamificationSkeletons";
import { useGamificationData } from "@/hooks/useGamificationData";

export default function CitizenGamificationOverview() {
  const { profile, catalog, loading, error } = useGamificationData();
  const totalPoints = profile?.totalPoints ?? 0;

  return (
    <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <GamificationMotionStyles />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="m-0 text-xl font-bold tracking-tight text-slate-900">
            Ton parcours écologique
          </h2>
          <p className="mt-1.5 mb-0 text-sm text-slate-500">
            Consulte tes points et ton prochain badge.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/gamification"
            className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-green-700 hover:shadow-md"
          >
            Voir la gamification
          </Link>
          <Link
            href="/dashboard/classement"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-green-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
          >
            Voir le classement
          </Link>
        </div>
      </div>

      {error ? (
        <p className="m-0 text-sm font-semibold text-red-700">{error}</p>
      ) : loading ? (
        <>
          <EcologicalImpactStatsSkeleton />
          <BadgeProgressSkeleton />
        </>
      ) : (
        <>
          <EcologicalImpactStats
            totalPoints={totalPoints}
            co2Saved={profile?.co2Saved}
            showHeading={false}
          />
          <BadgeProgressBar totalPoints={totalPoints} catalog={catalog} />
        </>
      )}
    </section>
  );
}
