"use client";

import type { Container } from "@/models/map";

export type ContainerListFallbackProps = {
  containers: Container[];
  selectedContainerId: string | null;
  onSelect: (container: Container) => void;
};

/**
 * Accessible list fallback when searching or when the map is secondary.
 */
export default function ContainerListFallback({
  containers,
  selectedContainerId,
  onSelect,
}: ContainerListFallbackProps) {
  if (containers.length === 0) {
    return (
      <p className="m-0 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
        Aucun conteneur ne correspond à votre recherche.
      </p>
    );
  }

  return (
    <ul className="m-0 max-h-48 list-none overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      {containers.map((container) => {
        const serial = container.serialNumber ?? container.id;
        const isActive = selectedContainerId === container.id;

        return (
          <li key={container.id}>
            <button
              type="button"
              onClick={() => onSelect(container)}
              className={`flex w-full flex-col gap-0.5 rounded-lg px-3 py-2 text-left text-sm transition ${
                isActive ? "bg-sky-50 text-sky-900" : "text-slate-800 hover:bg-slate-50"
              }`}
            >
              <span className="font-mono font-semibold">{serial}</span>
              <span className="text-xs text-slate-500">
                {container.zoneName ?? "Secteur inconnu"} · {container.fillLevelPercent} %
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
