"use client";

import { ThemeToggle } from "./ThemeToggle";
import { useCreateModal } from "./CreateModalContext";

export function Topbar() {
  const { setOpen } = useCreateModal();
  return (
    <header
      className="flex h-[66px] flex-none items-center gap-4 px-5"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <div
        className="ml-1 flex max-w-[380px] flex-1 items-center gap-2.5 rounded-[12px] px-3 py-2.5"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-faint)"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          placeholder="Search campaigns, contacts…"
          className="flex-1 border-0 bg-transparent text-[13px] font-medium outline-none"
          style={{ color: "var(--text)" }}
        />
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <ThemeToggle />
        <button
          type="button"
          title="Notifications"
          className="relative grid h-[38px] w-[38px] cursor-pointer place-items-center rounded-[11px]"
          style={{
            background: "var(--surface-2)",
            color: "var(--text)",
            border: "1px solid var(--border)",
          }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
          <span
            className="absolute right-2.5 top-2.5 h-[7px] w-[7px] rounded-full"
            style={{
              background: "var(--red)",
              boxShadow: "0 0 0 2px var(--surface)",
            }}
          />
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-[12px] px-4 py-2.5 text-[13px] font-bold text-white"
          style={{
            background:
              "linear-gradient(180deg, var(--accent), var(--accent-2))",
            boxShadow: "0 8px 20px var(--accent-soft)",
            border: "1px solid transparent",
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New campaign
        </button>
      </div>
    </header>
  );
}
