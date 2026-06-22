"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { useAppUser } from "@/components/UserContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { fetchCached, getCached } from "@/lib/client-cache";

type Integration = {
  key: string;
  name: string;
  tagline: string;
  matchers: string[]; // lowercased substrings to look for in client_integrations.name
  accent: string;
  initials: string;
};

type ClientIntegrationRow = {
  id: string;
  name: string | null;
  url: string | null;
  type: string | null;
  active: boolean | null;
  created_at: number | null;
};

const INTEGRATIONS: Integration[] = [
  {
    key: "reapit",
    name: "ReapitSales",
    tagline: "Pull sales contacts and pipeline from Reapit.",
    matchers: ["reapit"],
    accent: "linear-gradient(140deg, #ff6b6b, #ee5a52)",
    initials: "RS",
  },
  {
    key: "boxdice",
    name: "Box & Dice",
    tagline: "Two-way sync with Box & Dice CRM.",
    matchers: ["box&dice", "box & dice", "boxdice"],
    accent: "linear-gradient(140deg, #5b8def, #2c5cdb)",
    initials: "BD",
  },
  {
    key: "rex",
    name: "Rex",
    tagline: "Sync contacts and listings from Rex CRM.",
    matchers: ["rex"],
    accent: "linear-gradient(140deg, #1a1a1a, #4a4a4a)",
    initials: "RX",
  },
  {
    key: "lockedon",
    name: "LockedOn",
    tagline: "Real estate prospecting data from LockedOn.",
    matchers: ["lockedon", "locked on"],
    accent: "linear-gradient(140deg, #ffb547, #f08c00)",
    initials: "LO",
  },
  {
    key: "airtable",
    name: "Airtable",
    tagline: "Sync a base table as your contact source.",
    matchers: ["airtable"],
    accent: "linear-gradient(140deg, #ffbb33, #ff6f61)",
    initials: "AT",
  },
  {
    key: "hubspot",
    name: "HubSpot",
    tagline: "Push and pull contacts, deals, and activities.",
    matchers: ["hubspot"],
    accent: "linear-gradient(140deg, #ff7a59, #ff5722)",
    initials: "HS",
  },
  {
    key: "pipedrive",
    name: "Pipedrive",
    tagline: "Sync leads and deals with Pipedrive.",
    matchers: ["pipedrive"],
    accent: "linear-gradient(140deg, #1a1a1a, #2d2d2d)",
    initials: "PD",
  },
  {
    key: "monday",
    name: "Monday",
    tagline: "Connect boards and items from Monday.com.",
    matchers: ["monday"],
    accent: "linear-gradient(140deg, #ff3d57, #a25ddc)",
    initials: "MO",
  },
];

const CSV_INTEGRATION: Integration = {
  key: "csv",
  name: "CSV Upload",
  tagline: "Bulk import contacts from a spreadsheet.",
  matchers: [],
  accent: "linear-gradient(140deg, #3ddc97, #1ec587)",
  initials: "CSV",
};

async function loadIntegrations(
  clientId: string
): Promise<ClientIntegrationRow[]> {
  const supabase = getBrowserSupabase();
  const { data } = await supabase
    .from("client_integrations")
    .select("id, name, url, type, active, created_at")
    .eq("client_id", clientId);
  return (data ?? []) as ClientIntegrationRow[];
}

function findActiveMatch(
  integration: Integration,
  rows: ClientIntegrationRow[]
): ClientIntegrationRow | null {
  if (!integration.matchers.length) return null;
  for (const row of rows) {
    if (!row.active || !row.name) continue;
    const n = row.name.toLowerCase();
    if (integration.matchers.some((m) => n.includes(m))) return row;
  }
  return null;
}

export default function IntegrationsClient() {
  const { client } = useAppUser();
  const clientId = client?.id ?? null;
  const cacheKey = clientId ? `client-integrations:${clientId}` : null;
  const initial = cacheKey
    ? getCached<ClientIntegrationRow[]>(cacheKey)
    : null;

  const [rows, setRows] = useState<ClientIntegrationRow[]>(initial ?? []);
  const [loading, setLoading] = useState<boolean>(!initial && !!clientId);
  const [selectedActive, setSelectedActive] = useState<{
    integration: Integration;
    row: ClientIntegrationRow;
  } | null>(null);

  useEffect(() => {
    if (!clientId || !cacheKey) return;
    let cancelled = false;
    if (!initial) setLoading(true);
    fetchCached(cacheKey, () => loadIntegrations(clientId))
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clientId, cacheKey, initial]);

  const activeMatches = useMemo(() => {
    return INTEGRATIONS.map((i) => ({
      integration: i,
      row: findActiveMatch(i, rows),
    })).filter((x): x is { integration: Integration; row: ClientIntegrationRow } =>
      x.row !== null
    );
  }, [rows]);

  return (
    <div className="animate-pop flex flex-col gap-5 md:gap-6">
      <div>
        <h1
          className="text-[22px] font-extrabold md:text-[28px]"
          style={{ letterSpacing: "-0.025em" }}
        >
          Integrations
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-dim)" }}>
          Connect your CRM or upload contacts to power campaigns.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <SectionHeader
          title="Active"
          count={loading ? null : activeMatches.length}
        />
        {loading && rows.length === 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : activeMatches.length === 0 ? (
          <div
            className="rounded-[16px] p-4 text-[13px]"
            style={{
              background: "var(--surface-2)",
              color: "var(--text-dim)",
              border: "1px dashed var(--border-strong)",
            }}
          >
            No active integrations yet. Pick one from the marketplace below.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {activeMatches.map(({ integration, row }) => (
              <IntegrationCard
                key={integration.key}
                integration={integration}
                active
                rowName={row.name}
                onClick={() => setSelectedActive({ integration, row })}
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeader title="Marketplace" count={INTEGRATIONS.length + 1} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {INTEGRATIONS.map((i) => {
            const isActive = activeMatches.some(
              (a) => a.integration.key === i.key
            );
            return (
              <IntegrationCard
                key={i.key}
                integration={i}
                active={isActive}
                onClick={
                  isActive
                    ? () => {
                        const match = activeMatches.find(
                          (a) => a.integration.key === i.key
                        );
                        if (match) setSelectedActive(match);
                      }
                    : undefined
                }
              />
            );
          })}
          <IntegrationCard integration={CSV_INTEGRATION} active={false} />
        </div>
      </section>

      <IntegrationModal
        open={!!selectedActive}
        integration={selectedActive?.integration ?? null}
        row={selectedActive?.row ?? null}
        onClose={() => setSelectedActive(null)}
      />
    </div>
  );
}

function SectionHeader({
  title,
  count,
}: {
  title: string;
  count: number | null;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <h2 className="text-[15px] font-bold">{title}</h2>
      {count !== null && (
        <span
          className="text-[12px] font-semibold"
          style={{ color: "var(--text-faint)" }}
        >
          {count}
        </span>
      )}
    </div>
  );
}

function IntegrationCard({
  integration,
  active,
  rowName,
  onClick,
}: {
  integration: Integration;
  active: boolean;
  rowName?: string | null;
  onClick?: () => void;
}) {
  const clickable = !!onClick;
  return (
    <Card
      className={`flex flex-col gap-3 transition ${
        clickable ? "cursor-pointer hover:-translate-y-0.5" : ""
      }`}
      style={{ transitionDuration: "180ms" }}
    >
      <div
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          clickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick?.();
                }
              }
            : undefined
        }
        className="flex flex-col gap-3"
      >
        <div className="flex items-start gap-3">
          <div
            className="grid h-11 w-11 flex-none place-items-center rounded-[12px] text-[12px] font-bold text-white"
            style={{ background: integration.accent }}
          >
            {integration.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="truncate text-[15px] font-bold">
                {integration.name}
              </div>
              {active && <ActiveBadge />}
            </div>
            <p
              className="mt-0.5 text-[12.5px] leading-snug"
              style={{ color: "var(--text-dim)" }}
            >
              {integration.tagline}
            </p>
          </div>
        </div>

        {active && rowName && (
          <div
            className="truncate rounded-[10px] px-3 py-2 text-[11.5px] font-semibold"
            style={{
              background: "var(--surface)",
              color: "var(--text-dim)",
              border: "1px solid var(--border)",
            }}
            title={rowName}
          >
            {rowName}
          </div>
        )}

        {!active && (
          <div
            className="text-[12px] font-semibold"
            style={{ color: "var(--accent)" }}
          >
            {integration.key === "csv" ? "Upload CSV →" : "Connect →"}
          </div>
        )}
      </div>
    </Card>
  );
}

function ActiveBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[6px] px-1.5 py-0.5 text-[10.5px] font-bold"
      style={{ background: "rgba(61,220,151,0.16)", color: "var(--green)" }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: "var(--green)" }}
      />
      Active
    </span>
  );
}

function SkeletonCard() {
  return (
    <div
      className="h-[112px] animate-pulse rounded-[18px]"
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
      }}
    />
  );
}

function IntegrationModal({
  open,
  integration,
  row,
  onClose,
}: {
  open: boolean;
  integration: Integration | null;
  row: ClientIntegrationRow | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !integration) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center p-3 pb-[calc(12px+72px+env(safe-area-inset-bottom))] md:items-center md:p-4 md:pb-4"
      style={{ background: "rgba(7,8,17,0.55)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="animate-pop flex w-full flex-col overflow-hidden rounded-[18px] md:rounded-[22px]"
        style={{
          maxWidth: 720,
          maxHeight: "min(820px, 100%)",
          background: "var(--surface-modal)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow), inset 0 1px 0 var(--sheen)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center gap-3 p-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div
            className="grid h-11 w-11 flex-none place-items-center rounded-[12px] text-[12px] font-bold text-white"
            style={{ background: integration.accent }}
          >
            {integration.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[17px] font-bold">
              {integration.name}
            </div>
            <div
              className="truncate text-[12px]"
              style={{ color: "var(--text-faint)" }}
            >
              {row?.name ?? "Integration"}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-[11px]"
            style={{
              background: "var(--surface-2)",
              color: "var(--text-dim)",
              border: "1px solid var(--border)",
            }}
            aria-label="Close"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div
          className="grid flex-1 place-items-center p-10 text-center"
          style={{ color: "var(--text-faint)" }}
        >
          <div className="text-[13px]">
            Integration controls coming soon.
          </div>
        </div>
      </div>
    </div>
  );
}
