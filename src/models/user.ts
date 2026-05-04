export type Role = "ADMIN" | "MANAGER" | "AGENT" | "CITIZEN";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};