"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { SegmentedControl } from "@/components/SegmentedControl";
import { ChannelBadge, StatusBadge } from "@/components/Badge";
import { campaigns } from "@/lib/mock-data";
import { useCreateModal } from "@/components/CreateModalContext";

type Filter = "all" | "sms" | "call" | "active";

export default function CampaignsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const { setOpen } = useCreateModal();

  const filtered = campaigns.filter((c) => {
    if (filter === "all") return true;
    if (filter === "active") return c.status === "active";
    return c.channel === filter;
  });

  return (
    <div className="animate-pop flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className="text-[28px] font-extrabold"
            style={{ letterSpacing: "-0.025em" }}
          >
            Campaigns
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-dim)" }}>
            All your AI outreach in one place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SegmentedControl
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All" },
              { value: "sms", label: "AI SMS" },
              { value: "call", label: "AI Call" },
              { value: "active", label: "Active" },
            ]}
          />
          <button
            type="button"
            onClick={() => setOpen(true)}
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
            New campaign
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((c) => (
          <Link key={c.id} href={`/app/campaigns/${c.id}`} className="block">
            <Card
              className="cursor-pointer transition hover:-translate-y-0.5"
              style={{ transitionDuration: "180ms" }}
            >
              <div className="mb-3 flex items-center gap-2">
                <ChannelBadge channel={c.channel} />
                <StatusBadge status={c.status} />
              </div>
              <div className="text-[17px] font-bold">{c.name}</div>
              <p
                className="mt-1.5 mb-4 text-[13px] leading-snug"
                style={{ color: "var(--text-dim)" }}
              >
                {c.desc}
              </p>
              <ProgressBar value={c.progress} />
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <Stat label="Contacts" value={c.contacts.toLocaleString()} />
                <Stat label="Reply" value={`${c.reply}%`} />
                <Stat label="Booked" value={c.booked.toString()} />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[16px] font-extrabold">{value}</div>
      <div
        className="text-[11px] uppercase"
        style={{ color: "var(--text-faint)", letterSpacing: "0.05em" }}
      >
        {label}
      </div>
    </div>
  );
}
