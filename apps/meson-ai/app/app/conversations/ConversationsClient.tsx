"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { MessageBubble } from "@/components/MessageBubble";
import { TagBadge } from "@/components/Badge";
import { Input } from "@/components/Input";
import { conversations, threads } from "@/lib/mock-data";

export default function ConversationsPage() {
  const search = useSearchParams();
  const selectedId = search.get("c") ?? conversations[0].id;
  const cur =
    conversations.find((c) => c.id === selectedId) ?? conversations[0];
  const thread = threads[cur.id] ?? [];
  const [filter, setFilter] = useState("");

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div
      className="animate-pop -m-6 grid h-[calc(100vh-66px-40px)] grid-cols-1 md:m-0 md:grid-cols-[320px_1fr]"
      style={{ minHeight: 600 }}
    >
      {/* Sidebar */}
      <aside
        className="flex h-full flex-col overflow-hidden"
        style={{ borderRight: "1px solid var(--border)" }}
      >
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[17px] font-bold">Inbox</div>
            <span
              className="rounded-[8px] px-2 py-0.5 text-[11px] font-bold text-white"
              style={{ background: "var(--accent)" }}
            >
              {conversations.filter((c) => c.unread).length} new
            </span>
          </div>
          <Input
            placeholder="Search conversations…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <ul className="flex-1 overflow-auto px-2 pb-3">
          {filtered.map((c) => {
            const active = c.id === cur.id;
            return (
              <li key={c.id}>
                <Link
                  href={`/app/conversations?c=${c.id}`}
                  className="flex items-start gap-3 rounded-[12px] p-2.5"
                  style={{
                    background: active ? "var(--surface-2)" : "transparent",
                    border: active
                      ? "1px solid var(--border)"
                      : "1px solid transparent",
                  }}
                >
                  <Avatar initials={c.initials} unread={c.unread} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-[13px] font-semibold">
                        {c.name}
                      </div>
                      <div
                        className="flex-none text-[10.5px]"
                        style={{ color: "var(--text-faint)" }}
                      >
                        {c.time}
                      </div>
                    </div>
                    <div
                      className="truncate text-[12px]"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {c.preview}
                    </div>
                    <div className="mt-1.5">
                      <TagBadge tag={c.tag} />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Thread */}
      <section className="flex h-full min-w-0 flex-col">
        <header
          className="flex items-center gap-3 p-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <Avatar initials={cur.initials} size={42} />
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-bold">{cur.name}</div>
            <div
              className="text-[12px]"
              style={{ color: "var(--text-faint)" }}
            >
              {cur.campaign} · {cur.phone}
            </div>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-[8px] px-2 py-1 text-[11px] font-bold"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--accent)" }}
            />
            AI handling
          </span>
        </header>

        <div className="flex flex-1 flex-col gap-2.5 overflow-auto p-4">
          {thread.map((m, i) => (
            <MessageBubble
              key={i}
              ai={m.ai}
              text={m.text}
              time={m.time}
              who={m.ai ? "AI" : cur.name.split(" ")[0]}
            />
          ))}
        </div>

        <div
          className="flex items-center gap-2 p-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button
            type="button"
            className="grid h-10 w-10 flex-none cursor-pointer place-items-center rounded-[11px]"
            style={{
              background: "var(--surface-2)",
              color: "var(--text-dim)",
              border: "1px solid var(--border)",
            }}
            title="AI suggest"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4L12 3z" />
            </svg>
          </button>
          <Input placeholder="Jump in, or let the AI keep going…" />
          <button
            type="button"
            className="inline-flex flex-none cursor-pointer items-center gap-1.5 rounded-[11px] px-4 py-2.5 text-[13px] font-bold text-white"
            style={{
              background:
                "linear-gradient(180deg, var(--accent), var(--accent-2))",
              boxShadow: "0 8px 18px var(--accent-soft)",
            }}
          >
            Send
          </button>
        </div>
      </section>
    </div>
  );
}
