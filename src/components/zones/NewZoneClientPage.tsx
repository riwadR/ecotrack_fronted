"use client";

import { useState } from "react";
import Link from "next/link";
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

export default function NewZoneClientPage() {
  const router = useRouter();

  const [form, setForm] = useState<CreateZonePayload>({
    name: "",
    wktPolygon: "",
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
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Le nom de la zone est obligatoire.");
      return;
    }

    if (!form.wktPolygon.trim()) {
      setError("Le polygone WKT est obligatoire (voir la documentation API des zones).");
      return;
    }

    try {
      setSubmitting(true);

      await createZone({
        name: form.name.trim(),
        wktPolygon: form.wktPolygon.trim(),
        description: form.description?.trim() ?? "",
        city: form.city?.trim() || undefined,
      });

      setSuccess("Zone créée avec succès.");

      setTimeout(() => {
        router.push("/dashboard/infrastructure");
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de créer la zone.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "16px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p style={{ margin: "0 0 6px", color: "#94a3b8", fontSize: "13px" }}>
            Zones &amp; Conteneurs / Nouvelle zone
          </p>
          <h1 style={{ margin: "0 0 4px", color: "#0f172a" }}>
            Créer une zone
          </h1>
          <p style={{ margin: 0, color: "#64748b" }}>
            Ajoute une nouvelle zone de collecte au dashboard EcoTrack.
          </p>
        </div>

        <Link
          href="/dashboard/infrastructure"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            background: "#fff",
            color: "#0f172a",
            padding: "10px 16px",
            borderRadius: "10px",
            fontWeight: 700,
            border: "1px solid #e2e8f0",
          }}
        >
          Retour aux zones
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: "24px",
        }}
        className="zones-new-grid"
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            borderTop: "3px solid #16a34a",
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
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
              <label style={labelStyle}>Polygone (WKT)</label>
              <textarea
                value={form.wktPolygon}
                onChange={(e) => handleChange("wktPolygon", e.target.value)}
                placeholder='POLYGON ((2.34 48.85, 2.35 48.85, 2.35 48.86, 2.34 48.86, 2.34 48.85))'
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  fontFamily: "ui-monospace, monospace",
                  fontSize: "13px",
                }}
              />
              <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "12px" }}>
                Ordre des coordonnées : longitude puis latitude pour chaque sommet ; premier et dernier point identiques.
              </p>
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
                placeholder="Décris la zone, son secteur ou son usage..."
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
                onClick={() => router.push("/dashboard/infrastructure")}
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

        <div style={{ display: "grid", gap: "24px" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            }}
          >
            <h2 style={{ margin: "0 0 6px", color: "#0f172a" }}>Aperçu</h2>
            <p style={{ margin: "0 0 18px", color: "#64748b" }}>
              Vérifie les informations avant validation.
            </p>

            <div
              style={{
                display: "grid",
                gap: "14px",
                background: "#f8fafc",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <div>
                <p style={{ margin: "0 0 4px", color: "#94a3b8", fontSize: "12px" }}>Nom</p>
                <p style={{ margin: 0, color: "#0f172a", fontWeight: 700 }}>
                  {form.name.trim() || "—"}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 4px", color: "#94a3b8", fontSize: "12px" }}>Ville</p>
                <p style={{ margin: 0, color: "#0f172a", fontWeight: 600 }}>
                  {form.city?.trim() || "—"}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 4px", color: "#94a3b8", fontSize: "12px" }}>
                  Description
                </p>
                <p style={{ margin: 0, color: "#64748b", lineHeight: 1.5 }}>
                  {form.description?.trim() || "Aucune description renseignée."}
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
            <h2 style={{ margin: "0 0 6px", color: "#0f172a" }}>Conseils</h2>
            <p style={{ margin: "0 0 14px", color: "#64748b" }}>
              Quelques bonnes pratiques pour nommer les zones.
            </p>

            <div style={{ display: "grid", gap: "10px" }}>
              {[
                "Utilise un nom clair et stable, par exemple Zone Nord ou Centre-Ville.",
                "Ajoute la ville si plusieurs communes sont gérées.",
                "Décris la zone si elle couvre un quartier, un secteur ou un périmètre métier.",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    background: "#f8fafc",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    color: "#475569",
                    fontSize: "14px",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .zones-new-grid { grid-template-columns: 1.1fr 0.9fr; }

        @media (max-width: 991px) {
          .zones-new-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

