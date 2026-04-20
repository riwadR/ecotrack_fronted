"use client";

import { useState } from "react";

const MOCK_ALERTES_INIT = [
  { id: "ALT-001", capteur: "C003", zone: "Zone Est",  type: "CO2 élevé",          niveau: "critique", message: "Taux CO2 > 1200ppm",      date: "20/04/2026 10:42", resolue: false },
  { id: "ALT-002", capteur: "C007", zone: "Zone Nord", type: "Capteur hors ligne",  niveau: "warning",  message: "Aucune donnée depuis 3h", date: "20/04/2026 09:10", resolue: false },
  { id: "ALT-003", capteur: "C011", zone: "Centre",    type: "Humidité anormale",   niveau: "warning",  message: "Humidité > 90%",          date: "19/04/2026 22:05", resolue: false },
  { id: "ALT-004", capteur: "C002", zone: "Zone Sud",  type: "Température haute",   niveau: "info",     message: "Temp > 35°C",             date: "19/04/2026 14:30", resolue: true  },
];

const NIVEAU_STYLE: Record<string, { bg: string; color: string; border: string; icon: string }> = {
  critique: { bg: "#fee2e2", color: "#dc2626", border: "#dc2626", icon: "🔴" },
  warning:  { bg: "#fef9c3", color: "#ca8a04", border: "#ca8a04", icon: "🟡" },
  info:     { bg: "#dbeafe", color: "#2563eb", border: "#2563eb", icon: "🔵" },
};

const FILTRES = ["toutes", "critique", "warning", "info", "résolues"] as const;

export default function AlertesPage() {
  const [alertes, setAlertes] = useState(MOCK_ALERTES_INIT);
  const [filtre, setFiltre] = useState<string>("toutes");

  const filtered = alertes.filter((a) => {
    if (filtre === "toutes") return !a.resolue;
    if (filtre === "résolues") return a.resolue;
    return a.niveau === filtre && !a.resolue;
  });

  function resoudre(id: string) {
    setAlertes((prev) => prev.map((a) => (a.id === id ? { ...a, resolue: true } : a)));
  }

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <div>
        <h1 style={{ color: "#0f172a", margin: "0 0 4px" }}>Alertes</h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          {alertes.filter((a) => !a.resolue && a.niveau === "critique").length} critiques ·{" "}
          {alertes.filter((a) => !a.resolue && a.niveau === "warning").length} warnings ·{" "}
          {alertes.filter((a) => a.resolue).length} résolues
        </p>
      </div>

      {/* KPI mini */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
        {[
          { label: "Critiques", value: alertes.filter((a) => !a.resolue && a.niveau === "critique").length, color: "#dc2626" },
          { label: "Warnings",  value: alertes.filter((a) => !a.resolue && a.niveau === "warning").length,  color: "#ca8a04" },
          { label: "Info",      value: alertes.filter((a) => !a.resolue && a.niveau === "info").length,     color: "#2563eb" },
          { label: "Résolues",  value: alertes.filter((a) => a.resolue).length,                             color: "#16a34a" },
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

      {/* Liste alertes */}
      <div style={{ display: "grid", gap: "12px" }}>
        {filtered.length === 0 && (
          <div style={{ background: "#fff", borderRadius: "12px", padding: "48px", textAlign: "center", color: "#94a3b8" }}>
            <p style={{ fontSize: "40px", margin: "0 0 8px" }}>✅</p>
            <p style={{ margin: 0, fontWeight: 600, color: "#64748b" }}>Aucune alerte dans cette catégorie</p>
          </div>
        )}
        {filtered.map((a) => {
          const s = NIVEAU_STYLE[a.niveau];
          return (
            <div key={a.id} style={{ background: a.resolue ? "#f8fafc" : "#fff", borderRadius: "12px", padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", gap: "16px", alignItems: "flex-start", borderLeft: `4px solid ${a.resolue ? "#e2e8f0" : s.border}`, opacity: a.resolue ? 0.6 : 1 }}>
              <span style={{ fontSize: "24px", flexShrink: 0 }}>{a.resolue ? "✅" : s.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>{a.type}</span>
                  <span style={{ background: s.bg, color: s.color, fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "999px" }}>{a.niveau}</span>
                  {a.resolue && <span style={{ background: "#dcfce7", color: "#16a34a", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "999px" }}>Résolue</span>}
                </div>
                <p style={{ margin: "0 0 2px", color: "#475569", fontSize: "13px" }}>{a.message} — Capteur <strong>{a.capteur}</strong> · {a.zone}</p>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px" }}>{a.date}</p>
              </div>
              {!a.resolue && (
                <button
                  onClick={() => resoudre(a.id)}
                  style={{ flexShrink: 0, padding: "6px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: "13px", fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  ✓ Résoudre
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}