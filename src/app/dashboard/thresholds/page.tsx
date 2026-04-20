"use client";

import { useEffect, useState } from "react";
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
    <div style={{ display: "grid", gap: "24px" }}>
      <div>
        <h1 style={{ margin: "0 0 4px", color: "#0f172a" }}>
          Seuils de remplissage
        </h1>
        <p style={{ margin: 0, color: "#64748b" }}>
          Paramètre les niveaux d’alerte et critiques par type de déchet.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
        }}
      >
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
                    thresholds.reduce((sum, item) => sum + item.warningLevel, 0) /
                      thresholds.length
                  )}%`
                : "—",
            color: "#ca8a04",
          },
          {
            label: "Seuil moyen critique",
            value:
              thresholds.length > 0
                ? `${Math.round(
                    thresholds.reduce((sum, item) => sum + item.criticalLevel, 0) /
                      thresholds.length
                  )}%`
                : "—",
            color: "#dc2626",
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              borderTop: `3px solid ${item.color}`,
            }}
          >
            <p
              style={{
                margin: "0 0 6px",
                fontSize: "24px",
                fontWeight: 700,
                color: item.color,
              }}
            >
              {item.value}
            </p>
            <p style={{ margin: 0, color: "#64748b", fontSize: "12px" }}>
              {item.label}
            </p>
          </div>
        ))}
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

      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        {loading ? (
          <p style={{ margin: 0, color: "#64748b" }}>Chargement des seuils...</p>
        ) : (
          <>
            <div className="table-desktop">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
                  padding: "10px 16px",
                  borderBottom: "1px solid #e2e8f0",
                  color: "#94a3b8",
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                <span>Type</span>
                <span>Seuil alerte</span>
                <span>Seuil critique</span>
                <span>Action</span>
              </div>

              {thresholds.map((item) => (
                <div
                  key={item.type}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
                    padding: "14px 16px",
                    borderBottom: "1px solid #f1f5f9",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div>
                    <p style={{ margin: "0 0 4px", color: "#0f172a", fontWeight: 700 }}>
                      {typeLabels[item.type] || item.type}
                    </p>
                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px" }}>
                      {item.type}
                    </p>
                  </div>

                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editing[item.type]?.warningLevel ?? item.warningLevel}
                    onChange={(e) =>
                      handleChange(item.type, "warningLevel", Number(e.target.value))
                    }
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      fontSize: "14px",
                    }}
                  />

                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editing[item.type]?.criticalLevel ?? item.criticalLevel}
                    onChange={(e) =>
                      handleChange(item.type, "criticalLevel", Number(e.target.value))
                    }
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      fontSize: "14px",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => handleSave(item.type)}
                    disabled={savingType === item.type}
                    style={{
                      background: "#0f172a",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      fontWeight: 700,
                      cursor: "pointer",
                      opacity: savingType === item.type ? 0.7 : 1,
                    }}
                  >
                    {savingType === item.type ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              ))}
            </div>

            <div className="cards-mobile">
              <div style={{ display: "grid", gap: "12px" }}>
                {thresholds.map((item) => (
                  <div
                    key={item.type}
                    style={{
                      border: "1px solid #f1f5f9",
                      borderRadius: "12px",
                      padding: "16px",
                    }}
                  >
                    <p style={{ margin: "0 0 4px", color: "#0f172a", fontWeight: 700 }}>
                      {typeLabels[item.type] || item.type}
                    </p>
                    <p style={{ margin: "0 0 14px", color: "#94a3b8", fontSize: "12px" }}>
                      {item.type}
                    </p>

                    <div style={{ display: "grid", gap: "12px" }}>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "6px",
                            color: "#64748b",
                            fontSize: "13px",
                            fontWeight: 600,
                          }}
                        >
                          Seuil alerte
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={
                            editing[item.type]?.warningLevel ?? item.warningLevel
                          }
                          onChange={(e) =>
                            handleChange(
                              item.type,
                              "warningLevel",
                              Number(e.target.value)
                            )
                          }
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0",
                            fontSize: "14px",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "6px",
                            color: "#64748b",
                            fontSize: "13px",
                            fontWeight: 600,
                          }}
                        >
                          Seuil critique
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
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
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0",
                            fontSize: "14px",
                          }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSave(item.type)}
                        disabled={savingType === item.type}
                        style={{
                          background: "#0f172a",
                          color: "#fff",
                          border: "none",
                          borderRadius: "10px",
                          padding: "10px 14px",
                          fontWeight: 700,
                          cursor: "pointer",
                          opacity: savingType === item.type ? 0.7 : 1,
                        }}
                      >
                        {savingType === item.type ? "Enregistrement..." : "Enregistrer"}
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