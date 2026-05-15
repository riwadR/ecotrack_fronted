"use client";

import { useEffect, useState } from "react";
import type { Challenge } from "@/lib/api/challenges";
import {
  CHALLENGE_OUTCOME_BADGE_CLASS,
  CHALLENGE_OUTCOME_LABELS,
  CHALLENGE_STATUS_LABELS,
  getChallengeLifecycleStatus,
  getChallengeProgressPercent,
  getChallengeTimeLabel,
  resolveChallengeOutcome,
} from "@/lib/challenges/challengeUtils";

type ChallengeCardProps = {
  challenge: Challenge;
  now: Date;
  onJoin: (challengeId: string) => Promise<void>;
  onOpenDetail: (challenge: Challenge) => void;
  /** When false, hides join actions (history tab). */
  showJoinActions?: boolean;
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  upcoming: "bg-sky-50 text-sky-800 ring-sky-200",
  expired: "bg-slate-100 text-slate-600 ring-slate-200",
};

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 0 1 0 1.42l-7.25 7.25a1 1 0 0 1-1.42 0l-3.25-3.25a1 1 0 1 1 1.42-1.42l2.54 2.54 6.54-6.54a1 1 0 0 1 1.42 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function ChallengeCard({
  challenge,
  now,
  onJoin,
  onOpenDetail,
  showJoinActions = true,
}: ChallengeCardProps) {
  const [hasJoined, setHasJoined] = useState(challenge.hasJoined);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    setHasJoined(challenge.hasJoined);
  }, [challenge.hasJoined, challenge.id]);

  const lifecycle = getChallengeLifecycleStatus(challenge.startDate, challenge.endDate, now);
  const outcome = resolveChallengeOutcome(challenge, now);
  const progressPercent = getChallengeProgressPercent(
    challenge.currentProgress,
    challenge.goalThreshold
  );
  const timeLabel = getChallengeTimeLabel(challenge.startDate, challenge.endDate, now);
  const canJoin = lifecycle === "active" && !hasJoined;

  const handleJoin = async () => {
    if (!canJoin || isJoining) {
      return;
    }

    setJoinError(null);
    setIsJoining(true);
    try {
      await onJoin(challenge.id);
      setHasJoined(true);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Impossible de rejoindre ce défi.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <article
      className="flex h-full cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
      onClick={() => onOpenDetail(challenge)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetail(challenge);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="m-0 text-lg font-bold text-slate-900">{challenge.title}</h2>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
            {challenge.zone.name}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_BADGE_CLASS[lifecycle]}`}
          >
            {CHALLENGE_STATUS_LABELS[lifecycle]}
          </span>
          {(lifecycle === "expired" || outcome === "SUCCEEDED" || outcome === "FAILED") &&
          (outcome === "SUCCEEDED" || outcome === "FAILED") ? (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${CHALLENGE_OUTCOME_BADGE_CLASS[outcome]}`}
            >
              {CHALLENGE_OUTCOME_LABELS[outcome]}
            </span>
          ) : null}
        </div>
      </div>

      {challenge.description ? (
        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
          {challenge.description}
        </p>
      ) : (
        <p className="mt-3 flex-1 text-sm italic text-slate-400">Aucune description.</p>
      )}

      <p
        className={`mt-4 text-xs font-semibold uppercase tracking-wide ${
          lifecycle === "expired" ? "text-slate-400" : "text-emerald-700"
        }`}
      >
        {timeLabel}
      </p>

      <div className="mt-4">
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progression du défi"
          />
        </div>
        <p className="mt-2 text-sm font-medium text-slate-700">
          {challenge.currentProgress} / {challenge.goalThreshold} signalements validés
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Seuls les signalements validés dans cette zone font progresser le défi.
        </p>
      </div>

      <div className="mt-6">
        {showJoinActions ? (
          hasJoined ? (
          <button
            type="button"
            disabled
            className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-500"
          >
            <CheckIcon />
            Inscrit
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void handleJoin();
            }}
            disabled={!canJoin || isJoining}
            className={[
              "w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition",
              canJoin
                ? "bg-emerald-600 hover:bg-emerald-700 challenge-join-pulse"
                : "cursor-not-allowed bg-slate-300",
            ].join(" ")}
          >
            {isJoining ? "Inscription…" : "Rejoindre le défi"}
          </button>
          )
        ) : (
          <p
            className={[
              "rounded-xl px-4 py-3 text-center text-sm font-bold",
              challenge.currentProgress >= challenge.goalThreshold
                ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                : "bg-red-50 text-red-800 ring-1 ring-red-200",
            ].join(" ")}
          >
            {outcome === "SUCCEEDED" ? "Défi réussi" : "Défi échoué"}
          </p>
        )}
        {showJoinActions && joinError ? (
          <p className="mt-2 text-xs font-medium text-red-600" role="alert">
            {joinError}
          </p>
        ) : null}
        {showJoinActions && lifecycle === "upcoming" && !hasJoined ? (
          <p className="mt-2 text-xs text-slate-500">Ce défi n&apos;est pas encore ouvert.</p>
        ) : null}
        <p className="mt-3 text-center text-xs font-medium text-emerald-700">
          Cliquez pour voir les signalements
        </p>
      </div>
    </article>
  );
}
