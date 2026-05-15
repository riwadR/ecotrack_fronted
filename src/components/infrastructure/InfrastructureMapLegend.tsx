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
      className={
        "pointer-events-none absolute bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] " +
        "right-[max(0.75rem,env(safe-area-inset-right,0px))] z-[500] max-w-[min(17rem,calc(100vw-1.25rem))] " +
        "rounded-xl border border-slate-200 bg-white/95 px-2.5 py-2 text-[11px] text-slate-700 shadow-md " +
        "backdrop-blur-sm sm:bottom-4 sm:right-4 sm:px-3 sm:py-2.5 sm:text-xs"
      }
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
