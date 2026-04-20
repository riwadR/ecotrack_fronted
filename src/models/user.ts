export type Role = "ADMIN" | "GESTIONNAIRE" | "AGENT" | "CITOYEN";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};