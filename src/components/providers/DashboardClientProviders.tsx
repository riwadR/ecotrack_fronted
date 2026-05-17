"use client";

import type { ReactNode } from "react";
import { UserGeolocationProvider } from "@/contexts/UserGeolocationContext";

/** Client providers shared across authenticated dashboard routes. */
export default function DashboardClientProviders({ children }: { children: ReactNode }) {
  return <UserGeolocationProvider>{children}</UserGeolocationProvider>;
}
