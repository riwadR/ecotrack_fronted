"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isValidUsername,
  USERNAME_VALIDATION_MESSAGE,
} from "@/lib/validation/username";

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

      setSuccess("Inscription réussie. Redirection vers la page de connexion...");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
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
          htmlFor="username"
          style={{ display: "block", marginBottom: "8px", color: "#0f172a" }}
        >
          Pseudo
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="EcoWarrior99"
          required
          minLength={5}
          maxLength={15}
          pattern="[a-zA-Z0-9_.-]+"
          autoComplete="username"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            outline: "none",
          }}
        />
        <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "12px" }}>
          5 à 15 caractères : lettres, chiffres, tirets, underscores ou points (sans espace).
        </p>
      </div>

      <div>
        <label
          htmlFor="firstName"
          style={{ display: "block", marginBottom: "8px", color: "#0f172a" }}
        >
          Prénom
        </label>
        <input
          id="firstName"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="John"
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
          htmlFor="lastName"
          style={{ display: "block", marginBottom: "8px", color: "#0f172a" }}
        >
          Nom
        </label>
        <input
          id="lastName"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Doe"
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
          htmlFor="dateOfBirth"
          style={{ display: "block", marginBottom: "8px", color: "#0f172a" }}
        >
          Date de naissance
        </label>
        <input
          id="dateOfBirth"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
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
          placeholder="john.doe@test.com"
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
          placeholder="Min. 8 caractères + maj/min/chiffre/spécial"
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
          backgroundColor: isLoading ? "#94a3b8" : "#16a34a",
          color: "#ffffff",
          border: "none",
          borderRadius: "10px",
          fontWeight: 600,
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "Inscription..." : "Créer un compte"}
      </button>

      {error && (
        <p style={{ color: "#dc2626", margin: 0, textAlign: "center" }}>
          {error}
        </p>
      )}

      {success && (
        <p style={{ color: "#16a34a", margin: 0, textAlign: "center" }}>
          {success}
        </p>
      )}

      <p style={{ textAlign: "center", color: "#64748b", margin: 0 }}>
        Déjà un compte ?{" "}
        <Link href="/login" style={{ color: "#2563eb", textDecoration: "none" }}>
          Se connecter
        </Link>
      </p>
    </form>
  );
}