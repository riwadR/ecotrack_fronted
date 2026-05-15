"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { resetSessionExpiredGuard } from "@/lib/api/authSession";
import { APP_FORM_CONTROL_CLASS, APP_FORM_LABEL_CLASS } from "@/lib/ui/appChrome";

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
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div>
        <label className={APP_FORM_LABEL_CLASS} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className={APP_FORM_CONTROL_CLASS}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.fr"
          required
        />
      </div>

      <div>
        <label className={APP_FORM_LABEL_CLASS} htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          className={APP_FORM_CONTROL_CLASS}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-lg bg-emerald-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isLoading ? "Connexion..." : "Se connecter"}
      </button>

      {error && (
        <p className="m-0 text-center text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
