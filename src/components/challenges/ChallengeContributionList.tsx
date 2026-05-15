import type { ChallengeContribution } from "@/lib/api/challenges";
import { formatContributionDateTime } from "@/lib/challenges/challengeUtils";
import { getReportTypeLabel } from "@/lib/reports/reportTypeLabels";

type ChallengeContributionListProps = {
  contributions: ChallengeContribution[];
  emptyMessage: string;
  highlightMine?: boolean;
};

export default function ChallengeContributionList({
  contributions,
  emptyMessage,
  highlightMine = false,
}: ChallengeContributionListProps) {
  if (contributions.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="m-0 grid list-none gap-3 p-0">
      {contributions.map((contribution) => (
        <li
          key={contribution.reportId}
          className={[
            "rounded-xl border p-4 text-sm",
            highlightMine
              ? "border-emerald-200 bg-emerald-50/60"
              : "border-slate-200 bg-slate-50/80",
          ].join(" ")}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <span className="font-semibold text-slate-900">
              {getReportTypeLabel(contribution.reportType)}
            </span>
            <time className="text-xs text-slate-500" dateTime={contribution.occurredAt}>
              {formatContributionDateTime(contribution.occurredAt)}
            </time>
          </div>
          <dl className="mt-3 grid gap-1 text-xs text-slate-600">
            <div className="flex gap-2">
              <dt className="font-semibold text-slate-700">Pseudo :</dt>
              <dd className="m-0">{contribution.reporterPseudonym}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-slate-700">Zone :</dt>
              <dd className="m-0">{contribution.zoneName}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-slate-700">Conteneur :</dt>
              <dd className="m-0">{contribution.containerSerialNumber}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}
