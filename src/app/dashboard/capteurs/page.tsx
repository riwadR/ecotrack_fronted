"use client";

import { useState } from "react";

const MOCK_CAPTEURS = [
  { id: "C001", zone: "Zone Nord",  type: "Température", statut: "actif",   valeur: "22°C",    derniere: "il y a 2 min" },
  { id: "C002", zone: "Zone Sud",   type: "Humidité",    statut: "actif",   valeur: "65%",     derniere: "il y a 5 min" },
  { id: "C003", zone: "Zone Est",   type: "CO2",         statut: "alerte",  valeur: "1200ppm", derniere: "il y a 1 min" },
  { id: "C004", zone: "Zone Ouest", type: "Température", statut: "inactif", valeur: "—",       derniere: "il y a 3h" },
  { id: "C005", zone: "Centre",     type: "Humidité",    statut: "actif",   valeur: "58%",     derniere: "il y a 8 min" },
  { id: "C006", zone: "Zone Nord",  type: "CO2",         statut: "alerte",  valeur: "980ppm",  derniere: "il y a 4 min" },
];

const STATUT_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  actif:   { bg: "#dcfce7", color: "#16a34a", label: "Actif" },
  alerte:  { bg: "#fef9c3", color: "#ca8a04", label: "Alerte" },
  inactif: { bg: "#f1f5f9", color: "#94a3b8", label: "Inactif" },
};

const FILTRES = ["tous", "actif", "alerte", "inactif"] as const;

export default function CapteursPage() {
  const [filtre, setFiltre] = useState<string>("tous");

  const filtered = filtre === "tous" ? MOCK_CAPTEURS : MOCK_CAPTEURS.filter((c) => c.statut === filtre);

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      {/* Header */}
      <div>
        <h1 style={{ color: "#0f172a", margin: "0 0 4px" }}>Capteurs</h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          {MOCK_CAPTEURS.filter((c) => c.statut === "actif").length} actifs ·{" "}
          {MOCK_CAPTEURS.filter((c) => c.statut === "alerte").length} en alerte ·{" "}
          {MOCK_CAPTEURS.filter((c) => c.statut === "inactif").length} inactifs
        </p>
      </div>

      {/* KPI mini */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
        {[
          { label: "Total", value: MOCK_CAPTEURS.length, color: "#0ea5e9" },
          { label: "Actifs", value: MOCK_CAPTEURS.filter((c) => c.statut === "actif").length, color: "#16a34a" },
          { label: "Alertes", value: MOCK_CAPTEURS.filter((c) => c.statut === "alerte").length, color: "#ca8a04" },
          { label: "Inactifs", value: MOCK_CAPTEURS.filter((c) => c.statut === "inactif").length, color: "#94a3b8" },
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
          <button
            key={f}
            onClick={() => setFiltre(f)}
            style={{
              padding: "6px 16px", borderRadius: "999px", border: "1px solid",
              fontSize: "13px", fontWeight: 500, cursor: "pointer",
              borderColor: filtre === f ? "#0f172a" : "#e2e8f0",
              backgroundColor: filtre === f ? "#0f172a" : "#fff",
              color: filtre === f ? "#fff" : "#64748b",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table desktop / Cards mobile */}
      <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
        {/* Desktop */}
        <div className="table-desktop">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1.5fr 1fr 1fr 1.5fr", padding: "10px 16px", borderBottom: "1px solid #e2e8f0", color: "#94a3b8", fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>
            <span>ID</span><span>Zone</span><span>Type</span><span>Valeur</span><span>Statut</span><span>Dernière mesure</span>
          </div>
          {filtered.map((c) => {
            const s = STATUT_STYLE[c.statut];
            return (
              <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1.5fr 1fr 1fr 1.5fr", padding: "14px 16px", borderBottom: "1px solid #f1f5f9", alignItems: "center", fontSize: "14px" }}>
                <span style={{ fontWeight: 700, color: "#0ea5e9", fontFamily: "monospace" }}>{c.id}</span>
                <span style={{ color: "#0f172a" }}>{c.zone}</span>
                <span style={{ color: "#475569" }}>{c.type}</span>
                <span style={{ fontWeight: 600 }}>{c.valeur}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: s.bg, color: s.color, fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", width: "fit-content" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.color }} />{s.label}
                </span>
                <span style={{ color: "#94a3b8", fontSize: "13px" }}>{c.derniere}</span>
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
                  <span style={{ fontWeight: 700, color: "#0ea5e9", fontFamily: "monospace" }}>{c.id}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: s.bg, color: s.color, fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.color }} />{s.label}
                  </span>
                </div>
                <p style={{ margin: "0 0 2px", fontWeight: 600, color: "#0f172a" }}>{c.zone} — {c.type}</p>
                <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>Valeur : <strong>{c.valeur}</strong> · {c.derniere}</p>
              </div>
            );
          })}
        </div>

        <p style={{ padding: "12px 16px 0", color: "#94a3b8", fontSize: "13px", margin: 0 }}>{filtered.length} capteur{filtered.length > 1 ? "s" : ""}</p>
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