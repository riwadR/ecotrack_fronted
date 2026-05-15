import { MedalIcon } from "@/components/gamification/GamificationIcons";
import {
  formatCo2Label,
  formatPointsLabel,
} from "@/lib/gamification/formatters";
import type { LeaderboardEntry } from "@/models/gamification";

type LeaderboardRowProps = {
  entry: LeaderboardEntry;
  animationDelayMs?: number;
};

function formatPublicDisplayName(entry: LeaderboardEntry): string {
  return entry.username?.trim() || "Citoyen";
}

const podiumStyles: Record<
  number,
  { border: string; bg: string; medal: "gold" | "silver" | "bronze" }
> = {
  1: {
    border: "border-amber-300 ring-2 ring-amber-100",
    bg: "bg-gradient-to-r from-amber-50/80 to-white",
    medal: "gold",
  },
  2: {
    border: "border-slate-300 ring-1 ring-slate-200",
    bg: "bg-gradient-to-r from-slate-50 to-white",
    medal: "silver",
  },
  3: {
    border: "border-orange-300 ring-1 ring-orange-100",
    bg: "bg-gradient-to-r from-orange-50/70 to-white",
    medal: "bronze",
  },
};

export default function LeaderboardRow({
  entry,
  animationDelayMs = 0,
}: LeaderboardRowProps) {
  const rank = entry.rank;
  const isPodium = rank >= 1 && rank <= 3;
  const podium = isPodium ? podiumStyles[rank] : null;

  return (
    <li
      className={[
        "gamification-fade-in list-none rounded-xl border bg-white p-4 shadow-sm",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
        podium ? `${podium.border} ${podium.bg}` : "border-slate-200",
      ].join(" ")}
      style={{ animationDelay: `${animationDelayMs}ms` }}
    >
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
        <div className="flex w-11 shrink-0 items-center justify-center">
          {isPodium && podium ? (
            <MedalIcon size={32} variant={podium.medal} />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
              {rank}
            </span>
          )}
        </div>

        <p className="m-0 truncate font-semibold text-slate-900">
          {formatPublicDisplayName(entry)}
        </p>

        <div className="text-right">
          <p className="m-0 text-lg font-extrabold leading-tight text-green-700">
            {formatPointsLabel(entry.totalPoints)}
            <span className="ml-0.5 text-xs font-semibold text-green-600">pts</span>
          </p>
          <p className="mt-0.5 mb-0 text-xs text-slate-400">
            {formatCo2Label(entry.co2Saved)} kg CO₂
          </p>
        </div>
      </div>
    </li>
  );
}
