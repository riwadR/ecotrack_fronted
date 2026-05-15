"use client";

import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import { useChallengeClock } from "@/hooks/useChallengeClock";
import { usePeriodicRefresh } from "@/hooks/usePeriodicRefresh";
import type { Challenge, ChallengeCreatePayload } from "@/lib/api/challenges";
import {
  createChallenge,
  deleteChallenge,
  getChallenges,
  updateChallenge,
} from "@/lib/api/challenges";
import { CrossDeleteIcon, PencilIcon } from "@/components/zones/zoneTableIcons";
import type { Zone } from "@/models/zone";
import { getZones } from "@/services/api/zones";
import {
  CHALLENGE_OUTCOME_BADGE_CLASS,
  CHALLENGE_OUTCOME_LABELS,
  CHALLENGE_STATUS_LABELS,
  computeChallengeAdminStats,
  formatChallengeDateRange,
  getChallengeLifecycleStatus,
} from "@/lib/challenges/challengeUtils";
import ChallengeAdminStatsCards from "@/components/challenges/ChallengeAdminStatsCards";
import ChallengeCreateModal from "@/components/challenges/admin/ChallengeCreateModal";
import ChallengeDetailDrawer from "@/components/challenges/ChallengeDetailDrawer";
import { ChallengeAdminTableSkeleton } from "@/components/challenges/ChallengeSkeletons";
import ReportToast from "@/components/reports/ReportToast";
import { PAGE_DESCRIPTION_CLASS, PAGE_TITLE_CLASS } from "@/lib/ui/appChrome";

const STATUS_BADGE_CLASS: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  upcoming: "bg-sky-50 text-sky-800 ring-sky-200",
  expired: "bg-slate-100 text-slate-600 ring-slate-200",
};

export default function ChallengesAdminPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const { now } = useChallengeClock();

  const loadData = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setIsLoading(true);
    }
    setLoadError(null);
    try {
      const [challengeList, zoneList] = await Promise.all([getChallenges(), getZones()]);
      setChallenges(challengeList);
      setZones(zoneList);
    } catch (err) {
      if (!options?.silent) {
        setLoadError(err instanceof Error ? err.message : "Impossible de charger les défis.");
      }
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  }, []);

  const silentRefresh = useCallback(() => loadData({ silent: true }), [loadData]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  usePeriodicRefresh(silentRefresh, { intervalMs: 30_000 });

  const stats = useMemo(() => computeChallengeAdminStats(challenges), [challenges]);

  const handleCreate = async (payload: ChallengeCreatePayload) => {
    setIsSubmitting(true);
    try {
      const created = await createChallenge(payload);
      setChallenges((current) => [created, ...current]);
      setIsModalOpen(false);
      setToastMessage("Le défi a été créé avec succès.");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Impossible de créer le défi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (payload: ChallengeCreatePayload) => {
    if (!editingChallenge) {
      return;
    }
    setIsSubmitting(true);
    try {
      const updated = await updateChallenge(editingChallenge.id, payload);
      setChallenges((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
      setEditingChallenge(null);
      setToastMessage("Le défi a été mis à jour.");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Impossible de mettre à jour le défi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestDelete = (challenge: Challenge, event: MouseEvent) => {
    event.stopPropagation();
    const confirmed = window.confirm(
      `Supprimer le défi « ${challenge.title} » ? Les participations seront également retirées.`
    );
    if (!confirmed) {
      return;
    }
    void deleteChallenge(challenge.id)
      .then(() => {
        setChallenges((current) => current.filter((item) => item.id !== challenge.id));
        if (selectedChallenge?.id === challenge.id) {
          setSelectedChallenge(null);
        }
        setToastMessage("Le défi a été supprimé.");
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : "Impossible de supprimer le défi.");
      });
  };

  return (
    <div className="grid gap-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className={PAGE_TITLE_CLASS}>Gestion des défis</h1>
          <p className={PAGE_DESCRIPTION_CLASS}>
            Créez et suivez les défis communautaires par zone.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          Nouveau défi
        </button>
      </header>

      {!isLoading && challenges.length > 0 ? <ChallengeAdminStatsCards stats={stats} /> : null}

      {loadError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
        >
          {loadError}
        </div>
      ) : null}

      {isLoading ? (
        <ChallengeAdminTableSkeleton />
      ) : challenges.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-12 text-center text-slate-600 shadow-sm">
          Aucun défi publié. Cliquez sur « Nouveau défi » pour commencer.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3 w-24">Actions</th>
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Progression</th>
                <th className="px-4 py-3">Participants</th>
                <th className="px-4 py-3">Période</th>
                <th className="px-4 py-3">Résultat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {challenges.map((challenge) => {
                const lifecycle = getChallengeLifecycleStatus(
                  challenge.startDate,
                  challenge.endDate,
                  now
                );
                return (
                  <tr
                    key={challenge.id}
                    className="cursor-pointer text-slate-800 transition hover:bg-slate-50"
                    onClick={() => setSelectedChallenge(challenge)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                          aria-label={`Modifier ${challenge.title}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setEditingChallenge(challenge);
                          }}
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 shadow-sm hover:bg-red-50"
                          aria-label={`Supprimer ${challenge.title}`}
                          onClick={(event) => handleRequestDelete(challenge, event)}
                        >
                          <CrossDeleteIcon />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{challenge.title}</td>
                    <td className="px-4 py-3">{challenge.zone.name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatChallengeDateRange(challenge.startDate, challenge.endDate)}
                    </td>
                    <td className="px-4 py-3">
                      {challenge.currentProgress} / {challenge.goalThreshold}
                    </td>
                    <td className="px-4 py-3">{challenge.participantCount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_BADGE_CLASS[lifecycle]}`}
                      >
                        {CHALLENGE_STATUS_LABELS[lifecycle]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${CHALLENGE_OUTCOME_BADGE_CLASS[challenge.outcome]}`}
                      >
                        {CHALLENGE_OUTCOME_LABELS[challenge.outcome]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ChallengeCreateModal
        isOpen={isModalOpen}
        zones={zones}
        isSubmitting={isSubmitting}
        onConfirm={handleCreate}
        onCancel={() => {
          if (!isSubmitting) {
            setIsModalOpen(false);
          }
        }}
      />

      <ChallengeCreateModal
        isOpen={editingChallenge !== null}
        zones={zones}
        editingChallenge={editingChallenge}
        isSubmitting={isSubmitting}
        onConfirm={handleUpdate}
        onCancel={() => {
          if (!isSubmitting) {
            setEditingChallenge(null);
          }
        }}
      />

      <ChallengeDetailDrawer
        challenge={selectedChallenge}
        onClose={() => setSelectedChallenge(null)}
      />

      {toastMessage ? (
        <ReportToast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      ) : null}
    </div>
  );
}

