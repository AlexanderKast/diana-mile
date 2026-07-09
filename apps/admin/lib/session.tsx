"use client";

import { createContext, useContext } from "react";
import type { RolUsuario } from "@diana-mile/shared/types";

export type SessionInfo = {
  email: string;
  nombre: string;
  rol: RolUsuario;
};

const SessionContext = createContext<SessionInfo | null>(null);

export function SessionProvider({
  value,
  children,
}: {
  value: SessionInfo;
  children: React.ReactNode;
}) {
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionInfo {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de SessionProvider");
  return ctx;
}
