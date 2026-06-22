"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { fetchCached, getCached } from "@/lib/client-cache";
import type { Contact } from "../app/app/contacts/ContactsClient";

type CampaignRow = {
  id: string;
  campaign_name: string | null;
  status: string | null;
  call_type: string | null;
  start_date: string | null;
  end_date: string | null;
};

type CampaignContactRow = {
  id: string;
  campaign_id: string | null;
  status: string | null;
  outcome_name: string | null;
  attempts: number | null;
  created_at: number | null;
};

type TimelineItem = {
  id: string;
  kind: "call" | "sms";
  ts: number;
  direction: string | null;
  campaign_id: string | null;
  title: string;
  detail: string | null;
  outcome: string | null;
  durationSec: number | null;
};

type ContactDetailPayload = {
  campaigns: Map<string, CampaignRow>;
  campaignContacts: CampaignContactRow[];
  timeline: TimelineItem[];
};

async function loadContactDetail(
  contactId: string
): Promise<ContactDetailPayload> {
  const supabase = getBrowserSupabase();

  const [ccRes, callsRes, smsRes] = await Promise.all([
    supabase
      .from("campaign_contacts")
      .select(
        "id, campaign_id, status, outcome_name, attempts, created_at"
      )
      .eq("client_contact_id", contactId),
    supabase
      .from("calls")
      .select(
        "id, created_at, call_start_time, campaign_id, direction, outcome, length_seconds, notes"
      )
      .eq("client_contact_id", contactId)
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("received_sms")
      .select("id, created_at, body, direction, from_number, to_number")
      .eq("client_contact_id", contactId)
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  const campaignContacts = (ccRes.data ?? []) as CampaignContactRow[];
  const campaignIds = Array.from(
    new Set(
      campaignContacts
        .map((c) => c.campaign_id)
        .filter((id): id is string => !!id)
    )
  );

  let campaignRows: CampaignRow[] = [];
  if (campaignIds.length) {
    const { data } = await supabase
      .from("campaigns")
      .select("id, campaign_name, status, call_type, start_date, end_date")
      .in("id", campaignIds);
    campaignRows = (data ?? []) as CampaignRow[];
  }

  const campaigns = new Map<string, CampaignRow>();
  campaignRows.forEach((c) => campaigns.set(c.id, c));

  const calls = (callsRes.data ?? []) as Array<{
    id: string;
    created_at: number | null;
    call_start_time: number | null;
    campaign_id: string | null;
    direction: string | null;
    outcome: string | null;
    length_seconds: number | null;
    notes: string | null;
  }>;
  const sms = (smsRes.data ?? []) as Array<{
    id: string;
    created_at: number | null;
    body: string | null;
    direction: string | null;
    from_number: string | null;
    to_number: string | null;
  }>;

  const callItems: TimelineItem[] = calls.map((c) => ({
    id: c.id,
    kind: "call",
    ts: c.call_start_time ?? c.created_at ?? 0,
    direction: c.direction,
    campaign_id: c.campaign_id,
    title: c.direction === "inbound" ? "Inbound call" : "Outbound call",
    detail: c.notes,
    outcome: c.outcome,
    durationSec: c.length_seconds,
  }));

  const smsItems: TimelineItem[] = sms.map((s) => ({
    id: s.id,
    kind: "sms",
    ts: s.created_at ?? 0,
    direction: s.direction ?? "inbound",
    campaign_id: null,
    title: s.direction === "outbound" ? "Outbound SMS" : "Inbound SMS",
    detail: s.body,
    outcome: null,
    durationSec: null,
  }));

  const timeline = [...callItems, ...smsItems].sort((a, b) => b.ts - a.ts);

  return { campaigns, campaignContacts, timeline };
}

export function ContactModal({
  contact,
  open,
  onClose,
}: {
  contact: Contact | null;
  open: boolean;
  onClose: () => void;
}) {
  const contactId = contact?.id ?? null;
  const cacheKey = contactId ? `contact-detail:${contactId}` : null;
  const initial = cacheKey ? getCached<ContactDetailPayload>(cacheKey) : null;

  const [data, setData] = useState<ContactDetailPayload | null>(initial);
  const [loading, setLoading] = useState<boolean>(!initial && !!contactId);
  const [tab, setTab] = useState<"details" | "timeline">("timeline");

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

  useEffect(() => {
    if (!contactId || !cacheKey) {
      setData(null);
      return;
    }
    const cached = getCached<ContactDetailPayload>(cacheKey);
    setData(cached);
    let cancelled = false;
    if (!cached) setLoading(true);
    fetchCached(cacheKey, () => loadContactDetail(contactId))
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [contactId, cacheKey]);

  const fullName = useMemo(() => {
    if (!contact) return "";
    return (
      `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim() ||
      contact.email ||
      contact.phone ||
      "Unnamed contact"
    );
  }, [contact]);

  const initials = useMemo(() => {
    if (!contact) return "?";
    const f = (contact.first_name?.[0] ?? "").toUpperCase();
    const l = (contact.last_name?.[0] ?? "").toUpperCase();
    return (f + l) || (contact.email?.[0] ?? "?").toUpperCase();
  }, [contact]);

  if (!open || !contact) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center p-4 md:items-center"
      style={{ background: "rgba(7,8,17,0.55)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="animate-pop flex w-full flex-col overflow-hidden rounded-[22px]"
        style={{
          maxWidth: 1100,
          maxHeight: "min(900px, calc(100vh - 32px))",
          background: "var(--surface)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow), inset 0 1px 0 var(--sheen)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 p-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <Avatar initials={initials} size={42} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[17px] font-bold">{fullName}</div>
            <div
              className="truncate text-[12px]"
              style={{ color: "var(--text-faint)" }}
            >
              {contact.email || contact.phone || "—"}
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

        {/* Mobile tabs */}
        <div
          className="flex gap-1 p-2 md:hidden"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {(["details", "timeline"] as const).map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className="flex-1 cursor-pointer rounded-[10px] px-3 py-2 text-[13px] font-semibold capitalize transition"
                style={
                  active
                    ? {
                        background:
                          "linear-gradient(180deg, var(--accent), var(--accent-2))",
                        color: "#fff",
                      }
                    : { background: "transparent", color: "var(--text-dim)" }
                }
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col md:grid md:grid-cols-[30%_70%]">
          {/* Left: details */}
          <aside
            className={`min-h-0 flex-1 overflow-auto p-5 md:flex md:flex-col md:gap-4 ${
              tab === "details" ? "flex flex-col gap-4" : "hidden"
            } md:!flex`}
            style={{ borderRight: "1px solid var(--border)" }}
          >
            <Section label="Contact info">
              <InfoRow label="Email" value={contact.email} />
              <InfoRow label="Phone" value={contact.phone} />
              <InfoRow label="Address" value={contact.address} />
              <InfoRow label="Lead ref" value={contact.lead_reference} />
              <InfoRow label="Added" value={formatDate(contact.created_at)} />
              <InfoRow
                label="Last contact"
                value={formatDate(contact.last_contact_at)}
              />
            </Section>

            <Section
              label={`Campaigns${
                data ? ` · ${data.campaignContacts.length}` : ""
              }`}
            >
              {loading && !data && <CardSkeleton />}
              {data && data.campaignContacts.length === 0 && (
                <div
                  className="rounded-[12px] p-3 text-[12px]"
                  style={{
                    background: "var(--surface-2)",
                    color: "var(--text-faint)",
                    border: "1px solid var(--border)",
                  }}
                >
                  Not in any campaigns yet.
                </div>
              )}
              {data &&
                data.campaignContacts.map((cc) => {
                  const camp = cc.campaign_id
                    ? data.campaigns.get(cc.campaign_id)
                    : null;
                  return (
                    <a
                      key={cc.id}
                      href={
                        cc.campaign_id ? `/app/campaigns/${cc.campaign_id}` : "#"
                      }
                      className="block cursor-pointer rounded-[12px] p-3 transition hover:-translate-y-0.5"
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        transitionDuration: "180ms",
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate text-[13px] font-semibold">
                          {camp?.campaign_name ?? "Untitled campaign"}
                        </div>
                        {cc.status && <StatusPill text={cc.status} />}
                      </div>
                      <div
                        className="mt-1 flex items-center gap-2 text-[11px]"
                        style={{ color: "var(--text-faint)" }}
                      >
                        {camp?.call_type && <span>{camp.call_type}</span>}
                        {cc.attempts != null && (
                          <span>· {cc.attempts} attempts</span>
                        )}
                        {cc.outcome_name && <span>· {cc.outcome_name}</span>}
                      </div>
                    </a>
                  );
                })}
            </Section>
          </aside>

          {/* Right: timeline */}
          <section
            className={`min-h-0 flex-1 overflow-auto p-5 ${
              tab === "timeline" ? "flex flex-col gap-3" : "hidden"
            } md:!flex md:flex-col md:gap-3`}
          >
            <div className="flex items-center justify-between">
              <div className="text-[15px] font-bold">Activity timeline</div>
              <div
                className="text-[11px]"
                style={{ color: "var(--text-faint)" }}
              >
                {data ? `${data.timeline.length} events` : ""}
              </div>
            </div>

            {loading && !data && <TimelineSkeleton />}
            {data && data.timeline.length === 0 && (
              <div
                className="rounded-[12px] p-4 text-[13px]"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--text-dim)",
                  border: "1px solid var(--border)",
                }}
              >
                No call or SMS activity yet.
              </div>
            )}
            {data && data.timeline.length > 0 && (
              <ol className="flex flex-col gap-3">
                {data.timeline.map((item) => {
                  const camp = item.campaign_id
                    ? data.campaigns.get(item.campaign_id)
                    : null;
                  return (
                    <li
                      key={`${item.kind}:${item.id}`}
                      className="flex gap-3 rounded-[12px] p-3"
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <TimelineIcon kind={item.kind} direction={item.direction} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-[13px] font-semibold">
                            {item.title}
                          </div>
                          {item.outcome && (
                            <span
                              className="rounded-[6px] px-1.5 py-[1px] text-[10.5px] font-bold"
                              style={{
                                background: "var(--accent-soft)",
                                color: "var(--accent)",
                              }}
                            >
                              {item.outcome}
                            </span>
                          )}
                          {item.durationSec != null && (
                            <span
                              className="text-[11px]"
                              style={{ color: "var(--text-faint)" }}
                            >
                              {formatDuration(item.durationSec)}
                            </span>
                          )}
                        </div>
                        {item.detail && (
                          <div
                            className="mt-1 line-clamp-3 text-[12.5px]"
                            style={{ color: "var(--text-dim)" }}
                          >
                            {item.detail}
                          </div>
                        )}
                        <div
                          className="mt-1.5 flex items-center gap-2 text-[11px]"
                          style={{ color: "var(--text-faint)" }}
                        >
                          <span>{formatDateTime(item.ts)}</span>
                          {camp && <span>· {camp.campaign_name}</span>}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="text-[11px] font-semibold uppercase"
        style={{ color: "var(--text-faint)", letterSpacing: "0.05em" }}
      >
        {label}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-[13px]">
      <span style={{ color: "var(--text-faint)" }}>{label}</span>
      <span className="text-right font-medium" style={{ color: "var(--text)" }}>
        {value || "—"}
      </span>
    </div>
  );
}

function StatusPill({ text }: { text: string }) {
  return (
    <span
      className="rounded-[6px] px-1.5 py-[1px] text-[10.5px] font-bold uppercase"
      style={{
        background: "var(--surface)",
        color: "var(--text-dim)",
        border: "1px solid var(--border)",
        letterSpacing: "0.04em",
      }}
    >
      {text}
    </span>
  );
}

function TimelineIcon({
  kind,
  direction,
}: {
  kind: "call" | "sms";
  direction: string | null;
}) {
  const isOutbound = direction === "outbound";
  const bg = kind === "call" ? "var(--call)" : "var(--sms)";
  return (
    <div
      className="grid h-9 w-9 flex-none place-items-center rounded-[10px] text-white"
      style={{ background: bg }}
      title={`${kind} · ${direction ?? ""}`}
    >
      {kind === "call" ? (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
          {isOutbound && <path d="M16 4l5 5" />}
        </svg>
      ) : (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.4 8.4 0 0 1-3.4-.6L3 21l1.7-5.6A8.4 8.4 0 1 1 21 11.5z" />
        </svg>
      )}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="h-[58px] animate-pulse rounded-[12px]"
          style={{ background: "var(--surface-2)" }}
        />
      ))}
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-[72px] animate-pulse rounded-[12px]"
          style={{ background: "var(--surface-2)" }}
        />
      ))}
    </div>
  );
}

function formatDate(ms: number | null | undefined): string {
  if (!ms) return "—";
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(ms: number): string {
  if (!ms) return "—";
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(sec: number): string {
  if (!sec || sec < 0) return "0s";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m ? `${m}m ${s}s` : `${s}s`;
}
