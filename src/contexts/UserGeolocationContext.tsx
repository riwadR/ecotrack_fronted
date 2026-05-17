"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  useGeolocationWatch,
  type GeolocationFix,
} from "@/hooks/useGeolocationWatch";

export type UserGeolocationState = {
  tracking: boolean;
  fix: GeolocationFix | null;
  error: string | null;
  toggleTracking: () => void;
  setTracking: (active: boolean) => void;
};

const UserGeolocationContext = createContext<UserGeolocationState | null>(null);

export function UserGeolocationProvider({ children }: { children: ReactNode }) {
  const [tracking, setTracking] = useState(false);
  const { fix, error } = useGeolocationWatch({ enabled: tracking });

  const toggleTracking = useCallback(() => {
    setTracking((active) => !active);
  }, []);

  const value = useMemo(
    () => ({
      tracking,
      fix,
      error,
      toggleTracking,
      setTracking,
    }),
    [tracking, fix, error, toggleTracking]
  );

  return (
    <UserGeolocationContext.Provider value={value}>
      {children}
    </UserGeolocationContext.Provider>
  );
}

export function useUserGeolocation(): UserGeolocationState {
  const context = useContext(UserGeolocationContext);
  if (!context) {
    throw new Error("useUserGeolocation must be used within UserGeolocationProvider");
  }
  return context;
}
