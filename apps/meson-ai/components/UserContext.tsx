"use client";

import { createContext, useContext } from "react";
import type { AppSession } from "@/lib/auth/types";

const UserContext = createContext<AppSession | null>(null);

export function UserProvider({
  value,
  children,
}: {
  value: AppSession;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useAppUser(): AppSession {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useAppUser must be used inside <UserProvider>");
  return ctx;
}
