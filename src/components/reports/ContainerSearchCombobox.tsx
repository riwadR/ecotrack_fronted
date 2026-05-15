"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Container } from "@/models/map";
import { getContainerTypeLabel } from "@/lib/containers/containerTypeLabels";

export type ContainerSearchComboboxProps = {
  containers: Container[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (container: Container) => void;
  selectedContainerId: string | null;
};

function matchesQuery(container: Container, term: string): boolean {
  if (!term) {
    return true;
  }
  const serial = (container.serialNumber ?? container.id).toLowerCase();
  const zone = (container.zoneName ?? "").toLowerCase();
  return serial.includes(term) || zone.includes(term);
}

/**
 * Search input with a dropdown listing all containers (filtered while typing).
 */
export default function ContainerSearchCombobox({
  containers,
  value,
  onChange,
  onSelect,
  selectedContainerId,
}: ContainerSearchComboboxProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const normalizedQuery = value.trim().toLowerCase();

  const visibleContainers = useMemo(
    () => containers.filter((c) => matchesQuery(c, normalizedQuery)),
    [containers, normalizedQuery]
  );

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div ref={rootRef} className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="relative flex-1">
        <label htmlFor={`${listboxId}-input`} className="block text-sm font-medium text-slate-700">
          Rechercher un conteneur
        </label>
        <input
          id={`${listboxId}-input`}
          type="search"
          value={value}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={`${listboxId}-listbox`}
          aria-autocomplete="list"
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          placeholder="N° de série ou nom de secteur…"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-sky-500 focus:border-sky-500 focus:ring-2"
          autoComplete="off"
        />

        {isOpen && containers.length > 0 ? (
          <ul
            id={`${listboxId}-listbox`}
            role="listbox"
            className="absolute left-0 right-0 top-full z-[500] mt-1 max-h-56 list-none overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
          >
            {visibleContainers.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-slate-500" role="option">
                Aucun conteneur ne correspond à votre recherche.
              </li>
            ) : (
              visibleContainers.map((container) => {
                const serial = container.serialNumber ?? container.id;
                const isActive = selectedContainerId === container.id;

                return (
                  <li key={container.id} role="option" aria-selected={isActive}>
                    <button
                      type="button"
                      className={`flex w-full flex-col gap-0.5 rounded-lg px-3 py-2 text-left text-sm transition ${
                        isActive ? "bg-sky-50 text-sky-900" : "text-slate-800 hover:bg-slate-50"
                      }`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        onSelect(container);
                        onChange(serial);
                        setIsOpen(false);
                      }}
                    >
                      <span className="font-mono font-semibold">{serial}</span>
                      <span className="text-xs text-slate-500">
                        {getContainerTypeLabel(container.containerType)}
                        {" · "}
                        {container.zoneName ?? "Secteur inconnu"} · {container.fillLevelPercent} %
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        ) : null}
      </div>
      <p className="m-0 shrink-0 text-xs text-slate-500 sm:pb-2">
        {visibleContainers.length} résultat{visibleContainers.length !== 1 ? "s" : ""} sur{" "}
        {containers.length} conteneur{containers.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
