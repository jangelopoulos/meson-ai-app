"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { Textarea } from "./Input";
import { useCreateModal } from "./CreateModalContext";

type Channel = "sms" | "call";
type Audience = "dormant" | "openhome" | "csv";

export function CreateCampaignModal() {
  const { open, setOpen } = useCreateModal();
  const [step, setStep] = useState(1);
  const [channel, setChannel] = useState<Channel>("sms");
  const [audience, setAudience] = useState<Audience>("dormant");

  const close = () => {
    setOpen(false);
    setTimeout(() => setStep(1), 200);
  };

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  return (
    <Modal open={open} onClose={close} maxWidth={560}>
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <div className="text-[16px] font-bold">New campaign</div>
          <div
            className="text-[11.5px]"
            style={{ color: "var(--text-faint)" }}
          >
            Step {step} of 3
          </div>
        </div>
        <button
          type="button"
          onClick={close}
          className="grid h-8 w-8 cursor-pointer place-items-center rounded-[9px]"
          style={{
            background: "var(--surface-2)",
            color: "var(--text-dim)",
            border: "1px solid var(--border)",
          }}
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

      <div className="flex gap-1.5 px-6 pt-4">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className="h-1 flex-1 rounded-full"
            style={{
              background:
                s <= step
                  ? "linear-gradient(90deg, var(--accent), var(--accent-2))"
                  : "var(--surface-2)",
            }}
          />
        ))}
      </div>

      <div className="p-6">
        {step === 1 && (
          <>
            <div className="mb-4 text-[18px] font-bold">Choose a channel</div>
            <div className="flex flex-col gap-3">
              <ChannelOption
                active={channel === "sms"}
                onClick={() => setChannel("sms")}
                title="AI SMS"
                desc="Text-based outreach with conversational replies."
                color="var(--sms)"
              />
              <ChannelOption
                active={channel === "call"}
                onClick={() => setChannel("call")}
                title="AI Call"
                desc="Voice-based outreach that books meetings end-to-end."
                color="var(--call)"
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-4 text-[18px] font-bold">Pick your audience</div>
            <div className="flex flex-col gap-3">
              <AudienceOption
                active={audience === "dormant"}
                onClick={() => setAudience("dormant")}
                title="Dormant leads (5–10 yrs)"
                desc="4,820 contacts · last touched 2018–2020"
              />
              <AudienceOption
                active={audience === "openhome"}
                onClick={() => setAudience("openhome")}
                title="Open-home attendees"
                desc="612 contacts from last weekend"
              />
              <AudienceOption
                active={audience === "csv"}
                onClick={() => setAudience("csv")}
                title="Upload a CSV"
                desc="Bring your own list with phone + name columns"
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="mb-4 text-[18px] font-bold">Craft the opener</div>
            <Textarea
              defaultValue={`Hi {first_name} — David from Ray White Hawthorn. We last chatted a while back about your place; would now be a good time for a quick fresh appraisal?`}
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <InfoBox
                label="Send window"
                value="9am–6pm AEST"
              />
              <InfoBox label="Daily cap" value="500 / day" />
            </div>
          </>
        )}
      </div>

      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <button
          type="button"
          onClick={step === 1 ? close : back}
          className="cursor-pointer rounded-[11px] px-3.5 py-2 text-[13px] font-semibold"
          style={{
            background: "var(--surface-2)",
            color: "var(--text-dim)",
            border: "1px solid var(--border)",
          }}
        >
          {step === 1 ? "Cancel" : "Back"}
        </button>
        <button
          type="button"
          onClick={step === 3 ? close : next}
          className="inline-flex cursor-pointer items-center gap-2 rounded-[11px] px-4 py-2.5 text-[13px] font-bold text-white"
          style={{
            background:
              "linear-gradient(180deg, var(--accent), var(--accent-2))",
            boxShadow: "0 8px 18px var(--accent-soft)",
          }}
        >
          {step === 3 ? "Launch campaign" : "Continue"}
        </button>
      </div>
    </Modal>
  );
}

function ChannelOption({
  active,
  onClick,
  title,
  desc,
  color,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start gap-3 rounded-[14px] p-4 text-left"
      style={{
        background: active ? "var(--accent-soft)" : "var(--surface-2)",
        border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
      }}
    >
      <div
        className="grid h-9 w-9 flex-none place-items-center rounded-[10px] text-white"
        style={{ background: color }}
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
          <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.4 8.4 0 0 1-3.4-.6L3 21l1.7-5.6A8.4 8.4 0 1 1 21 11.5z" />
        </svg>
      </div>
      <div className="flex-1">
        <div className="text-[14px] font-bold">{title}</div>
        <div
          className="mt-0.5 text-[12.5px]"
          style={{ color: "var(--text-dim)" }}
        >
          {desc}
        </div>
      </div>
    </button>
  );
}

function AudienceOption({
  active,
  onClick,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-[14px] p-4 text-left"
      style={{
        background: active ? "var(--accent-soft)" : "var(--surface-2)",
        border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
      }}
    >
      <span
        className="grid h-[18px] w-[18px] flex-none place-items-center rounded-full"
        style={{
          background: active ? "var(--accent)" : "transparent",
          border: `2px solid ${active ? "var(--accent)" : "var(--border-strong)"}`,
        }}
      >
        {active && (
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
        )}
      </span>
      <div className="flex-1">
        <div className="text-[13.5px] font-bold">{title}</div>
        <div
          className="mt-0.5 text-[12px]"
          style={{ color: "var(--text-dim)" }}
        >
          {desc}
        </div>
      </div>
    </button>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[12px] p-3"
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="text-[11px] uppercase"
        style={{ color: "var(--text-faint)", letterSpacing: "0.05em" }}
      >
        {label}
      </div>
      <div className="mt-0.5 text-[13.5px] font-bold">{value}</div>
    </div>
  );
}
