"use client";

import { useState } from "react";
import {
  PAGE_DESCRIPTION_CLASS,
  PAGE_STACK_CLASS,
  PAGE_TITLE_CLASS,
} from "@/lib/ui/appChrome";

const MOCK_COLLECTES = [
  { id: "COL-001", zone: "Zone Nord", agent: "Pierre Martin", date: "20/04/2026 08:30", poids: "320 kg", statut: "terminée" },
  { id: "COL-002", zone: "Zone Sud", agent: "Sophie Blanc", date: "20/04/2026 09:15", poids: "215 kg", statut: "terminée" },
  { id: "COL-003", zone: "Zone Est", agent: "Pierre Martin", date: "20/04/2026 10:00", poids: "—", statut: "en cours" },
  { id: "COL-004", zone: "Centre", agent: "Lucas Petit", date: "20/04/2026 11:00", poids: "—", statut: "planifiée" },
  { id: "COL-005", zone: "Zone Ouest", agent: "Sophie Blanc", date: "19/04/2026 14:00", poids: "410 kg", statut: "terminée" },
];

const STATUT_STYLE: Record<string, { bg: string; color: string }> = {
  terminée: { bg: "#dcfce7", color: "#16a34a" },
  "en cours": { bg: "#dbeafe", color: "#2563eb" },
  planifiée: { bg: "#f1f5f9", color: "#64748b" },
};

const FILTRES = ["tous", "terminée", "en cours", "planifiée"] as const;

function filterPillClass(active: boolean) {
  return active
    ? "border border-emerald-600 bg-emerald-600 text-white"
    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50";
}

export default function CollectesPage() {
  const [filtre, setFiltre] = useState<string>("tous");

  const filtered =
    filtre === "tous"
      ? MOCK_COLLECTES
      : MOCK_COLLECTES.filter((c) => c.statut === filtre);
  const totalPoids = MOCK_COLLECTES.filter((c) => c.poids !== "—").reduce(
    (acc, c) => acc + parseInt(c.poids, 10),
    0
  );

  return (
    <div className={PAGE_STACK_CLASS}>
      <div>
        <h1 className={PAGE_TITLE_CLASS}>Collectes</h1>
        <p className={PAGE_DESCRIPTION_CLASS}>
          Suivi des tournées · {totalPoids} kg collectés aujourd&apos;hui
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
        {[
          { label: "Total", value: MOCK_COLLECTES.length, color: "#8b5cf6" },
          {
            label: "Terminées",
            value: MOCK_COLLECTES.filter((c) => c.statut === "terminée").length,
            color: "#16a34a",
          },
          {
            label: "En cours",
            value: MOCK_COLLECTES.filter((c) => c.statut === "en cours").length,
            color: "#2563eb",
          },
          {
            label: "Planifiées",
            value: MOCK_COLLECTES.filter((c) => c.statut === "planifiée").length,
            color: "#64748b",
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
          <div className="grid grid-cols-[1fr_1.5fr_1.5fr_1.5fr_1fr_1fr] gap-2 border-b border-slate-200 px-4 py-2.5 text-xs font-semibold uppercase text-slate-400">
            <span>ID</span>
            <span>Zone</span>
            <span>Agent</span>
            <span>Date</span>
            <span>Poids</span>
            <span>Statut</span>
          </div>
          {filtered.map((c) => {
            const s = STATUT_STYLE[c.statut];
            return (
              <div
                key={c.id}
                className="grid grid-cols-[1fr_1.5fr_1.5fr_1.5fr_1fr_1fr] items-center gap-2 border-b border-slate-100 px-4 py-3.5 text-sm"
              >
                <span className="font-mono font-bold text-violet-500">{c.id}</span>
                <span className="text-slate-900">{c.zone}</span>
                <span className="text-slate-600">{c.agent}</span>
                <span className="text-[13px] text-slate-600">{c.date}</span>
                <span className="font-semibold">{c.poids}</span>
                <span
                  className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ background: s.bg, color: s.color }}
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: s.color }}
                  />
                  {c.statut}
                </span>
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
                  <span className="font-mono font-bold text-violet-500">
                    {c.id}
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{ background: s.bg, color: s.color }}
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: s.color }}
                    />
                    {c.statut}
                  </span>
                </div>
                <p className="m-0 mb-0.5 font-semibold text-slate-900">{c.zone}</p>
                <p className="m-0 text-[13px] text-slate-600">
                  Agent : {c.agent} · {c.date}
                </p>
                <p className="m-0 mt-1 text-[13px] text-slate-900">
                  Poids : <strong>{c.poids}</strong>
                </p>
              </div>
            );
          })}
        </div>

        <p className="m-0 px-4 pt-3 text-[13px] text-slate-400">
          {filtered.length} collecte{filtered.length > 1 ? "s" : ""}
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
