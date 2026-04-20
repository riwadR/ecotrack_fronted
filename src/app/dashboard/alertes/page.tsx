import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const MOCK_ALERTES = [
  { id: "ALT-001", capteur: "C003", zone: "Zone Est",   type: "CO2 élevé",         niveau: "critique", message: "Taux CO2 > 1200ppm",     date: "20/04/2026 10:42" },
  { id: "ALT-002", capteur: "C007", zone: "Zone Nord",  type: "Capteur hors ligne", niveau: "warning",  message: "Aucune donnée depuis 3h",date: "20/04/2026 09:10" },
  { id: "ALT-003", capteur: "C011", zone: "Centre",     type: "Humidité anormale",  niveau: "warning",  message: "Humidité > 90%",          date: "19/04/2026 22:05" },
  { id: "ALT-004", capteur: "C002", zone: "Zone Sud",   type: "Température haute",  niveau: "info",     message: "Temp > 35°C",             date: "19/04/2026 14:30" },
];

const NIVEAU_STYLE: Record<string, { bg: string; color: string; icon: string }> = {
  critique: { bg: "#fee2e2", color: "#dc2626", icon: "🔴" },
  warning:  { bg: "#fef9c3", color: "#ca8a04", icon: "🟡" },
  info:     { bg: "#dbeafe", color: "#2563eb", icon: "🔵" },
};

export default async function AlertesPage() {
  const session = await getSession();
  if (!session || !["ADMIN", "GESTIONNAIRE"].includes(session.role)) {
    redirect("/dashboard/unauthorized");
  }

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <div>
        <h1 style={{ color: "#0f172a", margin: "0 0 4px" }}>Alertes</h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          {MOCK_ALERTES.filter((a) => a.niveau === "critique").length} critiques ·{" "}
          {MOCK_ALERTES.filter((a) => a.niveau === "warning").length} warnings
        </p>
      </div>

      <div style={{ display: "grid", gap: "12px" }}>
        {MOCK_ALERTES.map((a) => {
          const s = NIVEAU_STYLE[a.niveau];
          return (
            <div key={a.id} style={{ background: "#fff", borderRadius: "12px", padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "16px", alignItems: "center", borderLeft: `4px solid ${s.color}` }}>
              <span style={{ fontSize: "24px" }}>{s.icon}</span>
              <div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>{a.type}</span>
                  <span style={{ background: s.bg, color: s.color, fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "999px" }}>{a.niveau}</span>
                </div>
                <p style={{ margin: 0, color: "#475569", fontSize: "13px" }}>{a.message} — Capteur <strong>{a.capteur}</strong> · {a.zone}</p>
              </div>
              <span style={{ color: "#94a3b8", fontSize: "12px", whiteSpace: "nowrap" }}>{a.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}