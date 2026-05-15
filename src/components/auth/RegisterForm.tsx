"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isValidUsername,
  USERNAME_VALIDATION_MESSAGE,
} from "@/lib/validation/username";
import { APP_FORM_CONTROL_CLASS, APP_FORM_LABEL_CLASS } from "@/lib/ui/appChrome";

export default function RegisterForm() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmedUsername = username.trim();
    if (!isValidUsername(trimmedUsername)) {
      setError(USERNAME_VALIDATION_MESSAGE);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: trimmedUsername,
          firstName,
          lastName,
          dateOfBirth,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Impossible de créer le compte.");
        setIsLoading(false);
        return;
      }

      setSuccess(
        "Inscription réussie. Redirection vers la page de connexion..."
      );
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  }

  const controlClass = APP_FORM_CONTROL_CLASS;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div>
        <label className={APP_FORM_LABEL_CLASS} htmlFor="username">
          Pseudo
        </label>
        <input
          id="username"
          type="text"
          className={controlClass}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="EcoWarrior99"
          required
          minLength={5}
          maxLength={15}
          pattern="[a-zA-Z0-9_.-]+"
          autoComplete="username"
        />
        <p className="m-0 mt-1.5 text-xs text-slate-400">
          5 à 15 caractères : lettres, chiffres, tirets, underscores ou points
          (sans espace).
        </p>
      </div>

      <div>
        <label className={APP_FORM_LABEL_CLASS} htmlFor="firstName">
          Prénom
        </label>
        <input
          id="firstName"
          type="text"
          className={controlClass}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Jean"
          required
        />
      </div>

      <div>
        <label className={APP_FORM_LABEL_CLASS} htmlFor="lastName">
          Nom
        </label>
        <input
          id="lastName"
          type="text"
          className={controlClass}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Dupont"
          required
        />
      </div>

      <div>
        <label className={APP_FORM_LABEL_CLASS} htmlFor="dateOfBirth">
          Date de naissance
        </label>
        <input
          id="dateOfBirth"
          type="date"
          className={controlClass}
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          required
        />
      </div>

      <div>
        <label className={APP_FORM_LABEL_CLASS} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className={controlClass}
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
          className={controlClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 caractères + maj/min/chiffre/spécial"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-lg bg-emerald-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isLoading ? "Inscription..." : "Créer un compte"}
      </button>

      {error && (
        <p className="m-0 text-center text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p className="m-0 text-center text-sm font-medium text-emerald-700">
          {success}
        </p>
      )}

      <p className="m-0 text-center text-sm text-slate-600">
        Déjà un compte ?{" "}
        <Link
          href="/login"
          className="font-semibold text-emerald-600 no-underline hover:text-emerald-700"
        >
          Se connecter
        </Link>
      </p>
    </form>
  );
}
