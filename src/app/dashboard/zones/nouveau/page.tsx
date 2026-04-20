"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateZonePayload } from "@/models/zone";
import { createZone } from "@/services/api/zones";

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

export default function NewZonePage() {
  const router = useRouter();

  const [form, setForm] = useState<CreateZonePayload>({
    name: "",
    description: "",
    city: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (key: keyof CreateZonePayload, value: string) => {
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
      setError("Le nom de la zone est obligatoire.");
      return;
    }

    try {
      setSubmitting(true);

      await createZone({
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        city: form.city?.trim() || undefined,
      });

      setSuccess("Zone créée avec succès.");

      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible de créer la zone."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <div>
        <h1 style={{ margin: "0 0 4px", color: "#0f172a" }}>
          Nouvelle zone
        </h1>
        <p style={{ margin: 0, color: "#64748b" }}>
          Crée une nouvelle zone de collecte pour organiser les containers.
        </p>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          borderTop: "3px solid #16a34a",
          maxWidth: "760px",
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "20px" }}>
          <div>
            <label style={labelStyle}>Nom de la zone</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ex. Zone Nord"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Ville</label>
            <input
              type="text"
              value={form.city || ""}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="Ex. Moissy-Cramayel"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={form.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Décris brièvement la zone..."
              rows={5}
              style={{
                ...inputStyle,
                resize: "vertical",
              }}
            />
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
                background: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 18px",
                fontWeight: 700,
                cursor: "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Création..." : "Créer la zone"}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
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
    </div>
  );
}