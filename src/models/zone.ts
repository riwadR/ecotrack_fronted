export type Zone = {
  id: string;
  name: string;
  description?: string;
  city?: string;
  createdAt?: string;
  updatedAt?: string;
  containersCount?: number;
};

/** Payload accepted by `POST /api/zones` (see `backend/docs/ZONES_HTTP_API.md`). */
export type CreateZonePayload = {
  name: string;
  wktPolygon: string;
  description?: string;
  city?: string;
};

/** Payload accepted by `PUT /api/zones/{id}`. */
export type UpdateZonePayload = {
  name: string;
  wktPolygon: string;
  /** When omitted or null, the backend keeps the existing description. */
  description?: string | null;
};

/** Payload accepted by `PATCH /api/zones/{id}` (metadata only). */
export type PatchZoneDetailsPayload = {
  name: string;
  description: string;
};