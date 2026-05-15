import LeaderboardRow from "@/components/gamification/LeaderboardRow";
import { TrophyIcon } from "@/components/gamification/GamificationIcons";
import GamificationCard from "@/components/gamification/GamificationCard";
import type { LeaderboardEntry } from "@/models/gamification";

type LeaderboardPanelProps = {
  entries: LeaderboardEntry[];
};

export default function LeaderboardPanel({ entries }: LeaderboardPanelProps) {
  return (
    <section aria-label="Classement des citoyens" className="grid gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
          <TrophyIcon size={22} color="#16a34a" />
        </div>
        <div>
          <h2 className="m-0 text-xl font-bold tracking-tight text-slate-900">
            Podium
          </h2>
          <p className="mt-1 mb-0 text-sm text-slate-500">
            Top 10 des citoyens les plus engagés.
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <GamificationCard animate={false} className="hover:translate-y-0 hover:shadow-sm">
          <p className="m-0 text-sm text-slate-500">
            Aucun citoyen classé pour le moment.
          </p>
        </GamificationCard>
      ) : (
        <ol className="m-0 grid list-none gap-3 p-0">
          {entries.map((entry, index) => (
            <LeaderboardRow
              key={`${entry.rank}-${entry.firstName}-${entry.lastName ?? ""}`}
              entry={entry}
              animationDelayMs={index * 50}
            />
          ))}
        </ol>
      )}
    </section>
  );
}
