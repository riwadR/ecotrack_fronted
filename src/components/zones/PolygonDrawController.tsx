"use client";

import { useLayoutEffect } from "react";
import type { RefObject } from "react";
import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import { useMap } from "react-leaflet";
import { configureLeafletDrawFrench } from "@/lib/zones/leafletDrawFrench";
import { getPolygonOuterRingLatLng } from "@/lib/zones/polygonGeoUtils";
import { latLngRingToPolygonWkt } from "@/lib/zones/wktFromLeaflet";

export type PersistedPolygonEdit = {
  zoneId: string;
  wktPolygon: string;
};

function disableActiveDrawMode(map: L.Map, drawControl: L.Control.Draw) {
  type DrawToolbar = {
    _modes?: Record<string, { handler?: { disable?: () => void; enabled?: () => boolean } }>;
  };
  type DrawControlInternals = L.Control.Draw & { _toolbars?: { edit?: DrawToolbar } };

  const toolbars = (drawControl as DrawControlInternals)._toolbars;
  const editHandler = toolbars?.edit?._modes?.edit?.handler;
  if (editHandler?.enabled?.()) {
    editHandler.disable?.();
  }

  const removeHandler = toolbars?.edit?._modes?.remove?.handler;
  if (removeHandler?.enabled?.()) {
    removeHandler.disable?.();
  }

  map.fire(L.Draw.Event.EDITSTOP);
  map.fire(L.Draw.Event.DELETESTOP);
}

function readZoneIdFromLayer(layer: L.Layer): string | undefined {
  if ("ecotrackZoneId" in layer) {
    const raw = (layer as { ecotrackZoneId?: unknown }).ecotrackZoneId;
    return typeof raw === "string" ? raw : undefined;
  }
  return undefined;
}

export type PolygonDrawControllerProps = {
  spatialEditingEnabled: boolean;
  editableFeatureGroupRef: RefObject<L.FeatureGroup | null>;
  /** While true, parent must not refresh map polygons from the API (would cancel Leaflet.draw). */
  onMapDrawSessionLockChange?: (locked: boolean) => void;
  onPolygonSketchCommitted: (layer: L.Polygon, discardFromGroup: () => void) => void;
  onPersistedPolygonEditsCommitted?: (edits: PersistedPolygonEdit[]) => Promise<void>;
  onPersistedPolygonDeletesCommitted?: (zoneIds: string[]) => Promise<void>;
};

/**
 * Attaches Leaflet.draw polygon create + edit/delete toolbars to the active map instance.
 */
export default function PolygonDrawController({
  spatialEditingEnabled,
  editableFeatureGroupRef,
  onMapDrawSessionLockChange,
  onPolygonSketchCommitted,
  onPersistedPolygonEditsCommitted,
  onPersistedPolygonDeletesCommitted,
}: PolygonDrawControllerProps) {
  const map = useMap();

  useLayoutEffect(() => {
    if (!spatialEditingEnabled) {
      return;
    }

    const fg = editableFeatureGroupRef.current;
    if (!fg) {
      return;
    }

    configureLeafletDrawFrench();

    const drawControl = new L.Control.Draw({
      position: "topleft",
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: "#0369a1",
            weight: 2,
            fillColor: "#0ea5e9",
            fillOpacity: 0.15,
          },
        },
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: fg,
        remove: true,
      },
    });

    map.addControl(drawControl);

    let persistingMutation = false;

    const setMapLocked = (locked: boolean) => {
      onMapDrawSessionLockChange?.(locked);
    };

    const handleDrawSessionStart = () => setMapLocked(true);

    const handleDrawSessionEnd = () => {
      if (!persistingMutation) {
        setMapLocked(false);
      }
    };

    const handleCreated = (e: L.LeafletEvent) => {
      const created = e as L.DrawEvents.Created;
      if (created.layerType !== "polygon") {
        return;
      }
      const layer = created.layer as L.Polygon;
      fg.addLayer(layer);

      const discardFromGroup = () => {
        fg.removeLayer(layer);
      };

      onPolygonSketchCommitted(layer, discardFromGroup);
    };

    const handleEdited = async (e: L.LeafletEvent) => {
      if (!onPersistedPolygonEditsCommitted) {
        return;
      }
      const edited = e as L.DrawEvents.Edited;
      const edits: PersistedPolygonEdit[] = [];
      edited.layers.eachLayer((layer) => {
        const zoneId = readZoneIdFromLayer(layer);
        if (!zoneId || !(layer instanceof L.Polygon)) {
          return;
        }
        try {
          const ring = getPolygonOuterRingLatLng(layer);
          edits.push({ zoneId, wktPolygon: latLngRingToPolygonWkt(ring) });
        } catch {
          //
        }
      });
      if (edits.length > 0) {
        persistingMutation = true;
        try {
          await onPersistedPolygonEditsCommitted(edits);
        } catch {
          // Errors are surfaced by the parent handler; avoid unhandled rejections from Leaflet events.
        } finally {
          persistingMutation = false;
          disableActiveDrawMode(map, drawControl);
          setMapLocked(false);
        }
      }
    };

    const handleDeleted = async (e: L.LeafletEvent) => {
      if (!onPersistedPolygonDeletesCommitted) {
        return;
      }
      const deleted = e as L.DrawEvents.Deleted;
      const zoneIds: string[] = [];
      deleted.layers.eachLayer((layer) => {
        const zoneId = readZoneIdFromLayer(layer);
        if (zoneId) {
          zoneIds.push(zoneId);
        }
      });
      if (zoneIds.length > 0) {
        persistingMutation = true;
        try {
          await onPersistedPolygonDeletesCommitted(zoneIds);
        } catch {
          //
        } finally {
          persistingMutation = false;
          disableActiveDrawMode(map, drawControl);
          setMapLocked(false);
        }
      }
    };

    map.on(L.Draw.Event.DRAWSTART, handleDrawSessionStart);
    map.on(L.Draw.Event.DRAWSTOP, handleDrawSessionEnd);
    map.on(L.Draw.Event.EDITSTART, handleDrawSessionStart);
    map.on(L.Draw.Event.EDITSTOP, handleDrawSessionEnd);
    map.on(L.Draw.Event.DELETESTART, handleDrawSessionStart);
    map.on(L.Draw.Event.DELETESTOP, handleDrawSessionEnd);
    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.EDITED, handleEdited);
    map.on(L.Draw.Event.DELETED, handleDeleted);

    return () => {
      map.off(L.Draw.Event.DRAWSTART, handleDrawSessionStart);
      map.off(L.Draw.Event.DRAWSTOP, handleDrawSessionEnd);
      map.off(L.Draw.Event.EDITSTART, handleDrawSessionStart);
      map.off(L.Draw.Event.EDITSTOP, handleDrawSessionEnd);
      map.off(L.Draw.Event.DELETESTART, handleDrawSessionStart);
      map.off(L.Draw.Event.DELETESTOP, handleDrawSessionEnd);
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.off(L.Draw.Event.EDITED, handleEdited);
      map.off(L.Draw.Event.DELETED, handleDeleted);
      map.removeControl(drawControl);
      setMapLocked(false);
    };
  }, [
    map,
    spatialEditingEnabled,
    editableFeatureGroupRef,
    onMapDrawSessionLockChange,
    onPolygonSketchCommitted,
    onPersistedPolygonEditsCommitted,
    onPersistedPolygonDeletesCommitted,
  ]);

  return null;
}
