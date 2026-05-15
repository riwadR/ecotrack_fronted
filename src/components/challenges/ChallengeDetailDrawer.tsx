"use client";

import { useEffect, useMemo, useState } from "react";
import type { Challenge } from "@/lib/api/challenges";
import { getChallengeDetail, type ChallengeDetail } from "@/lib/api/challenges";
import ChallengeContributionList from "@/components/challenges/ChallengeContributionList";
import {
  CHALLENGE_OUTCOME_BADGE_CLASS,
  CHALLENGE_OUTCOME_LABELS,
  formatChallengeDateRange,
  getChallengeProgressPercent,
} from "@/lib/challenges/challengeUtils";

export type ChallengeDetailDrawerProps = {
  challenge: Challenge | null;
  onClose: () => void;
  splitContributions?: boolean;
};

export default function ChallengeDetailDrawer({
  challenge,
  onClose,
  splitContributions = false,
}: ChallengeDetailDrawerProps) {
  const [detail, setDetail] = useState<ChallengeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!challenge) {
      setDetail(null);
      setError(null);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getChallengeDetail(challenge.id);
        if (!cancelled) {
          setDetail(data);
        }
      } catch (err) {
        if (!cancelled) {
          setDetail(null);
          setError(err instanceof Error ? err.message : "Impossible de charger le détail.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [challenge]);

  const myContributions = useMemo(() => detail?.myContributions ?? [], [detail]);

  const otherContributions = useMemo(() => {
    if (!detail) {
      return [];
    }
    if (splitContributions) {
      return detail.otherContributions ?? [];
    }
    return detail.contributions ?? [];
  }, [detail, splitContributions]);

  if (!challenge) {
    return null;
  }

  const resolved = detail?.challenge ?? challenge;
  const progressPercent = getChallengeProgressPercent(
    resolved.currentProgress,
    resolved.goalThreshold
  );

  return (
    <div
      className="fixed inset-0 z-[1000] flex justify-end bg-slate-900/50"
      role="presentation"
      onClick={onClose}
    >
      <aside
        className="flex h-full w-full max-w-lg flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="challenge-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2 id="challenge-detail-title" className="m-0 text-xl font-bold text-slate-900">
              {resolved.title}
            </h2>
            <p className="m-0 mt-1 text-sm text-slate-500">{resolved.zone.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
            aria-label="Fermer"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${CHALLENGE_OUTCOME_BADGE_CLASS[resolved.outcome]}`}
            >
              {CHALLENGE_OUTCOME_LABELS[resolved.outcome]}
            </span>
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
              {resolved.participantCount} participant{resolved.participantCount > 1 ? "s" : ""}
            </span>
          </div>

          <p className="mt-4 text-sm text-slate-600">
            {formatChallengeDateRange(resolved.startDate, resolved.endDate)}
          </p>

          {resolved.description ? (
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{resolved.description}</p>
          ) : null}

          <div className="mt-5">
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-medium text-slate-800">
              {resolved.currentProgress} / {resolved.goalThreshold} signalements validés
            </p>
          </div>

          {isLoading ? (
            <p className="mt-8 text-sm text-slate-500">Chargement des signalements…</p>
          ) : error ? (
            <p className="mt-8 text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          ) : splitContributions ? (
            <div className="mt-8 grid gap-8">
              <section>
                <h3 className="m-0 text-sm font-bold uppercase tracking-wide text-emerald-800">
                  Mes signalements ({myContributions.length})
                </h3>
                <div className="mt-3">
                  <ChallengeContributionList
                    contributions={myContributions}
                    emptyMessage="Vous n'avez pas encore de signalement validé pour ce défi."
                    highlightMine
                  />
                </div>
              </section>
              <section>
                <h3 className="m-0 text-sm font-bold uppercase tracking-wide text-slate-700">
                  Signalements des autres participants ({otherContributions.length})
                </h3>
                <div className="mt-3">
                  <ChallengeContributionList
                    contributions={otherContributions}
                    emptyMessage="Aucun autre signalement validé pour ce défi."
                  />
                </div>
              </section>
            </div>
          ) : (
            <section className="mt-8">
              <h3 className="m-0 text-sm font-bold uppercase tracking-wide text-slate-700">
                Signalements comptabilisés
              </h3>
              <div className="mt-3">
                <ChallengeContributionList
                  contributions={otherContributions}
                  emptyMessage="Aucun signalement validé pour ce défi."
                />
              </div>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}
