import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { ChannelBadge, StatusBadge } from "@/components/Badge";
import { Avatar } from "@/components/Avatar";
import { DonutChart } from "@/components/DonutChart";
import { MessageBubble } from "@/components/MessageBubble";
import {
  callLog,
  campaigns,
  replies,
  sentiment,
  sequence,
  transcript,
} from "@/lib/mock-data";

type Params = { id: string };

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const campaign = campaigns.find((c) => c.id === id);
  if (!campaign) notFound();

  const isSms = campaign.channel === "sms";

  const metrics = isSms
    ? [
        { label: "Contacts enrolled", value: campaign.contacts.toLocaleString() },
        { label: "Delivered", value: "8,140" },
        { label: "Reply rate", value: `${campaign.reply}%` },
        { label: "Meetings booked", value: campaign.booked.toString() },
      ]
    : [
        { label: "Numbers dialled", value: "612" },
        { label: "Connect rate", value: "47.1%" },
        { label: "Avg duration", value: "3:14" },
        { label: "Meetings booked", value: campaign.booked.toString() },
      ];

  return (
    <div className="animate-pop flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/app/campaigns"
            className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-semibold"
            style={{ color: "var(--text-dim)" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            All campaigns
          </Link>
          <div className="mb-2 flex items-center gap-2">
            <ChannelBadge channel={campaign.channel} />
            <StatusBadge status={campaign.status} />
          </div>
          <h1
            className="text-[26px] font-extrabold"
            style={{ letterSpacing: "-0.025em" }}
          >
            {campaign.name}
          </h1>
          <p
            className="mt-1.5 text-sm"
            style={{ color: "var(--text-dim)", maxWidth: 560 }}
          >
            {campaign.desc}
          </p>
        </div>
        <div className="flex gap-2">
          <SecondaryButton>Pause</SecondaryButton>
          <SecondaryButton>Edit</SecondaryButton>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <div
              className="mb-1 text-[11px] font-semibold uppercase"
              style={{ color: "var(--text-faint)", letterSpacing: "0.05em" }}
            >
              {m.label}
            </div>
            <div
              className="text-[26px] font-extrabold"
              style={{ letterSpacing: "-0.02em" }}
            >
              {m.value}
            </div>
          </Card>
        ))}
      </div>

      {isSms ? <SmsView /> : <CallView />}
    </div>
  );
}

function SmsView() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Card>
        <div className="mb-4 text-[15px] font-bold">Message sequence</div>
        <ul className="flex flex-col gap-3">
          {sequence.map((s) => {
            const stateColor =
              s.state === "Complete"
                ? "var(--green)"
                : s.state === "Sending"
                  ? "var(--accent)"
                  : "var(--text-faint)";
            return (
              <li
                key={s.n}
                className="flex items-center gap-4 rounded-[14px] p-3.5"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="grid h-9 w-9 flex-none place-items-center rounded-[10px] font-bold"
                  style={{
                    background: "var(--surface-2)",
                    color: "var(--text-dim)",
                    fontSize: 12,
                  }}
                >
                  {s.n}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-semibold">{s.label}</div>
                  <div
                    className="mt-1.5 flex items-center gap-3 text-[11px]"
                    style={{ color: "var(--text-faint)" }}
                  >
                    <span>{s.sent.toLocaleString()} sent</span>
                    <div className="flex-1">
                      <ProgressBar value={s.pct} height={4} />
                    </div>
                  </div>
                </div>
                <span
                  className="rounded-[8px] px-2 py-1 text-[11px] font-bold"
                  style={{ background: "var(--surface-2)", color: stateColor }}
                >
                  {s.state}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <div className="mb-4 text-[15px] font-bold">Latest replies</div>
        <ul className="flex flex-col gap-3.5">
          {replies.map((r, i) => (
            <li key={i} className="flex items-start gap-3">
              <Avatar initials={r.initials} size={32} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[13px] font-semibold">{r.name}</div>
                  <div
                    className="text-[11px]"
                    style={{ color: "var(--text-faint)" }}
                  >
                    {r.time}
                  </div>
                </div>
                <div
                  className="mt-0.5 truncate text-[12.5px]"
                  style={{ color: "var(--text-dim)" }}
                >
                  {r.preview}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function CallView() {
  const sentimentColor = {
    positive: "var(--green)",
    neutral: "var(--amber)",
    negative: "var(--red)",
  };
  const outcomeColor: Record<string, string> = {
    Booked: "var(--green)",
    Callback: "var(--accent)",
    "No answer": "var(--text-faint)",
    "Not interested": "var(--red)",
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Card>
        <div className="mb-4 text-[15px] font-bold">Recent calls</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-[13px]">
            <thead>
              <tr
                style={{ color: "var(--text-faint)" }}
                className="text-[11px] uppercase"
              >
                <th className="pb-3 pr-4 font-semibold">Contact</th>
                <th className="pb-3 pr-4 font-semibold">Outcome</th>
                <th className="pb-3 pr-4 font-semibold">Duration</th>
                <th className="pb-3 font-semibold">Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {callLog.map((c) => (
                <tr
                  key={c.phone}
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={c.initials} size={32} />
                      <div>
                        <div className="font-semibold">{c.name}</div>
                        <div
                          className="text-[11px]"
                          style={{ color: "var(--text-faint)" }}
                        >
                          {c.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className="rounded-[8px] px-2 py-1 text-[11px] font-bold"
                      style={{
                        background: "var(--surface)",
                        color: outcomeColor[c.outcome],
                      }}
                    >
                      {c.outcome}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-semibold">{c.duration}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1.5 capitalize">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: sentimentColor[c.sentiment] }}
                      />
                      <span style={{ color: "var(--text-dim)" }}>
                        {c.sentiment}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <Card>
          <div className="mb-4 text-[15px] font-bold">Call sentiment</div>
          <DonutChart
            segments={[
              { label: "Positive", value: sentiment.positive, color: "var(--green)" },
              { label: "Neutral", value: sentiment.neutral, color: "var(--amber)" },
              { label: "Negative", value: sentiment.negative, color: "var(--red)" },
            ]}
          />
        </Card>

        <Card>
          <div className="mb-3 text-[15px] font-bold">Live transcript</div>
          <div className="flex flex-col gap-2.5">
            {transcript.map((m, i) => (
              <MessageBubble
                key={i}
                ai={m.ai}
                text={m.text}
                time={m.time}
                who={m.ai ? "AI" : "Michael"}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SecondaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="cursor-pointer rounded-[11px] px-3.5 py-2 text-[13px] font-semibold"
      style={{
        background: "var(--surface-2)",
        color: "var(--text)",
        border: "1px solid var(--border-strong)",
      }}
    >
      {children}
    </button>
  );
}
