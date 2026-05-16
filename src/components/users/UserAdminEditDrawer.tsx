"use client";

import { useEffect, useId, useState } from "react";
import type { User } from "@/models/user";
import type { Role } from "@/models/user";
import {
  putAdminUserUpdate,
  type AdminUserUpdatePayload,
} from "@/services/api/adminWorkspaceApi";
import { APP_FORM_CONTROL_CLASS, APP_FORM_LABEL_CLASS } from "@/lib/ui/appChrome";

export type UserAdminEditDrawerProps = {
  user: User | null;
  isOpen: boolean;
  currentUserId: string;
  onClose: () => void;
  onSaved: (user: User) => void;
};

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "CITIZEN", label: "Citoyen" },
  { value: "AGENT", label: "Agent" },
  { value: "MANAGER", label: "Gestionnaire" },
  { value: "ADMIN", label: "Administrateur" },
];

export default function UserAdminEditDrawer({
  user,
  isOpen,
  currentUserId,
  onClose,
  onSaved,
}: UserAdminEditDrawerProps) {
  const titleId = useId();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("CITIZEN");
  const [accountActive, setAccountActive] = useState(true);
  const [receivesAlerts, setReceivesAlerts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSelf = user != null && currentUserId !== "" && user.id === currentUserId;

  useEffect(() => {
    if (!isOpen || user == null) {
      return;
    }
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setEmail(user.email ?? "");
    setRole(user.role);
    setAccountActive(!user.accountLocked);
    setReceivesAlerts(user.receivesAlerts);
    setError(null);
  }, [isOpen, user]);

  if (!isOpen || user == null) {
    return null;
  }

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    const payload: AdminUserUpdatePayload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      role: isSelf ? "ADMIN" : role,
      accountLocked: isSelf ? false : !accountActive,
      receivesAlerts,
    };
    try {
      const updated = await putAdminUserUpdate(user.id, payload);
      onSaved(updated);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[1000] bg-slate-900/40"
        aria-label="Fermer"
        onClick={() => {
          if (!submitting) onClose();
        }}
      />
      <aside
        className="fixed right-0 top-0 z-[1001] flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="border-b border-slate-200 px-5 py-4">
          <h2 id={titleId} className="m-0 text-lg font-semibold text-slate-900">
            Modifier l&apos;utilisateur
          </h2>
          <p className="m-0 mt-1 text-sm text-slate-600">
            {user.username} — identité, rôle et état du compte.
          </p>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isSelf ? (
            <p className="m-0 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Vous éditez votre propre compte : le rôle Administrateur et le verrouillage ne peuvent pas être modifiés
              ici.
            </p>
          ) : null}

          <div className="mt-4 grid gap-4">
            <label className={APP_FORM_LABEL_CLASS}>
              Prénom
              <input
                type="text"
                value={firstName}
                onChange={(ev) => setFirstName(ev.target.value)}
                disabled={submitting}
                className={APP_FORM_CONTROL_CLASS}
                autoComplete="given-name"
              />
            </label>
            <label className={APP_FORM_LABEL_CLASS}>
              Nom
              <input
                type="text"
                value={lastName}
                onChange={(ev) => setLastName(ev.target.value)}
                disabled={submitting}
                className={APP_FORM_CONTROL_CLASS}
                autoComplete="family-name"
              />
            </label>
            <label className={APP_FORM_LABEL_CLASS}>
              E-mail
              <input
                type="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                disabled={submitting}
                className={APP_FORM_CONTROL_CLASS}
                autoComplete="email"
              />
            </label>
            <label className={APP_FORM_LABEL_CLASS}>
              Rôle
              <select
                value={role}
                disabled={submitting || isSelf}
                onChange={(ev) => setRole(ev.target.value as Role)}
                className={APP_FORM_CONTROL_CLASS}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="m-0 text-sm font-semibold text-slate-900">
                  Recevoir les alertes systèmes (E-mail)
                </p>
                <p className="m-0 mt-0.5 text-xs text-slate-500">
                  Active les notifications par e-mail pour ce compte (agents, gestionnaires, etc.).
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={receivesAlerts}
                disabled={submitting}
                onClick={() => setReceivesAlerts((v) => !v)}
                className={[
                  "relative h-8 w-14 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                  receivesAlerts ? "bg-emerald-600" : "bg-slate-300",
                  submitting ? "cursor-not-allowed opacity-60" : "",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-1 size-6 rounded-full bg-white shadow transition-transform",
                    receivesAlerts ? "left-7" : "left-1",
                  ].join(" ")}
                  aria-hidden
                />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="m-0 text-sm font-semibold text-slate-900">Compte actif</p>
                <p className="m-0 mt-0.5 text-xs text-slate-500">
                  Désactiver pour verrouiller la connexion (équivalent compte verrouillé).
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={accountActive}
                disabled={submitting || isSelf}
                onClick={() => setAccountActive((v) => !v)}
                className={[
                  "relative h-8 w-14 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                  accountActive ? "bg-emerald-600" : "bg-slate-300",
                  submitting || isSelf ? "cursor-not-allowed opacity-60" : "",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-1 size-6 rounded-full bg-white shadow transition-transform",
                    accountActive ? "left-7" : "left-1",
                  ].join(" ")}
                  aria-hidden
                />
              </button>
            </div>
          </div>

          {error ? (
            <p className="mt-3 text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleSubmit()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? "Enregistrement…" : "Enregistrer"}
          </button>
        </footer>
      </aside>
    </>
  );
}
