"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Container } from "@/models/container";
import { getContainerById } from "@/services/api/containers";

const statusMap: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  ACTIVE: {
    label: "Actif",
    color: "#16a34a",
    bg: "#dcfce7",
    border: "#16a34a",
  },
  WARNING: {
    label: "Alerte",
    color: "#ca8a04",
    bg: "#fef9c3",
    border: "#ca8a04",
  },
  CRITICAL: {
    label: "Critique",
    color: "#dc2626",
    bg: "#fee2e2",
    border: "#dc2626",
  },
  INACTIVE: {
    label: "Inactif",
    color: "#94a3b8",
    bg: "#f1f5f9",
    border: "#94a3b8",
  },
};

const severityMap: Record<string, { color: string; bg: string; label: string }> =
  {
    INFO: { color: "#0ea5e9", bg: "#e0f2fe", label: "Info" },
    WARNING: { color: "#ca8a04", bg: "#fef9c3", label: "Alerte" },
    CRITICAL: { color: "#dc2626", bg: "#fee2e2", label: "Critique" },
  };

function formatDate(value?: string | null) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("fr-FR");
  } catch {
    return value;
  }
}

function getFillLevelStatus(fillLevel?: number) {
  if (fillLevel == null) {
    return {
      label: "Inconnu",
      color: "#94a3b8",
      bg: "#f1f5f9",
    };
  }

  if (fillLevel >= 90) {
    return {
      label: "Critique",
      color: "#dc2626",
      bg: "#fee2e2",
    };
  }

  if (fillLevel >= 70) {
    return {
      label: "À surveiller",
      color: "#ca8a04",
      bg: "#fef9c3",
    };
  }

  return {
    label: "Normal",
    color: "#16a34a",
    bg: "#dcfce7",
  };
}

export default function ContainerDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [container, setContainer] = useState<Container | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const loadContainer = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getContainerById(id);
        setContainer(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger le détail du container."
        );
      } finally {
        setLoading(false);
      }
    };

    loadContainer();
  }, [id]);

  const fillInfo = useMemo(
    () => getFillLevelStatus(container?.fillLevel),
    [container?.fillLevel]
  );

  if (loading) {
    return (
      <div style={{ display: "grid", gap: "24px" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", color: "#0f172a" }}>
            Détail du container
          </h1>
          <p style={{ margin: 0, color: "#64748b" }}>Chargement en cours...</p>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            color: "#64748b",
          }}
        >
          Chargement des informations...
        </div>
      </div>
    );
  }

  if (error || !container) {
    return (
      <div style={{ display: "grid", gap: "24px" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", color: "#0f172a" }}>
            Détail du container
          </h1>
          <p style={{ margin: 0, color: "#64748b" }}>
            Une erreur est survenue lors du chargement.
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            borderTop: "3px solid #dc2626",
          }}
        >
          <p style={{ margin: "0 0 16px", color: "#dc2626", fontWeight: 600 }}>
            {error || "Container introuvable."}
          </p>
          <Link
            href="/dashboard/capteurs"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#0f172a",
              color: "#fff",
              textDecoration: "none",
              padding: "10px 16px",
              borderRadius: "10px",
              fontWeight: 600,
            }}
          >
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const currentStatus = statusMap[container.status] || statusMap.INACTIVE;

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div>
          <p style={{ margin: "0 0 6px", color: "#94a3b8", fontSize: "13px" }}>
            Container / {container.id}
          </p>
          <h1 style={{ margin: "0 0 6px", color: "#0f172a" }}>
            {container.name}
          </h1>
          <p style={{ margin: 0, color: "#64748b" }}>
            {container.zoneName || "Zone non renseignée"} ·{" "}
            {container.wasteType}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link
            href="/dashboard/capteurs"
            style={{
              textDecoration: "none",
              padding: "10px 16px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              color: "#0f172a",
              background: "#fff",
              fontWeight: 600,
            }}
          >
            Retour
          </Link>
          <Link
            href="/dashboard/iot-simulator"
            style={{
              textDecoration: "none",
              padding: "10px 16px",
              borderRadius: "10px",
              color: "#fff",
              background: "#0ea5e9",
              fontWeight: 600,
            }}
          >
            Simuler un payload
          </Link>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        {[
          {
            label: "Niveau de remplissage",
            value:
              container.fillLevel != null ? `${container.fillLevel}%` : "—",
            color: fillInfo.color,
          },
          {
            label: "Statut",
            value: currentStatus.label,
            color: currentStatus.color,
          },
          {
            label: "Dernière collecte",
            value: formatDate(container.lastCollectionAt),
            color: "#0ea5e9",
          },
          {
            label: "Alertes liées",
            value: `${container.alerts?.length || 0}`,
            color:
              (container.alerts?.length || 0) > 0 ? "#dc2626" : "#16a34a",
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "24px",
        }}
        className="details-grid"
      >
        <div style={{ display: "grid", gap: "24px" }}>
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
                display: "flex",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2 style={{ margin: "0 0 4px", color: "#0f172a" }}>
                  Informations générales
                </h2>
                <p style={{ margin: 0, color: "#64748b" }}>
                  Vue d’ensemble du container
                </p>
              </div>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  background: currentStatus.bg,
                  color: currentStatus.color,
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: "999px",
                  height: "fit-content",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: currentStatus.color,
                  }}
                />
                {currentStatus.label}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
              }}
            >
              <div>
                <p style={{ margin: "0 0 4px", color: "#94a3b8", fontSize: "12px" }}>
                  ID
                </p>
                <p
                  style={{
                    margin: 0,
                    color: "#0f172a",
                    fontWeight: 700,
                    fontFamily: "monospace",
                  }}
                >
                  {container.id}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 4px", color: "#94a3b8", fontSize: "12px" }}>
                  Nom
                </p>
                <p style={{ margin: 0, color: "#0f172a", fontWeight: 600 }}>
                  {container.name}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 4px", color: "#94a3b8", fontSize: "12px" }}>
                  Type de déchet
                </p>
                <p style={{ margin: 0, color: "#0f172a", fontWeight: 600 }}>
                  {container.wasteType}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 4px", color: "#94a3b8", fontSize: "12px" }}>
                  Zone
                </p>
                <p style={{ margin: 0, color: "#0f172a", fontWeight: 600 }}>
                  {container.zoneName || "—"}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 4px", color: "#94a3b8", fontSize: "12px" }}>
                  Adresse
                </p>
                <p style={{ margin: 0, color: "#0f172a", fontWeight: 600 }}>
                  {container.address || "—"}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 4px", color: "#94a3b8", fontSize: "12px" }}>
                  Coordonnées GPS
                </p>
                <p style={{ margin: 0, color: "#0f172a", fontWeight: 600 }}>
                  {container.latitude != null && container.longitude != null
                    ? `${container.latitude}, ${container.longitude}`
                    : "—"}
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
            }}
          >
            <h2 style={{ margin: "0 0 4px", color: "#0f172a" }}>
              Dernière mesure
            </h2>
            <p style={{ margin: "0 0 20px", color: "#64748b" }}>
              Dernier état remonté par le container
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "12px",
              }}
            >
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <p style={{ margin: "0 0 6px", color: "#94a3b8", fontSize: "12px" }}>
                  Remplissage
                </p>
                <p style={{ margin: 0, color: fillInfo.color, fontWeight: 700, fontSize: "24px" }}>
                  {container.lastMeasurement?.fillLevel ?? container.fillLevel ?? "—"}
                  {container.lastMeasurement?.fillLevel != null ||
                  container.fillLevel != null
                    ? "%"
                    : ""}
                </p>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <p style={{ margin: "0 0 6px", color: "#94a3b8", fontSize: "12px" }}>
                  Température
                </p>
                <p style={{ margin: 0, color: "#0f172a", fontWeight: 700, fontSize: "24px" }}>
                  {container.lastMeasurement?.temperature != null
                    ? `${container.lastMeasurement.temperature}°C`
                    : "—"}
                </p>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <p style={{ margin: "0 0 6px", color: "#94a3b8", fontSize: "12px" }}>
                  Humidité
                </p>
                <p style={{ margin: 0, color: "#0f172a", fontWeight: 700, fontSize: "24px" }}>
                  {container.lastMeasurement?.humidity != null
                    ? `${container.lastMeasurement.humidity}%`
                    : "—"}
                </p>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <p style={{ margin: "0 0 6px", color: "#94a3b8", fontSize: "12px" }}>
                  Batterie
                </p>
                <p style={{ margin: 0, color: "#0f172a", fontWeight: 700, fontSize: "24px" }}>
                  {container.lastMeasurement?.batteryLevel != null
                    ? `${container.lastMeasurement.batteryLevel}%`
                    : "—"}
                </p>
              </div>
            </div>

            <p style={{ margin: "16px 0 0", color: "#64748b", fontSize: "13px" }}>
              Mesurée le {formatDate(container.lastMeasurement?.measuredAt)}
            </p>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            }}
          >
            <h2 style={{ margin: "0 0 4px", color: "#0f172a" }}>Historique</h2>
            <p style={{ margin: "0 0 20px", color: "#64748b" }}>
              Dernières mesures remontées
            </p>

            <div className="table-desktop">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr",
                  padding: "10px 16px",
                  borderBottom: "1px solid #e2e8f0",
                  color: "#94a3b8",
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                <span>Date</span>
                <span>Remplissage</span>
                <span>Température</span>
                <span>Humidité</span>
                <span>Batterie</span>
              </div>

              {(container.measurementHistory || []).length === 0 ? (
                <p style={{ margin: "16px", color: "#94a3b8" }}>
                  Aucun historique disponible.
                </p>
              ) : (
                container.measurementHistory?.map((item, index) => (
                  <div
                    key={`${item.measuredAt}-${index}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr",
                      padding: "14px 16px",
                      borderBottom: "1px solid #f1f5f9",
                      alignItems: "center",
                      fontSize: "14px",
                    }}
                  >
                    <span style={{ color: "#0f172a", fontWeight: 600 }}>
                      {formatDate(item.measuredAt)}
                    </span>
                    <span style={{ color: "#0f172a" }}>{item.fillLevel}%</span>
                    <span style={{ color: "#475569" }}>
                      {item.temperature != null ? `${item.temperature}°C` : "—"}
                    </span>
                    <span style={{ color: "#475569" }}>
                      {item.humidity != null ? `${item.humidity}%` : "—"}
                    </span>
                    <span style={{ color: "#475569" }}>
                      {item.batteryLevel != null ? `${item.batteryLevel}%` : "—"}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="cards-mobile">
              {(container.measurementHistory || []).length === 0 ? (
                <p style={{ margin: 0, color: "#94a3b8" }}>
                  Aucun historique disponible.
                </p>
              ) : (
                container.measurementHistory?.map((item, index) => (
                  <div
                    key={`${item.measuredAt}-${index}`}
                    style={{
                      padding: "16px",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <p style={{ margin: "0 0 8px", color: "#0f172a", fontWeight: 700 }}>
                      {formatDate(item.measuredAt)}
                    </p>
                    <p style={{ margin: "0 0 4px", color: "#64748b", fontSize: "13px" }}>
                      Remplissage : <strong>{item.fillLevel}%</strong>
                    </p>
                    <p style={{ margin: "0 0 4px", color: "#64748b", fontSize: "13px" }}>
                      Température :{" "}
                      <strong>
                        {item.temperature != null ? `${item.temperature}°C` : "—"}
                      </strong>
                    </p>
                    <p style={{ margin: "0 0 4px", color: "#64748b", fontSize: "13px" }}>
                      Humidité :{" "}
                      <strong>
                        {item.humidity != null ? `${item.humidity}%` : "—"}
                      </strong>
                    </p>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                      Batterie :{" "}
                      <strong>
                        {item.batteryLevel != null
                          ? `${item.batteryLevel}%`
                          : "—"}
                      </strong>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: "24px" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            }}
          >
            <h2 style={{ margin: "0 0 4px", color: "#0f172a" }}>
              État de remplissage
            </h2>
            <p style={{ margin: "0 0 16px", color: "#64748b" }}>
              Niveau actuel du container
            </p>

            <div
              style={{
                background: "#f1f5f9",
                borderRadius: "999px",
                height: "14px",
                overflow: "hidden",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: `${Math.min(container.fillLevel || 0, 100)}%`,
                  height: "100%",
                  background: fillInfo.color,
                  borderRadius: "999px",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <p style={{ margin: 0, color: "#0f172a", fontWeight: 700 }}>
                {container.fillLevel != null ? `${container.fillLevel}%` : "—"}
              </p>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  background: fillInfo.bg,
                  color: fillInfo.color,
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
                    background: fillInfo.color,
                  }}
                />
                {fillInfo.label}
              </span>
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            }}
          >
            <h2 style={{ margin: "0 0 4px", color: "#0f172a" }}>
              Alertes liées
            </h2>
            <p style={{ margin: "0 0 16px", color: "#64748b" }}>
              Événements récents associés
            </p>

            {(container.alerts || []).length === 0 ? (
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "12px",
                  padding: "16px",
                  color: "#64748b",
                }}
              >
                Aucune alerte active pour ce container.
              </div>
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                {container.alerts?.map((alert) => {
                  const severity =
                    severityMap[alert.severity] || severityMap.INFO;

                  return (
                    <div
                      key={alert.id}
                      style={{
                        background: "#f8fafc",
                        borderRadius: "12px",
                        padding: "14px",
                        borderLeft: `3px solid ${severity.color}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "10px",
                          alignItems: "flex-start",
                          marginBottom: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            color: "#0f172a",
                            fontWeight: 700,
                          }}
                        >
                          {alert.type}
                        </p>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            background: severity.bg,
                            color: severity.color,
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
                              background: severity.color,
                            }}
                          />
                          {severity.label}
                        </span>
                      </div>

                      <p style={{ margin: "0 0 8px", color: "#64748b", fontSize: "14px" }}>
                        {alert.message}
                      </p>
                      <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px" }}>
                        {formatDate(alert.createdAt)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .table-desktop { display: block; }
        .cards-mobile { display: none; }
        .details-grid { grid-template-columns: 2fr 1fr; }

        @media (max-width: 991px) {
          .details-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 767px) {
          .table-desktop { display: none; }
          .cards-mobile { display: block; }
        }
      `}</style>
    </div>
  );
}