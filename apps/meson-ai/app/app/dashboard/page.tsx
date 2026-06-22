"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/Card";
import { KpiCard } from "@/components/KpiCard";
import { BarChart, ChartLegend } from "@/components/BarChart";
import { ProgressBar } from "@/components/ProgressBar";
import { SegmentedControl } from "@/components/SegmentedControl";
import { ChannelBadge, StatusBadge } from "@/components/Badge";
import {
  activity,
  campaigns,
  kpis,
  messagingChart,
  user,
} from "@/lib/mock-data";

const dotColor: Record<string, string> = {
  accent: "var(--accent)",
  sms: "var(--sms)",
  call: "var(--call)",
  amber: "var(--amber)",
};

export default function DashboardPage() {
  const [range, setRange] = useState<"7d" | "30d" | "quarter">("7d");
  const active = campaigns.filter((c) => c.status !== "draft");

  return (
    <div className="animate-pop flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div
            className="mb-1 text-[12px] font-semibold uppercase"
            style={{ color: "var(--text-faint)", letterSpacing: "0.07em" }}
          >
            {new Date().toLocaleDateString("en-AU", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </div>
          <h1
            className="text-[28px] font-extrabold"
            style={{ letterSpacing: "-0.025em" }}
          >
            Good morning, {user.name.split(" ")[0]}.
          </h1>
        </div>
        <SegmentedControl
          value={range}
          onChange={setRange}
          options={[
            { value: "7d", label: "7 days" },
            { value: "30d", label: "30 days" },
            { value: "quarter", label: "Quarter" },
          ]}
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} kpi={k} />
        ))}
      </div>

      {/* Chart + activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[15px] font-bold">Messages &amp; replies</div>
              <div
                className="text-[12px]"
                style={{ color: "var(--text-dim)" }}
              >
                Last 7 days
              </div>
            </div>
            <ChartLegend />
          </div>
          <BarChart data={messagingChart} />
        </Card>

        <Card>
          <div className="mb-4 text-[15px] font-bold">Recent activity</div>
          <ul className="flex flex-col gap-3">
            {activity.map((a, i) => (
              <li key={i} className="flex items-start gap-3 text-[13px]">
                <span
                  className="mt-1.5 h-2 w-2 flex-none rounded-full"
                  style={{ background: dotColor[a.dot] }}
                />
                <div className="flex-1">
                  <span className="font-semibold">{a.who}</span>{" "}
                  <span style={{ color: "var(--text-dim)" }}>{a.what}</span>
                </div>
                <span
                  className="text-[11px]"
                  style={{ color: "var(--text-faint)" }}
                >
                  {a.when}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Active campaigns */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[15px] font-bold">Active campaigns</div>
          <Link
            href="/app/campaigns"
            className="text-[12px] font-semibold"
            style={{ color: "var(--accent)" }}
          >
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead>
              <tr
                style={{ color: "var(--text-faint)" }}
                className="text-[11px] uppercase"
              >
                <th className="pb-3 pr-4 font-semibold">Campaign</th>
                <th className="pb-3 pr-4 font-semibold">Status</th>
                <th className="pb-3 pr-4 font-semibold">Progress</th>
                <th className="pb-3 pr-4 font-semibold">Reply</th>
                <th className="pb-3 font-semibold">Booked</th>
              </tr>
            </thead>
            <tbody>
              {active.map((c) => (
                <tr
                  key={c.id}
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <td className="py-3.5 pr-4">
                    <Link
                      href={`/app/campaigns/${c.id}`}
                      className="flex items-center gap-2.5"
                    >
                      <ChannelBadge channel={c.channel} />
                      <span className="font-semibold">{c.name}</span>
                    </Link>
                  </td>
                  <td className="py-3.5 pr-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="min-w-[100px] flex-1">
                        <ProgressBar value={c.progress} />
                      </div>
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color: "var(--text-faint)" }}
                      >
                        {c.progress}%
                      </span>
                    </div>
                  </td>
                  <td
                    className="py-3.5 pr-4 font-semibold"
                    style={{ color: "var(--text-dim)" }}
                  >
                    {c.reply}%
                  </td>
                  <td className="py-3.5 font-semibold">{c.booked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
