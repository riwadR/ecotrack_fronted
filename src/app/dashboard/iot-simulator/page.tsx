"use client";

import { useEffect, useMemo, useState } from "react";
import {
  APP_FORM_CONTROL_CLASS,
  APP_FORM_LABEL_CLASS,
  PAGE_DESCRIPTION_CLASS,
  PAGE_STACK_CLASS,
  PAGE_TITLE_CLASS,
  SECTION_DESCRIPTION_CLASS,
  SECTION_TITLE_CLASS,
} from "@/lib/ui/appChrome";
import { Container, IoTPayload } from "@/models/container";
import { getContainers, sendIoTPayload } from "@/services/api/containers";

export default function IoTSimulatorPage() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loadingContainers, setLoadingContainers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState<IoTPayload>({
    containerId: "",
    fillLevel: 0,
    temperature: 22,
    humidity: 50,
    batteryLevel: 100,
  });

  useEffect(() => {
    const loadContainers = async () => {
      try {
        setLoadingContainers(true);
        setError("");
        const data = await getContainers();
        setContainers(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les containers."
        );
      } finally {
        setLoadingContainers(false);
      }
    };

    loadContainers();
  }, []);

  const selectedContainer = useMemo(
    () => containers.find((container) => container.id === form.containerId),
    [containers, form.containerId]
  );

  const handleChange = (key: keyof IoTPayload, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    if (!form.containerId) {
      setError("Veuillez sélectionner un container.");
      return;
    }

    if (form.fillLevel < 0 || form.fillLevel > 100) {
      setError("Le niveau de remplissage doit être entre 0 et 100.");
      return;
    }

    try {
      setSubmitting(true);

      await sendIoTPayload({
        containerId: form.containerId,
        fillLevel: Number(form.fillLevel),
        temperature:
          form.temperature !== undefined ? Number(form.temperature) : undefined,
        humidity: form.humidity !== undefined ? Number(form.humidity) : undefined,
        batteryLevel:
          form.batteryLevel !== undefined
            ? Number(form.batteryLevel)
            : undefined,
      });

      setSuccess("Payload IoT envoyé avec succès.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible d'envoyer le payload."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={PAGE_STACK_CLASS}>
      <div>
        <h1 className={PAGE_TITLE_CLASS}>Simulateur IoT</h1>
        <p className={PAGE_DESCRIPTION_CLASS}>
          Envoie une mesure simulée à un container pour tester le flux backend.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 border-t-[3px] border-t-sky-500 bg-white p-6 shadow-md shadow-slate-200/40">
          <form className="grid gap-4 sm:gap-[18px]" onSubmit={handleSubmit}>
            <div>
              <label className={APP_FORM_LABEL_CLASS} htmlFor="iot-container">
                Container
              </label>
              <select
                id="iot-container"
                className={APP_FORM_CONTROL_CLASS}
                value={form.containerId}
                onChange={(e) => handleChange("containerId", e.target.value)}
                disabled={loadingContainers}
              >
                <option value="">
                  {loadingContainers
                    ? "Chargement des containers..."
                    : "Sélectionner un container"}
                </option>
                {containers.map((container) => (
                  <option key={container.id} value={container.id}>
                    {container.name} ({container.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={APP_FORM_LABEL_CLASS} htmlFor="iot-fill">
                Niveau de remplissage ({form.fillLevel}%)
              </label>
              <input
                id="iot-fill"
                type="range"
                min={0}
                max={100}
                value={form.fillLevel}
                className="h-2 w-full cursor-pointer accent-emerald-600"
                onChange={(e) =>
                  handleChange("fillLevel", Number(e.target.value))
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className={APP_FORM_LABEL_CLASS}>Température (°C)</label>
                <input
                  type="number"
                  className={APP_FORM_CONTROL_CLASS}
                  value={form.temperature ?? ""}
                  onChange={(e) =>
                    handleChange("temperature", Number(e.target.value))
                  }
                />
              </div>

              <div>
                <label className={APP_FORM_LABEL_CLASS}>Humidité (%)</label>
                <input
                  type="number"
                  className={APP_FORM_CONTROL_CLASS}
                  value={form.humidity ?? ""}
                  onChange={(e) =>
                    handleChange("humidity", Number(e.target.value))
                  }
                />
              </div>

              <div>
                <label className={APP_FORM_LABEL_CLASS}>Batterie (%)</label>
                <input
                  type="number"
                  className={APP_FORM_CONTROL_CLASS}
                  value={form.batteryLevel ?? ""}
                  onChange={(e) =>
                    handleChange("batteryLevel", Number(e.target.value))
                  }
                />
              </div>
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

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-emerald-600 px-[18px] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Envoi..." : "Envoyer le payload"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/40">
          <h2 className={SECTION_TITLE_CLASS}>Aperçu</h2>
          <p className={`${SECTION_DESCRIPTION_CLASS} mb-4`}>
            Résumé du payload prêt à être envoyé.
          </p>

          <div className="overflow-x-auto rounded-xl bg-slate-50 p-4 font-mono text-xs text-slate-900 sm:text-[13px]">
            <pre className="m-0 whitespace-pre-wrap break-words">
              {JSON.stringify(
                {
                  containerId: form.containerId,
                  containerName: selectedContainer?.name || null,
                  fillLevel: form.fillLevel,
                  temperature: form.temperature,
                  humidity: form.humidity,
                  batteryLevel: form.batteryLevel,
                },
                null,
                2
              )}
            </pre>
          </div>

          {selectedContainer ? (
            <div className="mt-4 grid gap-2 text-[13px] text-slate-600">
              <p className="m-0">
                <strong className="text-slate-900">Nom :</strong>{" "}
                {selectedContainer.name}
              </p>
              <p className="m-0">
                <strong className="text-slate-900">Zone :</strong>{" "}
                {selectedContainer.zoneName || "—"}
              </p>
              <p className="m-0">
                <strong className="text-slate-900">Type :</strong>{" "}
                {selectedContainer.wasteType}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
