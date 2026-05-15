import type { ChallengeAdminStats, HistoryStatsFilter } from "@/lib/challenges/challengeUtils";

type ChallengeAdminStatsCardsProps = {
  stats: ChallengeAdminStats;
  variant?: "full" | "history";
  selectable?: boolean;
  activeHistoryFilter?: HistoryStatsFilter;
  onHistoryFilterChange?: (filter: HistoryStatsFilter) => void;
};

const FULL_CARDS: {
  key: keyof ChallengeAdminStats;
  label: string;
  accent: string;
  historyFilter?: HistoryStatsFilter;
}[] = [
  {
    key: "total",
    label: "Total",
    accent: "border-slate-200 bg-white text-slate-900",
    historyFilter: "total",
  },
  {
    key: "completed",
    label: "Terminés",
    accent: "border-slate-300 bg-slate-50 text-slate-800",
    historyFilter: "completed",
  },
  {
    key: "succeeded",
    label: "Réussis",
    accent: "border-emerald-200 bg-emerald-50 text-emerald-900",
    historyFilter: "succeeded",
  },
  {
    key: "failed",
    label: "Échoués",
    accent: "border-red-200 bg-red-50 text-red-900",
    historyFilter: "failed",
  },
  {
    key: "inProgress",
    label: "En cours",
    accent: "border-emerald-200 bg-white text-emerald-800",
  },
  { key: "upcoming", label: "À venir", accent: "border-sky-200 bg-sky-50 text-sky-900" },
];

const HISTORY_CARDS = FULL_CARDS.filter((card) => card.historyFilter !== undefined);

export default function ChallengeAdminStatsCards({
  stats,
  variant = "full",
  selectable = false,
  activeHistoryFilter = "total",
  onHistoryFilterChange,
}: ChallengeAdminStatsCardsProps) {
  const cards = variant === "history" ? HISTORY_CARDS : FULL_CARDS;
  const gridClass =
    variant === "history"
      ? "grid grid-cols-2 gap-4 sm:grid-cols-4"
      : "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6";

  return (
    <div className={gridClass} role={selectable ? "group" : undefined}>
      {cards.map(({ key, label, accent, historyFilter }) => {
        const isSelectable = selectable && historyFilter !== undefined;
        const isActive = isSelectable && activeHistoryFilter === historyFilter;

        const className = [
          "rounded-2xl border p-4 shadow-sm text-left transition",
          accent,
          isSelectable ? "cursor-pointer hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" : "",
          isActive ? "ring-2 ring-emerald-600 ring-offset-2" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const content = (
          <>
            <p className="m-0 text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
            <p className="m-0 mt-2 text-2xl font-extrabold tabular-nums">{stats[key]}</p>
            {isSelectable ? (
              <p className="m-0 mt-1 text-[11px] text-slate-500">
                {isActive ? "Filtre actif" : "Filtrer"}
              </p>
            ) : null}
          </>
        );

        if (isSelectable && onHistoryFilterChange && historyFilter) {
          return (
            <button
              key={key}
              type="button"
              className={className}
              aria-pressed={isActive}
              onClick={() => onHistoryFilterChange(historyFilter)}
            >
              {content}
            </button>
          );
        }

        return (
          <div key={key} className={className}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
