export type Role = "ADMIN" | "MANAGER" | "AGENT" | "CITIZEN";

export type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
};
