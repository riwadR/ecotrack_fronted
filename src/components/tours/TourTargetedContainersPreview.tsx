"use client";

import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { getContainerTypeLabel } from "@/lib/containers/containerTypeLabels";
import type { TargetedContainersByZone } from "@/lib/tours/tourTargetedContainersPreview";
import { SECTION_TITLE_CLASS } from "@/lib/ui/appChrome";

export type TourTargetedContainersPreviewProps = {
  groups: TargetedContainersByZone[];
  orderedContainerIds: string[];
  emptyMessage: string;
  onMoveUp: (containerId: string) => void;
  onMoveDown: (containerId: string) => void;
  onRemove: (containerId: string) => void;
};

export default function TourTargetedContainersPreview({
  groups,
  orderedContainerIds,
  emptyMessage,
  onMoveUp,
  onMoveDown,
  onRemove,
}: TourTargetedContainersPreviewProps) {
  const totalCount = orderedContainerIds.length;
  const indexById = new Map(orderedContainerIds.map((id, index) => [id, index]));

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <p className={`m-0 ${SECTION_TITLE_CLASS} text-sm`}>Conteneurs ciblés</p>
      <p className="m-0 mt-1 text-sm font-semibold text-emerald-700">
        {totalCount} conteneur{totalCount > 1 ? "s" : ""}
      </p>

      {totalCount === 0 ? (
        <p className="m-0 mt-3 text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <div className="mt-3 max-h-72 space-y-4 overflow-y-auto pr-1">
          {groups.map((group) => (
            <div key={`${group.zoneId}-${group.containers[0]?.id ?? "zone"}`}>
              <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Zone : {group.zoneName}
              </p>
              <ul className="m-0 mt-2 list-none space-y-2 p-0">
                {group.containers.map((container) => {
                  const globalIndex = indexById.get(container.id) ?? 0;
                  const routeNumber = globalIndex + 1;
                  const isFirst = globalIndex === 0;
                  const isLast = globalIndex === totalCount - 1;

                  return (
                    <li
                      key={container.id}
                      className="flex items-stretch gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700"
                        aria-label={`Étape ${routeNumber}`}
                      >
                        {routeNumber}
                      </span>

                      <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                        <span className="text-xs font-medium text-slate-500">
                          {getContainerTypeLabel(container.containerType)}
                        </span>
                        <span className="font-mono text-sm font-semibold text-slate-900">
                          {container.serialNumber}
                        </span>
                        <span className="text-xs text-slate-500">
                          Remplissage : {Math.round(container.fillLevelPercent)} %
                        </span>
                      </span>

                      <span className="flex shrink-0 flex-col items-end justify-between gap-1">
                        <span className="flex flex-col items-center gap-0.5">
                          <button
                            type="button"
                            title="Monter"
                            aria-label={`Monter ${container.serialNumber}`}
                            disabled={isFirst}
                            onClick={() => onMoveUp(container.id)}
                            className="inline-flex min-h-[28px] min-w-[28px] items-center justify-center rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-30"
                          >
                            <ChevronUp className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                          </button>
                          <button
                            type="button"
                            title="Descendre"
                            aria-label={`Descendre ${container.serialNumber}`}
                            disabled={isLast}
                            onClick={() => onMoveDown(container.id)}
                            className="inline-flex min-h-[28px] min-w-[28px] items-center justify-center rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-30"
                          >
                            <ChevronDown className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                          </button>
                        </span>
                        <button
                          type="button"
                          title="Retirer"
                          aria-label={`Retirer ${container.serialNumber}`}
                          onClick={() => onRemove(container.id)}
                          className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                          Retirer
                        </button>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
