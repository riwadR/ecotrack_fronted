import type { ContainerType } from "@/models/container";
import {
  CONTAINER_TYPE_VALUES,
  getContainerTypeShortLabel,
} from "@/lib/containers/containerTypeLabels";

const PILL_STYLES: Record<ContainerType, string> = {
  GLASS: "border-emerald-200 bg-emerald-50 text-emerald-800",
  PLASTIC: "border-sky-200 bg-sky-50 text-sky-800",
  PAPER: "border-amber-200 bg-amber-50 text-amber-900",
  GENERAL: "border-slate-300 bg-slate-100 text-slate-800",
};

type TourContainerTypePillsProps = {
  types: ContainerType[];
  className?: string;
};

export default function TourContainerTypePills({ types, className = "" }: TourContainerTypePillsProps) {
  const ordered =
    types.length > 0
      ? CONTAINER_TYPE_VALUES.filter((type) => types.includes(type))
      : [];

  if (ordered.length === 0) {
    return <span className="text-xs text-slate-400">—</span>;
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`.trim()}>
      {ordered.map((type) => (
        <span
          key={type}
          className={`inline-flex max-w-full items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-tight ${PILL_STYLES[type]}`}
        >
          {getContainerTypeShortLabel(type)}
        </span>
      ))}
    </div>
  );
}
