import type { Role } from "@/models/user";

export type ZoneUserBasic = {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: Role;
};

export type Zone = {
  id: string;
  name: string;
  description?: string;
  city?: string;
  createdAt?: string;
  updatedAt?: string;
  containersCount?: number;
  manager?: ZoneUserBasic | null;
  notificationReceivers?: ZoneUserBasic[];
};

/** Payload accepted by `POST /api/zones` (see `backend/docs/ZONES_HTTP_API.md`). */
export type CreateZonePayload = {
  name: string;
  wktPolygon: string;
  description?: string;
  city?: string;
  managerId?: string | null;
  notificationReceiverIds?: string[];
};

/** Payload accepted by `PUT /api/zones/{id}`. */
export type UpdateZonePayload = {
  name: string;
  wktPolygon: string;
  /** When omitted or null, the backend keeps the existing description. */
  description?: string | null;
  managerId?: string | null;
  notificationReceiverIds?: string[];
};

/** Payload accepted by `PATCH /api/zones/{id}` (metadata only). */
export type PatchZoneDetailsPayload = {
  name: string;
  description: string;
  managerId?: string | null;
  notificationReceiverIds?: string[];
};

export type ZoneFormValues = {
  name: string;
  description: string;
  managerId: string;
  notificationReceiverIds: string[];
};
