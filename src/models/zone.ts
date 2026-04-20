export type Zone = {
  id: string;
  name: string;
  description?: string;
  city?: string;
  createdAt?: string;
  updatedAt?: string;
  containersCount?: number;
};

export type CreateZonePayload = {
  name: string;
  description?: string;
  city?: string;
};