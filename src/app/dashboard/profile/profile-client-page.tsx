"use client";

import { useEffect, useState } from "react";
import { SessionUser } from "@/lib/auth";

import { Role } from "@/models/user";

type UserProfileResponse = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  outline: "none",
  fontSize: "14px",
  color: "#0f172a",
  background: "#fff",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  color: "#0f172a",
  fontWeight: 600,
  fontSize: "14px",
};

async function getCurrentUserByEmail(email: string): Promise<UserProfileResponse> {
  const response = await fetch(`${API_URL}/users/by-email/${encodeURIComponent(email)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Impossible de charger le profil utilisateur.");
  }

  return response.json();
}

async function updateUser(
  id: string,
  payload: { name: string; email: string; password?: string }
): Promise<UserProfileResponse> {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Impossible de mettre à jour le profil.";
    try {
      const errorData = await response.json();
      message = errorData?.message || message;
    } catch {
      //
    }
    throw new Error(message);
  }

  return response.json();
}

export default function ProfileClientPage({
  session,
}: {
  session: SessionUser;
}) {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState(session.role);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: session.name || "",
    email: session.email || "",
    password: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const user = await getCurrentUserByEmail(session.email);
        setUserId(user.id);
        setRole(user.role);
        setForm({
          name: user.name,
          email: user.email,
          password: "",
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger le profil."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [session.email]);

  const handleChange = (key: "name" | "email" | "password", value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Le nom est obligatoire.");
      return;
    }

    if (!form.email.trim()) {
      setError("L'email est obligatoire.");
      return;
    }

    if (form.password && form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (!userId) {
      setError("ID utilisateur introuvable.");
      return;
    }

    try {
      setSubmitting(true);

      await updateUser(userId, {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password.trim() || undefined,
      });

      setSuccess("Profil mis à jour avec succès.");
      setForm((prev) => ({
        ...prev,
        password: "",
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de mettre à jour le profil."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <div>
        <h1 style={{ margin: "0 0 4px", color: "#0f172a" }}>Mon profil</h1>
        <p style={{ margin: 0, color: "#64748b" }}>
          Consulte et modifie tes informations personnelles.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "0.9fr 1.1fr",
          gap: "24px",
        }}
        className="profile-grid"
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "#e0f2fe",
              color: "#0ea5e9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 700,
              marginBottom: "16px",
            }}
          >
            {(form.name || session.name || "U").charAt(0).toUpperCase()}
          </div>

          <h2 style={{ margin: "0 0 6px", color: "#0f172a" }}>
            {form.name || session.name}
          </h2>
          <p style={{ margin: "0 0 14px", color: "#64748b" }}>
            {form.email || session.email}
          </p>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              background: "#f1f5f9",
              color: "#475569",
              fontSize: "12px",
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: "999px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#94a3b8",
              }}
            />
            {role}
          </span>

          <div style={{ marginTop: "20px", display: "grid", gap: "12px" }}>
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "12px",
                padding: "14px",
              }}
            >
              <p style={{ margin: "0 0 4px", color: "#94a3b8", fontSize: "12px" }}>
                Session active
              </p>
              <p style={{ margin: 0, color: "#0f172a", fontWeight: 600 }}>
                Connecté via cookie httpOnly
              </p>
            </div>

            <div
              style={{
                background: "#f8fafc",
                borderRadius: "12px",
                padding: "14px",
              }}
            >
              <p style={{ margin: "0 0 4px", color: "#94a3b8", fontSize: "12px" }}>
                État
              </p>
              <p style={{ margin: 0, color: "#16a34a", fontWeight: 600 }}>
                Compte actif
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            borderTop: "3px solid #0ea5e9",
          }}
        >
          <h2 style={{ margin: "0 0 4px", color: "#0f172a" }}>
            Modifier mes informations
          </h2>
          <p style={{ margin: "0 0 20px", color: "#64748b" }}>
            Mets à jour ton nom, ton email ou ton mot de passe.
          </p>

          {loading ? (
            <p style={{ margin: 0, color: "#64748b" }}>Chargement du profil...</p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
              <div>
                <label style={labelStyle}>Nom complet</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  style={inputStyle}
                  placeholder="Ex. Marie Dupont"
                />
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  style={inputStyle}
                  placeholder="Ex. marie@ecotrack.com"
                />
              </div>

              <div>
                <label style={labelStyle}>Nouveau mot de passe</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  style={inputStyle}
                  placeholder="Laisser vide si inchangé"
                />
                <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "12px" }}>
                  Laisse ce champ vide pour conserver le mot de passe actuel.
                </p>
              </div>

              {error ? (
                <div
                  style={{
                    background: "#fee2e2",
                    color: "#dc2626",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {error}
                </div>
              ) : null}

              {success ? (
                <div
                  style={{
                    background: "#dcfce7",
                    color: "#16a34a",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {success}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: "#0ea5e9",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 18px",
                  fontWeight: 700,
                  cursor: "pointer",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .profile-grid { grid-template-columns: 0.9fr 1.1fr; }

        @media (max-width: 991px) {
          .profile-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}