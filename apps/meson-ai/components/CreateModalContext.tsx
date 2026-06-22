"use client";

import { createContext, useContext, useState } from "react";

type Ctx = { open: boolean; setOpen: (v: boolean) => void };

const CreateModalContext = createContext<Ctx | null>(null);

export function CreateModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <CreateModalContext.Provider value={{ open, setOpen }}>
      {children}
    </CreateModalContext.Provider>
  );
}

export function useCreateModal() {
  const ctx = useContext(CreateModalContext);
  if (!ctx)
    throw new Error("useCreateModal must be used inside <CreateModalProvider>");
  return ctx;
}
