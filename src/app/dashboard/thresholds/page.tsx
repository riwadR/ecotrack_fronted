"use client";

import { useEffect, useState } from "react";
import {
  APP_FORM_CONTROL_CLASS,
  APP_FORM_LABEL_CLASS,
  PAGE_DESCRIPTION_CLASS,
  PAGE_STACK_CLASS,
  PAGE_TITLE_CLASS,
} from "@/lib/ui/appChrome";
import { Threshold } from "@/models/threshold";
import { getThresholds, updateThreshold } from "@/services/api/thresholds";

type EditingValues = Record<
  string,
  {
    warningLevel: number;
    criticalLevel: number;
  }
>;

const typeLabels: Record<string, string> = {
  PLASTIC: "Plastique",
  PAPER: "Papier",
  GLASS: "Verre",
  METAL: "Métal",
  ORGANIC: "Organique",
  MIXED: "Mixte",
};

export default function ThresholdsPage() {
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [editing, setEditing] = useState<EditingValues>({});
  const [loading, setLoading] = useState(true);
  const [savingType, setSavingType] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadThresholds = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getThresholds();
        setThresholds(data);

        const nextEditing: EditingValues = {};
        data.forEach((item) => {
          nextEditing[item.type] = {
            warningLevel: item.warningLevel,
            criticalLevel: item.criticalLevel,
          };
        });
        setEditing(nextEditing);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les seuils."
        );
      } finally {
        setLoading(false);
      }
    };

    loadThresholds();
  }, []);

  const handleChange = (
    type: string,
    key: "warningLevel" | "criticalLevel",
    value: number
  ) => {
    setEditing((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: value,
      },
    }));
    setSuccess("");
    setError("");
  };

  const handleSave = async (type: string) => {
    const values = editing[type];

    if (!values) return;

    if (values.warningLevel < 0 || values.warningLevel > 100) {
      setError("Le seuil d'alerte doit être entre 0 et 100.");
      return;
    }

    if (values.criticalLevel < 0 || values.criticalLevel > 100) {
      setError("Le seuil critique doit être entre 0 et 100.");
      return;
    }

    if (values.criticalLevel <= values.warningLevel) {
      setError("Le seuil critique doit être supérieur au seuil d'alerte.");
      return;
    }

    try {
      setSavingType(type);
      setError("");
      setSuccess("");

      const updated = await updateThreshold(type as never, {
        warningLevel: values.warningLevel,
        criticalLevel: values.criticalLevel,
      });

      setThresholds((prev) =>
        prev.map((item) => (item.type === type ? updated : item))
      );

      setSuccess(`Seuils mis à jour pour ${typeLabels[type] || type}.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de mettre à jour le seuil."
      );
    } finally {
      setSavingType(null);
    }
  };

  return (
    <div className={PAGE_STACK_CLASS}>
      <div>
        <h1 className={PAGE_TITLE_CLASS}>Seuils de remplissage</h1>
        <p className={PAGE_DESCRIPTION_CLASS}>
          Paramètre les niveaux d’alerte et critiques par type de déchet.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
        {[
          {
            label: "Types suivis",
            value: thresholds.length,
            color: "#0ea5e9",
          },
          {
            label: "Seuil moyen alerte",
            value:
              thresholds.length > 0
                ? `${Math.round(
                    thresholds.reduce(
                      (sum, item) => sum + item.warningLevel,
                      0
                    ) / thresholds.length
                  )}%`
                : "—",
            color: "#ca8a04",
          },
          {
            label: "Seuil moyen critique",
            value:
              thresholds.length > 0
                ? `${Math.round(
                    thresholds.reduce(
                      (sum, item) => sum + item.criticalLevel,
                      0
                    ) / thresholds.length
                  )}%`
                : "—",
            color: "#dc2626",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-100 bg-white p-4 shadow-md shadow-slate-200/30 border-t-[3px] border-t-solid"
            style={{ borderTopColor: item.color }}
          >
            <p
              className="m-0 mb-1.5 text-2xl font-bold"
              style={{ color: item.color }}
            >
              {item.value}
            </p>
            <p className="m-0 text-xs text-slate-600">{item.label}</p>
          </div>
        ))}
      </div>

      {error ? (
        <div className="rounded-xl bg-red-50 px-3.5 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-xl bg-emerald-50 px-3.5 py-3 text-sm font-semibold text-emerald-800">
          {success}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/40">
        {loading ? (
          <p className="m-0 text-slate-600">Chargement des seuils...</p>
        ) : (
          <>
            <div className="table-desktop">
              <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-3 border-b border-slate-200 px-4 py-2.5 text-xs font-semibold uppercase text-slate-400">
                <span>Type</span>
                <span>Seuil alerte</span>
                <span>Seuil critique</span>
                <span>Action</span>
              </div>

              {thresholds.map((item) => (
                <div
                  key={item.type}
                  className="grid grid-cols-[1.2fr_1fr_1fr_1fr] items-center gap-3 border-b border-slate-100 px-4 py-3.5"
                >
                  <div>
                    <p className="m-0 mb-1 font-bold text-slate-900">
                      {typeLabels[item.type] || item.type}
                    </p>
                    <p className="m-0 text-xs text-slate-400">{item.type}</p>
                  </div>

                  <input
                    type="number"
                    min={0}
                    max={100}
                    className={APP_FORM_CONTROL_CLASS}
                    value={editing[item.type]?.warningLevel ?? item.warningLevel}
                    onChange={(e) =>
                      handleChange(
                        item.type,
                        "warningLevel",
                        Number(e.target.value)
                      )
                    }
                  />

                  <input
                    type="number"
                    min={0}
                    max={100}
                    className={APP_FORM_CONTROL_CLASS}
                    value={
                      editing[item.type]?.criticalLevel ?? item.criticalLevel
                    }
                    onChange={(e) =>
                      handleChange(
                        item.type,
                        "criticalLevel",
                        Number(e.target.value)
                      )
                    }
                  />

                  <button
                    type="button"
                    onClick={() => handleSave(item.type)}
                    disabled={savingType === item.type}
                    className="rounded-lg bg-emerald-600 px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {savingType === item.type
                      ? "Enregistrement..."
                      : "Enregistrer"}
                  </button>
                </div>
              ))}
            </div>

            <div className="cards-mobile">
              <div className="grid gap-3">
                {thresholds.map((item) => (
                  <div
                    key={item.type}
                    className="rounded-xl border border-slate-100 p-4"
                  >
                    <p className="m-0 mb-1 font-bold text-slate-900">
                      {typeLabels[item.type] || item.type}
                    </p>
                    <p className="m-0 mb-3.5 text-xs text-slate-400">
                      {item.type}
                    </p>

                    <div className="grid gap-3">
                      <div>
                        <label className={APP_FORM_LABEL_CLASS}>
                          Seuil alerte
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          className={APP_FORM_CONTROL_CLASS}
                          value={
                            editing[item.type]?.warningLevel ??
                            item.warningLevel
                          }
                          onChange={(e) =>
                            handleChange(
                              item.type,
                              "warningLevel",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>

                      <div>
                        <label className={APP_FORM_LABEL_CLASS}>
                          Seuil critique
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          className={APP_FORM_CONTROL_CLASS}
                          value={
                            editing[item.type]?.criticalLevel ??
                            item.criticalLevel
                          }
                          onChange={(e) =>
                            handleChange(
                              item.type,
                              "criticalLevel",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSave(item.type)}
                        disabled={savingType === item.type}
                        className="rounded-lg bg-emerald-600 px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {savingType === item.type
                          ? "Enregistrement..."
                          : "Enregistrer"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .table-desktop { display: block; }
        .cards-mobile { display: none; }

        @media (max-width: 767px) {
          .table-desktop { display: none; }
          .cards-mobile { display: block; }
        }
      `}</style>
    </div>
  );
}
