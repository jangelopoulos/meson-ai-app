"use client";

import { useState } from "react";
import { Input, Textarea } from "./Input";
import { Select } from "./Select";

export type AgentFormValue = {
  name: string;
  description: string;
  status: string;
  role: string;
  avatar_color: string;
  company_context: string;
  objective: string;
  persona: string;
  greeting: string;
  system_prompt: string;
  knowledge_base: string;
  guardrails: string;
  escalation_instructions: string;
  voice_provider: string;
  voice_id: string;
  language: string;
  voicemail_message: string;
  transfer_phone: string;
  max_call_seconds: string;
  model: string;
  temperature: string;
};

export const EMPTY_AGENT: AgentFormValue = {
  name: "",
  description: "",
  status: "draft",
  role: "",
  avatar_color: "#5b8def",
  company_context: "",
  objective: "",
  persona: "",
  greeting: "",
  system_prompt: "",
  knowledge_base: "",
  guardrails: "",
  escalation_instructions: "",
  voice_provider: "",
  voice_id: "",
  language: "en-US",
  voicemail_message: "",
  transfer_phone: "",
  max_call_seconds: "",
  model: "gpt-4o",
  temperature: "0.5",
};

const COLORS = [
  "#5b8def",
  "#3ddc97",
  "#ff7a59",
  "#a25ddc",
  "#ffb547",
  "#ff3d57",
  "#1ec587",
  "#2c5cdb",
];

export function AgentForm({
  value,
  onChange,
}: {
  value: AgentFormValue;
  onChange: (next: AgentFormValue) => void;
}) {
  const [voiceOpen, setVoiceOpen] = useState(false);
  const set = <K extends keyof AgentFormValue>(k: K, v: AgentFormValue[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="flex flex-col gap-5">
      <Section title="Identity">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Name *">
            <Input
              value={value.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Sarah – SDR"
            />
          </Field>
          <Field label="Role">
            <Input
              value={value.role}
              onChange={(e) => set("role", e.target.value)}
              placeholder="Sales SDR"
            />
          </Field>
        </div>
        <Field label="Short description">
          <Input
            value={value.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="One-line summary of what this agent does"
          />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Status">
            <Select
              value={value.status}
              onChange={(e) => set("status", e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </Select>
          </Field>
          <Field label="Card colour">
            <div className="flex flex-wrap gap-2 py-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("avatar_color", c)}
                  className="h-7 w-7 cursor-pointer rounded-full"
                  style={{
                    background: c,
                    border:
                      value.avatar_color === c
                        ? "2px solid var(--text)"
                        : "2px solid transparent",
                  }}
                  aria-label={`Use colour ${c}`}
                />
              ))}
            </div>
          </Field>
        </div>
      </Section>

      <Section title="Brief">
        <Field label="Company context">
          <Textarea
            value={value.company_context}
            onChange={(e) => set("company_context", e.target.value)}
            placeholder="What your business does, your customers, anything the agent should always know."
            style={{ minHeight: 90 }}
          />
        </Field>
        <Field label="Objective">
          <Textarea
            value={value.objective}
            onChange={(e) => set("objective", e.target.value)}
            placeholder="What outcome the agent is trying to achieve on each interaction."
            style={{ minHeight: 80 }}
          />
        </Field>
        <Field label="Persona / tone">
          <Textarea
            value={value.persona}
            onChange={(e) => set("persona", e.target.value)}
            placeholder="Warm, professional, concise. Speak like a friendly colleague."
            style={{ minHeight: 70 }}
          />
        </Field>
        <Field label="Opening line / greeting">
          <Input
            value={value.greeting}
            onChange={(e) => set("greeting", e.target.value)}
            placeholder="Hi, this is Sarah from Acme Realty…"
          />
        </Field>
      </Section>

      <Section title="Prompt & knowledge">
        <Field label="System prompt">
          <Textarea
            value={value.system_prompt}
            onChange={(e) => set("system_prompt", e.target.value)}
            placeholder="The full instructions the model receives."
            style={{ minHeight: 160 }}
          />
        </Field>
        <Field label="Knowledge base">
          <Textarea
            value={value.knowledge_base}
            onChange={(e) => set("knowledge_base", e.target.value)}
            placeholder="Paste FAQs, scripts, policies, anything the agent should reference."
            style={{ minHeight: 140 }}
          />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Guardrails">
            <Textarea
              value={value.guardrails}
              onChange={(e) => set("guardrails", e.target.value)}
              placeholder="Things the agent must never do or say."
              style={{ minHeight: 90 }}
            />
          </Field>
          <Field label="Escalation instructions">
            <Textarea
              value={value.escalation_instructions}
              onChange={(e) => set("escalation_instructions", e.target.value)}
              placeholder="When to transfer to a human, and how."
              style={{ minHeight: 90 }}
            />
          </Field>
        </div>
      </Section>

      <Section title="Model">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Model">
            <Select
              value={value.model}
              onChange={(e) => set("model", e.target.value)}
            >
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o mini</option>
              <option value="claude-opus-4-8">Claude Opus 4.8</option>
              <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
              <option value="claude-haiku-4-5">Claude Haiku 4.5</option>
            </Select>
          </Field>
          <Field label={`Temperature · ${value.temperature}`}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={Number(value.temperature) || 0}
              onChange={(e) => set("temperature", e.target.value)}
              className="w-full"
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Voice settings (optional)"
        collapsible
        open={voiceOpen}
        onToggle={() => setVoiceOpen((o) => !o)}
      >
        {voiceOpen && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Provider">
                <Select
                  value={value.voice_provider}
                  onChange={(e) => set("voice_provider", e.target.value)}
                >
                  <option value="">None</option>
                  <option value="bland">Bland</option>
                  <option value="elevenlabs">ElevenLabs</option>
                  <option value="openai">OpenAI</option>
                  <option value="twilio">Twilio</option>
                </Select>
              </Field>
              <Field label="Voice ID">
                <Input
                  value={value.voice_id}
                  onChange={(e) => set("voice_id", e.target.value)}
                  placeholder="provider-specific voice identifier"
                />
              </Field>
              <Field label="Language">
                <Select
                  value={value.language}
                  onChange={(e) => set("language", e.target.value)}
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="en-AU">English (AU)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                </Select>
              </Field>
              <Field label="Max call seconds">
                <Input
                  type="number"
                  value={value.max_call_seconds}
                  onChange={(e) => set("max_call_seconds", e.target.value)}
                  placeholder="e.g. 600"
                />
              </Field>
              <Field label="Transfer phone">
                <Input
                  value={value.transfer_phone}
                  onChange={(e) => set("transfer_phone", e.target.value)}
                  placeholder="+61…"
                />
              </Field>
              <Field label="Voicemail message">
                <Input
                  value={value.voicemail_message}
                  onChange={(e) => set("voicemail_message", e.target.value)}
                  placeholder="Leave them a short voicemail…"
                />
              </Field>
            </div>
          </>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
  collapsible,
  open,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  open?: boolean;
  onToggle?: () => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      {collapsible ? (
        <button
          type="button"
          onClick={onToggle}
          className="flex cursor-pointer items-center justify-between text-left"
        >
          <span
            className="text-[11px] font-semibold uppercase"
            style={{ color: "var(--text-faint)", letterSpacing: "0.05em" }}
          >
            {title}
          </span>
          <span
            className="text-[11px] font-bold"
            style={{ color: "var(--text-dim)" }}
          >
            {open ? "Hide" : "Show"}
          </span>
        </button>
      ) : (
        <div
          className="text-[11px] font-semibold uppercase"
          style={{ color: "var(--text-faint)", letterSpacing: "0.05em" }}
        >
          {title}
        </div>
      )}
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold">{label}</span>
      {children}
    </label>
  );
}
