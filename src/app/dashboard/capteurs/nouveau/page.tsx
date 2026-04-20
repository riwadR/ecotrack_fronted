"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreateContainerPayload, WasteType } from "@/models/container";
import { Zone } from "@/models/zone";
import { createContainer } from "@/services/api/containers";
import { getZones } from "@/services/api/zones";

const wasteTypes: WasteType[] = [
  "PLASTIC",
  "PAPER",
  "GLASS",
  "METAL",
  "ORGANIC",
  "MIXED",
];

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

export default function NewContainerPage() {
  const router = useRouter();

  const [zones, setZones] = useState<Zone[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState<CreateContainerPayload>({
    name: "",
    wasteType: "PLASTIC",
    zoneId: "",
    latitude: undefined,
    longitude: undefined,
    address: "",
  });

  useEffect(() => {
    const loadZones = async () => {
      try {
        setLoadingZones(true);
        const data = await getZones();
        setZones(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les zones."
        );
      } finally {
        setLoadingZones(false);
      }
    };

    loadZones();
  }, []);

  const handleChange = (
    key: keyof CreateContainerPayload,
    value: string | number | undefined
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Le nom du container est obligatoire.");
      return;
    }

    if (!form.zoneId) {
      setError("La zone est obligatoire.");
      return;
    }

    try {
      setSubmitting(true);

      const payload: CreateContainerPayload = {
        name: form.name.trim(),
        wasteType: form.wasteType,
        zoneId: form.zoneId,
        address: form.address?.trim() || undefined,
        latitude:
          typeof form.latitude === "number" && !Number.isNaN(form.latitude)
            ? form.latitude
            : undefined,
        longitude:
          typeof form.longitude === "number" && !Number.isNaN(form.longitude)
            ? form.longitude
            : undefined,
      };

      const created = await createContainer(payload);
      setSuccess("Container créé avec succès.");

      setTimeout(() => {
        router.push(`/dashboard/capteurs/${created.id}`);
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de créer le container."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <div>
        <h1 style={{ margin: "0 0 4px", color: "#0f172a" }}>
          Nouveau container
        </h1>
        <p style={{ margin: 0, color: "#64748b" }}>
          Ajoute un nouveau container à une zone existante.
        </p>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          borderTop: "3px solid #0ea5e9",
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="form-grid">
            <div>
              <label style={labelStyle}>Nom du container</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ex. Container Centre 01"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Type de déchet</label>
              <select
                value={form.wasteType}
                onChange={(e) =>
                  handleChange("wasteType", e.target.value as WasteType)
                }
                style={inputStyle}
              >
                {wasteTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Zone</label>
              <select
                value={form.zoneId}
                onChange={(e) => handleChange("zoneId", e.target.value)}
                style={inputStyle}
                disabled={loadingZones}
              >
                <option value="">
                  {loadingZones ? "Chargement..." : "Sélectionner une zone"}
                </option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Adresse</label>
              <input
                type="text"
                value={form.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Ex. 12 rue des capteurs"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Latitude</label>
              <input
                type="number"
                step="any"
                value={form.latitude ?? ""}
                onChange={(e) =>
                  handleChange(
                    "latitude",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                placeholder="Ex. 48.6351"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Longitude</label>
              <input
                type="number"
                step="any"
                value={form.longitude ?? ""}
                onChange={(e) =>
                  handleChange(
                    "longitude",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                placeholder="Ex. 2.5760"
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

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
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
              {submitting ? "Création..." : "Créer le container"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard/capteurs")}
              style={{
                background: "#fff",
                color: "#0f172a",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "12px 18px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .form-grid { grid-template-columns: 1fr 1fr; }
        @media (max-width: 767px) {
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}