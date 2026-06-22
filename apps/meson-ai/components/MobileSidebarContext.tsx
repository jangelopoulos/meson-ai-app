"use client";

import { createContext, useContext, useState } from "react";

type Ctx = { open: boolean; setOpen: (v: boolean) => void };

const MobileSidebarContext = createContext<Ctx | null>(null);

export function MobileSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <MobileSidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </MobileSidebarContext.Provider>
  );
}

export function useMobileSidebar(): Ctx {
  const ctx = useContext(MobileSidebarContext);
  if (!ctx)
    throw new Error("useMobileSidebar must be used inside MobileSidebarProvider");
  return ctx;
}
