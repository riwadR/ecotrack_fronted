"use client";

import type { BackendContainerStatus } from "@/lib/containers/backendContainerStatus";
import { FILL_BAR_CLASS_BY_STATUS } from "@/lib/containers/containerOperationalStatus";
import { parseBackendContainerStatus } from "@/lib/containers/backendContainerStatus";

export type ContainerFillLevelBarProps = {
  fillLevel: number;
  operationalStatus?: BackendContainerStatus | string | null;
};

export default function ContainerFillLevelBar({
  fillLevel,
  operationalStatus,
}: ContainerFillLevelBarProps) {
  const clamped = Math.min(100, Math.max(0, fillLevel));
  const status = parseBackendContainerStatus(operationalStatus);
  const barClass = FILL_BAR_CLASS_BY_STATUS[status];

  return (
    <div className="flex min-w-[7rem] flex-col gap-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold tabular-nums text-slate-900">{clamped}%</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Niveau de remplissage ${clamped} pour cent`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${barClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
