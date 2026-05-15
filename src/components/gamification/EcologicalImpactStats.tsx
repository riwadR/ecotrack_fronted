import GamificationCard from "@/components/gamification/GamificationCard";
import { Co2Icon, PointsIcon } from "@/components/gamification/GamificationIcons";
import {
  formatCo2Label,
  formatPointsLabel,
  resolveCo2SavedKg,
} from "@/lib/gamification/formatters";

type EcologicalImpactStatsProps = {
  totalPoints: number;
  co2Saved?: number | null;
  showHeading?: boolean;
};

export default function EcologicalImpactStats({
  totalPoints,
  co2Saved,
  showHeading = true,
}: EcologicalImpactStatsProps) {
  const resolvedCo2 = resolveCo2SavedKg(co2Saved);

  const cards = [
    {
      key: "points",
      label: "Points cumulés",
      value: formatPointsLabel(totalPoints),
      helper: "Actions écologiques validées",
      icon: <PointsIcon size={26} color="#16a34a" />,
      valueClass: "text-green-600",
      iconWrapClass: "bg-green-50 text-green-600",
    },
    {
      key: "co2",
      label: "CO₂ évité",
      value: formatCo2Label(resolvedCo2),
      unit: "kg",
      helper: "Impact estimé sur la période",
      icon: <Co2Icon size={26} color="#15803d" />,
      valueClass: "text-green-700",
      iconWrapClass: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <section aria-label="Impact écologique" className="grid gap-5">
      {showHeading ? (
        <div>
          <h2 className="m-0 text-xl font-bold tracking-tight text-slate-900">
            Impact écologique
          </h2>
          <p className="mt-1.5 mb-0 text-sm text-slate-500">
            Tes points se traduisent en kilogrammes de CO₂ évités.
          </p>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        {cards.map((card, index) => (
          <GamificationCard key={card.key} animationDelayMs={index * 80} className="p-8">
            <div className="flex items-start justify-between gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.iconWrapClass}`}
              >
                {card.icon}
              </div>
              <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {card.label}
              </p>
            </div>

            <p className={`mt-5 mb-0 text-4xl font-extrabold leading-none tracking-tight sm:text-5xl ${card.valueClass}`}>
              {card.value}
              {"unit" in card && card.unit ? (
                <span className="ml-2 text-2xl font-bold text-slate-400 sm:text-3xl">
                  {card.unit}
                </span>
              ) : null}
            </p>

            <p className="mt-3 mb-0 text-sm text-slate-500">{card.helper}</p>
          </GamificationCard>
        ))}
      </div>
    </section>
  );
}
