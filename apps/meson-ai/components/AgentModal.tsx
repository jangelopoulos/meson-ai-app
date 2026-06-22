"use client";

import { useEffect, useMemo, useState } from "react";
import { AgentForm, EMPTY_AGENT, type AgentFormValue } from "./AgentForm";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { invalidate } from "@/lib/client-cache";
import type { Agent } from "@/lib/types/agent";

type Mode = "create" | "edit";

function agentToForm(agent: Agent): AgentFormValue {
  return {
    name: agent.name ?? "",
    description: agent.description ?? "",
    status: agent.status ?? "draft",
    role: agent.role ?? "",
    avatar_color: agent.avatar_color ?? EMPTY_AGENT.avatar_color,
    company_context: agent.company_context ?? "",
    objective: agent.objective ?? "",
    persona: agent.persona ?? "",
    greeting: agent.greeting ?? "",
    system_prompt: agent.system_prompt ?? "",
    knowledge_base: agent.knowledge_base ?? "",
    guardrails: agent.guardrails ?? "",
    escalation_instructions: agent.escalation_instructions ?? "",
    voice_provider: agent.voice_provider ?? "",
    voice_id: agent.voice_id ?? "",
    language: agent.language ?? "en-US",
    voicemail_message: agent.voicemail_message ?? "",
    transfer_phone: agent.transfer_phone ?? "",
    max_call_seconds:
      agent.max_call_seconds != null ? String(agent.max_call_seconds) : "",
    model: agent.model ?? "gpt-4o",
    temperature:
      agent.temperature != null ? String(agent.temperature) : "0.5",
  };
}

function formToPayload(v: AgentFormValue) {
  return {
    name: v.name.trim(),
    description: v.description || null,
    status: v.status,
    role: v.role || null,
    avatar_color: v.avatar_color || null,
    company_context: v.company_context || null,
    objective: v.objective || null,
    persona: v.persona || null,
    greeting: v.greeting || null,
    system_prompt: v.system_prompt || null,
    knowledge_base: v.knowledge_base || null,
    guardrails: v.guardrails || null,
    escalation_instructions: v.escalation_instructions || null,
    voice_provider: v.voice_provider || null,
    voice_id: v.voice_id || null,
    language: v.language || null,
    voicemail_message: v.voicemail_message || null,
    transfer_phone: v.transfer_phone || null,
    max_call_seconds: v.max_call_seconds ? Number(v.max_call_seconds) : null,
    model: v.model || null,
    temperature: v.temperature ? Number(v.temperature) : null,
  };
}

export function AgentModal({
  mode,
  open,
  agent,
  clientId,
  onClose,
  onSaved,
}: {
  mode: Mode;
  open: boolean;
  agent: Agent | null;
  clientId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const initial = useMemo(
    () => (agent ? agentToForm(agent) : EMPTY_AGENT),
    [agent]
  );
  const [value, setValue] = useState<AgentFormValue>(initial);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValue(initial);
      setError(null);
    }
  }, [open, initial]);

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

  if (!open) return null;

  const save = async () => {
    if (!value.name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = getBrowserSupabase();
    const payload = formToPayload(value);
    try {
      if (mode === "create") {
        const { error: err } = await supabase
          .schema("meson_ai")
          .from("ai_agents")
          .insert({ ...payload, client_id: clientId });
        if (err) throw err;
      } else if (agent) {
        const { error: err } = await supabase
          .schema("meson_ai")
          .from("ai_agents")
          .update(payload)
          .eq("id", agent.id);
        if (err) throw err;
      }
      invalidate(`ai-agents:${clientId}`);
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save agent.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!agent) return;
    if (!confirm(`Delete agent "${agent.name}"? This cannot be undone.`))
      return;
    setDeleting(true);
    setError(null);
    const supabase = getBrowserSupabase();
    try {
      const { error: err } = await supabase
        .schema("meson_ai")
        .from("ai_agents")
        .delete()
        .eq("id", agent.id);
      if (err) throw err;
      invalidate(`ai-agents:${clientId}`);
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete agent.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center p-3 pb-[calc(12px+72px+env(safe-area-inset-bottom))] md:items-center md:p-4 md:pb-4"
      style={{ background: "rgba(7,8,17,0.55)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="animate-pop flex w-full flex-col overflow-hidden rounded-[18px] md:rounded-[22px]"
        style={{
          maxWidth: 820,
          maxHeight: "min(900px, 100%)",
          background: "var(--surface)",
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
            className="grid h-11 w-11 flex-none place-items-center rounded-[12px] text-[14px] font-bold text-white"
            style={{
              background: value.avatar_color || "var(--accent)",
            }}
          >
            {(value.name.trim()[0] ?? "A").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[17px] font-bold">
              {mode === "create" ? "New agent" : value.name || "Edit agent"}
            </div>
            <div
              className="truncate text-[12px]"
              style={{ color: "var(--text-faint)" }}
            >
              {mode === "create"
                ? "Configure how this agent thinks and speaks."
                : "Edit this agent's brief, prompt, and voice settings."}
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

        <div className="flex-1 overflow-auto p-5">
          <AgentForm value={value} onChange={setValue} />
          {error && (
            <div
              className="mt-4 rounded-[10px] p-3 text-[12.5px] font-semibold"
              style={{
                background: "rgba(244,67,54,0.12)",
                color: "var(--red)",
                border: "1px solid rgba(244,67,54,0.3)",
              }}
            >
              {error}
            </div>
          )}
        </div>

        <div
          className="flex items-center justify-between gap-3 p-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div>
            {mode === "edit" && (
              <button
                type="button"
                onClick={remove}
                disabled={deleting}
                className="cursor-pointer rounded-[11px] px-3 py-2 text-[13px] font-bold"
                style={{
                  background: "transparent",
                  color: "var(--red)",
                  border: "1px solid var(--border-strong)",
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-[11px] px-3.5 py-2 text-[13px] font-semibold"
              style={{
                background: "var(--surface-2)",
                color: "var(--text)",
                border: "1px solid var(--border-strong)",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex cursor-pointer items-center gap-2 rounded-[11px] px-4 py-2 text-[13px] font-bold text-white"
              style={{
                background:
                  "linear-gradient(180deg, var(--accent), var(--accent-2))",
                boxShadow: "0 8px 20px var(--accent-soft)",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving
                ? "Saving…"
                : mode === "create"
                ? "Create agent"
                : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
