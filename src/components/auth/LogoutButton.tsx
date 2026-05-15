"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiClient } from "@/lib/api/apiClient";

export type LogoutButtonProps = {
  /** Styled for sidebar vs mobile drawer footer (same touch target minimum). */
  variant?: "desktop" | "mobile-drawer";
  /** Runs before logout request (e.g. close drawer for cleaner UX). */
  onLogoutStart?: () => void;
};

export default function LogoutButton({ variant = "desktop", onLogoutStart }: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    onLogoutStart?.();
    setIsLoading(true);
    try {
      await apiClient.post("/api/logout");
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  const base =
    "w-full min-h-[44px] rounded-lg border px-3 py-3 text-left text-sm font-semibold transition disabled:opacity-60";

  const styles =
    variant === "mobile-drawer"
      ? "border-red-900/70 bg-transparent text-red-400 hover:bg-slate-800 hover:text-red-300"
      : "border-slate-800 bg-transparent text-red-400 hover:border-slate-700 hover:bg-slate-950/60";

  return (
    <button type="button" onClick={() => void handleLogout()} disabled={isLoading} className={`${base} ${styles}`}>
      {isLoading ? "Déconnexion…" : "🚪 Se déconnecter"}
    </button>
  );
}
