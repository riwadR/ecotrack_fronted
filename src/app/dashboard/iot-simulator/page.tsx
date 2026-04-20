"use client";

import { useEffect, useMemo, useState } from "react";
import { Container, IoTPayload } from "@/models/container";
import { getContainers, sendIoTPayload } from "@/services/api/containers";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  outline: "none",
  fontSize: "14px",
  color: "#0f172a",
  background: "#fff",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  color: "#0f172a",
  fontWeight: 600,
  fontSize: "14px",
};

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
    <div style={{ display: "grid", gap: "24px" }}>
      <div>
        <h1 style={{ margin: "0 0 4px", color: "#0f172a" }}>
          Simulateur IoT
        </h1>
        <p style={{ margin: 0, color: "#64748b" }}>
          Envoie une mesure simulée à un container pour tester le flux backend.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: "24px",
        }}
        className="iot-grid"
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            borderTop: "3px solid #0ea5e9",
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
            <div>
              <label style={labelStyle}>Container</label>
              <select
                value={form.containerId}
                onChange={(e) => handleChange("containerId", e.target.value)}
                style={inputStyle}
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
              <label style={labelStyle}>
                Niveau de remplissage ({form.fillLevel}%)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={form.fillLevel}
                onChange={(e) =>
                  handleChange("fillLevel", Number(e.target.value))
                }
                style={{ width: "100%", accentColor: "#0ea5e9" }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "16px",
              }}
              className="iot-fields"
            >
              <div>
                <label style={labelStyle}>Température (°C)</label>
                <input
                  type="number"
                  value={form.temperature ?? ""}
                  onChange={(e) =>
                    handleChange("temperature", Number(e.target.value))
                  }
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Humidité (%)</label>
                <input
                  type="number"
                  value={form.humidity ?? ""}
                  onChange={(e) =>
                    handleChange("humidity", Number(e.target.value))
                  }
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Batterie (%)</label>
                <input
                  type="number"
                  value={form.batteryLevel ?? ""}
                  onChange={(e) =>
                    handleChange("batteryLevel", Number(e.target.value))
                  }
                  style={inputStyle}
                />
              </div>
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

            <button
              type="submit"
              disabled={submitting}
              style={{
                background: "#0ea5e9",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 18px",
                fontWeight: 700,
                cursor: "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Envoi..." : "Envoyer le payload"}
            </button>
          </form>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          <h2 style={{ margin: "0 0 6px", color: "#0f172a" }}>Aperçu</h2>
          <p style={{ margin: "0 0 16px", color: "#64748b" }}>
            Résumé du payload prêt à être envoyé.
          </p>

          <div
            style={{
              background: "#f8fafc",
              borderRadius: "12px",
              padding: "16px",
              fontFamily: "monospace",
              fontSize: "13px",
              color: "#0f172a",
              overflowX: "auto",
            }}
          >
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
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
            <div style={{ marginTop: "16px", display: "grid", gap: "8px" }}>
              <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                <strong style={{ color: "#0f172a" }}>Nom :</strong>{" "}
                {selectedContainer.name}
              </p>
              <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                <strong style={{ color: "#0f172a" }}>Zone :</strong>{" "}
                {selectedContainer.zoneName || "—"}
              </p>
              <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                <strong style={{ color: "#0f172a" }}>Type :</strong>{" "}
                {selectedContainer.wasteType}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <style>{`
        .iot-grid { grid-template-columns: 1.2fr 0.8fr; }
        .iot-fields { grid-template-columns: 1fr 1fr 1fr; }

        @media (max-width: 991px) {
          .iot-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 767px) {
          .iot-fields { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}