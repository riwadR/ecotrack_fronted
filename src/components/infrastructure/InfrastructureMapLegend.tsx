"use client";

import { INFRASTRUCTURE_MARKER_COLORS } from "@/lib/map/containerMarkerColor";

const LEGEND_ITEMS = [
  { label: "< 50 %", color: INFRASTRUCTURE_MARKER_COLORS.fillLow },
  { label: "50 % – 90 %", color: INFRASTRUCTURE_MARKER_COLORS.fillModerate },
  { label: "> 90 %", color: INFRASTRUCTURE_MARKER_COLORS.fillHigh },
  { label: "Maintenance", color: INFRASTRUCTURE_MARKER_COLORS.maintenance },
] as const;

export default function InfrastructureMapLegend() {
  return (
    <div
      className="pointer-events-none absolute bottom-4 right-4 z-[500] rounded-xl border border-slate-200 bg-white/95 px-3 py-2.5 text-xs text-slate-700 shadow-md backdrop-blur-sm"
      aria-label="Légende des conteneurs"
    >
      <p className="m-0 mb-2 font-semibold text-slate-900">Légende</p>
      <ul className="m-0 flex flex-col gap-1.5 p-0">
        {LEGEND_ITEMS.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-full ring-2 ring-white"
              style={{ backgroundColor: item.color }}
              aria-hidden
            />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
