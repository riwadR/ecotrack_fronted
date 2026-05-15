import { TrophyIcon } from "@/components/gamification/GamificationIcons";
import { gamificationTheme } from "@/components/gamification/gamificationTheme";
import {
  formatCo2Label,
  formatPointsLabel,
} from "@/lib/gamification/formatters";
import type { LeaderboardEntry } from "@/models/gamification";

type LeaderboardPanelProps = {
  entries: LeaderboardEntry[];
};

function formatCitizenName(entry: LeaderboardEntry): string {
  const firstName = entry.firstName?.trim() ?? "";
  const lastName = entry.lastName?.trim() ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || "Citoyen";
}

export default function LeaderboardPanel({ entries }: LeaderboardPanelProps) {
  return (
    <section aria-label="Classement des citoyens">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <TrophyIcon size={22} />
        <div>
          <h2
            style={{
              margin: 0,
              color: gamificationTheme.title,
              fontSize: "20px",
            }}
          >
            Classement
          </h2>
          <p style={{ margin: "6px 0 0", color: gamificationTheme.muted }}>
            Top 10 des citoyens les plus engagés.
          </p>
        </div>
      </div>

      <div
        style={{
          background: gamificationTheme.cardBackground,
          borderRadius: gamificationTheme.radiusMd,
          padding: "8px",
          boxShadow: gamificationTheme.shadow,
          border: `1px solid ${gamificationTheme.border}`,
        }}
      >
        {entries.length === 0 ? (
          <p style={{ margin: "12px", color: gamificationTheme.muted }}>
            Aucun citoyen classé pour le moment.
          </p>
        ) : (
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {entries.map((entry, index) => (
              <li
                key={`${entry.rank}-${entry.firstName}-${entry.lastName ?? ""}`}
                className="gamification-fade-in"
                style={{
                  display: "grid",
                  gridTemplateColumns: "48px minmax(0, 1fr) auto auto",
                  gap: "12px",
                  alignItems: "center",
                  padding: "12px 14px",
                  borderRadius: gamificationTheme.radiusSm,
                  background:
                    index === 0 ? gamificationTheme.softBackground : "transparent",
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <span
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "999px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      index < 3 ? gamificationTheme.accentSoft : "#f1f5f9",
                    color: gamificationTheme.accentDeep,
                    fontWeight: 700,
                  }}
                >
                  {entry.rank}
                </span>
                <p style={{ margin: 0, color: gamificationTheme.text, fontWeight: 600 }}>
                  {formatCitizenName(entry)}
                </p>
                <p
                  style={{
                    margin: 0,
                    color: gamificationTheme.muted,
                    fontSize: "13px",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatCo2Label(entry.co2Saved)} kg CO2
                </p>
                <p
                  style={{
                    margin: 0,
                    color: gamificationTheme.accentDeep,
                    fontWeight: 700,
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatPointsLabel(entry.totalPoints)} pts
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
