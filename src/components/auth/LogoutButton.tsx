"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiClient } from "@/lib/api/apiClient";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await apiClient.post("/api/logout");
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      style={{
        width: "100%",
        padding: "10px 12px",
        backgroundColor: "transparent",
        color: isLoading ? "#64748b" : "#f87171",
        border: "1px solid #1e293b",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 500,
        cursor: isLoading ? "not-allowed" : "pointer",
        textAlign: "left",
        transition: "all 0.15s",
      }}
    >
      {isLoading ? "Déconnexion..." : "🚪 Se déconnecter"}
    </button>
  );
}