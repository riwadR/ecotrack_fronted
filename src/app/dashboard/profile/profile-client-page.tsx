"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/auth";

import type { Role } from "@/models/user";
import { resolvePublicUsername } from "@/lib/user/displayUsername";
import {
  changeUserPassword,
  getUserByEmail,
  updateUserProfile,
  type UserProfileResponse,
} from "@/services/api/profile";
import { PAGE_DESCRIPTION_CLASS, PAGE_TITLE_CLASS } from "@/lib/ui/appChrome";

function normalizeDateOfBirthInput(value: UserProfileResponse["dateOfBirth"]): string {
  if (!value) return "";

  if (typeof value === "string") {
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

const ROLE_LABEL_FR: Record<Role, string> = {
  ADMIN: "Administrateur",
  MANAGER: "Gestionnaire",
  AGENT: "Agent",
  CITIZEN: "Citoyen",
};

const inputFieldClass =
  "h-11 min-h-[44px] w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-[15px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

const labelClass =
  "mb-1.5 block text-sm font-semibold text-slate-800";

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
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [profileForm, setProfileForm] = useState({
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

  const displayUsername = resolvePublicUsername({
    username: profileForm.username || session.username,
    email: profileForm.email || session.email,
    fallback: "—",
  });

  const initials = (
    displayUsername && displayUsername !== "—"
      ? displayUsername
      : session.email || "?"
  )
    .charAt(0)
    .toUpperCase();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const user = await getUserByEmail(session.email);
        setUserId(user.id);
        setRole(user.role);
        setEmailVerified(Boolean(user.emailVerified));
        setMfaEnabled(Boolean(user.mfaEnabled));
        setProfileForm({
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
        setErrorMessage(err instanceof Error ? err.message : "Impossible de charger le profil.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [session.email]);

  const handleProfileFieldChange = (
    key: keyof Pick<typeof profileForm, "firstName" | "lastName" | "dateOfBirth" | "email">,
    value: string
  ) => {
    setProfileForm((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handlePasswordFieldChange = (key: "oldPassword" | "newPassword", value: string) => {
    setPasswordForm((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!profileForm.email.trim()) {
      setErrorMessage("L'adresse e-mail est obligatoire.");
      return;
    }

    if (!userId) {
      setErrorMessage("Identifiant utilisateur introuvable.");
      return;
    }

    try {
      setSubmittingProfile(true);

      const updated = await updateUserProfile(userId, {
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        email: profileForm.email.trim(),
        dateOfBirth: profileForm.dateOfBirth ? profileForm.dateOfBirth : null,
      });

      setUserId(updated.id);
      setRole(updated.role);
      setEmailVerified(Boolean(updated.emailVerified));
      setMfaEnabled(Boolean(updated.mfaEnabled));
      setProfileForm({
        username: updated.username || profileForm.username,
        firstName: updated.firstName || "",
        lastName: updated.lastName || "",
        dateOfBirth: normalizeDateOfBirthInput(updated.dateOfBirth),
        email: updated.email,
      });

      setSuccessMessage("Informations personnelles enregistrées avec succès.");
      router.refresh();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Impossible de mettre à jour le profil."
      );
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!userId) {
      setErrorMessage("Identifiant utilisateur introuvable.");
      return;
    }

    if (!passwordForm.oldPassword.trim() || !passwordForm.newPassword.trim()) {
      setErrorMessage("L'ancien et le nouveau mot de passe sont obligatoires.");
      return;
    }

    try {
      setSubmittingPassword(true);
      await changeUserPassword(userId, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccessMessage("Mot de passe mis à jour avec succès.");
      setPasswordForm({ oldPassword: "", newPassword: "" });
      router.refresh();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Impossible de changer le mot de passe."
      );
    } finally {
      setSubmittingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-8">
      <header className="lg:col-span-12">
        <h1 className={PAGE_TITLE_CLASS}>Mon profil</h1>
        <p className={`${PAGE_DESCRIPTION_CLASS} mt-2`}>
          Consultez et mettez à jour vos données personnelles et votre sécurité.
        </p>
      </header>

      {/* Summary column — avatar, pseudo, rôle, statuts sécurité (no duplicate identity fields) */}
      <aside className="order-2 flex flex-col gap-6 lg:order-none lg:col-span-4">
        <section
          className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6 lg:sticky lg:top-6"
          aria-label="Résumé du compte"
        >
          <div className="flex flex-col items-center gap-5 text-center">
            <div
              className="flex h-[7.5rem] w-[7.5rem] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-[2.125rem] font-bold text-emerald-800 shadow-inner ring-[3px] ring-emerald-200/90 sm:h-32 sm:w-32 sm:text-[2.25rem]"
              aria-hidden="true"
            >
              {initials}
            </div>

            <div className="min-w-0">
              <h2 className="m-0 break-words text-xl font-bold text-slate-900 md:text-2xl">{displayUsername}</h2>
              <span
                className="mt-4 inline-flex items-center rounded-full bg-emerald-50 px-3 py-2 text-[13px] font-semibold text-emerald-800 ring-1 ring-emerald-200/80"
                title={ROLE_LABEL_FR[role]}
              >
                {ROLE_LABEL_FR[role]}
              </span>
            </div>

            <div className="flex w-full flex-col gap-2 border-t border-slate-100 pt-5">
              <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">Compte</p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start lg:justify-center">
                <span
                  className={
                    emailVerified
                      ? "rounded-full bg-emerald-600/95 px-3 py-2 text-[12px] font-semibold text-white"
                      : "rounded-full bg-amber-100 px-3 py-2 text-[12px] font-semibold text-amber-900 ring-1 ring-amber-200"
                  }
                >
                  Email vérifié : {emailVerified ? "Oui" : "Non"}
                </span>
                <span
                  className={
                    mfaEnabled
                      ? "rounded-full bg-emerald-600/95 px-3 py-2 text-[12px] font-semibold text-white"
                      : "rounded-full bg-slate-100 px-3 py-2 text-[12px] font-semibold text-slate-700 ring-1 ring-slate-200"
                  }
                >
                  MFA : {mfaEnabled ? "Activée" : "Désactivée"}
                </span>
              </div>
            </div>

            {loading ? (
              <p className="m-0 w-full animate-pulse text-sm text-slate-500">Chargement du profil…</p>
            ) : null}
          </div>
        </section>
      </aside>

      {/* Forms column */}
      <div className="order-3 flex flex-col gap-6 lg:order-none lg:col-span-8">
        {errorMessage ? (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 sm:p-4"
            role="alert"
          >
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 sm:p-4"
            role="status"
          >
            {successMessage}
          </div>
        ) : null}

        <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="m-0 text-lg font-semibold text-slate-900 md:text-xl">Informations personnelles</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Mettez à jour votre nom, votre e-mail et votre date de naissance.
          </p>

          {loading ? (
            <p className="mt-6 text-sm text-slate-500">Chargement…</p>
          ) : (
            <form onSubmit={handleSubmitProfile} className="mt-6 flex flex-col gap-5 md:gap-6">
              <div>
                <label htmlFor="profile-username" className={labelClass}>
                  Pseudo
                </label>
                <input
                  id="profile-username"
                  type="text"
                  value={profileForm.username}
                  readOnly
                  disabled
                  className={`${inputFieldClass} bg-slate-50 text-slate-600`}
                  aria-readonly="true"
                />
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Le pseudo ne peut pas être modifié après la création du compte. Contactez le support si
                  besoin.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
                <div>
                  <label htmlFor="profile-first-name" className={labelClass}>
                    Prénom
                  </label>
                  <input
                    id="profile-first-name"
                    type="text"
                    autoComplete="given-name"
                    value={profileForm.firstName}
                    onChange={(e) => handleProfileFieldChange("firstName", e.target.value)}
                    className={inputFieldClass}
                    placeholder="Ex. Marie"
                  />
                </div>
                <div>
                  <label htmlFor="profile-last-name" className={labelClass}>
                    Nom
                  </label>
                  <input
                    id="profile-last-name"
                    type="text"
                    autoComplete="family-name"
                    value={profileForm.lastName}
                    onChange={(e) => handleProfileFieldChange("lastName", e.target.value)}
                    className={inputFieldClass}
                    placeholder="Ex. Dupont"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="profile-email" className={labelClass}>
                  E-mail
                </label>
                <input
                  id="profile-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={profileForm.email}
                  onChange={(e) => handleProfileFieldChange("email", e.target.value)}
                  className={inputFieldClass}
                  placeholder="exemple@domaine.fr"
                />
              </div>

              <div>
                <label htmlFor="profile-dob" className={labelClass}>
                  Date de naissance
                </label>
                <input
                  id="profile-dob"
                  type="date"
                  value={profileForm.dateOfBirth}
                  onChange={(e) => handleProfileFieldChange("dateOfBirth", e.target.value)}
                  className={inputFieldClass}
                  lang="fr-FR"
                />
                <p className="mt-2 text-xs text-slate-500">Choisissez une date avec le sélecteur.</p>
              </div>

              <button
                type="submit"
                disabled={submittingProfile}
                className="h-11 min-h-[44px] w-full rounded-lg bg-emerald-600 px-4 py-3 text-[15px] font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[12rem]"
              >
                {submittingProfile ? "Enregistrement…" : "Enregistrer"}
              </button>
            </form>
          )}
        </section>

        <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="m-0 text-lg font-semibold text-slate-900 md:text-xl">Sécurité &amp; mot de passe</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Ancien mot de passe obligatoire. Le nouveau mot de passe doit comporter au moins 8 caractères avec
            majuscule, minuscule, chiffre et caractère spécial.
          </p>

          {loading ? (
            <p className="mt-6 text-sm text-slate-500">Chargement…</p>
          ) : (
            <form onSubmit={handleSubmitPassword} className="mt-6 flex flex-col gap-5">
              <div>
                <label htmlFor="password-old" className={labelClass}>
                  Ancien mot de passe
                </label>
                <input
                  id="password-old"
                  type="password"
                  autoComplete="current-password"
                  value={passwordForm.oldPassword}
                  onChange={(e) => handlePasswordFieldChange("oldPassword", e.target.value)}
                  className={inputFieldClass}
                  placeholder="Mot de passe actuel"
                />
              </div>

              <div>
                <label htmlFor="password-new" className={labelClass}>
                  Nouveau mot de passe
                </label>
                <input
                  id="password-new"
                  type="password"
                  autoComplete="new-password"
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordFieldChange("newPassword", e.target.value)}
                  className={inputFieldClass}
                  placeholder="Saisissez le nouveau mot de passe"
                />
              </div>

              <button
                type="submit"
                disabled={submittingPassword}
                className="h-11 min-h-[44px] w-full rounded-lg border-2 border-emerald-700 bg-white px-4 py-3 text-[15px] font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[12rem]"
              >
                {submittingPassword ? "Mise à jour…" : "Mettre à jour le mot de passe"}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
