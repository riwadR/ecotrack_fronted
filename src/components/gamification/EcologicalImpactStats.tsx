import { Co2Icon, PointsIcon } from "@/components/gamification/GamificationIcons";
import { gamificationTheme } from "@/components/gamification/gamificationTheme";
import {
  formatCo2Label,
  formatPointsLabel,
  resolveCo2SavedKg,
} from "@/lib/gamification/formatters";

type EcologicalImpactStatsProps = {
  totalPoints: number;
  co2Saved?: number | null;
};

export default function EcologicalImpactStats({
  totalPoints,
  co2Saved,
}: EcologicalImpactStatsProps) {
  const resolvedCo2 = resolveCo2SavedKg(co2Saved);

  const cards = [
    {
      key: "points",
      label: "Points cumulés",
      value: formatPointsLabel(totalPoints),
      helper: "Actions écologiques validées",
      icon: <PointsIcon size={28} />,
      accent: gamificationTheme.accent,
    },
    {
      key: "co2",
      label: "CO2 évité",
      value: `${formatCo2Label(resolvedCo2)} kg`,
      helper: "Impact estimé sur la période",
      icon: <Co2Icon size={28} />,
      accent: gamificationTheme.accentDeep,
    },
  ];

  return (
    <section aria-label="Impact écologique">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: gamificationTheme.title,
              fontSize: "20px",
            }}
          >
            Impact écologique
          </h2>
          <p style={{ margin: "6px 0 0", color: gamificationTheme.muted }}>
            Tes points se traduisent en kilogrammes de CO2 évités.
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        {cards.map((card, index) => (
          <article
            key={card.key}
            className="gamification-fade-in"
            style={{
              background: gamificationTheme.cardBackground,
              borderRadius: gamificationTheme.radiusMd,
              padding: "20px",
              boxShadow: gamificationTheme.shadow,
              border: `1px solid ${gamificationTheme.border}`,
              animationDelay: `${index * 80}ms`,
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: gamificationTheme.softBackground,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "14px",
              }}
            >
              {card.icon}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: 700,
                color: card.accent,
              }}
            >
              {card.value}
            </p>
            <p
              style={{
                margin: "6px 0 0",
                color: gamificationTheme.text,
                fontWeight: 600,
              }}
            >
              {card.label}
            </p>
            <p style={{ margin: "4px 0 0", color: gamificationTheme.muted, fontSize: "13px" }}>
              {card.helper}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
