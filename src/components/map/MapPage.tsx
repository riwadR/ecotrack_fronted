"use client";

import dynamic from "next/dynamic";
import type { Role } from "@/models/user";
import { useMapData } from "@/hooks/useMapData";

const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-[min(70vh,560px)] w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600"
      role="status"
      aria-live="polite"
    >
      Chargement de la carte…
    </div>
  ),
});

export type MapPageProps = {
  viewerRole: Role;
};

function operationalNoticeForRole(role: Role): string | null {
  if (role === "AGENT") {
    return "Agent view: daily tour route and numbered stops will load here once the tour API is connected. The map is shown without bulk containers or zones.";
  }
  if (role === "CITIZEN") {
    return "Citizen view: nearby prioritization and public collection schedules will appear here in a future release. All published containers are shown for now.";
  }
  return null;
}

/**
 * Dashboard map route shell: heading, legend, and client-only Leaflet surface.
 */
export default function MapPage({ viewerRole }: MapPageProps) {
  const { containers, zones, isLoading, error, refetch, isAgentRouteMode, citizenAugments } = useMapData(viewerRole);

  const notice = operationalNoticeForRole(viewerRole);
  const schedulesPreviewCount = citizenAugments.collectionSchedules.length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Carte opérationnelle</h1>
        <p className="text-sm text-slate-600">
          Données issues du backend EcoTrack. Tuiles{" "}
          <span className="font-medium text-slate-800">OpenStreetMap</span>, rendu{" "}
          <span className="font-medium text-slate-800">Leaflet</span>.
          {viewerRole === "ADMIN" || viewerRole === "MANAGER"
            ? " Vue complète : tous les conteneurs et toutes les zones."
            : null}
          {isAgentRouteMode ? " Mode tournée (aperçu) : données d'itinéraire à brancher." : null}
          {viewerRole === "CITIZEN" ? " Mode citoyen : conteneurs (filtre proximité à venir)." : null}
        </p>
      </header>

      {error ? (
        <div
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          <p className="m-0 font-medium">Impossible de charger les données cartographiques.</p>
          <p className="m-0 text-red-800">{error}</p>
          <button
            type="button"
            className="self-start rounded-md bg-red-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800"
            onClick={() => void refetch()}
          >
            Réessayer
          </button>
        </div>
      ) : null}

      <section
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        aria-labelledby="map-legend-heading"
      >
        <h2 id="map-legend-heading" className="mb-3 text-sm font-semibold text-slate-800">
          Légende — remplissage (ADMIN / MANAGER)
        </h2>
        <ul className="flex flex-wrap gap-4 text-sm text-slate-700">
          <li className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white shadow" />
            {"< 50 %"}
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-orange-500 ring-2 ring-white shadow" />
            50 % – 90 %
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white shadow" />
            {"> 90 %"}
          </li>
        </ul>
        {viewerRole === "CITIZEN" && schedulesPreviewCount === 0 ? (
          <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
            Horaires de collecte : structure prête côté client (collectionSchedules vide) — branchement API à venir.
          </p>
        ) : null}
      </section>

      {isLoading ? (
        <div
          className="flex h-[min(70vh,560px)] w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600"
          role="status"
          aria-live="polite"
        >
          Chargement des conteneurs et zones…
        </div>
      ) : (
        <InteractiveMap
          containers={containers}
          zones={zones}
          viewerRole={viewerRole}
          operationalNotice={notice}
        />
      )}
    </div>
  );
}
