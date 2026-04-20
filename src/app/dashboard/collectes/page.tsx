import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const MOCK_COLLECTES = [
  { id: "COL-001", zone: "Zone Nord",  agent: "Pierre Martin", date: "20/04/2026 08:30", poids: "320 kg", statut: "terminée" },
  { id: "COL-002", zone: "Zone Sud",   agent: "Sophie Blanc",  date: "20/04/2026 09:15", poids: "215 kg", statut: "terminée" },
  { id: "COL-003", zone: "Zone Est",   agent: "Pierre Martin", date: "20/04/2026 10:00", poids: "—",      statut: "en cours" },
  { id: "COL-004", zone: "Centre",     agent: "Lucas Petit",   date: "20/04/2026 11:00", poids: "—",      statut: "planifiée" },
  { id: "COL-005", zone: "Zone Ouest", agent: "Sophie Blanc",  date: "19/04/2026 14:00", poids: "410 kg", statut: "terminée" },
];

const STATUT_STYLE: Record<string, { bg: string; color: string }> = {
  "terminée":  { bg: "#dcfce7", color: "#16a34a" },
  "en cours":  { bg: "#dbeafe", color: "#2563eb" },
  "planifiée": { bg: "#f1f5f9", color: "#64748b" },
};

export default async function CollectesPage() {
  const session = await getSession();
  if (!session || session.role === "CITOYEN") redirect("/dashboard/unauthorized");

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <div>
        <h1 style={{ color: "#0f172a", margin: "0 0 4px" }}>Collectes</h1>
        <p style={{ color: "#64748b", margin: 0 }}>Suivi des tournées de collecte</p>
      </div>

      <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1.5fr 1.5fr 1fr 1fr", padding: "10px 16px", borderBottom: "1px solid #e2e8f0", color: "#94a3b8", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <span>ID</span><span>Zone</span><span>Agent</span><span>Date</span><span>Poids</span><span>Statut</span>
        </div>

        {MOCK_COLLECTES.map((c) => {
          const s = STATUT_STYLE[c.statut];
          return (
            <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1.5fr 1.5fr 1fr 1fr", padding: "14px 16px", borderBottom: "1px solid #f1f5f9", alignItems: "center", fontSize: "14px" }}>
              <span style={{ fontWeight: 700, color: "#8b5cf6", fontFamily: "monospace" }}>{c.id}</span>
              <span style={{ color: "#0f172a" }}>{c.zone}</span>
              <span style={{ color: "#475569" }}>{c.agent}</span>
              <span style={{ color: "#475569", fontSize: "13px" }}>{c.date}</span>
              <span style={{ fontWeight: 600, color: "#0f172a" }}>{c.poids}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: s.bg, color: s.color, fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", width: "fit-content" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.color, display: "inline-block" }} />
                {c.statut}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}