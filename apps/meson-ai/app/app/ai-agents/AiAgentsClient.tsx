"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { SegmentedControl } from "@/components/SegmentedControl";
import { AgentModal } from "@/components/AgentModal";
import { useAppUser } from "@/components/UserContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { fetchCached, getCached } from "@/lib/client-cache";
import type { Agent } from "@/lib/types/agent";

type StatusFilter = "all" | "draft" | "active" | "paused" | "archived";
type SortKey =
  | "created_desc"
  | "created_asc"
  | "name_asc"
  | "updated_desc";

async function loadAgents(clientId: string): Promise<Agent[]> {
  const supabase = getBrowserSupabase();
  const { data } = await supabase
    .schema("meson_ai")
    .from("ai_agents")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return (data ?? []) as Agent[];
}

export default function AiAgentsClient() {
  const { client } = useAppUser();
  const clientId = client?.id ?? null;
  const cacheKey = clientId ? `ai-agents:${clientId}` : null;
  const initial = cacheKey ? getCached<Agent[]>(cacheKey) : null;

  const [agents, setAgents] = useState<Agent[]>(initial ?? []);
  const [loading, setLoading] = useState<boolean>(!initial && !!clientId);
  const [reloadTick, setReloadTick] = useState(0);

  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("created_desc");

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Agent | null>(null);

  useEffect(() => {
    if (!clientId || !cacheKey) return;
    let cancelled = false;
    setLoading(true);
    fetchCached(cacheKey, () => loadAgents(clientId))
      .then((data) => {
        if (!cancelled) setAgents(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clientId, cacheKey, reloadTick]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = agents.filter((a) => {
      if (status !== "all" && a.status !== status) return false;
      if (q) {
        const hay = [a.name, a.description, a.role, a.objective]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const ts = (s: string | null) => (s ? new Date(s).getTime() : 0);
    arr = [...arr];
    switch (sort) {
      case "created_asc":
        arr.sort((a, b) => ts(a.created_at) - ts(b.created_at));
        break;
      case "name_asc":
        arr.sort((a, b) =>
          (a.name ?? "").toLowerCase().localeCompare((b.name ?? "").toLowerCase())
        );
        break;
      case "updated_desc":
        arr.sort((a, b) => ts(b.updated_at) - ts(a.updated_at));
        break;
      case "created_desc":
      default:
        arr.sort((a, b) => ts(b.created_at) - ts(a.created_at));
    }
    return arr;
  }, [agents, status, search, sort]);

  if (!clientId) {
    return (
      <div className="text-sm" style={{ color: "var(--text-dim)" }}>
        No client linked to this account.
      </div>
    );
  }

  return (
    <div className="animate-pop flex flex-col gap-5 md:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1
            className="text-[22px] font-extrabold md:text-[28px]"
            style={{ letterSpacing: "-0.025em" }}
          >
            AI Agents
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-dim)" }}>
            Configure how your AI agents think, talk, and what they know.
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:gap-3">
          <div className="w-full overflow-x-auto md:w-auto">
            <SegmentedControl
              value={status}
              onChange={setStatus}
              options={[
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "draft", label: "Draft" },
                { value: "paused", label: "Paused" },
                { value: "archived", label: "Archived" },
              ]}
            />
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-[12px] px-4 py-2.5 text-[13px] font-bold text-white"
            style={{
              background:
                "linear-gradient(180deg, var(--accent), var(--accent-2))",
              boxShadow: "0 8px 20px var(--accent-soft)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New agent
          </button>
        </div>
      </div>

      <Card padded={false}>
        <div
          className="flex flex-col gap-3 p-3 md:flex-row md:items-center md:gap-3 md:p-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="md:flex-1">
            <Input
              placeholder="Search name, role, objective…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            label="Sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            <option value="created_desc">Newest</option>
            <option value="created_asc">Oldest</option>
            <option value="name_asc">Name A–Z</option>
            <option value="updated_desc">Recently updated</option>
          </Select>
        </div>

        <div className="p-3 md:p-4">
          {loading && agents.length === 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              hasAgents={agents.length > 0}
              onCreate={() => setCreateOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((a) => (
                <AgentCard
                  key={a.id}
                  agent={a}
                  onClick={() => setEditing(a)}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      <AgentModal
        mode="create"
        open={createOpen}
        agent={null}
        clientId={clientId}
        onClose={() => setCreateOpen(false)}
        onSaved={() => setReloadTick((t) => t + 1)}
      />
      <AgentModal
        mode="edit"
        open={!!editing}
        agent={editing}
        clientId={clientId}
        onClose={() => setEditing(null)}
        onSaved={() => setReloadTick((t) => t + 1)}
      />
    </div>
  );
}

function AgentCard({
  agent,
  onClick,
}: {
  agent: Agent;
  onClick: () => void;
}) {
  return (
    <Card
      className="cursor-pointer transition hover:-translate-y-0.5"
      style={{ transitionDuration: "180ms" }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        className="flex flex-col gap-3"
      >
        <div className="flex items-start gap-3">
          <div
            className="grid h-11 w-11 flex-none place-items-center rounded-[12px] text-[14px] font-bold text-white"
            style={{ background: agent.avatar_color ?? "var(--accent)" }}
          >
            {(agent.name?.[0] ?? "A").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="truncate text-[15px] font-bold">
                {agent.name || "Untitled"}
              </div>
              <StatusBadge status={agent.status} />
            </div>
            <div
              className="truncate text-[12px]"
              style={{ color: "var(--text-faint)" }}
            >
              {agent.role || "—"}
            </div>
          </div>
        </div>
        {agent.objective && (
          <p
            className="line-clamp-2 text-[12.5px] leading-snug"
            style={{ color: "var(--text-dim)" }}
          >
            {agent.objective}
          </p>
        )}
        <div
          className="text-[11px]"
          style={{ color: "var(--text-faint)" }}
        >
          {agent.updated_at
            ? `Updated ${formatRel(agent.updated_at)}`
            : "Just created"}
        </div>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    active: {
      bg: "rgba(61,220,151,0.16)",
      color: "var(--green)",
      label: "Active",
    },
    draft: {
      bg: "var(--surface)",
      color: "var(--text-dim)",
      label: "Draft",
    },
    paused: {
      bg: "rgba(255,181,71,0.18)",
      color: "var(--amber)",
      label: "Paused",
    },
    archived: {
      bg: "var(--surface)",
      color: "var(--text-faint)",
      label: "Archived",
    },
  };
  const s = map[status] ?? map.draft;
  return (
    <span
      className="rounded-[6px] px-1.5 py-[1px] text-[10.5px] font-bold uppercase"
      style={{ background: s.bg, color: s.color, letterSpacing: "0.04em" }}
    >
      {s.label}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div
      className="h-[140px] animate-pulse rounded-[18px]"
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
      }}
    />
  );
}

function EmptyState({
  hasAgents,
  onCreate,
}: {
  hasAgents: boolean;
  onCreate: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-[16px] p-10 text-center"
      style={{
        background: "var(--surface-2)",
        border: "1px dashed var(--border-strong)",
      }}
    >
      <div className="text-[15px] font-bold">
        {hasAgents ? "No agents match these filters." : "Create your first agent."}
      </div>
      <p className="text-[13px]" style={{ color: "var(--text-dim)" }}>
        Define a persona, prompt, and knowledge base — then plug it into a
        campaign.
      </p>
      {!hasAgents && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-[11px] px-3.5 py-2 text-[13px] font-bold text-white"
          style={{
            background:
              "linear-gradient(180deg, var(--accent), var(--accent-2))",
            boxShadow: "0 8px 20px var(--accent-soft)",
          }}
        >
          New agent
        </button>
      )}
    </div>
  );
}

function formatRel(iso: string): string {
  const t = new Date(iso).getTime();
  if (!t) return "—";
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
