"use client";

import { useMemo } from "react";
import type { User } from "@/models/user";
import { APP_FORM_CONTROL_CLASS, APP_FORM_LABEL_CLASS } from "@/lib/ui/appChrome";

function formatUserLabel(user: User): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (name) {
    return `${name} (${user.username})`;
  }
  return user.username;
}

export type ZoneAssignmentFieldsProps = {
  formId: string;
  eligibleUsers: User[];
  loadingUsers: boolean;
  managerId: string;
  notificationReceiverIds: string[];
  disabled?: boolean;
  onManagerChange: (managerId: string) => void;
  onReceiversChange: (ids: string[]) => void;
};

/**
 * Manager select + multi-select notification receivers for zone create/edit forms.
 */
export default function ZoneAssignmentFields({
  formId,
  eligibleUsers,
  loadingUsers,
  managerId,
  notificationReceiverIds,
  disabled = false,
  onManagerChange,
  onReceiversChange,
}: ZoneAssignmentFieldsProps) {
  const managerFieldId = `${formId}-manager`;
  const receiverSet = useMemo(
    () => new Set(notificationReceiverIds),
    [notificationReceiverIds]
  );

  const receiverCandidates = useMemo(
    () => eligibleUsers.filter((user) => user.id !== managerId),
    [eligibleUsers, managerId]
  );

  const toggleReceiver = (userId: string) => {
    const next = new Set(receiverSet);
    if (next.has(userId)) {
      next.delete(userId);
    } else {
      next.add(userId);
    }
    onReceiversChange(Array.from(next));
  };

  return (
    <>
      <label htmlFor={managerFieldId} className={APP_FORM_LABEL_CLASS}>
        Gestionnaire de la zone
        <select
          id={managerFieldId}
          value={managerId}
          onChange={(e) => onManagerChange(e.target.value)}
          disabled={disabled || loadingUsers}
          className={APP_FORM_CONTROL_CLASS}
        >
          <option value="">— Aucun gestionnaire —</option>
          {eligibleUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {formatUserLabel(user)} · {user.role === "ADMIN" ? "Admin" : "Gestionnaire"}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="mb-2 text-xs font-medium text-slate-700 sm:text-sm">
          Autres destinataires (Notifications)
        </legend>
        <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white">
          {loadingUsers ? (
            <p className="m-0 px-3 py-3 text-sm text-slate-500">Chargement des utilisateurs…</p>
          ) : receiverCandidates.length === 0 ? (
            <p className="m-0 px-3 py-3 text-sm text-slate-500">
              Aucun autre destinataire disponible.
            </p>
          ) : (
            <ul className="m-0 list-none divide-y divide-slate-100 p-0">
              {receiverCandidates.map((user) => {
                const checked = receiverSet.has(user.id);
                const inputId = `${formId}-receiver-${user.id}`;
                return (
                  <li key={user.id}>
                    <label
                      htmlFor={inputId}
                      className="flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
                    >
                      <input
                        id={inputId}
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleReceiver(user.id)}
                        disabled={disabled}
                        className="h-5 w-5 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-medium">{formatUserLabel(user)}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </fieldset>
    </>
  );
}
