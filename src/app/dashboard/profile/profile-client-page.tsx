"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionUser } from "@/lib/auth";

import { Role } from "@/models/user";
import { resolvePublicUsername } from "@/lib/user/displayUsername";
import {
  changeUserPassword,
  getUserByEmail,
  updateUserProfile,
  type UserProfileResponse,
} from "@/services/api/profile";

function normalizeDateOfBirthInput(
  value: UserProfileResponse["dateOfBirth"]
): string {
  if (!value) return "";

  if (typeof value === "string") {
    // Accept "YYYY-MM-DD" or ISO strings
    return value.includes("T") ? value.slice(0, 10) : value.slice(0, 10);
  }

  if (Array.isArray(value) && value.length >= 3) {
    const year = String(value[0]).padStart(4, "0");
    const month = String(value[1]).padStart(2, "0");
    const day = String(value[2]).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return "";
}

function formatFrenchLocalDate(yyyyMmDd?: string) {
  if (!yyyyMmDd) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyyMmDd);
  if (!m) return yyyyMmDd;
  const year = Number(m[1]);
  const monthIndex = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(year, monthIndex, day);
  if (Number.isNaN(d.getTime())) return yyyyMmDd;
  return d.toLocaleDateString("fr-FR");
}

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

export default function ProfileClientPage({
  session,
}: {
  session: SessionUser;
}) {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState(session.role);
  const [emailVerified, setEmailVerified] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: session.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const user = await getUserByEmail(session.email);
        setUserId(user.id);
        setRole(user.role);
        setEmailVerified(Boolean(user.emailVerified));
        setMfaEnabled(Boolean(user.mfaEnabled));
        setForm({
          username: resolvePublicUsername({
            username: user.username,
            email: user.email,
            fallback: "",
          }),
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          dateOfBirth: normalizeDateOfBirthInput(user.dateOfBirth),
          email: user.email,
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

  const handleChange = (
    key: "firstName" | "lastName" | "dateOfBirth" | "email",
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSuccess("");
    setError("");
  };

  const handlePasswordChange = (
    key: "oldPassword" | "newPassword",
    value: string
  ) => {
    setPasswordForm((prev) => ({
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

    if (!form.email.trim()) {
      setError("L'email est obligatoire.");
      return;
    }

    if (!userId) {
      setError("ID utilisateur introuvable.");
      return;
    }

    try {
      setSubmitting(true);

      const updated = await updateUserProfile(userId, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        dateOfBirth: form.dateOfBirth ? form.dateOfBirth : null,
      });

      setUserId(updated.id);
      setRole(updated.role);
      setEmailVerified(Boolean(updated.emailVerified));
      setMfaEnabled(Boolean(updated.mfaEnabled));
      setForm({
        username: updated.username || form.username,
        firstName: updated.firstName || "",
        lastName: updated.lastName || "",
        dateOfBirth: normalizeDateOfBirthInput(updated.dateOfBirth),
        email: updated.email,
      });

      setSuccess("Profil mis à jour avec succès.");
      router.refresh();
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

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!userId) {
      setError("ID utilisateur introuvable.");
      return;
    }

    if (!passwordForm.oldPassword.trim() || !passwordForm.newPassword.trim()) {
      setError("Ancien et nouveau mot de passe sont obligatoires.");
      return;
    }

    try {
      setChangingPassword(true);
      await changeUserPassword(userId, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccess("Mot de passe mis à jour avec succès.");
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible de changer le mot de passe."
      );
    } finally {
      setChangingPassword(false);
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
            {resolvePublicUsername({
              username: form.username || session.username,
              email: form.email || session.email,
              fallback: "U",
            })
              .charAt(0)
              .toUpperCase()}
          </div>

          <h2 style={{ margin: "0 0 6px", color: "#0f172a" }}>
            {resolvePublicUsername({
              username: form.username || session.username,
              email: form.email || session.email,
            })}
          </h2>
          <p style={{ margin: "0 0 14px", color: "#64748b", fontSize: "14px" }}>
            {`${form.firstName} ${form.lastName}`.trim() || "—"}
          </p>

          <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: "14px" }}>
            <strong style={{ color: "#0f172a" }}>Date de naissance :</strong>{" "}
            {form.dateOfBirth
              ? formatFrenchLocalDate(form.dateOfBirth)
              : "—"}
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
                Nom légal
              </p>
              <p style={{ margin: 0, color: "#0f172a", fontWeight: 600 }}>
                {`${form.firstName} ${form.lastName}`.trim() || "—"}
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
                Compte
              </p>
              <p style={{ margin: "0 0 6px", color: "#0f172a", fontWeight: 600 }}>
                Adresse mail :{" "}
                <span style={{ fontWeight: 500 }}>{form.email || session.email}</span>
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
                Sécurité du compte
              </p>
              <p style={{ margin: "0 0 6px", color: "#0f172a", fontWeight: 600 }}>
                Email vérifié :{" "}
                <span style={{ color: emailVerified ? "#16a34a" : "#ca8a04" }}>
                  {emailVerified ? "Oui" : "Non"}
                </span>
              </p>
              <p style={{ margin: 0, color: "#0f172a", fontWeight: 600 }}>
                MFA :{" "}
                <span style={{ color: mfaEnabled ? "#16a34a" : "#64748b" }}>
                  {mfaEnabled ? "Activée" : "Désactivée"}
                </span>
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
            Mets à jour ton prénom, ton nom, ta date de naissance ou ton email.
          </p>

          {loading ? (
            <p style={{ margin: 0, color: "#64748b" }}>Chargement du profil...</p>
          ) : (
            <div style={{ display: "grid", gap: "22px" }}>
              <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
                <div>
                  <label style={labelStyle}>Pseudo</label>
                  <input
                    type="text"
                    value={form.username}
                    readOnly
                    disabled
                    style={{
                      ...inputStyle,
                      background: "#f8fafc",
                      color: "#64748b",
                      cursor: "not-allowed",
                    }}
                    aria-readonly="true"
                  />
                  <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "12px" }}>
                    Le pseudo ne peut pas être modifié après la création du compte. Veuillez
                    contacter le support en cas de besoin.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }} className="name-grid">
                  <div>
                    <label style={labelStyle}>Prénom</label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      style={inputStyle}
                      placeholder="Ex. Marie"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Nom</label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      style={inputStyle}
                      placeholder="Ex. Dupont"
                    />
                  </div>
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
                  <label style={labelStyle}>Date de naissance</label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                    style={inputStyle}
                  />
                  <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "12px" }}>
                    Format attendu par l&apos;API : <strong>YYYY-MM-DD</strong>.
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

              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "18px" }}>
                <h3 style={{ margin: "0 0 6px", color: "#0f172a" }}>
                  Changer mon mot de passe
                </h3>
                <p style={{ margin: "0 0 16px", color: "#64748b" }}>
                  Saisis ton ancien mot de passe puis le nouveau (8+ chars avec
                  maj/min/chiffre/spécial).
                </p>

                <form
                  onSubmit={handleSubmitPassword}
                  style={{ display: "grid", gap: "14px" }}
                >
                  <div>
                    <label style={labelStyle}>Ancien mot de passe</label>
                    <input
                      type="password"
                      value={passwordForm.oldPassword}
                      onChange={(e) =>
                        handlePasswordChange("oldPassword", e.target.value)
                      }
                      style={inputStyle}
                      placeholder="Ancien mot de passe"
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Nouveau mot de passe</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        handlePasswordChange("newPassword", e.target.value)
                      }
                      style={inputStyle}
                      placeholder="Nouveau mot de passe"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={changingPassword}
                    style={{
                      background: "#0f172a",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "12px 18px",
                      fontWeight: 700,
                      cursor: "pointer",
                      opacity: changingPassword ? 0.7 : 1,
                    }}
                  >
                    {changingPassword ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .profile-grid { grid-template-columns: 0.9fr 1.1fr; }
        .name-grid { grid-template-columns: 1fr 1fr; }

        @media (max-width: 991px) {
          .profile-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 767px) {
          .name-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}