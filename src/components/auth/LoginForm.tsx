"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { resetSessionExpiredGuard } from "@/lib/api/authSession";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        setError(data.message || "Identifiants invalides.");
        setIsLoading(false);
        return;
      }

      resetSessionExpiredGuard();
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "16px" }}
    >
      <div>
        <label
          htmlFor="email"
          style={{ display: "block", marginBottom: "8px", color: "#0f172a" }}
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="test@test.com"
          required
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            outline: "none",
          }}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          style={{ display: "block", marginBottom: "8px", color: "#0f172a" }}
        >
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="123456"
          required
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            outline: "none",
          }}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        style={{
          padding: "12px",
          backgroundColor: isLoading ? "#94a3b8" : "#2563eb",
          color: "#ffffff",
          border: "none",
          borderRadius: "10px",
          fontWeight: 600,
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "Connexion..." : "Se connecter"}
      </button>

      {error && (
        <p style={{ color: "#dc2626", margin: 0, textAlign: "center" }}>
          {error}
        </p>
      )}

      <p style={{ color: "#64748b", fontSize: "0.9rem", textAlign: "center" }}>
        Test rapide : utilise <strong>test@test.com</strong> / <strong>123456</strong>
      </p>
    </form>
  );
}