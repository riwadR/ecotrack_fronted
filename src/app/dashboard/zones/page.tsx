"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Zone } from "@/models/zone";
import { getZones } from "@/services/api/zones";

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadZones = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getZones();
        setZones(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les zones."
        );
      } finally {
        setLoading(false);
      }
    };

    loadZones();
  }, []);

  const totalContainers = useMemo(() => {
    return zones.reduce((sum, zone) => sum + (zone.containersCount || 0), 0);
  }, [zones]);

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
          <h1 style={{ color: "#0f172a", margin: "0 0 4px" }}>Zones</h1>
          <p style={{ color: "#64748b", margin: 0 }}>
            Gère les zones de collecte et consulte leur répartition.
          </p>
        </div>

        <Link
          href="/dashboard/zones/nouveau"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            background: "#0ea5e9",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: "10px",
            fontWeight: 700,
          }}
        >
          + Nouvelle zone
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
        }}
      >
        {[
          { label: "Total zones", value: zones.length, color: "#0ea5e9" },
          {
            label: "Avec containers",
            value: zones.filter((zone) => (zone.containersCount || 0) > 0).length,
            color: "#16a34a",
          },
          { label: "Total containers", value: totalContainers, color: "#ca8a04" },
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
                margin: "0 0 4px",
                fontSize: "24px",
                fontWeight: 700,
                color: item.color,
              }}
            >
              {item.value}
            </p>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        {loading ? (
          <p style={{ margin: 0, color: "#64748b" }}>Chargement des zones...</p>
        ) : error ? (
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
        ) : zones.length === 0 ? (
          <div
            style={{
              display: "grid",
              gap: "12px",
            }}
          >
            <p style={{ margin: 0, color: "#64748b" }}>
              Aucune zone disponible pour le moment.
            </p>
            <div>
              <Link
                href="/dashboard/zones/nouveau"
                style={{
                  display: "inline-flex",
                  textDecoration: "none",
                  background: "#0f172a",
                  color: "#fff",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  fontWeight: 700,
                }}
              >
                Créer une zone
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="table-desktop">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr 2fr 1fr",
                  padding: "10px 16px",
                  borderBottom: "1px solid #e2e8f0",
                  color: "#94a3b8",
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                <span>Nom</span>
                <span>Ville</span>
                <span>Description</span>
                <span>Containers</span>
              </div>

              {zones.map((zone) => (
                <div
                  key={zone.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr 2fr 1fr",
                    padding: "14px 16px",
                    borderBottom: "1px solid #f1f5f9",
                    alignItems: "center",
                    fontSize: "14px",
                    gap: "12px",
                  }}
                >
                  <div>
                    <p style={{ margin: "0 0 2px", fontWeight: 700, color: "#0f172a" }}>
                      {zone.name}
                    </p>
                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px" }}>
                      {zone.id}
                    </p>
                  </div>

                  <span style={{ color: "#475569" }}>{zone.city || "—"}</span>

                  <span style={{ color: "#64748b" }}>
                    {zone.description || "Aucune description"}
                  </span>

                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      background:
                        (zone.containersCount || 0) > 0 ? "#dcfce7" : "#f1f5f9",
                      color:
                        (zone.containersCount || 0) > 0 ? "#16a34a" : "#94a3b8",
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: "999px",
                      width: "fit-content",
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background:
                          (zone.containersCount || 0) > 0 ? "#16a34a" : "#94a3b8",
                      }}
                    />
                    {zone.containersCount || 0}
                  </span>
                </div>
              ))}
            </div>

            <div className="cards-mobile">
              <div style={{ display: "grid", gap: "12px" }}>
                {zones.map((zone) => (
                  <div
                    key={zone.id}
                    style={{
                      border: "1px solid #f1f5f9",
                      borderRadius: "12px",
                      padding: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                        alignItems: "flex-start",
                        marginBottom: "8px",
                      }}
                    >
                      <div>
                        <p style={{ margin: "0 0 2px", fontWeight: 700, color: "#0f172a" }}>
                          {zone.name}
                        </p>
                        <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px" }}>
                          {zone.id}
                        </p>
                      </div>

                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          background:
                            (zone.containersCount || 0) > 0 ? "#dcfce7" : "#f1f5f9",
                          color:
                            (zone.containersCount || 0) > 0 ? "#16a34a" : "#94a3b8",
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
                            background:
                              (zone.containersCount || 0) > 0 ? "#16a34a" : "#94a3b8",
                          }}
                        />
                        {zone.containersCount || 0} container
                        {(zone.containersCount || 0) > 1 ? "s" : ""}
                      </span>
                    </div>

                    <p style={{ margin: "0 0 4px", color: "#64748b", fontSize: "13px" }}>
                      <strong style={{ color: "#0f172a" }}>Ville :</strong>{" "}
                      {zone.city || "—"}
                    </p>

                    <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                      <strong style={{ color: "#0f172a" }}>Description :</strong>{" "}
                      {zone.description || "Aucune description"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p
              style={{
                padding: "12px 4px 0",
                color: "#94a3b8",
                fontSize: "13px",
                margin: 0,
              }}
            >
              {zones.length} zone{zones.length > 1 ? "s" : ""}
            </p>
          </>
        )}
      </div>

      <style>{`
        .table-desktop { display: block; }
        .cards-mobile  { display: none;  }

        @media (max-width: 767px) {
          .table-desktop { display: none; }
          .cards-mobile  { display: block; }
        }
      `}</style>
    </div>
  );
}