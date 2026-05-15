"use client";

import { useState } from "react";
import {
  PAGE_DESCRIPTION_CLASS,
  PAGE_STACK_CLASS,
  PAGE_TITLE_CLASS,
} from "@/lib/ui/appChrome";

const MOCK_ALERTES_INIT = [
  { id: "ALT-001", capteur: "C003", zone: "Zone Est", type: "CO2 élevé", niveau: "critique", message: "Taux CO2 > 1200ppm", date: "20/04/2026 10:42", resolue: false },
  { id: "ALT-002", capteur: "C007", zone: "Zone Nord", type: "Capteur hors ligne", niveau: "warning", message: "Aucune donnée depuis 3h", date: "20/04/2026 09:10", resolue: false },
  { id: "ALT-003", capteur: "C011", zone: "Centre", type: "Humidité anormale", niveau: "warning", message: "Humidité > 90%", date: "19/04/2026 22:05", resolue: false },
  { id: "ALT-004", capteur: "C002", zone: "Zone Sud", type: "Température haute", niveau: "info", message: "Temp > 35°C", date: "19/04/2026 14:30", resolue: true },
];

const NIVEAU_STYLE: Record<string, { bg: string; color: string; border: string; icon: string }> = {
  critique: { bg: "#fee2e2", color: "#dc2626", border: "#dc2626", icon: "🔴" },
  warning: { bg: "#fef9c3", color: "#ca8a04", border: "#ca8a04", icon: "🟡" },
  info: { bg: "#dbeafe", color: "#2563eb", border: "#2563eb", icon: "🔵" },
};

const FILTRES = ["toutes", "critique", "warning", "info", "résolues"] as const;

function filterPillClass(active: boolean) {
  return active
    ? "border border-emerald-600 bg-emerald-600 text-white"
    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50";
}

export default function AlertesPage() {
  const [alertes, setAlertes] = useState(MOCK_ALERTES_INIT);
  const [filtre, setFiltre] = useState<string>("toutes");

  const filtered = alertes.filter((a) => {
    if (filtre === "toutes") return !a.resolue;
    if (filtre === "résolues") return a.resolue;
    return a.niveau === filtre && !a.resolue;
  });

  function resoudre(id: string) {
    setAlertes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolue: true } : a))
    );
  }

  return (
    <div className={PAGE_STACK_CLASS}>
      <div>
        <h1 className={PAGE_TITLE_CLASS}>Alertes</h1>
        <p className={PAGE_DESCRIPTION_CLASS}>
          {alertes.filter((a) => !a.resolue && a.niveau === "critique").length}{" "}
          critiques ·{" "}
          {alertes.filter((a) => !a.resolue && a.niveau === "warning").length}{" "}
          warnings · {alertes.filter((a) => a.resolue).length} résolues
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
        {[
          {
            label: "Critiques",
            value: alertes.filter((a) => !a.resolue && a.niveau === "critique").length,
            color: "#dc2626",
          },
          {
            label: "Warnings",
            value: alertes.filter((a) => !a.resolue && a.niveau === "warning").length,
            color: "#ca8a04",
          },
          {
            label: "Info",
            value: alertes.filter((a) => !a.resolue && a.niveau === "info").length,
            color: "#2563eb",
          },
          {
            label: "Résolues",
            value: alertes.filter((a) => a.resolue).length,
            color: "#16a34a",
          },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm border-t-[3px] border-t-solid"
            style={{ borderTopColor: k.color }}
          >
            <p
              className="m-0 mb-1 text-2xl font-bold"
              style={{ color: k.color }}
            >
              {k.value}
            </p>
            <p className="m-0 text-xs text-slate-600">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTRES.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltre(f)}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-[13px] font-medium transition ${filterPillClass(filtre === f)}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 && (
          <div className="rounded-xl bg-white p-12 text-center text-slate-400 shadow-sm">
            <p className="m-0 mb-2 text-4xl">✅</p>
            <p className="m-0 font-semibold text-slate-600">
              Aucune alerte dans cette catégorie
            </p>
          </div>
        )}
        {filtered.map((a) => {
          const s = NIVEAU_STYLE[a.niveau];
          return (
            <div
              key={a.id}
              className={`flex gap-4 rounded-xl border-l-4 border-solid p-4 pr-5 shadow-sm sm:p-5 ${
                a.resolue ? "bg-slate-50 opacity-60" : "bg-white"
              }`}
              style={{ borderLeftColor: a.resolue ? "#e2e8f0" : s.border }}
            >
              <span className="shrink-0 text-2xl">
                {a.resolue ? "✅" : s.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    {a.type}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{ background: s.bg, color: s.color }}
                  >
                    {a.niveau}
                  </span>
                  {a.resolue && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      Résolue
                    </span>
                  )}
                </div>
                <p className="m-0 mb-0.5 text-[13px] text-slate-600">
                  {a.message} — Capteur <strong>{a.capteur}</strong> · {a.zone}
                </p>
                <p className="m-0 text-xs text-slate-400">{a.date}</p>
              </div>
              {!a.resolue && (
                <button
                  type="button"
                  onClick={() => resoudre(a.id)}
                  className="shrink-0 self-start whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50"
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
