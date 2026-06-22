"use client";

import { useEffect } from "react";
import { SidebarContents } from "./Sidebar";
import { useMobileSidebar } from "./MobileSidebarContext";

export function MobileSidebarDrawer() {
  const { open, setOpen } = useMobileSidebar();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div
        className="absolute inset-0 transition-opacity duration-200"
        style={{
          background: "rgba(7,8,17,0.55)",
          backdropFilter: "blur(8px)",
          opacity: open ? 1 : 0,
        }}
        onClick={() => setOpen(false)}
      />
      <aside
        className="absolute left-0 top-0 flex h-full w-[268px] max-w-[85vw] flex-col p-4 transition-transform duration-200"
        style={{
          transform: open ? "translateX(0)" : "translateX(-100%)",
          background: "var(--surface)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          borderRight: "1px solid var(--border)",
          boxShadow: "var(--shadow), inset 0 1px 0 var(--sheen)",
        }}
      >
        <SidebarContents onNavigate={() => setOpen(false)} />
      </aside>
    </div>
  );
}
