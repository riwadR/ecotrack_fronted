"use client";

import { useState } from "react";
import {
  PAGE_DESCRIPTION_CLASS,
  PAGE_STACK_CLASS,
  PAGE_TITLE_CLASS,
} from "@/lib/ui/appChrome";

const MOCK_CAPTEURS = [
  { id: "C001", zone: "Zone Nord", type: "Température", statut: "actif", valeur: "22°C", derniere: "il y a 2 min" },
  { id: "C002", zone: "Zone Sud", type: "Humidité", statut: "actif", valeur: "65%", derniere: "il y a 5 min" },
  { id: "C003", zone: "Zone Est", type: "CO2", statut: "alerte", valeur: "1200ppm", derniere: "il y a 1 min" },
  { id: "C004", zone: "Zone Ouest", type: "Température", statut: "inactif", valeur: "—", derniere: "il y a 3h" },
  { id: "C005", zone: "Centre", type: "Humidité", statut: "actif", valeur: "58%", derniere: "il y a 8 min" },
  { id: "C006", zone: "Zone Nord", type: "CO2", statut: "alerte", valeur: "980ppm", derniere: "il y a 4 min" },
];

const STATUT_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  actif: { bg: "#dcfce7", color: "#16a34a", label: "Actif" },
  alerte: { bg: "#fef9c3", color: "#ca8a04", label: "Alerte" },
  inactif: { bg: "#f1f5f9", color: "#94a3b8", label: "Inactif" },
};

const FILTRES = ["tous", "actif", "alerte", "inactif"] as const;

function filterPillClass(active: boolean) {
  return active
    ? "border border-emerald-600 bg-emerald-600 text-white"
    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50";
}

export default function CapteursPage() {
  const [filtre, setFiltre] = useState<string>("tous");

  const filtered =
    filtre === "tous"
      ? MOCK_CAPTEURS
      : MOCK_CAPTEURS.filter((c) => c.statut === filtre);

  return (
    <div className={PAGE_STACK_CLASS}>
      <div>
        <h1 className={PAGE_TITLE_CLASS}>Capteurs</h1>
        <p className={PAGE_DESCRIPTION_CLASS}>
          {MOCK_CAPTEURS.filter((c) => c.statut === "actif").length} actifs ·{" "}
          {MOCK_CAPTEURS.filter((c) => c.statut === "alerte").length} en alerte ·{" "}
          {MOCK_CAPTEURS.filter((c) => c.statut === "inactif").length} inactifs
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
        {[
          { label: "Total", value: MOCK_CAPTEURS.length, color: "#0ea5e9" },
          {
            label: "Actifs",
            value: MOCK_CAPTEURS.filter((c) => c.statut === "actif").length,
            color: "#16a34a",
          },
          {
            label: "Alertes",
            value: MOCK_CAPTEURS.filter((c) => c.statut === "alerte").length,
            color: "#ca8a04",
          },
          {
            label: "Inactifs",
            value: MOCK_CAPTEURS.filter((c) => c.statut === "inactif").length,
            color: "#94a3b8",
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

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/40">
        <div className="table-desktop">
          <div className="grid grid-cols-[1fr_1.5fr_1.5fr_1fr_1fr_1.5fr] gap-2 border-b border-slate-200 px-4 py-2.5 text-xs font-semibold uppercase text-slate-400">
            <span>ID</span>
            <span>Zone</span>
            <span>Type</span>
            <span>Valeur</span>
            <span>Statut</span>
            <span>Dernière mesure</span>
          </div>
          {filtered.map((c) => {
            const s = STATUT_STYLE[c.statut];
            return (
              <div
                key={c.id}
                className="grid grid-cols-[1fr_1.5fr_1.5fr_1fr_1fr_1.5fr] items-center gap-2 border-b border-slate-100 px-4 py-3.5 text-sm"
              >
                <span className="font-mono font-bold text-sky-500">{c.id}</span>
                <span className="text-slate-900">{c.zone}</span>
                <span className="text-slate-600">{c.type}</span>
                <span className="font-semibold">{c.valeur}</span>
                <span
                  className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ background: s.bg, color: s.color }}
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: s.color }}
                  />
                  {s.label}
                </span>
                <span className="text-[13px] text-slate-400">{c.derniere}</span>
              </div>
            );
          })}
        </div>

        <div className="cards-mobile">
          {filtered.map((c) => {
            const s = STATUT_STYLE[c.statut];
            return (
              <div key={c.id} className="border-b border-slate-100 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono font-bold text-sky-500">{c.id}</span>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{ background: s.bg, color: s.color }}
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: s.color }}
                    />
                    {s.label}
                  </span>
                </div>
                <p className="m-0 mb-0.5 font-semibold text-slate-900">
                  {c.zone} — {c.type}
                </p>
                <p className="m-0 text-[13px] text-slate-600">
                  Valeur : <strong>{c.valeur}</strong> · {c.derniere}
                </p>
              </div>
            );
          })}
        </div>

        <p className="m-0 px-4 pt-3 text-[13px] text-slate-400">
          {filtered.length} capteur{filtered.length > 1 ? "s" : ""}
        </p>
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
