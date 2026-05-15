"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Polygon } from "leaflet";
import type { Container } from "@/models/container";
import type { Role } from "@/models/user";
import type { Zone } from "@/models/zone";
import { mapApiZoneToMapZone } from "@/lib/map/mapDtoMappers";
import { wktPolygonOuterRingToLatLngTuples } from "@/lib/map/wktToLeafletRing";
import { getPolygonOuterRingLatLng } from "@/lib/zones/polygonGeoUtils";
import { latLngRingToPolygonWkt } from "@/lib/zones/wktFromLeaflet";
import { toAdminMapContainer, type AdminMapContainer } from "@/lib/map/adminMapContainer";
import {
  createZone,
  deleteZone,
  getZoneDeletionPreview,
  getZones,
  patchZoneDetails,
  updateZone,
} from "@/services/api/zones";
import type { ZoneDeletionPreview } from "@/services/api/zones";
import ZoneDeleteConfirmModal from "@/components/zones/ZoneDeleteConfirmModal";
import {
  createMapContainer,
  deleteContainer,
  getContainers,
  getContainersByZone,
  putMapContainer,
} from "@/services/api/containers";
import InfrastructureContainerLayer from "@/components/infrastructure/InfrastructureContainerLayer";
import InfrastructureMapClickCapture from "@/components/infrastructure/InfrastructureMapClickCapture";
import CreateContainerDrawer, {
  type CreateContainerDrawerFormValues,
} from "@/components/infrastructure/CreateContainerDrawer";
import ReportToast from "@/components/reports/ReportToast";
import { fetchZonesForMap } from "@/services/api/mapDataSource";
import ZoneNameModal from "@/components/zones/ZoneNameModal";
import ZoneDetailsEditModal from "@/components/zones/ZoneDetailsEditModal";
import ZoneContainersPanel from "@/components/zones/ZoneContainersPanel";
import ContainerFullEditModal from "@/components/zones/ContainerFullEditModal";
import {
  adminMarkerToFullEdit,
  containerApiRowToFullEdit,
  type ContainerFullEditValues,
} from "@/lib/zones/containerFullEditValues";
import { CrossDeleteIcon, PencilIcon } from "@/components/zones/zoneTableIcons";
import type { ZonePolygonLayer } from "@/components/zones/ZoneManagementMap";
import { findZoneIdContainingPoint } from "@/lib/zones/pointInZonePolygon";

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
  const [adminContainers, setAdminContainers] = useState<AdminMapContainer[]>([]);
  const [mapPolygons, setMapPolygons] = useState<ZonePolygonLayer[]>([]);
  const mapDrawSessionLockRef = useRef(false);
  const [mapDrawSessionLocked, setMapDrawSessionLocked] = useState(false);
  const containersPanelZoneRef = useRef<Zone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mapMutationError, setMapMutationError] = useState("");
  const [tableMutationError, setTableMutationError] = useState("");

  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [editModalSubmitting, setEditModalSubmitting] = useState(false);

  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [nameModalMountKey, setNameModalMountKey] = useState(0);
  const [nameModalSubmitting, setNameModalSubmitting] = useState(false);

  const [containersPanelZone, setContainersPanelZone] = useState<Zone | null>(null);
  const [panelContainers, setPanelContainers] = useState<Container[]>([]);
  const [panelLoading, setPanelLoading] = useState(false);
  const [panelError, setPanelError] = useState<string | null>(null);

  const [containerBeingEdited, setContainerBeingEdited] = useState<ContainerFullEditValues | null>(
    null
  );
  const [containerEditSubmitting, setContainerEditSubmitting] = useState(false);
  const [containerEditError, setContainerEditError] = useState<string | null>(null);

  const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null);
  const [zoneDeletePreview, setZoneDeletePreview] = useState<ZoneDeletionPreview | null>(null);
  const [zoneDeletePreviewLoading, setZoneDeletePreviewLoading] = useState(false);
  const [zoneDeletePreviewError, setZoneDeletePreviewError] = useState<string | null>(null);
  const [zoneDeleteSubmitting, setZoneDeleteSubmitting] = useState(false);

  const [isAddingContainer, setIsAddingContainer] = useState(false);
  const [relocatingContainer, setRelocatingContainer] = useState<AdminMapContainer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingCoordinates, setPendingCoordinates] = useState<{
    latitude: number;
    longitude: number;
    suggestedZoneId: string;
    sectorInferredFromMapClick: boolean;
  } | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const pendingPolygonRef = useRef<Polygon | null>(null);
  const pendingDiscardRef = useRef<(() => void) | null>(null);
  const zonesRef = useRef<Zone[]>([]);
  zonesRef.current = zones;

  const removeZoneFromState = useCallback((zoneId: string) => {
    setZones((prev) => prev.filter((z) => z.id !== zoneId));
    setMapPolygons((prev) => prev.filter((p) => p.id !== zoneId));
  }, []);

  const applyInventory = useCallback(
    (
      list: Zone[],
      containerRows: Container[],
      rawZones: Awaited<ReturnType<typeof fetchZonesForMap>>,
      options?: { syncMapGeometry?: boolean }
    ) => {
      const enriched = list.map((zone) => ({
        ...zone,
        containersCount: zone.containersCount ?? 0,
      }));
      setZones(enriched);

      const polygons: ZonePolygonLayer[] = rawZones
        .map(mapApiZoneToMapZone)
        .filter((z): z is NonNullable<typeof z> => z !== null)
        .map((z) => ({
          id: z.id,
          name: z.name,
          positions: z.polygon,
        }));

      const shouldSyncMap =
        options?.syncMapGeometry ?? !mapDrawSessionLockRef.current;
      if (shouldSyncMap) {
        setMapPolygons((previous) => {
          const epochById = new Map(
            previous.map((layer) => [layer.id, layer.geometryEpoch ?? 0])
          );
          return polygons.map((layer) => ({
            ...layer,
            geometryEpoch: epochById.get(layer.id) ?? 0,
          }));
        });
      }

      return enriched;
    },
    []
  );

  const handleMapDrawSessionLockChange = useCallback((locked: boolean) => {
    mapDrawSessionLockRef.current = locked;
    setMapDrawSessionLocked(locked);
  }, []);

  const reloadGeometries = useCallback(
    async (options?: { silent?: boolean; force?: boolean }) => {
      if (mapDrawSessionLockRef.current && !options?.force) {
        return;
      }

      const [list, rawZones, containerRows] = await Promise.all([
        getZones(),
        fetchZonesForMap(),
        getContainers(),
      ]);
      applyInventory(list, containerRows, rawZones, {
        syncMapGeometry: !mapDrawSessionLockRef.current,
      });

      if (!mapDrawSessionLockRef.current) {
        setAdminContainers(
          containerRows
            .map(toAdminMapContainer)
            .filter((container): container is AdminMapContainer => container !== null)
        );
      }
    },
    [applyInventory]
  );

  const refreshAdminContainers = useCallback(async () => {
    if (mapDrawSessionLockRef.current) {
      return;
    }
    const rows = await getContainers();
    setAdminContainers(
      rows.map(toAdminMapContainer).filter((row): row is AdminMapContainer => row !== null)
    );
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

  const canManageContainers = spatialEditingEnabled;

  useEffect(() => {
    containersPanelZoneRef.current = containersPanelZone;
  }, [containersPanelZone]);

  const openContainersPanel = useCallback(
    async (zone: Zone) => {
      setContainersPanelZone(zone);
      setPanelError(null);
      setPanelContainers([]);
      setPanelLoading(true);
      try {
        const rows = await getContainersByZone(zone.id);
        setPanelContainers(rows);
      } catch (err) {
        setPanelError(
          err instanceof Error ? err.message : "Impossible de charger les conteneurs."
        );
      } finally {
        setPanelLoading(false);
      }
    },
    []
  );

  const handleContainerDragEnd = useCallback(
    async (container: AdminMapContainer, latitude: number, longitude: number) => {
      const previousLatitude = container.latitude;
      const previousLongitude = container.longitude;

      setAdminContainers((current) =>
        current.map((item) =>
          item.id === container.id ? { ...item, latitude, longitude } : item
        )
      );

      try {
        await putMapContainer(container.id, {
          serialNumber: container.serialNumber,
          type: container.type,
          latitude,
          longitude,
          zoneId: container.zoneId,
          status: container.status,
          fillLevel: Math.min(100, Math.max(0, Math.round(container.fillLevelPercent))),
        });
        setToastMessage("Position mise à jour");
      } catch (err) {
        setAdminContainers((current) =>
          current.map((item) =>
            item.id === container.id
              ? { ...item, latitude: previousLatitude, longitude: previousLongitude }
              : item
          )
        );
        setToastMessage(
          err instanceof Error ? err.message : "Impossible de mettre à jour la position."
        );
      }
    },
    []
  );

  const handleRequestRelocation = useCallback((container: AdminMapContainer) => {
    setIsAddingContainer(false);
    setRelocatingContainer(container);
    setToastMessage(`Cliquez sur la carte pour placer « ${container.serialNumber} ».`);
  }, []);

  const handleRequestContainerEditFromMap = useCallback((marker: AdminMapContainer) => {
    setIsAddingContainer(false);
    setRelocatingContainer(null);
    setDrawerOpen(false);
    setPendingCoordinates(null);
    setContainerEditError(null);
    setContainerBeingEdited(adminMarkerToFullEdit(marker));
  }, []);

  const handleInfrastructureMapClick = useCallback(
    (latitude: number, longitude: number) => {
      if (relocatingContainer) {
        const target = relocatingContainer;
        setRelocatingContainer(null);
        void handleContainerDragEnd(target, latitude, longitude);
        return;
      }
      if (isAddingContainer) {
        setIsAddingContainer(false);
        const suggestedZoneId =
          findZoneIdContainingPoint(latitude, longitude, mapPolygons) ?? "";
        setPendingCoordinates({
          latitude,
          longitude,
          suggestedZoneId,
          sectorInferredFromMapClick: suggestedZoneId !== "",
        });
        setCreateError(null);
        setDrawerOpen(true);
      }
    },
    [
      handleContainerDragEnd,
      isAddingContainer,
      relocatingContainer,
      mapPolygons,
    ]
  );

  const handleCloseCreateDrawer = useCallback(() => {
    if (createSubmitting) {
      return;
    }
    setDrawerOpen(false);
    setPendingCoordinates(null);
    setCreateError(null);
  }, [createSubmitting]);

  const handleCreateContainer = useCallback(
    async (values: CreateContainerDrawerFormValues) => {
      if (!pendingCoordinates) {
        return;
      }
      setCreateSubmitting(true);
      setCreateError(null);
      try {
        await createMapContainer({
          serialNumber: values.serialNumber,
          type: values.type,
          latitude: pendingCoordinates.latitude,
          longitude: pendingCoordinates.longitude,
          zoneId: values.zoneId,
          status: values.status,
        });
        setDrawerOpen(false);
        setPendingCoordinates(null);
        setToastMessage("Conteneur créé avec succès.");
        await reloadGeometries();
      } catch (err) {
        setCreateError(err instanceof Error ? err.message : "Impossible de créer le conteneur.");
      } finally {
        setCreateSubmitting(false);
      }
    },
    [pendingCoordinates, reloadGeometries]
  );

  const infrastructureMapOverlay: ReactNode = useMemo(
    () => (
      <>
        <InfrastructureMapClickCapture
          enabled={isAddingContainer || relocatingContainer !== null}
          cursorClass={
            relocatingContainer ? "ecotrack-map--relocate-container" : "ecotrack-map--add-container"
          }
          onMapClick={handleInfrastructureMapClick}
        />
        <InfrastructureContainerLayer
          containers={adminContainers}
          canManage={spatialEditingEnabled}
          relocatingContainerId={relocatingContainer?.id ?? null}
          onContainerDragEnd={(container, lat, lng) => {
            void handleContainerDragEnd(container, lat, lng);
          }}
          onRequestRelocation={handleRequestRelocation}
          onRequestEdit={handleRequestContainerEditFromMap}
        />
      </>
    ),
    [
      adminContainers,
      handleContainerDragEnd,
      handleRequestContainerEditFromMap,
      handleInfrastructureMapClick,
      handleRequestRelocation,
      isAddingContainer,
      relocatingContainer,
      spatialEditingEnabled,
    ]
  );

  const closeContainersPanel = useCallback(() => {
    setContainersPanelZone(null);
    setPanelContainers([]);
    setPanelError(null);
  }, []);

  const handleSaveContainerFull = useCallback(
    async (values: ContainerFullEditValues) => {
      try {
        setContainerEditError(null);
        setContainerEditSubmitting(true);
        await putMapContainer(values.id, {
          serialNumber: values.serialNumber.trim(),
          type: values.type,
          latitude: values.latitude,
          longitude: values.longitude,
          zoneId: values.zoneId,
          status: values.status,
          fillLevel: values.fillLevel,
        });
        setContainerBeingEdited(null);
        await reloadGeometries();
        await refreshAdminContainers();
        if (containersPanelZone) {
          const refreshed = await getContainersByZone(containersPanelZone.id);
          setPanelContainers(refreshed);
        }
        setToastMessage("Conteneur mis à jour.");
      } catch (err) {
        setContainerEditError(
          err instanceof Error ? err.message : "Impossible de mettre à jour le conteneur."
        );
      } finally {
        setContainerEditSubmitting(false);
      }
    },
    [reloadGeometries, refreshAdminContainers, containersPanelZone]
  );

  const handleDeleteContainer = useCallback(
    async (container: Container) => {
      const confirmed = window.confirm(
        `Supprimer le conteneur « ${container.serialNumber ?? container.id} » ?`
      );
      if (!confirmed) {
        return;
      }
      try {
        setTableMutationError("");
        await deleteContainer(container.id);
        await reloadGeometries();
        await refreshAdminContainers();
        if (containersPanelZone) {
          setPanelContainers((prev) => prev.filter((c) => c.id !== container.id));
        }
      } catch (err) {
        setTableMutationError(
          err instanceof Error ? err.message : "Impossible de supprimer le conteneur."
        );
      }
    },
    [reloadGeometries, refreshAdminContainers, containersPanelZone]
  );

  const renderContainerCount = (zone: Zone) => {
    const count = zone.containersCount ?? 0;
    const label = `${count} conteneur${count > 1 ? "s" : ""}`;

    if (count === 0) {
      return (
        <span
          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500"
        >
          {label}
        </span>
      );
    }

    return (
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 underline-offset-2 transition hover:bg-emerald-200 hover:underline"
        title="Voir et gérer les conteneurs de ce secteur"
        onClick={() => void openContainersPanel(zone)}
      >
        {label}
      </button>
    );
  };

  const totalContainers = useMemo(() => {
    return zones.reduce((sum, zone) => sum + (zone.containersCount || 0), 0);
  }, [zones]);

  const handlePolygonSketchCommitted = useCallback(
    (layer: Polygon, discardFromGroup: () => void) => {
      mapDrawSessionLockRef.current = true;
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
    mapDrawSessionLockRef.current = false;
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
        mapDrawSessionLockRef.current = false;
        await reloadGeometries({ force: true });
      } catch (err) {
        setMapMutationError(
          err instanceof Error ? err.message : "Impossible de créer la zone."
        );
      } finally {
        setNameModalSubmitting(false);
        mapDrawSessionLockRef.current = false;
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

        setMapPolygons((previous) =>
          previous.map((layer) => {
            const edit = edits.find((item) => item.zoneId === layer.id);
            if (!edit) {
              return layer;
            }
            let positions = layer.positions;
            try {
              positions = wktPolygonOuterRingToLatLngTuples(edit.wktPolygon);
            } catch {
              //
            }
            return {
              ...layer,
              positions,
              geometryEpoch: (layer.geometryEpoch ?? 0) + 1,
            };
          })
        );

        const list = await getZones();
        setZones((previous) =>
          previous.map((zone) => {
            const refreshed = list.find((item) => item.id === zone.id);
            if (!refreshed) {
              return zone;
            }
            return {
              ...zone,
              ...refreshed,
              containersCount: refreshed.containersCount ?? zone.containersCount ?? 0,
            };
          })
        );
      } catch (err) {
        setMapMutationError(
          err instanceof Error ? err.message : "Impossible de mettre à jour le contour."
        );
        await reloadGeometries({ force: true });
      }
    },
    [reloadGeometries]
  );

  const handlePersistedPolygonDeletesCommitted = useCallback(
    async (zoneIds: string[]) => {
      try {
        setMapMutationError("");
        for (const id of zoneIds) {
          await deleteZone(id, { cascade: true });
          removeZoneFromState(id);
        }
        await reloadGeometries({ force: true });
      } catch (err) {
        setMapMutationError(
          err instanceof Error ? err.message : "Impossible de supprimer la zone."
        );
        await reloadGeometries({ force: true });
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

  const handleRequestDeleteZone = useCallback((zone: Zone) => {
    setZoneToDelete(zone);
    setZoneDeletePreview(null);
    setZoneDeletePreviewError(null);
    setZoneDeletePreviewLoading(true);
    void getZoneDeletionPreview(zone.id)
      .then((preview) => {
        setZoneDeletePreview(preview);
      })
      .catch((err) => {
        setZoneDeletePreviewError(
          err instanceof Error ? err.message : "Impossible d'analyser les éléments liés."
        );
      })
      .finally(() => {
        setZoneDeletePreviewLoading(false);
      });
  }, []);

  const handleCloseZoneDeleteModal = useCallback(() => {
    if (zoneDeleteSubmitting) {
      return;
    }
    setZoneToDelete(null);
    setZoneDeletePreview(null);
    setZoneDeletePreviewError(null);
  }, [zoneDeleteSubmitting]);

  const handleConfirmZoneDelete = useCallback(async () => {
    if (!zoneToDelete) {
      return;
    }
    const cascade =
      zoneDeletePreview !== null &&
      (zoneDeletePreview.challengeCount > 0 ||
        zoneDeletePreview.containerCount > 0 ||
        zoneDeletePreview.reportCount > 0);

    try {
      setTableMutationError("");
      setZoneDeleteSubmitting(true);
      await deleteZone(zoneToDelete.id, { cascade });
      removeZoneFromState(zoneToDelete.id);
      setZoneToDelete(null);
      setZoneDeletePreview(null);
      await reloadGeometries();
    } catch (err) {
      setTableMutationError(
        err instanceof Error ? err.message : "Impossible de supprimer la zone."
      );
    } finally {
      setZoneDeleteSubmitting(false);
    }
  }, [zoneToDelete, zoneDeletePreview, reloadGeometries, removeZoneFromState]);

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <ZoneDeleteConfirmModal
        isOpen={zoneToDelete !== null}
        preview={zoneDeletePreview}
        isLoadingPreview={zoneDeletePreviewLoading}
        isDeleting={zoneDeleteSubmitting}
        previewError={zoneDeletePreviewError}
        onConfirmCascade={handleConfirmZoneDelete}
        onCancel={handleCloseZoneDeleteModal}
      />

      <ContainerFullEditModal
        values={containerBeingEdited}
        isOpen={containerBeingEdited !== null}
        zones={zones}
        isSubmitting={containerEditSubmitting}
        error={containerEditError}
        onClose={() => {
          if (!containerEditSubmitting) {
            setContainerBeingEdited(null);
            setContainerEditError(null);
          }
        }}
        onSave={(next) => void handleSaveContainerFull(next)}
      />

      <ZoneContainersPanel
        zone={containersPanelZone}
        containers={panelContainers}
        isLoading={panelLoading}
        error={panelError}
        canManage={canManageContainers}
        onClose={closeContainersPanel}
        onEdit={(container) => {
          setContainerEditError(null);
          const draft = containerApiRowToFullEdit(container);
          if (!draft) {
            setToastMessage(
              "Impossible d'ouvrir l'édition : coordonnées GPS ou secteur manquants pour ce conteneur."
            );
            return;
          }
          setContainerBeingEdited(draft);
        }}
        onDelete={(container) => void handleDeleteContainer(container)}
      />

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
          <h1 style={{ color: "#0f172a", margin: "0 0 4px" }}>Zones &amp; Conteneurs</h1>
          <p style={{ color: "#64748b", margin: 0 }}>
            Carte opérationnelle : secteurs, conteneurs et outils de gestion.
          </p>
          {spatialEditingEnabled ? (
            <ul className="mt-2 max-w-2xl list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>
                <strong className="text-slate-800">Dessiner un secteur</strong> : tracez le contour, puis
                nommez le secteur dans la fenêtre qui s&apos;ouvre.
              </li>
              <li>
                <strong className="text-slate-800">Modifier les contours</strong> : déplacez les sommets, puis
                cliquez sur « Enregistrer ».
              </li>
              <li>
                <strong className="text-slate-800">Supprimer un secteur</strong> : sélectionnez-le sur la carte,
                puis validez la suppression.
              </li>
              <li>
                Les pastilles colorées sont les conteneurs (clic pour la fiche) ; le nombre dans le tableau
                ouvre la liste complète du secteur.
              </li>
            </ul>
          ) : (
            <p className="mt-2 max-w-2xl text-sm text-amber-800">
              Consultation seule : les outils de dessin sont réservés aux profils administrateur et gestionnaire.
            </p>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "flex-end" }}>
          {viewerRole === "ADMIN" ? (
            <Link
              href="/dashboard/infrastructure/nouveau"
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
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 text-base font-semibold text-slate-900">Carte des secteurs</h2>
          {spatialEditingEnabled ? (
            <button
              type="button"
              onClick={() => {
                setRelocatingContainer(null);
                setIsAddingContainer((current) => !current);
                if (isAddingContainer) {
                  setDrawerOpen(false);
                  setPendingCoordinates(null);
                }
              }}
              className={[
                "rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition",
                isAddingContainer
                  ? "bg-slate-800 text-white hover:bg-slate-900"
                  : "bg-emerald-600 text-white hover:bg-emerald-700",
              ].join(" ")}
            >
              {isAddingContainer ? "Annuler l'ajout" : "Ajouter un conteneur"}
            </button>
          ) : null}
        </div>
        {relocatingContainer ? (
          <p className="mb-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
            Mode déplacement : cliquez sur la carte pour repositionner « {relocatingContainer.serialNumber} ».
            <button
              type="button"
              className="ml-2 font-semibold underline"
              onClick={() => setRelocatingContainer(null)}
            >
              Annuler
            </button>
          </p>
        ) : null}
        {isAddingContainer ? (
          <p className="mb-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
            Cliquez sur la carte pour placer le nouveau conteneur.
          </p>
        ) : null}
        {mapMutationError ? (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            {mapMutationError}
          </div>
        ) : null}
        {!loading && !error ? (
          <ZoneManagementMap
            initialPolygons={mapPolygons}
            viewerRole={viewerRole}
            spatialEditingEnabled={spatialEditingEnabled}
            mapDrawSessionLocked={mapDrawSessionLocked}
            onMapDrawSessionLockChange={handleMapDrawSessionLockChange}
            infrastructureOverlay={infrastructureMapOverlay}
            showContainerLegend
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
            label: "Avec conteneurs",
            value: zones.filter((zone) => (zone.containersCount || 0) > 0).length,
            color: "#16a34a",
          },
          { label: "Total conteneurs", value: totalContainers, color: "#ca8a04" },
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
                  href="/dashboard/infrastructure/nouveau"
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
                <span>Conteneurs</span>
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

                  {renderContainerCount(zone)}
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

                      {renderContainerCount(zone)}
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

      {pendingCoordinates ? (
        <CreateContainerDrawer
          isOpen={drawerOpen}
          latitude={pendingCoordinates.latitude}
          longitude={pendingCoordinates.longitude}
          suggestedZoneId={pendingCoordinates.suggestedZoneId || null}
          zoneInferredFromMap={pendingCoordinates.sectorInferredFromMapClick}
          zones={zones}
          isSubmitting={createSubmitting}
          errorMessage={createError}
          onSubmit={(values) => void handleCreateContainer(values)}
          onClose={handleCloseCreateDrawer}
        />
      ) : null}

      {toastMessage ? (
        <ReportToast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      ) : null}

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
