"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark, Wordmark } from "./Logo";
import { useAppUser } from "./UserContext";
import { signOut } from "@/lib/auth/actions";

function NavSpinner() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span
      className="ml-auto inline-block h-3.5 w-3.5 animate-spin rounded-full"
      style={{
        border: "2px solid var(--surface-2)",
        borderTopColor: "var(--accent)",
      }}
    />
  );
}

const items = [
  {
    href: "/app/dashboard",
    label: "Dashboard",
    icon: (
      <>
        <rect x="3" y="3" width="8" height="10" rx="2" />
        <rect x="13" y="3" width="8" height="6" rx="2" />
        <rect x="3" y="15" width="8" height="6" rx="2" />
        <rect x="13" y="11" width="8" height="10" rx="2" />
      </>
    ),
  },
  {
    href: "/app/campaigns",
    label: "Campaigns",
    icon: (
      <>
        <path d="M3 11l18-7v16L3 13z" />
        <path d="M7 13v5a2 2 0 0 0 4 0v-3" />
      </>
    ),
  },
  {
    href: "/app/conversations",
    label: "Conversations",
    badge: "2",
    icon: (
      <>
        <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.4 8.4 0 0 1-3.4-.6L3 21l1.7-5.6A8.4 8.4 0 1 1 21 11.5z" />
      </>
    ),
  },
  {
    href: "/app/contacts",
    label: "Contacts",
    icon: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    href: "/app/integrations",
    label: "Integrations",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <path d="M6.5 10v4M10 17.5h4" />
      </>
    ),
  },
  {
    href: "/app/settings",
    label: "Settings",
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.8.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.4-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
      </>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, client } = useAppUser();
  const fullName = `${user.first_name} ${user.last_name}`.trim() || user.email;
  const initials =
    (user.first_name?.[0] ?? "") + (user.last_name?.[0] ?? "") ||
    user.email[0].toUpperCase();
  const orgName = client?.company_name ?? "—";

  return (
    <aside
      className="hidden w-[248px] flex-none flex-col rounded-[22px] p-4 md:flex"
      style={{
        background: "var(--surface)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow), inset 0 1px 0 var(--sheen)",
      }}
    >
      <div className="mb-6 flex items-center gap-2.5 px-1.5 pt-1">
        <LogoMark size={34} />
        <Wordmark size={16} />
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <Link
              key={it.href}
              href={it.href}
              className="flex items-center gap-3 rounded-[11px] px-3 py-2.5 text-[13.5px] font-semibold transition"
              style={{
                background: active ? "var(--surface-2)" : "transparent",
                color: active ? "var(--text)" : "var(--text-dim)",
                border: active
                  ? "1px solid var(--border)"
                  : "1px solid transparent",
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
                {it.icon}
              </svg>
              <span>{it.label}</span>
              <NavSpinner />
              {it.badge && (
                <span
                  className="ml-auto rounded-[8px] px-[7px] py-[2px] text-[11px] font-bold text-white"
                  style={{ background: "var(--accent)" }}
                >
                  {it.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <div
          className="rounded-[16px] p-3.5"
          style={{
            background:
              "linear-gradient(160deg, var(--accent-soft), transparent)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="text-[13px] font-bold">Pro plan</div>
          <div
            className="mt-1 mb-2.5 text-xs"
            style={{ color: "var(--text-dim)" }}
          >
            8,200 / 15,000 messages used
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-[6px]"
            style={{ background: "var(--surface-2)" }}
          >
            <div
              className="h-full rounded-[6px]"
              style={{
                width: "55%",
                background:
                  "linear-gradient(90deg, var(--accent), var(--accent-2))",
              }}
            />
          </div>
        </div>

        <div
          className="flex items-center gap-2.5 rounded-[14px] p-2.5"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <div
            className="grid h-[34px] w-[34px] flex-none place-items-center rounded-full text-[13px] font-bold text-white"
            style={{
              background: "linear-gradient(140deg, var(--sms), var(--call))",
            }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold">
              {fullName}
            </div>
            <div
              className="truncate text-[11px]"
              style={{ color: "var(--text-faint)" }}
            >
              {orgName}
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              title="Sign out"
              className="grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-[9px]"
              style={{
                background: "var(--surface)",
                color: "var(--text-dim)",
                border: "1px solid var(--border)",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
