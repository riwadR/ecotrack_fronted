"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { TourResponseDTO, TourStepDTO } from "@/models/tour";
import ReportToast from "@/components/reports/ReportToast";
import TourStepCompletionDrawer from "@/components/tours/TourStepCompletionDrawer";
import {
  formatTourDistance,
  formatTourDuration,
  formatTourSchedule,
  formatTourZones,
  TOUR_STATUS_LABELS,
  TOUR_STATUS_STYLES,
} from "@/lib/tours/tourDisplay";
import {
  canAgentStartTourNow,
  TOUR_START_TOO_EARLY_HINT,
} from "@/lib/tours/tourStartWindow";
import {
  areAllTourStepsCompleted,
  findFirstPendingStep,
  getTourStepProgress,
  sortTourSteps,
} from "@/lib/tours/tourRouteMap";
import { SECTION_TITLE_CLASS } from "@/lib/ui/appChrome";
import { useAgentTourTelemetry } from "@/hooks/useAgentTourTelemetry";
import {
  completeTourStep,
  getMyCurrentTour,
  startTour,
} from "@/services/api/tourApi";

const TourItineraryMap = dynamic(() => import("@/components/tours/TourItineraryMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-slate-50 text-sm text-slate-500">
      Chargement de la carte…
    </div>
  ),
});

type ToastState = {
  message: string;
  variant: "success" | "neutral";
};

function AgentTourEmptyState() {
  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-center shadow-sm">
      <p className="m-0 text-lg font-semibold text-emerald-900">
        Aucune tournée en cours. Vous êtes à jour !
      </p>
      <p className="m-0 mt-2 text-sm leading-relaxed text-emerald-800/90">
        Revenez plus tard lorsqu&apos;une nouvelle tournée vous sera assignée.
      </p>
    </section>
  );
}

function AgentTourCompletedState() {
  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm">
      <p className="m-0 text-xl font-bold text-emerald-900">Tournée terminée !</p>
      <p className="m-0 mt-2 text-sm leading-relaxed text-emerald-800">
        Toutes les collectes ont été validées. Merci pour votre travail.
      </p>
    </section>
  );
}

type AgentCurrentStepCardProps = {
  step: TourStepDTO;
  tourStatus: TourResponseDTO["status"];
  onValidate: (step: TourStepDTO) => void;
  onReportRedirect: () => void;
};

function AgentCurrentStepCard({
  step,
  tourStatus,
  onValidate,
  onReportRedirect,
}: AgentCurrentStepCardProps) {
  const canValidate = tourStatus === "IN_PROGRESS" && step.status === "PENDING";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Conteneur à collecter
      </p>
      <p className="m-0 mt-1 text-lg font-bold text-slate-900">{step.serialNumber}</p>
      <p className="m-0 mt-1 text-sm text-slate-600">
        Ordre de passage : étape n°{step.stepOrder}
      </p>

      {tourStatus === "PENDING" ? (
        <p className="m-0 mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Démarrez la tournée pour pouvoir valider cette collecte.
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-2">
        {canValidate ? (
          <button
            type="button"
            onClick={() => onValidate(step)}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Valider la collecte
          </button>
        ) : null}

        <Link
          href={`/dashboard/signalements?containerId=${encodeURIComponent(step.containerId)}`}
          onClick={onReportRedirect}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Signaler un problème
        </Link>
      </div>
    </article>
  );
}

export default function AgentCollectesView() {
  const [tour, setTour] = useState<TourResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [startingTour, setStartingTour] = useState(false);
  const [completionStep, setCompletionStep] = useState<TourStepDTO | null>(null);
  const [completingStep, setCompletingStep] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useAgentTourTelemetry(tour);

  const loadTour = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getMyCurrentTour();
      setTour(data);
    } catch (error) {
      setTour(null);
      setLoadError(
        error instanceof Error ? error.message : "Impossible de charger votre tournée."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTour();
  }, [loadTour]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const steps = useMemo(
    () => (tour ? sortTourSteps(tour.steps) : []),
    [tour]
  );

  const stepProgress = useMemo(() => getTourStepProgress(steps), [steps]);
  const currentPendingStep = useMemo(() => findFirstPendingStep(steps), [steps]);
  const tourCompleted = useMemo(() => areAllTourStepsCompleted(steps), [steps]);

  useEffect(() => {
    if (!tour) {
      return;
    }
    const timer = window.setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 200);
    return () => window.clearTimeout(timer);
  }, [tour?.id, steps.length]);

  const handleStartTour = useCallback(async () => {
    if (!tour || tour.status !== "PENDING" || !canAgentStartTourNow(tour.startTime)) {
      return;
    }
    setStartingTour(true);
    try {
      await startTour(tour.id);
      setToast({ message: "Tournée démarrée. Bonne collecte !", variant: "success" });
      await loadTour();
    } catch (error) {
      setToast({
        message:
          error instanceof Error ? error.message : "Impossible de démarrer la tournée.",
        variant: "neutral",
      });
    } finally {
      setStartingTour(false);
    }
  }, [loadTour, tour]);

  const handleCompleteStep = useCallback(
    async (collectedVolume: number | undefined) => {
      if (!completionStep) {
        return;
      }
      setCompletingStep(true);
      try {
        await completeTourStep(completionStep.id, {
          collectedVolume,
        });
        setCompletionStep(null);
        setToast({ message: "Collecte validée.", variant: "success" });
        await loadTour();
      } catch (error) {
        setToast({
          message:
            error instanceof Error ? error.message : "Impossible de valider la collecte.",
          variant: "neutral",
        });
      } finally {
        setCompletingStep(false);
      }
    },
    [completionStep, loadTour]
  );

  if (loading) {
    return (
      <p className="m-0 text-sm text-slate-500">Chargement de votre tournée…</p>
    );
  }

  if (loadError) {
    return (
      <p className="m-0 text-sm font-medium text-red-600" role="alert">
        {loadError}
      </p>
    );
  }

  if (!tour) {
    return <AgentTourEmptyState />;
  }

  const statusStyle = TOUR_STATUS_STYLES[tour.status];
  const isInProgress = tour.status === "IN_PROGRESS";
  const isPending = tour.status === "PENDING";
  const hasItinerary = steps.length > 0;
  const showMap = hasItinerary;
  const showStepWizard = isInProgress && hasItinerary && !tourCompleted;
  const canStartTour = isPending && canAgentStartTourNow(tour.startTime, nowMs);

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className={SECTION_TITLE_CLASS}>Ma tournée du jour</h2>
            <p className="m-0 mt-1 text-sm text-slate-600">{formatTourZones(tour)}</p>
          </div>
          <span
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ background: statusStyle.bg, color: statusStyle.color }}
          >
            {TOUR_STATUS_LABELS[tour.status]}
          </span>
        </div>

        <dl className="m-0 mt-4 grid gap-2 text-sm text-slate-700">
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="font-medium text-slate-500">Créneau</dt>
            <dd className="m-0 text-right font-semibold text-slate-900">
              {formatTourSchedule(tour.startTime, tour.endTime)}
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="font-medium text-slate-500">Distance</dt>
            <dd className="m-0 font-semibold text-slate-900">
              {formatTourDistance(tour.totalDistanceKm)}
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="font-medium text-slate-500">Durée estimée</dt>
            <dd className="m-0 font-semibold text-slate-900">
              {formatTourDuration(tour.estimatedDurationMinutes)}
            </dd>
          </div>
        </dl>

        {isPending ? (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => void handleStartTour()}
              disabled={startingTour || !canStartTour}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
            >
              {startingTour ? "Démarrage…" : "Démarrer ma tournée"}
            </button>
            {!canStartTour ? (
              <p className="m-0 mt-2 text-center text-xs text-slate-500">
                {TOUR_START_TOO_EARLY_HINT}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      {showMap ? (
        <section
          className="h-[40vh] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm"
          aria-label="Itinéraire de la tournée"
        >
          <TourItineraryMap
            steps={steps}
            hideCompletedMarkers={isInProgress}
            className="h-full min-h-0 rounded-2xl border-0"
          />
        </section>
      ) : null}

      {isPending && hasItinerary ? (
        <p className="m-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-600">
          Consultez l&apos;itinéraire ci-dessus, puis démarrez la tournée pour valider les
          collectes.
        </p>
      ) : null}

      {showStepWizard ? (
        <>
          {stepProgress ? (
            <p className="m-0 flex justify-center" aria-live="polite">
              <span className="inline-flex min-h-10 items-center rounded-full bg-slate-900 px-5 text-sm font-bold tracking-wide text-white">
                Étape {stepProgress.current} / {stepProgress.total}
              </span>
            </p>
          ) : null}

          {currentPendingStep ? (
            <AgentCurrentStepCard
              step={currentPendingStep}
              tourStatus={tour.status}
              onValidate={setCompletionStep}
              onReportRedirect={() =>
                setToast({
                  message: "Redirection vers signalement…",
                  variant: "neutral",
                })
              }
            />
          ) : null}
        </>
      ) : tourCompleted ? (
        <AgentTourCompletedState />
      ) : null}

      <TourStepCompletionDrawer
        step={completionStep}
        isOpen={completionStep !== null}
        isSubmitting={completingStep}
        onClose={() => setCompletionStep(null)}
        onSubmit={(volume) => void handleCompleteStep(volume)}
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
