"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Role } from "@/models/user";
import type { TourResponseDTO } from "@/models/tour";
import TourEditModal from "@/components/tours/TourEditModal";
import TourItineraryModal from "@/components/tours/TourItineraryModal";
import TourPlanningWorkspace from "@/components/tours/TourPlanningWorkspace";
import TourTableActions from "@/components/tours/TourTableActions";
import ReportToast from "@/components/reports/ReportToast";
import {
  PAGE_DESCRIPTION_CLASS,
  PAGE_STACK_CLASS,
  PAGE_TITLE_CLASS,
  SECTION_TITLE_CLASS,
} from "@/lib/ui/appChrome";
import {
  filterToursByStatus,
  formatTourAgents,
  formatTourDistance,
  formatTourDuration,
  formatTourSchedule,
  shortTourId,
  TOUR_FILTER_OPTIONS,
  TOUR_STATUS_LABELS,
  TOUR_STATUS_STYLES,
  type TourFilterId,
} from "@/lib/tours/tourDisplay";
import { getTourStepCount } from "@/lib/tours/tourStepCount";
import { deleteTour, getTours } from "@/services/api/tourApi";

type CollectesPageClientProps = {
  role: Role;
};

type ToastState = {
  message: string;
  variant: "success" | "neutral";
};

function filterPillClass(active: boolean) {
  return active
    ? "min-h-11 border border-emerald-600 bg-emerald-600 px-4 text-white"
    : "min-h-11 border border-slate-200 bg-white px-4 text-slate-600 hover:bg-slate-50";
}

function CreateTourButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 lg:w-auto"
    >
      Créer une nouvelle tournée
    </button>
  );
}

function AgentCollectesPlaceholder() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className={SECTION_TITLE_CLASS}>Ma tournée du jour</h2>
      <p className="m-0 mt-3 text-sm leading-relaxed text-slate-600">
        Le chargement de votre itinéraire optimisé sera bientôt disponible.
      </p>
    </section>
  );
}

function ManagerCollectesView() {
  const [tours, setTours] = useState<TourResponseDTO[]>([]);
  const [filter, setFilter] = useState<TourFilterId>("all");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [deletingTourId, setDeletingTourId] = useState<string | null>(null);
  const [viewingTourId, setViewingTourId] = useState<string | null>(null);
  const [editingTour, setEditingTour] = useState<TourResponseDTO | null>(null);

  const loadTours = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getTours();
      setTours(data);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Impossible de charger les tournées."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTours();
  }, [loadTours]);

  const filteredTours = useMemo(
    () => filterToursByStatus(tours, filter),
    [tours, filter]
  );

  const stats = useMemo(
    () => ({
      total: tours.length,
      completed: tours.filter((t) => t.status === "COMPLETED").length,
      inProgress: tours.filter((t) => t.status === "IN_PROGRESS").length,
      pending: tours.filter((t) => t.status === "PENDING").length,
    }),
    [tours]
  );

  const handleTourCreated = useCallback((tour: TourResponseDTO) => {
    setTours((prev) => [tour, ...prev]);
    setToast({
      message: `Tournée créée — ${getTourStepCount(tour)} étape(s), ${formatTourDistance(tour.totalDistanceKm)}.`,
      variant: "success",
    });
  }, []);

  const handleDeleteTour = useCallback(
    async (tourId: string) => {
      if (!window.confirm("Supprimer cette tournée planifiée ?")) {
        return;
      }
      setDeletingTourId(tourId);
      try {
        await deleteTour(tourId);
        setTours((prev) => prev.filter((t) => t.id !== tourId));
        setToast({ message: "Tournée supprimée.", variant: "success" });
      } catch (error) {
        setToast({
          message:
            error instanceof Error ? error.message : "Impossible de supprimer la tournée.",
          variant: "neutral",
        });
      } finally {
        setDeletingTourId(null);
      }
    },
    []
  );

  const handleTourError = useCallback((message: string) => {
    setToast({ message, variant: "neutral" });
  }, []);

  const handleTourUpdated = useCallback((tour: TourResponseDTO) => {
    setTours((prev) => prev.map((t) => (t.id === tour.id ? tour : t)));
    setToast({ message: "Tournée mise à jour.", variant: "success" });
  }, []);

  const handleViewTour = useCallback((tour: TourResponseDTO) => {
    setViewingTourId(tour.id);
  }, []);

  const handleEditTour = useCallback((tour: TourResponseDTO) => {
    setEditingTour(tour);
  }, []);

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className={PAGE_TITLE_CLASS}>Collectes</h1>
          <p className={PAGE_DESCRIPTION_CLASS}>
            Suivi des tournées planifiées et en cours · {stats.total} tournée
            {stats.total > 1 ? "s" : ""}
          </p>
        </div>
        <div className="hidden shrink-0 lg:block">
          <CreateTourButton onClick={() => setWorkspaceOpen(true)} />
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
        {[
          { label: "Total", value: stats.total, color: "#8b5cf6" },
          { label: "Terminées", value: stats.completed, color: "#16a34a" },
          { label: "En cours", value: stats.inProgress, color: "#2563eb" },
          { label: "Planifiées", value: stats.pending, color: "#64748b" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
            style={{ borderTop: `3px solid ${item.color}` }}
          >
            <p className="m-0 mb-1 text-2xl font-bold" style={{ color: item.color }}>
              {item.value}
            </p>
            <p className="m-0 text-xs text-slate-600">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {TOUR_FILTER_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setFilter(option.id)}
            className={`cursor-pointer rounded-full py-2 text-[13px] font-medium transition ${filterPillClass(filter === option.id)}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-slate-200/40 sm:p-6">
        {loadError ? (
          <p className="m-0 text-sm font-medium text-red-600" role="alert">
            {loadError}
          </p>
        ) : loading ? (
          <p className="m-0 text-sm text-slate-500">Chargement des tournées…</p>
        ) : filteredTours.length === 0 ? (
          <p className="m-0 text-sm text-slate-500">Aucune tournée pour ce filtre.</p>
        ) : (
          <>
            <div className="hidden lg:block">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-2.5">Réf.</th>
                    <th className="px-4 py-2.5">Zone</th>
                    <th className="px-4 py-2.5">Agents</th>
                    <th className="px-4 py-2.5">Créneau</th>
                    <th className="px-4 py-2.5">Distance</th>
                    <th className="px-4 py-2.5">Durée</th>
                    <th className="px-4 py-2.5">Étapes</th>
                    <th className="px-4 py-2.5">Statut</th>
                    <th className="px-4 py-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTours.map((tour) => {
                    const statusStyle = TOUR_STATUS_STYLES[tour.status];
                    const stepCount = getTourStepCount(tour);
                    return (
                      <tr key={tour.id} className="border-b border-slate-100">
                        <td className="px-4 py-3.5 font-mono text-xs font-bold text-violet-600">
                          {shortTourId(tour.id)}
                        </td>
                        <td className="px-4 py-3.5 text-slate-900">{tour.zone.name}</td>
                        <td className="max-w-[12rem] truncate px-4 py-3.5 text-slate-600">
                          {formatTourAgents(tour)}
                        </td>
                        <td className="px-4 py-3.5 text-[13px] text-slate-600">
                          {formatTourSchedule(tour.startTime, tour.endTime)}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-900">
                          {formatTourDistance(tour.totalDistanceKm)}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">
                          {formatTourDuration(tour.estimatedDurationMinutes)}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">{stepCount}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            style={{
                              background: statusStyle.bg,
                              color: statusStyle.color,
                            }}
                          >
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ background: statusStyle.color }}
                            />
                            {TOUR_STATUS_LABELS[tour.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <TourTableActions
                            tour={tour}
                            isDeleting={deletingTourId === tour.id}
                            onView={handleViewTour}
                            onEdit={handleEditTour}
                            onDelete={(id) => void handleDeleteTour(id)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 lg:hidden">
              {filteredTours.map((tour) => {
                const statusStyle = TOUR_STATUS_STYLES[tour.status];
                const stepCount = getTourStepCount(tour);
                return (
                  <article
                    key={tour.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <span className="font-mono text-sm font-bold text-violet-600">
                        {shortTourId(tour.id)}
                      </span>
                      <span
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                        }}
                      >
                        {TOUR_STATUS_LABELS[tour.status]}
                      </span>
                    </div>
                    <p className="m-0 font-semibold text-slate-900">{tour.zone.name}</p>
                    <p className="m-0 mt-1 text-[13px] text-slate-600">
                      Agents : {formatTourAgents(tour)}
                    </p>
                    <p className="m-0 mt-1 text-[13px] text-slate-600">
                      {formatTourSchedule(tour.startTime, tour.endTime)}
                    </p>
                    <p className="m-0 mt-2 text-[13px] text-slate-900">
                      {formatTourDistance(tour.totalDistanceKm)} ·{" "}
                      {formatTourDuration(tour.estimatedDurationMinutes)} ·{" "}
                      {stepCount} étape{stepCount > 1 ? "s" : ""}
                    </p>
                    <div className="mt-3 border-t border-slate-200 pt-3">
                      <TourTableActions
                        tour={tour}
                        layout="stack"
                        isDeleting={deletingTourId === tour.id}
                        onView={handleViewTour}
                        onEdit={handleEditTour}
                        onDelete={(id) => void handleDeleteTour(id)}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        <p className="m-0 mt-4 text-[13px] text-slate-400">
          {filteredTours.length} tournée{filteredTours.length > 1 ? "s" : ""}
        </p>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
        <CreateTourButton onClick={() => setWorkspaceOpen(true)} />
      </div>

      <div className="h-20 lg:hidden" aria-hidden />

      <TourPlanningWorkspace
        isOpen={workspaceOpen}
        onClose={() => setWorkspaceOpen(false)}
        onSuccess={handleTourCreated}
        onError={handleTourError}
      />

      <TourItineraryModal
        tourId={viewingTourId}
        isOpen={viewingTourId !== null}
        onClose={() => setViewingTourId(null)}
      />

      <TourEditModal
        tour={editingTour}
        isOpen={editingTour !== null}
        onClose={() => setEditingTour(null)}
        onSuccess={handleTourUpdated}
        onError={handleTourError}
      />

      {toast ? (
        <ReportToast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      ) : null}
    </>
  );
}

export default function CollectesPageClient({ role }: CollectesPageClientProps) {
  const isManagerView = role === "ADMIN" || role === "MANAGER";

  if (!isManagerView) {
    return (
      <div className={PAGE_STACK_CLASS}>
        <header>
          <h1 className={PAGE_TITLE_CLASS}>Collectes</h1>
          <p className={PAGE_DESCRIPTION_CLASS}>
            Votre espace de collecte et d&apos;exécution des tournées.
          </p>
        </header>
        <AgentCollectesPlaceholder />
      </div>
    );
  }

  return (
    <div className={PAGE_STACK_CLASS}>
      <ManagerCollectesView />
    </div>
  );
}
