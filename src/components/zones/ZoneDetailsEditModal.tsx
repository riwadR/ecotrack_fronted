"use client";

import { useEffect, useId, useState } from "react";
import type { ZoneFormValues } from "@/models/zone";
import type { User } from "@/models/user";
import { getEligibleReceivers } from "@/services/api/usersClient";
import ZoneAssignmentFields from "@/components/zones/ZoneAssignmentFields";
import {
  APP_MODAL_BODY_CLASS,
  APP_MODAL_FOOTER_CLASS,
  APP_MODAL_HEADER_CLASS,
  APP_MODAL_PANEL_COMPACT_CLASS,
  APP_MODAL_SUBTITLE_CLASS,
  APP_MODAL_TITLE_CLASS,
  APP_FORM_CONTROL_CLASS,
  appModalBackdrop,
} from "@/lib/ui/appChrome";

export type ZoneDetailsEditModalProps = {
  isOpen: boolean;
  initialName: string;
  initialDescription: string;
  initialManagerId?: string;
  initialNotificationReceiverIds?: string[];
  isSubmitting: boolean;
  onSave: (values: ZoneFormValues) => void | Promise<void>;
  onClose: () => void;
};

/**
 * Modal for editing zone display fields and notification assignments without touching geometry.
 */
export default function ZoneDetailsEditModal({
  isOpen,
  initialName,
  initialDescription,
  initialManagerId = "",
  initialNotificationReceiverIds = [],
  isSubmitting,
  onSave,
  onClose,
}: ZoneDetailsEditModalProps) {
  const labelId = useId();
  const formId = useId();
  const [draftName, setDraftName] = useState(initialName);
  const [draftDescription, setDraftDescription] = useState(initialDescription);
  const [managerId, setManagerId] = useState(initialManagerId);
  const [notificationReceiverIds, setNotificationReceiverIds] = useState(
    initialNotificationReceiverIds
  );
  const [eligibleUsers, setEligibleUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setDraftName(initialName);
    setDraftDescription(initialDescription);
    setManagerId(initialManagerId);
    setNotificationReceiverIds(initialNotificationReceiverIds);
  }, [
    isOpen,
    initialName,
    initialDescription,
    initialManagerId,
    initialNotificationReceiverIds,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    let cancelled = false;
    setLoadingUsers(true);
    void getEligibleReceivers()
      .then((users) => {
        if (!cancelled) {
          setEligibleUsers(users);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEligibleUsers([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingUsers(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    setNotificationReceiverIds((prev) => prev.filter((id) => id !== managerId));
  }, [managerId]);

  if (!isOpen) {
    return null;
  }

  const trimmedName = draftName.trim();
  const canSave = trimmedName.length > 0 && !isSubmitting;

  const save = () => {
    if (!canSave) {
      return;
    }
    void onSave({
      name: trimmedName,
      description: draftDescription,
      managerId,
      notificationReceiverIds,
    });
  };

  const control = `${APP_FORM_CONTROL_CLASS} disabled:opacity-60`;

  return (
    <div
      className={appModalBackdrop("z-[1000]")}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className={`${APP_MODAL_PANEL_COMPACT_CLASS} max-h-[min(92vh,40rem)] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={APP_MODAL_HEADER_CLASS}>
          <h2 id={labelId} className={APP_MODAL_TITLE_CLASS}>
            Modifier la zone
          </h2>
          <p className={APP_MODAL_SUBTITLE_CLASS}>
            Ajustez le nom, la description et les destinataires des alertes pour ce secteur.
          </p>
        </header>

        <div className={`${APP_MODAL_BODY_CLASS} space-y-4`}>
          <div>
            <label htmlFor={`${labelId}-name`} className="block text-xs font-medium text-slate-700 sm:text-sm">
              Nom
            </label>
            <input
              id={`${labelId}-name`}
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              disabled={isSubmitting}
              className={`${control} mt-1 bg-white`}
            />
          </div>

          <div>
            <label htmlFor={`${labelId}-desc`} className="block text-xs font-medium text-slate-700 sm:text-sm">
              Description
            </label>
            <textarea
              id={`${labelId}-desc`}
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
              disabled={isSubmitting}
              rows={4}
              className={`${control} mt-1 resize-y bg-white`}
            />
          </div>

          <ZoneAssignmentFields
            formId={formId}
            eligibleUsers={eligibleUsers}
            loadingUsers={loadingUsers}
            managerId={managerId}
            notificationReceiverIds={notificationReceiverIds}
            disabled={isSubmitting}
            onManagerChange={setManagerId}
            onReceiversChange={setNotificationReceiverIds}
          />
        </div>

        <footer className={APP_MODAL_FOOTER_CLASS}>
          <button
            type="button"
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:px-4 sm:text-sm"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={!canSave}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
            onClick={save}
          >
            {isSubmitting ? "Enregistrement…" : "Enregistrer"}
          </button>
        </footer>
      </div>
    </div>
  );
}