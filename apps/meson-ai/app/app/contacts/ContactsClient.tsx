"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { SegmentedControl } from "@/components/SegmentedControl";
import { useAppUser } from "@/components/UserContext";
import { ContactModal } from "@/components/ContactModal";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { fetchCached, getCached } from "@/lib/client-cache";

export type Contact = {
  id: string;
  created_at: number | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  project_id: string | null;
  last_contact_at: number | null;
  lead_reference: string | null;
};

export type Project = { id: string; name: string | null };

type ContactsPayload = { contacts: Contact[]; projects: Project[] };

type ContactFilter = "all" | "email" | "phone" | "recent";
type SortKey =
  | "created_desc"
  | "created_asc"
  | "name_asc"
  | "name_desc"
  | "last_contact_desc";

const PAGE_SIZE_OPTIONS = [25, 50, 100];
const RECENT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

async function loadContactsData(clientId: string): Promise<ContactsPayload> {
  const supabase = getBrowserSupabase();
  const [contactsRes, projectsRes] = await Promise.all([
    supabase
      .from("client_contact")
      .select(
        "id, created_at, first_name, last_name, email, phone, address, project_id, last_contact_at, lead_reference"
      )
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase.from("projects").select("id, name").eq("client_id", clientId),
  ]);
  return {
    contacts: (contactsRes.data ?? []) as Contact[],
    projects: (projectsRes.data ?? []) as Project[],
  };
}

export default function ContactsClient() {
  const { client } = useAppUser();
  const clientId = client?.id ?? null;
  const cacheKey = clientId ? `contacts:${clientId}` : null;

  const initial = cacheKey ? getCached<ContactsPayload>(cacheKey) : null;
  const [data, setData] = useState<ContactsPayload | null>(initial);
  const [loading, setLoading] = useState<boolean>(!initial && !!clientId);

  useEffect(() => {
    if (!clientId || !cacheKey) return;
    let cancelled = false;
    if (!data) setLoading(true);
    fetchCached(cacheKey, () => loadContactsData(clientId))
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clientId, cacheKey, data]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ContactFilter>("all");
  const [projectId, setProjectId] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("created_desc");
  const [pageSize, setPageSize] = useState<number>(25);
  const [page, setPage] = useState<number>(1);
  const [selected, setSelected] = useState<Contact | null>(null);

  const contacts = data?.contacts ?? [];
  const projects = data?.projects ?? [];
  const now = Date.now();

  const metrics = useMemo(() => {
    const total = contacts.length;
    const withEmail = contacts.filter((c) => !!c.email).length;
    const withPhone = contacts.filter((c) => !!c.phone).length;
    const recent = contacts.filter(
      (c) => c.last_contact_at && now - c.last_contact_at < RECENT_WINDOW_MS
    ).length;
    return { total, withEmail, withPhone, recent };
  }, [contacts, now]);

  const projectName = useMemo(() => {
    const map = new Map<string, string>();
    projects.forEach((p) => map.set(p.id, p.name ?? "Untitled"));
    return map;
  }, [projects]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts.filter((c) => {
      if (filter === "email" && !c.email) return false;
      if (filter === "phone" && !c.phone) return false;
      if (
        filter === "recent" &&
        !(c.last_contact_at && now - c.last_contact_at < RECENT_WINDOW_MS)
      )
        return false;
      if (projectId !== "all" && c.project_id !== projectId) return false;
      if (q) {
        const hay = [
          c.first_name,
          c.last_name,
          c.email,
          c.phone,
          c.address,
          c.lead_reference,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [contacts, search, filter, projectId, now]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const name = (c: Contact) =>
      `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim().toLowerCase();
    switch (sort) {
      case "created_asc":
        arr.sort((a, b) => (a.created_at ?? 0) - (b.created_at ?? 0));
        break;
      case "name_asc":
        arr.sort((a, b) => name(a).localeCompare(name(b)));
        break;
      case "name_desc":
        arr.sort((a, b) => name(b).localeCompare(name(a)));
        break;
      case "last_contact_desc":
        arr.sort(
          (a, b) => (b.last_contact_at ?? 0) - (a.last_contact_at ?? 0)
        );
        break;
      case "created_desc":
      default:
        arr.sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0));
    }
    return arr;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageRows = sorted.slice(start, start + pageSize);

  const resetPage = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  if (!clientId) {
    return (
      <div className="text-sm" style={{ color: "var(--text-dim)" }}>
        No client linked to this account.
      </div>
    );
  }

  return (
    <div className="animate-pop flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className="text-[28px] font-extrabold"
            style={{ letterSpacing: "-0.025em" }}
          >
            Contacts
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-dim)" }}>
            Everyone in your client database.
          </p>
        </div>
        <SegmentedControl
          value={filter}
          onChange={resetPage(setFilter)}
          options={[
            { value: "all", label: "All" },
            { value: "email", label: "Has email" },
            { value: "phone", label: "Has phone" },
            { value: "recent", label: "Recent" },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Metric label="Total" value={metrics.total} loading={loading && !data} />
        <Metric label="With email" value={metrics.withEmail} loading={loading && !data} />
        <Metric label="With phone" value={metrics.withPhone} loading={loading && !data} />
        <Metric label="Contacted 30d" value={metrics.recent} loading={loading && !data} />
      </div>

      <Card padded={false}>
        <div
          className="flex flex-wrap items-center gap-3 p-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="min-w-[220px] flex-1">
            <Input
              placeholder="Search name, email, phone, address…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={projectId}
            onChange={resetPage(setProjectId)}
            label="Project"
          >
            <option value="all">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name ?? "Untitled"}
              </option>
            ))}
          </Select>
          <Select
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
            label="Sort"
          >
            <option value="created_desc">Newest</option>
            <option value="created_asc">Oldest</option>
            <option value="name_asc">Name A–Z</option>
            <option value="name_desc">Name Z–A</option>
            <option value="last_contact_desc">Last contacted</option>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead>
              <tr
                style={{ color: "var(--text-faint)" }}
                className="text-[11px] uppercase"
              >
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Project</th>
                <th className="px-4 py-3 font-semibold">Last contact</th>
                <th className="px-4 py-3 font-semibold">Added</th>
              </tr>
            </thead>
            <tbody>
              {loading && !data && <SkeletonRows count={pageSize} />}
              {!loading && pageRows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-[13px]"
                    style={{ color: "var(--text-dim)" }}
                  >
                    No contacts match these filters.
                  </td>
                </tr>
              )}
              {pageRows.map((c) => {
                const fullName =
                  `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || "—";
                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="cursor-pointer transition hover:bg-[var(--surface)]"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <td className="px-4 py-3.5 font-semibold">{fullName}</td>
                    <td
                      className="px-4 py-3.5"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {c.email || "—"}
                    </td>
                    <td
                      className="px-4 py-3.5"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {c.phone || "—"}
                    </td>
                    <td
                      className="px-4 py-3.5"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {c.project_id
                        ? projectName.get(c.project_id) ?? "—"
                        : "—"}
                    </td>
                    <td
                      className="px-4 py-3.5"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {formatDate(c.last_contact_at)}
                    </td>
                    <td
                      className="px-4 py-3.5"
                      style={{ color: "var(--text-faint)" }}
                    >
                      {formatDate(c.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div
          className="flex flex-wrap items-center justify-between gap-3 p-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="text-[12px]" style={{ color: "var(--text-faint)" }}>
            {loading && !data
              ? "Loading…"
              : sorted.length === 0
              ? "0 contacts"
              : `${start + 1}–${Math.min(start + pageSize, sorted.length)} of ${sorted.length}`}
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={String(pageSize)}
              onChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
              label="Rows"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </Select>
            <div className="flex items-center gap-1.5">
              <PageBtn
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
              >
                ←
              </PageBtn>
              <span
                className="px-2 text-[12px] font-semibold"
                style={{ color: "var(--text-dim)" }}
              >
                {currentPage} / {totalPages}
              </span>
              <PageBtn
                disabled={currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                →
              </PageBtn>
            </div>
          </div>
        </div>
      </Card>

      <ContactModal
        contact={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function Metric({
  label,
  value,
  loading,
}: {
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <Card>
      <div
        className="mb-1.5 text-[12px] font-semibold uppercase"
        style={{ color: "var(--text-faint)", letterSpacing: "0.05em" }}
      >
        {label}
      </div>
      {loading ? (
        <div
          className="h-[34px] w-20 animate-pulse rounded-[8px]"
          style={{ background: "var(--surface)" }}
        />
      ) : (
        <div
          className="text-[28px] font-extrabold"
          style={{ letterSpacing: "-0.02em" }}
        >
          {value.toLocaleString()}
        </div>
      )}
    </Card>
  );
}

function Select({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2">
      <span
        className="text-[11px] font-semibold uppercase"
        style={{ color: "var(--text-faint)", letterSpacing: "0.05em" }}
      >
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-[10px] px-3 py-2 text-[13px] font-semibold outline-none"
        style={{
          background: "var(--surface-2)",
          color: "var(--text)",
          border: "1px solid var(--border-strong)",
        }}
      >
        {children}
      </select>
    </label>
  );
}

function PageBtn({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="grid h-8 w-8 place-items-center rounded-[9px] text-[13px] font-bold transition"
      style={{
        background: "var(--surface-2)",
        color: disabled ? "var(--text-faint)" : "var(--text)",
        border: "1px solid var(--border)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: Math.min(count, 8) }).map((_, i) => (
        <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
          {Array.from({ length: 6 }).map((__, j) => (
            <td key={j} className="px-4 py-3.5">
              <div
                className="h-4 animate-pulse rounded-[6px]"
                style={{ background: "var(--surface)" }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function formatDate(ms: number | null): string {
  if (!ms) return "—";
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
