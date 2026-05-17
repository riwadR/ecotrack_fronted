"use client";

export type ReportToastProps = {
  message: string;
  variant?: "success" | "neutral" | "warning";
  onDismiss: () => void;
};

/**
 * Lightweight fixed toast for agent report confirmations.
 */
export default function ReportToast({
  message,
  variant = "success",
  onDismiss,
}: ReportToastProps) {
  const background =
    variant === "success" ? "#0f766e" : variant === "warning" ? "#b45309" : "#334155";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[1100] flex max-w-sm items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg"
      style={{ background }}
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-md bg-white/15 px-2 py-0.5 text-xs hover:bg-white/25"
        aria-label="Fermer"
      >
        ✕
      </button>
    </div>
  );
}
