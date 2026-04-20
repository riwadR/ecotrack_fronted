"use client";

import { useState } from "react";

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

const FILTRES = ["tous", "terminée", "en cours", "planifiée"] as const;

export default function CollectesPage() {
  const [filtre, setFiltre] = useState<string>("tous");

  const filtered = filtre === "tous" ? MOCK_COLLECTES : MOCK_COLLECTES.filter((c) => c.statut === filtre);
  const totalPoids = MOCK_COLLECTES.filter((c) => c.poids !== "—").reduce((acc, c) => acc + parseInt(c.poids), 0);

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <div>
        <h1 style={{ color: "#0f172a", margin: "0 0 4px" }}>Collectes</h1>
        <p style={{ color: "#64748b", margin: 0 }}>Suivi des tournées · {totalPoids} kg collectés aujourd'hui</p>
      </div>

      {/* KPI mini */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
        {[
          { label: "Total", value: MOCK_COLLECTES.length, color: "#8b5cf6" },
          { label: "Terminées", value: MOCK_COLLECTES.filter((c) => c.statut === "terminée").length, color: "#16a34a" },
          { label: "En cours", value: MOCK_COLLECTES.filter((c) => c.statut === "en cours").length, color: "#2563eb" },
          { label: "Planifiées", value: MOCK_COLLECTES.filter((c) => c.statut === "planifiée").length, color: "#64748b" },
        ].map((k) => (
          <div key={k.label} style={{ background: "#fff", borderRadius: "12px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderTop: `3px solid ${k.color}` }}>
            <p style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: 700, color: k.color }}>{k.value}</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {FILTRES.map((f) => (
          <button key={f} onClick={() => setFiltre(f)} style={{ padding: "6px 16px", borderRadius: "999px", border: "1px solid", fontSize: "13px", fontWeight: 500, cursor: "pointer", borderColor: filtre === f ? "#0f172a" : "#e2e8f0", backgroundColor: filtre === f ? "#0f172a" : "#fff", color: filtre === f ? "#fff" : "#64748b" }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
        {/* Desktop */}
        <div className="table-desktop">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1.5fr 1.5fr 1fr 1fr", padding: "10px 16px", borderBottom: "1px solid #e2e8f0", color: "#94a3b8", fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>
            <span>ID</span><span>Zone</span><span>Agent</span><span>Date</span><span>Poids</span><span>Statut</span>
          </div>
          {filtered.map((c) => {
            const s = STATUT_STYLE[c.statut];
            return (
              <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1.5fr 1.5fr 1fr 1fr", padding: "14px 16px", borderBottom: "1px solid #f1f5f9", alignItems: "center", fontSize: "14px" }}>
                <span style={{ fontWeight: 700, color: "#8b5cf6", fontFamily: "monospace" }}>{c.id}</span>
                <span>{c.zone}</span>
                <span style={{ color: "#475569" }}>{c.agent}</span>
                <span style={{ color: "#475569", fontSize: "13px" }}>{c.date}</span>
                <span style={{ fontWeight: 600 }}>{c.poids}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: s.bg, color: s.color, fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", width: "fit-content" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.color }} />{c.statut}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mobile cards */}
        <div className="cards-mobile">
          {filtered.map((c) => {
            const s = STATUT_STYLE[c.statut];
            return (
              <div key={c.id} style={{ padding: "16px", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontWeight: 700, color: "#8b5cf6", fontFamily: "monospace" }}>{c.id}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: s.bg, color: s.color, fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.color }} />{c.statut}
                  </span>
                </div>
                <p style={{ margin: "0 0 2px", fontWeight: 600, color: "#0f172a" }}>{c.zone}</p>
                <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>Agent : {c.agent} · {c.date}</p>
                <p style={{ margin: "4px 0 0", color: "#0f172a", fontSize: "13px" }}>Poids : <strong>{c.poids}</strong></p>
              </div>
            );
          })}
        </div>

        <p style={{ padding: "12px 16px 0", color: "#94a3b8", fontSize: "13px", margin: 0 }}>{filtered.length} collecte{filtered.length > 1 ? "s" : ""}</p>
      </div>

      <style>{`
        .table-desktop { display: block; }
        .cards-mobile  { display: none;  }
        @media (max-width: 767px) {
          .table-desktop { display: none;  }
          .cards-mobile  { display: block; }
        }
      `}</style>
    </div>
  );
}