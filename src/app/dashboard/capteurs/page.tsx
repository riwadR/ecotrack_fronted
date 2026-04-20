import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const MOCK_CAPTEURS = [
  { id: "C001", zone: "Zone Nord",  type: "Température", statut: "actif",    valeur: "22°C",   derniere: "il y a 2 min" },
  { id: "C002", zone: "Zone Sud",   type: "Humidité",    statut: "actif",    valeur: "65%",    derniere: "il y a 5 min" },
  { id: "C003", zone: "Zone Est",   type: "CO2",         statut: "alerte",   valeur: "1200ppm",derniere: "il y a 1 min" },
  { id: "C004", zone: "Zone Ouest", type: "Température", statut: "inactif",  valeur: "—",      derniere: "il y a 3h" },
  { id: "C005", zone: "Centre",     type: "Humidité",    statut: "actif",    valeur: "58%",    derniere: "il y a 8 min" },
];

const STATUT_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  actif:   { bg: "#dcfce7", color: "#16a34a", label: "Actif" },
  alerte:  { bg: "#fef9c3", color: "#ca8a04", label: "Alerte" },
  inactif: { bg: "#f1f5f9", color: "#94a3b8", label: "Inactif" },
};

export default async function CapteursPage() {
  const session = await getSession();
  if (!session || session.role === "CITOYEN") redirect("/dashboard/unauthorized");

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <div>
        <h1 style={{ color: "#0f172a", margin: "0 0 4px" }}>Capteurs</h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          {MOCK_CAPTEURS.filter((c) => c.statut === "actif").length} actifs ·{" "}
          {MOCK_CAPTEURS.filter((c) => c.statut === "alerte").length} en alerte ·{" "}
          {MOCK_CAPTEURS.filter((c) => c.statut === "inactif").length} inactifs
        </p>
      </div>

      <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1.5fr 1fr 1fr 1.5fr", padding: "10px 16px", borderBottom: "1px solid #e2e8f0", color: "#94a3b8", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <span>ID</span><span>Zone</span><span>Type</span><span>Valeur</span><span>Statut</span><span>Dernière mesure</span>
        </div>

        {MOCK_CAPTEURS.map((c) => {
          const s = STATUT_STYLE[c.statut];
          return (
            <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1.5fr 1fr 1fr 1.5fr", padding: "14px 16px", borderBottom: "1px solid #f1f5f9", alignItems: "center", fontSize: "14px" }}>
              <span style={{ fontWeight: 700, color: "#0ea5e9", fontFamily: "monospace" }}>{c.id}</span>
              <span style={{ color: "#0f172a" }}>{c.zone}</span>
              <span style={{ color: "#475569" }}>{c.type}</span>
              <span style={{ fontWeight: 600, color: "#0f172a" }}>{c.valeur}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: s.bg, color: s.color, fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", width: "fit-content" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.color, display: "inline-block" }} />
                {s.label}
              </span>
              <span style={{ color: "#94a3b8", fontSize: "13px" }}>{c.derniere}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}