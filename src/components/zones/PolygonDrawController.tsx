"use client";

import { useLayoutEffect } from "react";
import type { RefObject } from "react";
import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import { useMap } from "react-leaflet";
import { getPolygonOuterRingLatLng } from "@/lib/zones/polygonGeoUtils";
import { latLngRingToPolygonWkt } from "@/lib/zones/wktFromLeaflet";

export type PersistedPolygonEdit = {
  zoneId: string;
  wktPolygon: string;
};

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
  editableLayerRevision: number;
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
  editableLayerRevision,
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

    const drawControl = new L.Control.Draw({
      position: "topleft",
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
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
        try {
          await onPersistedPolygonEditsCommitted(edits);
        } catch {
          // Errors are surfaced by the parent handler; avoid unhandled rejections from Leaflet events.
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
        try {
          await onPersistedPolygonDeletesCommitted(zoneIds);
        } catch {
          //
        }
      }
    };

    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.EDITED, handleEdited);
    map.on(L.Draw.Event.DELETED, handleDeleted);

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.off(L.Draw.Event.EDITED, handleEdited);
      map.off(L.Draw.Event.DELETED, handleDeleted);
      map.removeControl(drawControl);
    };
  }, [
    map,
    spatialEditingEnabled,
    editableFeatureGroupRef,
    editableLayerRevision,
    onPolygonSketchCommitted,
    onPersistedPolygonEditsCommitted,
    onPersistedPolygonDeletesCommitted,
  ]);

  return null;
}
