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

export type ZoneNameModalProps = {
  isOpen: boolean;
  initialName?: string;
  initialManagerId?: string;
  initialNotificationReceiverIds?: string[];
  isSubmitting?: boolean;
  onConfirm: (values: ZoneFormValues) => void | Promise<void>;
  onCancel: () => void;
};

/**
 * Naming and assignment step after a polygon sketch is finished.
 */
export default function ZoneNameModal({
  isOpen,
  initialName = "",
  initialManagerId = "",
  initialNotificationReceiverIds = [],
  isSubmitting = false,
  onConfirm,
  onCancel,
}: ZoneNameModalProps) {
  const labelId = useId();
  const formId = useId();
  const [draftName, setDraftName] = useState(initialName);
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
    setManagerId(initialManagerId);
    setNotificationReceiverIds(initialNotificationReceiverIds);
  }, [isOpen, initialName, initialManagerId, initialNotificationReceiverIds]);

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

  const trimmed = draftName.trim();
  const canSubmit = trimmed.length > 0;

  const submit = () => {
    if (!canSubmit || isSubmitting) {
      return;
    }
    void onConfirm({
      name: trimmed,
      description: "",
      managerId,
      notificationReceiverIds,
    });
  };

  return (
    <div
      className={appModalBackdrop("z-[1000]")}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
      onClick={() => {
        if (!isSubmitting) onCancel();
      }}
    >
      <div
        className={`${APP_MODAL_PANEL_COMPACT_CLASS} max-h-[min(92vh,40rem)] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={APP_MODAL_HEADER_CLASS}>
          <h2 id={labelId} className={APP_MODAL_TITLE_CLASS}>
            Nouvelle zone
          </h2>
          <p className={APP_MODAL_SUBTITLE_CLASS}>
            Nommez le secteur et assignez le gestionnaire ainsi que les destinataires des alertes.
          </p>
        </header>

        <div className={`${APP_MODAL_BODY_CLASS} space-y-4`}>
          <div>
            <label
              htmlFor={`${labelId}-input`}
              className="block text-xs font-medium text-slate-700 sm:text-sm"
            >
              Nom
            </label>
            <input
              id={`${labelId}-input`}
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className={`${APP_FORM_CONTROL_CLASS} mt-1`}
              placeholder="Zone Nord"
              autoFocus
              disabled={isSubmitting}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSubmit && !isSubmitting) {
                  e.preventDefault();
                  submit();
                }
                if (e.key === "Escape" && !isSubmitting) {
                  e.preventDefault();
                  onCancel();
                }
              }}
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
            onClick={onCancel}
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={!canSubmit || isSubmitting}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
            onClick={submit}
          >
            {isSubmitting ? "Enregistrement…" : "Valider"}
          </button>
        </footer>
      </div>
    </div>
  );
}
