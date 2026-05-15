"use client";

export type ChallengeGalleryTabId = "active" | "history";

type ChallengeGalleryTabsProps = {
  activeTab: ChallengeGalleryTabId;
  onTabChange: (tab: ChallengeGalleryTabId) => void;
  activeCount: number;
  historyCount: number;
};

const TABS: { id: ChallengeGalleryTabId; label: string }[] = [
  { id: "active", label: "Défis actifs" },
  { id: "history", label: "Mon historique" },
];

export default function ChallengeGalleryTabs({
  activeTab,
  onTabChange,
  activeCount,
  historyCount,
}: ChallengeGalleryTabsProps) {
  const counts: Record<ChallengeGalleryTabId, number> = {
    active: activeCount,
    history: historyCount,
  };

  return (
    <div className="border-b border-slate-200">
      <div className="flex gap-1" role="tablist" aria-label="Sections des défis">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={[
                "relative -mb-px px-5 py-3 text-sm font-semibold transition-colors",
                isActive ? "text-emerald-700" : "text-slate-500 hover:text-slate-800",
              ].join(" ")}
            >
              {tab.label}
              <span
                className={[
                  "ml-2 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
                  isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600",
                ].join(" ")}
              >
                {counts[tab.id]}
              </span>
              {isActive ? (
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-emerald-600"
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
