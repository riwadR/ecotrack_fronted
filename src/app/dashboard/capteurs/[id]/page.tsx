"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Container } from "@/models/container";
import {
  DATA_LABEL_CLASS,
  PAGE_DESCRIPTION_CLASS,
  PAGE_STACK_CLASS,
  PAGE_TITLE_CLASS,
  SECTION_DESCRIPTION_CLASS,
  SECTION_TITLE_CLASS,
} from "@/lib/ui/appChrome";
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

function StatusPill({
  bg,
  color,
  label,
}: {
  bg: string;
  color: string;
  label: string;
}) {
  return (
    <span
      className="inline-flex h-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: bg, color }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
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
      <div className={PAGE_STACK_CLASS}>
        <div>
          <h1 className={PAGE_TITLE_CLASS}>Détail du container</h1>
          <p className={PAGE_DESCRIPTION_CLASS}>Chargement en cours…</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 shadow-md shadow-slate-200/40">
          Chargement des informations…
        </div>
      </div>
    );
  }

  if (error || !container) {
    return (
      <div className={PAGE_STACK_CLASS}>
        <div>
          <h1 className={PAGE_TITLE_CLASS}>Détail du container</h1>
          <p className={PAGE_DESCRIPTION_CLASS}>
            Une erreur est survenue lors du chargement.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 border-t-[3px] border-t-red-600 bg-white p-6 shadow-md shadow-slate-200/40">
          <p className="m-0 mb-4 font-semibold text-red-600">
            {error || "Container introuvable."}
          </p>
          <Link
            href="/dashboard/capteurs"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-slate-800"
          >
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const currentStatus = statusMap[container.status] || statusMap.INACTIVE;

  return (
    <div className={PAGE_STACK_CLASS}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="m-0 mb-1.5 text-[13px] text-slate-400">
            Container / {container.id}
          </p>
          <h1 className={PAGE_TITLE_CLASS}>{container.name}</h1>
          <p className={PAGE_DESCRIPTION_CLASS}>
            {container.zoneName || "Zone non renseignée"} ·{" "}
            {container.wasteType}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/dashboard/capteurs"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 no-underline shadow-sm transition hover:bg-slate-50"
          >
            Retour
          </Link>
          <Link
            href="/dashboard/iot-simulator"
            className="inline-flex items-center rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white no-underline shadow-sm transition hover:bg-sky-600"
          >
            Simuler un payload
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
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

      <div className="details-grid grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/40">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className={SECTION_TITLE_CLASS}>Informations générales</h2>
                <p className={SECTION_DESCRIPTION_CLASS}>
                  Vue d’ensemble du container
                </p>
              </div>

              <StatusPill
                bg={currentStatus.bg}
                color={currentStatus.color}
                label={currentStatus.label}
              />
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
              <div>
                <p className={DATA_LABEL_CLASS}>ID</p>
                <p className="m-0 font-mono font-bold text-slate-900">
                  {container.id}
                </p>
              </div>

              <div>
                <p className={DATA_LABEL_CLASS}>Nom</p>
                <p className="m-0 font-semibold text-slate-900">
                  {container.name}
                </p>
              </div>

              <div>
                <p className={DATA_LABEL_CLASS}>Type de déchet</p>
                <p className="m-0 font-semibold text-slate-900">
                  {container.wasteType}
                </p>
              </div>

              <div>
                <p className={DATA_LABEL_CLASS}>Zone</p>
                <p className="m-0 font-semibold text-slate-900">
                  {container.zoneName || "—"}
                </p>
              </div>

              <div>
                <p className={DATA_LABEL_CLASS}>Adresse</p>
                <p className="m-0 font-semibold text-slate-900">
                  {container.address || "—"}
                </p>
              </div>

              <div>
                <p className={DATA_LABEL_CLASS}>Coordonnées GPS</p>
                <p className="m-0 font-semibold text-slate-900">
                  {container.latitude != null && container.longitude != null
                    ? `${container.latitude}, ${container.longitude}`
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/40">
            <h2 className={SECTION_TITLE_CLASS}>Dernière mesure</h2>
            <p className={`${SECTION_DESCRIPTION_CLASS} mb-5`}>
              Dernier état remonté par le container
            </p>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="m-0 mb-1.5 text-xs text-slate-400">Remplissage</p>
                <p
                  className="m-0 text-2xl font-bold"
                  style={{ color: fillInfo.color }}
                >
                  {container.lastMeasurement?.fillLevel ??
                    container.fillLevel ??
                    "—"}
                  {container.lastMeasurement?.fillLevel != null ||
                  container.fillLevel != null
                    ? "%"
                    : ""}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="m-0 mb-1.5 text-xs text-slate-400">Température</p>
                <p className="m-0 text-2xl font-bold text-slate-900">
                  {container.lastMeasurement?.temperature != null
                    ? `${container.lastMeasurement.temperature}°C`
                    : "—"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="m-0 mb-1.5 text-xs text-slate-400">Humidité</p>
                <p className="m-0 text-2xl font-bold text-slate-900">
                  {container.lastMeasurement?.humidity != null
                    ? `${container.lastMeasurement.humidity}%`
                    : "—"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="m-0 mb-1.5 text-xs text-slate-400">Batterie</p>
                <p className="m-0 text-2xl font-bold text-slate-900">
                  {container.lastMeasurement?.batteryLevel != null
                    ? `${container.lastMeasurement.batteryLevel}%`
                    : "—"}
                </p>
              </div>
            </div>

            <p className="m-0 mt-4 text-[13px] text-slate-600">
              Mesurée le {formatDate(container.lastMeasurement?.measuredAt)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/40">
            <h2 className={SECTION_TITLE_CLASS}>Historique</h2>
            <p className={`${SECTION_DESCRIPTION_CLASS} mb-5`}>
              Dernières mesures remontées
            </p>

            <div className="table-desktop">
              <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-2 border-b border-slate-200 px-4 py-2.5 text-xs font-semibold uppercase text-slate-400">
                <span>Date</span>
                <span>Remplissage</span>
                <span>Température</span>
                <span>Humidité</span>
                <span>Batterie</span>
              </div>

              {(container.measurementHistory || []).length === 0 ? (
                <p className="m-4 text-slate-400">Aucun historique disponible.</p>
              ) : (
                container.measurementHistory?.map((item, index) => (
                  <div
                    key={`${item.measuredAt}-${index}`}
                    className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] items-center gap-2 border-b border-slate-100 px-4 py-3.5 text-sm"
                  >
                    <span className="font-semibold text-slate-900">
                      {formatDate(item.measuredAt)}
                    </span>
                    <span className="text-slate-900">{item.fillLevel}%</span>
                    <span className="text-slate-600">
                      {item.temperature != null ? `${item.temperature}°C` : "—"}
                    </span>
                    <span className="text-slate-600">
                      {item.humidity != null ? `${item.humidity}%` : "—"}
                    </span>
                    <span className="text-slate-600">
                      {item.batteryLevel != null
                        ? `${item.batteryLevel}%`
                        : "—"}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="cards-mobile">
              {(container.measurementHistory || []).length === 0 ? (
                <p className="m-0 text-slate-400">
                  Aucun historique disponible.
                </p>
              ) : (
                container.measurementHistory?.map((item, index) => (
                  <div
                    key={`${item.measuredAt}-${index}`}
                    className="border-b border-slate-100 p-4"
                  >
                    <p className="m-0 mb-2 font-bold text-slate-900">
                      {formatDate(item.measuredAt)}
                    </p>
                    <p className="m-0 mb-1 text-[13px] text-slate-600">
                      Remplissage : <strong>{item.fillLevel}%</strong>
                    </p>
                    <p className="m-0 mb-1 text-[13px] text-slate-600">
                      Température :{" "}
                      <strong>
                        {item.temperature != null
                          ? `${item.temperature}°C`
                          : "—"}
                      </strong>
                    </p>
                    <p className="m-0 mb-1 text-[13px] text-slate-600">
                      Humidité :{" "}
                      <strong>
                        {item.humidity != null ? `${item.humidity}%` : "—"}
                      </strong>
                    </p>
                    <p className="m-0 text-[13px] text-slate-600">
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

        <div className="grid gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/40">
            <h2 className={SECTION_TITLE_CLASS}>État de remplissage</h2>
            <p className={`${SECTION_DESCRIPTION_CLASS} mb-4`}>
              Niveau actuel du container
            </p>

            <div className="mb-3 h-3.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-[width]"
                style={{
                  width: `${Math.min(container.fillLevel || 0, 100)}%`,
                  background: fillInfo.color,
                }}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="m-0 font-bold text-slate-900">
                {container.fillLevel != null ? `${container.fillLevel}%` : "—"}
              </p>
              <StatusPill
                bg={fillInfo.bg}
                color={fillInfo.color}
                label={fillInfo.label}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/40">
            <h2 className={SECTION_TITLE_CLASS}>Alertes liées</h2>
            <p className={`${SECTION_DESCRIPTION_CLASS} mb-4`}>
              Événements récents associés
            </p>

            {(container.alerts || []).length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-4 text-slate-600">
                Aucune alerte active pour ce container.
              </div>
            ) : (
              <div className="grid gap-3">
                {container.alerts?.map((alert) => {
                  const severity =
                    severityMap[alert.severity] || severityMap.INFO;

                  return (
                    <div
                      key={alert.id}
                      className="rounded-xl border border-slate-100 border-l-[3px] border-l-solid bg-slate-50 p-3.5"
                      style={{ borderLeftColor: severity.color }}
                    >
                      <div className="mb-2 flex flex-wrap items-start justify-between gap-2.5">
                        <p className="m-0 font-bold text-slate-900">
                          {alert.type}
                        </p>
                        <StatusPill
                          bg={severity.bg}
                          color={severity.color}
                          label={severity.label}
                        />
                      </div>

                      <p className="m-0 mb-2 text-sm text-slate-600">
                        {alert.message}
                      </p>
                      <p className="m-0 text-xs text-slate-400">
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

        @media (max-width: 767px) {
          .table-desktop { display: none; }
          .cards-mobile { display: block; }
        }
      `}</style>
    </div>
  );
}
