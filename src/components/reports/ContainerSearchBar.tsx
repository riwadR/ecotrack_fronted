"use client";

export type ContainerSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  totalCount: number;
};

/**
 * Filters containers by serial number or zone name (list + map views).
 */
export default function ContainerSearchBar({
  value,
  onChange,
  resultCount,
  totalCount,
}: ContainerSearchBarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex-1">
        <label htmlFor="container-search" className="block text-sm font-medium text-slate-700">
          Rechercher un conteneur
        </label>
        <input
          id="container-search"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="N° de série ou nom de secteur…"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-sky-500 focus:border-sky-500 focus:ring-2"
          autoComplete="off"
        />
      </div>
      <p className="m-0 shrink-0 text-xs text-slate-500 sm:pb-2">
        {resultCount} résultat{resultCount !== 1 ? "s" : ""} sur {totalCount} conteneur
        {totalCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
