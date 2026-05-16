import type { ContainerType } from "@/models/container";

const FILTER_PILL_ACTIVE =
  "border-green-600 bg-green-600 text-white shadow-sm hover:bg-green-700";
const FILTER_PILL_INACTIVE =
  "border-slate-300 bg-transparent text-slate-600 hover:border-slate-400 hover:bg-slate-50";

/** Tour map type toggles: green when visible, outline when hidden. */
export function typeFilterPillClass(_type: ContainerType, active: boolean): string {
  const base =
    "inline-flex min-h-10 items-center rounded-full border px-3.5 text-xs font-semibold transition sm:min-h-11 sm:px-4";
  return `${base} ${active ? FILTER_PILL_ACTIVE : FILTER_PILL_INACTIVE}`;
}
