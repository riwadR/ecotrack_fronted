"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Polygon } from "leaflet";
import type { Role } from "@/models/user";
import type { Zone } from "@/models/zone";
import { mapApiZoneToMapZone } from "@/lib/map/mapDtoMappers";
import { getPolygonOuterRingLatLng } from "@/lib/zones/polygonGeoUtils";
import { latLngRingToPolygonWkt } from "@/lib/zones/wktFromLeaflet";
import {
  createZone,
  deleteZone,
  getZones,
  patchZoneDetails,
  updateZone,
} from "@/services/api/zones";
import { fetchZonesForMap } from "@/services/api/mapDataSource";
import ZoneNameModal from "@/components/zones/ZoneNameModal";
import ZoneDetailsEditModal from "@/components/zones/ZoneDetailsEditModal";
import { CrossDeleteIcon, PencilIcon } from "@/components/zones/zoneTableIcons";
import type { ZonePolygonLayer } from "@/components/zones/ZoneManagementMap";

const ZoneManagementMap = dynamic(() => import("@/components/zones/ZoneManagementMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[min(72vh,620px)] w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
      Chargement de la carte…
    </div>
  ),
});

export type ZonesManagementPageProps = {
  viewerRole: Role;
};

/**
 * Geographic zone administration: map sketching (ADMIN/MANAGER) plus tabular inventory.
 */
export default function ZonesManagementPage({ viewerRole }: ZonesManagementPageProps) {
  const spatialEditingEnabled = viewerRole === "ADMIN" || viewerRole === "MANAGER";

  const [zones, setZones] = useState<Zone[]>([]);
  const [mapPolygons, setMapPolygons] = useState<ZonePolygonLayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mapMutationError, setMapMutationError] = useState("");
  const [tableMutationError, setTableMutationError] = useState("");

  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [editModalSubmitting, setEditModalSubmitting] = useState(false);

  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [nameModalMountKey, setNameModalMountKey] = useState(0);
  const [nameModalSubmitting, setNameModalSubmitting] = useState(false);
  const pendingPolygonRef = useRef<Polygon | null>(null);
  const pendingDiscardRef = useRef<(() => void) | null>(null);
  const zonesRef = useRef<Zone[]>([]);
  zonesRef.current = zones;

  const removeZoneFromState = useCallback((zoneId: string) => {
    setZones((prev) => prev.filter((z) => z.id !== zoneId));
    setMapPolygons((prev) => prev.filter((p) => p.id !== zoneId));
  }, []);

  const reloadGeometries = useCallback(async () => {
    const [list, rawZones] = await Promise.all([getZones(), fetchZonesForMap()]);
    setZones(list);
    const polygons: ZonePolygonLayer[] = rawZones
      .map(mapApiZoneToMapZone)
      .filter((z): z is NonNullable<typeof z> => z !== null)
      .map((z) => ({
        id: z.id,
        name: z.name,
        positions: z.polygon,
      }));
    setMapPolygons(polygons);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadInitial = async () => {
      try {
        setLoading(true);
        setError("");
        await reloadGeometries();
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Impossible de charger les zones."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadInitial();
    return () => {
      cancelled = true;
    };
  }, [reloadGeometries]);

  const totalContainers = useMemo(() => {
    return zones.reduce((sum, zone) => sum + (zone.containersCount || 0), 0);
  }, [zones]);

  const handlePolygonSketchCommitted = useCallback(
    (layer: Polygon, discardFromGroup: () => void) => {
      pendingPolygonRef.current = layer;
      pendingDiscardRef.current = discardFromGroup;
      setNameModalMountKey((key) => key + 1);
      setNameModalOpen(true);
    },
    []
  );

  const handleNameModalCancel = useCallback(() => {
    if (nameModalSubmitting) {
      return;
    }
    pendingDiscardRef.current?.();
    pendingPolygonRef.current = null;
    pendingDiscardRef.current = null;
    setNameModalOpen(false);
  }, [nameModalSubmitting]);

  const handleNameModalConfirm = useCallback(
    async (zoneName: string) => {
      const layer = pendingPolygonRef.current;
      const discard = pendingDiscardRef.current;
      if (!layer || !discard) {
        setNameModalOpen(false);
        return;
      }

      try {
        setMapMutationError("");
        setNameModalSubmitting(true);
        const ring = getPolygonOuterRingLatLng(layer);
        const wktPolygon = latLngRingToPolygonWkt(ring);
        await createZone({ name: zoneName.trim(), wktPolygon, description: "" });
        discard();
        pendingPolygonRef.current = null;
        pendingDiscardRef.current = null;
        setNameModalOpen(false);
        await reloadGeometries();
      } catch (err) {
        setMapMutationError(
          err instanceof Error ? err.message : "Unable to create zone."
        );
      } finally {
        setNameModalSubmitting(false);
      }
    },
    [reloadGeometries]
  );

  const handlePersistedPolygonEditsCommitted = useCallback(
    async (edits: { zoneId: string; wktPolygon: string }[]) => {
      try {
        setMapMutationError("");
        for (const edit of edits) {
          const meta = zonesRef.current.find((z) => z.id === edit.zoneId);
          const label = meta?.name?.trim() || "Zone";
          await updateZone(edit.zoneId, {
            name: label,
            wktPolygon: edit.wktPolygon,
            description: meta?.description ?? "",
          });
        }
        await reloadGeometries();
      } catch (err) {
        setMapMutationError(
          err instanceof Error ? err.message : "Unable to update zone geometry."
        );
        await reloadGeometries();
      }
    },
    [reloadGeometries]
  );

  const handlePersistedPolygonDeletesCommitted = useCallback(
    async (zoneIds: string[]) => {
      try {
        setMapMutationError("");
        for (const id of zoneIds) {
          await deleteZone(id);
          removeZoneFromState(id);
        }
        await reloadGeometries();
      } catch (err) {
        setMapMutationError(
          err instanceof Error ? err.message : "Impossible de supprimer la zone."
        );
        await reloadGeometries();
      }
    },
    [reloadGeometries, removeZoneFromState]
  );

  const handleCloseEditZoneModal = useCallback(() => {
    if (editModalSubmitting) {
      return;
    }
    setEditingZone(null);
  }, [editModalSubmitting]);

  const handleSaveEditedZoneDetails = useCallback(
    async (name: string, description: string) => {
      if (!editingZone) {
        return;
      }
      try {
        setTableMutationError("");
        setEditModalSubmitting(true);
        await patchZoneDetails(editingZone.id, { name, description });
        setEditingZone(null);
        await reloadGeometries();
      } catch (err) {
        setTableMutationError(
          err instanceof Error ? err.message : "Impossible de mettre à jour la zone."
        );
      } finally {
        setEditModalSubmitting(false);
      }
    },
    [editingZone, reloadGeometries]
  );

  const handleRequestDeleteZone = useCallback(
    async (zone: Zone) => {
      const confirmed = window.confirm(
        `Supprimer la zone « ${zone.name} » ? Cette action est irréversible (bloquée si des conteneurs y sont encore liés).`
      );
      if (!confirmed) {
        return;
      }
      try {
        setTableMutationError("");
        await deleteZone(zone.id);
        removeZoneFromState(zone.id);
        await reloadGeometries();
      } catch (err) {
        setTableMutationError(
          err instanceof Error ? err.message : "Impossible de supprimer la zone."
        );
      }
    },
    [reloadGeometries, removeZoneFromState]
  );

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      {editingZone ? (
        <ZoneDetailsEditModal
          key={editingZone.id}
          isOpen={editingZone !== null}
          zoneId={editingZone.id}
          initialName={editingZone.name}
          initialDescription={editingZone.description ?? ""}
          isSubmitting={editModalSubmitting}
          onSave={handleSaveEditedZoneDetails}
          onClose={handleCloseEditZoneModal}
        />
      ) : null}

      <ZoneNameModal
        key={nameModalMountKey}
        isOpen={nameModalOpen}
        initialName=""
        isSubmitting={nameModalSubmitting}
        onConfirm={handleNameModalConfirm}
        onCancel={handleNameModalCancel}
      />

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
          {spatialEditingEnabled ? (
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Tracez un polygone avec la barre d&apos;outils en haut à gauche, puis validez le nom du secteur.
              Édition et suppression disponibles via les icônes feuille / corbeille.
            </p>
          ) : (
            <p className="mt-2 max-w-2xl text-sm text-amber-800">
              Consultation seule : les outils de dessin sont réservés aux profils administrateur et gestionnaire.
            </p>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "flex-end" }}>
          {viewerRole === "ADMIN" ? (
            <Link
              href="/dashboard/zones/nouveau"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                background: "#0f172a",
                color: "#fff",
                padding: "10px 16px",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              Formulaire WKT (admin)
            </Link>
          ) : null}
        </div>
      </div>

      <div
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
      >
        <h2 className="mb-3 text-base font-semibold text-slate-900">Carte des secteurs</h2>
        {mapMutationError ? (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            {mapMutationError}
          </div>
        ) : null}
        {!loading && !error ? (
          <ZoneManagementMap
            initialPolygons={mapPolygons}
            spatialEditingEnabled={spatialEditingEnabled}
            onPolygonSketchCommitted={handlePolygonSketchCommitted}
            {...(spatialEditingEnabled
              ? {
                  onPersistedPolygonEditsCommitted: handlePersistedPolygonEditsCommitted,
                  onPersistedPolygonDeletesCommitted: handlePersistedPolygonDeletesCommitted,
                }
              : {})}
          />
        ) : loading ? (
          <div className="flex h-[min(72vh,620px)] w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
            Préparation de la carte…
          </div>
        ) : (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        )}
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
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{item.label}</p>
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
        {tableMutationError ? (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            {tableMutationError}
          </div>
        ) : null}
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
            <p style={{ margin: 0, color: "#64748b" }}>Aucune zone disponible pour le moment.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {viewerRole === "ADMIN" ? (
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
                  Créer une zone (WKT)
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            <div className="table-desktop">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(200px, 1.45fr) 1fr 2fr 1fr",
                  padding: "10px 16px",
                  borderBottom: "1px solid #e2e8f0",
                  color: "#94a3b8",
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                <span>Zone</span>
                <span>Ville</span>
                <span>Description</span>
                <span>Containers</span>
              </div>

              {zones.map((zone) => (
                <div
                  key={zone.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(200px, 1.45fr) 1fr 2fr 1fr",
                    padding: "14px 16px",
                    borderBottom: "1px solid #f1f5f9",
                    alignItems: "center",
                    fontSize: "14px",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                    {spatialEditingEnabled ? (
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                          aria-label={`Modifier ${zone.name}`}
                          onClick={() => setEditingZone(zone)}
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 shadow-sm hover:bg-red-50"
                          aria-label={`Supprimer ${zone.name}`}
                          onClick={() => void handleRequestDeleteZone(zone)}
                        >
                          <CrossDeleteIcon />
                        </button>
                      </div>
                    ) : null}
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          margin: "0 0 2px",
                          fontWeight: 700,
                          color: "#0f172a",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {zone.name}
                      </p>
                      <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px" }}>{zone.id}</p>
                    </div>
                  </div>

                  <span style={{ color: "#475569" }}>{zone.city || "—"}</span>

                  <span style={{ color: "#64748b" }}>{zone.description || "Aucune description"}</span>

                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      background:
                        (zone.containersCount || 0) > 0 ? "#dcfce7" : "#f1f5f9",
                      color: (zone.containersCount || 0) > 0 ? "#16a34a" : "#94a3b8",
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
                        background: (zone.containersCount || 0) > 0 ? "#16a34a" : "#94a3b8",
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
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", minWidth: 0 }}>
                        {spatialEditingEnabled ? (
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                              aria-label={`Modifier ${zone.name}`}
                              onClick={() => setEditingZone(zone)}
                            >
                              <PencilIcon />
                            </button>
                            <button
                              type="button"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 shadow-sm hover:bg-red-50"
                              aria-label={`Supprimer ${zone.name}`}
                              onClick={() => void handleRequestDeleteZone(zone)}
                            >
                              <CrossDeleteIcon />
                            </button>
                          </div>
                        ) : null}
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: "0 0 2px", fontWeight: 700, color: "#0f172a" }}>{zone.name}</p>
                          <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px" }}>{zone.id}</p>
                        </div>
                      </div>

                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          background:
                            (zone.containersCount || 0) > 0 ? "#dcfce7" : "#f1f5f9",
                          color: (zone.containersCount || 0) > 0 ? "#16a34a" : "#94a3b8",
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
                      <strong style={{ color: "#0f172a" }}>Ville :</strong> {zone.city || "—"}
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
