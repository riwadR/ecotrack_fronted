"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ContainerType } from "@/models/container";
import { CONTAINER_TYPE_FORM_OPTIONS } from "@/lib/containers/containerTypeLabels";
import {
  getAlertThresholds,
  putAlertThreshold,
  type AlertThresholdRecord,
} from "@/services/api/adminWorkspaceApi";
import { APP_FORM_CONTROL_CLASS, APP_FORM_LABEL_CLASS, SECTION_TITLE_CLASS } from "@/lib/ui/appChrome";

type RowState = {
  warningThreshold: number;
  criticalThreshold: number;
  serverId: string | null;
};

const DEFAULT_WARNING = 70;
const DEFAULT_CRITICAL = 90;

function buildInitialRows(
  list: AlertThresholdRecord[],
  types: ContainerType[]
): Record<ContainerType, RowState> {
  const map = new Map<ContainerType, AlertThresholdRecord>();
  for (const item of list) {
    map.set(item.containerType, item);
  }
  const out = {} as Record<ContainerType, RowState>;
  for (const t of types) {
    const hit = map.get(t);
    out[t] = {
      warningThreshold: hit?.warningThreshold ?? DEFAULT_WARNING,
      criticalThreshold: hit?.criticalThreshold ?? DEFAULT_CRITICAL,
      serverId: hit?.id ?? null,
    };
  }
  return out;
}

export default function AlertThresholdsConfigPanel() {
  const types = useMemo(
    () => CONTAINER_TYPE_FORM_OPTIONS.map((o) => o.value),
    []
  );

  const [rows, setRows] = useState<Record<ContainerType, RowState> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingType, setSavingType] = useState<ContainerType | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getAlertThresholds();
      setRows(buildInitialRows(list, types));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible.");
      setRows(buildInitialRows([], types));
    } finally {
      setLoading(false);
    }
  }, [types]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateRow = (type: ContainerType, patch: Partial<RowState>) => {
    setRows((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [type]: { ...prev[type]!, ...patch },
      };
    });
  };

  const saveType = async (type: ContainerType) => {
    if (!rows?.[type]) return;
    const { warningThreshold, criticalThreshold } = rows[type]!;
    if (
      warningThreshold < 0 ||
      warningThreshold > 100 ||
      criticalThreshold < 0 ||
      criticalThreshold > 100
    ) {
      setError("Les seuils doivent être compris entre 0 et 100 %.");
      return;
    }
    if (warningThreshold >= criticalThreshold) {
      setError("Le seuil d'avertissement doit être strictement inférieur au seuil critique.");
      return;
    }
    setError(null);
    setSavingType(type);
    try {
      const updated = await putAlertThreshold(type, {
        warningThreshold,
        criticalThreshold,
      });
      setRows((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [type]: {
            warningThreshold: updated.warningThreshold,
            criticalThreshold: updated.criticalThreshold,
            serverId: updated.id,
          },
        };
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setSavingType(null);
    }
  };

  if (loading || rows == null) {
    return (
      <p className="m-0 text-sm text-slate-500">Chargement des seuils par type de collecte…</p>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className={SECTION_TITLE_CLASS}>Seuils d&apos;alerte par type de conteneur</h2>
        <p className="m-0 mt-1 text-sm text-slate-600">
          Ces valeurs alimentent la logique IoT existante (avertissement / critique). Réservé aux administrateurs
          pour la sauvegarde.
        </p>
      </div>

      {error ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-5 xl:grid-cols-2">
        {CONTAINER_TYPE_FORM_OPTIONS.map(({ value: type, label }) => {
          const row = rows[type]!;
          const busy = savingType === type;
          return (
            <article
              key={type}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <header>
                <h3 className="m-0 text-base font-semibold text-slate-900">{label}</h3>
                <p className="m-0 mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-400">{type}</p>
              </header>

              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                <label className={APP_FORM_LABEL_CLASS}>
                  Seuil d&apos;avertissement (%)
                  <input
                    type="number"
                    min={0}
                    max={100}
                    disabled={busy}
                    value={row.warningThreshold}
                    onChange={(ev) =>
                      updateRow(type, { warningThreshold: Number(ev.target.value) })
                    }
                    className={`${APP_FORM_CONTROL_CLASS} h-11 min-h-[2.75rem] touch-manipulation`}
                  />
                </label>
                <label className={APP_FORM_LABEL_CLASS}>
                  Seuil critique (%)
                  <input
                    type="number"
                    min={0}
                    max={100}
                    disabled={busy}
                    value={row.criticalThreshold}
                    onChange={(ev) =>
                      updateRow(type, { criticalThreshold: Number(ev.target.value) })
                    }
                    className={`${APP_FORM_CONTROL_CLASS} h-11 min-h-[2.75rem] touch-manipulation`}
                  />
                </label>
              </div>

              <div className="mt-auto flex justify-end pt-1">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void saveType(type)}
                  className="h-11 min-h-[2.75rem] w-full rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 sm:w-auto touch-manipulation"
                >
                  {busy ? "Enregistrement…" : "Sauvegarder"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
