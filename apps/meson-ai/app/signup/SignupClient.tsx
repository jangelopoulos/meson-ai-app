"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { BgBlobs } from "@/components/BgBlobs";
import { LogoMark, Wordmark } from "@/components/Logo";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { PhoneInput } from "@/components/PhoneInput";
import { AddressInput, type AddressParts } from "@/components/AddressInput";
import { PlanCard, type Plan } from "@/components/PlanCard";
import { StepProgress } from "@/components/StepProgress";
import {
  createAccount,
  createCompany,
  selectPlan,
  completeSignup,
  type SignupStepState,
} from "@/lib/auth/signup";

const INDUSTRIES = [
  "Real Estate",
  "Finance",
  "Professional Services",
  "Other",
];

const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

const PLANS: Plan[] = [
  {
    slug: "free",
    name: "Free",
    priceMonthly: 0,
    priceYearly: null,
    perCall: "$0.85",
    perSms: "$0.30",
    features: [
      "Everything included",
      "Simple webhook & API connection",
      "Pay per call / sms only",
    ],
  },
  {
    slug: "starter",
    name: "Starter",
    priceMonthly: 330,
    priceYearly: 220,
    perCall: "$0.60",
    perSms: "$0.20",
    badge: "Most popular",
    features: [
      "Minimum subscription, credits included",
      "Lower per-call & per-sms rates",
      "Standard support",
    ],
  },
  {
    slug: "pro",
    name: "Pro",
    priceMonthly: 660,
    priceYearly: 550,
    perCall: "$0.45",
    perSms: "$0.15",
    features: [
      "Everything in Starter",
      "Dedicated account manager",
      "Lowest per-call & per-sms rates",
    ],
  },
];

function initialStep(s: SignupStepState): number {
  if (!s.hasUserRow) return 1;
  if (!s.hasClientId) return 2;
  if (!s.hasPlanSelected) return 3;
  if (s.clientStatus === "AI Onboarding") return 4;
  return 5;
}

export default function SignupClient({
  initialState,
}: {
  initialState: SignupStepState;
}) {
  const [step, setStep] = useState<number>(initialStep(initialState));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [account, setAccount] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [company, setCompany] = useState({
    company_name: "",
    industry: "Real Estate",
    address: "",
    suburb: "",
    state: "NSW",
    country: "Australia",
    postcode: "",
    website: "",
  });

  const [planPeriod, setPlanPeriod] = useState<"monthly" | "yearly">("monthly");
  const [planSlug, setPlanSlug] = useState<string>("starter");

  const next = () => setStep((s) => Math.min(5, s + 1));

  const submitAccount = () => {
    setError(null);
    if (account.password !== account.confirm_password) {
      setError("Passwords don't match.");
      return;
    }
    startTransition(async () => {
      const res = await createAccount({
        first_name: account.first_name,
        last_name: account.last_name,
        phone: account.phone,
        email: account.email,
        password: account.password,
      });
      if ("error" in res) setError(res.error);
      else next();
    });
  };

  const submitCompany = () => {
    setError(null);
    startTransition(async () => {
      const res = await createCompany(company);
      if ("error" in res) setError(res.error);
      else next();
    });
  };

  const submitPlan = () => {
    setError(null);
    startTransition(async () => {
      const res = await selectPlan({
        plan: planSlug,
        billing_period: planPeriod,
      });
      if ("error" in res) setError(res.error);
      else next();
    });
  };

  const finishWizard = () => {
    setError(null);
    startTransition(async () => {
      await completeSignup();
    });
  };

  const visiblePlans = PLANS.filter(
    (p) => !(planPeriod === "yearly" && p.slug === "free")
  );

  return (
    <main className="relative min-h-screen">
      <BgBlobs />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-8">
        <div
          className="animate-pop grid w-full max-w-[1080px] overflow-hidden rounded-[28px] md:grid-cols-[1fr_1.2fr]"
          style={{
            background: "var(--surface)",
            backdropFilter: "var(--glass-blur)",
            WebkitBackdropFilter: "var(--glass-blur)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow), inset 0 1px 0 var(--sheen)",
          }}
        >
          {/* Brand panel */}
          <div
            className="relative hidden flex-col justify-between p-8 sm:p-11 md:flex"
            style={{
              minHeight: 640,
              background:
                "linear-gradient(150deg, var(--accent-soft), transparent 55%), linear-gradient(320deg, rgba(167,123,255,.14), transparent 50%)",
              borderRight: "1px solid var(--border)",
            }}
          >
            <Link href="/" className="flex items-center gap-3">
              <LogoMark />
              <Wordmark />
            </Link>

            <div>
              <div
                className="mb-3.5 text-[13px] font-semibold uppercase"
                style={{ color: "var(--accent)", letterSpacing: "0.04em" }}
              >
                Get started
              </div>
              <h1
                className="mb-3.5 text-[32px] font-extrabold leading-[1.12]"
                style={{ letterSpacing: "-0.03em", textWrap: "balance" }}
              >
                A few quick steps and your AI is live.
              </h1>
              <p
                className="max-w-[340px] text-[15px] leading-[1.55]"
                style={{ color: "var(--text-dim)" }}
              >
                Tell us about you, your company, and pick a plan. You can
                wire payment up later.
              </p>
            </div>

            <ol className="flex flex-col gap-2.5 text-[13px]">
              {[
                "Your account",
                "Your company",
                "Pick a plan",
                "Payment",
                "All set",
              ].map((label, i) => {
                const n = i + 1;
                const active = n === step;
                const done = n < step;
                return (
                  <li
                    key={label}
                    className="flex items-center gap-3"
                    style={{
                      color: active
                        ? "var(--text)"
                        : done
                          ? "var(--text-dim)"
                          : "var(--text-faint)",
                    }}
                  >
                    <span
                      className="grid h-6 w-6 flex-none place-items-center rounded-full text-[11px] font-bold"
                      style={{
                        background: active
                          ? "var(--accent)"
                          : done
                            ? "var(--accent-soft)"
                            : "var(--surface-2)",
                        color: active ? "#fff" : "var(--text-dim)",
                      }}
                    >
                      {done ? "✓" : n}
                    </span>
                    <span className="font-semibold">{label}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Form panel */}
          <div className="flex flex-col p-6 sm:p-10">
            <div className="mb-6 flex flex-col gap-3">
              <StepProgress steps={5} current={step} />
              <div
                className="text-[12px] font-semibold uppercase"
                style={{ color: "var(--text-faint)", letterSpacing: "0.05em" }}
              >
                Step {step} of 5
              </div>
            </div>

            {step === 1 && (
              <StepAccount
                value={account}
                onChange={setAccount}
                onSubmit={submitAccount}
                pending={pending}
                error={error}
              />
            )}
            {step === 2 && (
              <StepCompany
                value={company}
                onChange={setCompany}
                onSubmit={submitCompany}
                pending={pending}
                error={error}
              />
            )}
            {step === 3 && (
              <StepPlan
                period={planPeriod}
                onPeriod={setPlanPeriod}
                planSlug={planSlug}
                onPlan={setPlanSlug}
                plans={visiblePlans}
                onSubmit={submitPlan}
                pending={pending}
                error={error}
              />
            )}
            {step === 4 && (
              <StepPayment onSubmit={next} pending={pending} />
            )}
            {step === 5 && (
              <StepDone
                companyName={company.company_name}
                planSlug={planSlug}
                planPeriod={planPeriod}
                onFinish={finishWizard}
                pending={pending}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ---------- Step 1: Account ---------- */
function StepAccount({
  value,
  onChange,
  onSubmit,
  pending,
  error,
}: {
  value: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    password: string;
    confirm_password: string;
  };
  onChange: (v: typeof value) => void;
  onSubmit: () => void;
  pending: boolean;
  error: string | null;
}) {
  const set = <K extends keyof typeof value>(k: K, v: (typeof value)[K]) =>
    onChange({ ...value, [k]: v });
  return (
    <Form onSubmit={onSubmit}>
      <Title>Create your account</Title>
      <Sub>This is the admin login for your workspace.</Sub>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="First name">
          <Input
            value={value.first_name}
            onChange={(e) => set("first_name", e.target.value)}
            autoComplete="given-name"
            required
          />
        </Field>
        <Field label="Last name">
          <Input
            value={value.last_name}
            onChange={(e) => set("last_name", e.target.value)}
            autoComplete="family-name"
            required
          />
        </Field>
      </div>
      <Field label="Phone">
        <PhoneInput
          value={value.phone}
          onChange={(v) => set("phone", v)}
        />
      </Field>
      <Field label="Work email">
        <Input
          type="email"
          value={value.email}
          onChange={(e) => set("email", e.target.value)}
          autoComplete="email"
          required
        />
      </Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Password">
          <Input
            type="password"
            value={value.password}
            onChange={(e) => set("password", e.target.value)}
            autoComplete="new-password"
            required
          />
        </Field>
        <Field label="Confirm password">
          <Input
            type="password"
            value={value.confirm_password}
            onChange={(e) => set("confirm_password", e.target.value)}
            autoComplete="new-password"
            required
          />
        </Field>
      </div>
      <Error msg={error} />
      <Footer pending={pending} label="Create account & continue" />
    </Form>
  );
}

/* ---------- Step 2: Company ---------- */
function StepCompany({
  value,
  onChange,
  onSubmit,
  pending,
  error,
}: {
  value: {
    company_name: string;
    industry: string;
    address: string;
    suburb: string;
    state: string;
    country: string;
    postcode: string;
    website: string;
  };
  onChange: (v: typeof value) => void;
  onSubmit: () => void;
  pending: boolean;
  error: string | null;
}) {
  const set = <K extends keyof typeof value>(k: K, v: (typeof value)[K]) =>
    onChange({ ...value, [k]: v });
  const onSelectAddress = (parts: AddressParts) => {
    onChange({
      ...value,
      address: parts.address || value.address,
      suburb: parts.suburb || value.suburb,
      state: parts.state || value.state,
      country: parts.country || value.country,
      postcode: parts.postcode || value.postcode,
    });
  };
  return (
    <Form onSubmit={onSubmit}>
      <Title>About your company</Title>
      <Sub>We'll set up your workspace and billing from this.</Sub>
      <Field label="Company name">
        <Input
          value={value.company_name}
          onChange={(e) => set("company_name", e.target.value)}
          required
        />
      </Field>
      <Field label="Industry">
        <Select
          value={value.industry}
          onChange={(e) => set("industry", e.target.value)}
        >
          {INDUSTRIES.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Address">
        <AddressInput
          value={value.address}
          onChange={(v) => set("address", v)}
          onSelect={onSelectAddress}
        />
      </Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Suburb">
          <Input
            value={value.suburb}
            onChange={(e) => set("suburb", e.target.value)}
          />
        </Field>
        <Field label="Postcode">
          <Input
            inputMode="numeric"
            value={value.postcode}
            onChange={(e) => set("postcode", e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="State">
          <Select
            value={value.state}
            onChange={(e) => set("state", e.target.value)}
          >
            {AU_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Country">
          <Input
            value={value.country}
            onChange={(e) => set("country", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Website (optional)">
        <Input
          type="url"
          value={value.website}
          onChange={(e) => set("website", e.target.value)}
          placeholder="https://"
        />
      </Field>
      <Error msg={error} />
      <Footer pending={pending} label="Continue" />
    </Form>
  );
}

/* ---------- Step 3: Plan ---------- */
function StepPlan({
  period,
  onPeriod,
  planSlug,
  onPlan,
  plans,
  onSubmit,
  pending,
  error,
}: {
  period: "monthly" | "yearly";
  onPeriod: (p: "monthly" | "yearly") => void;
  planSlug: string;
  onPlan: (slug: string) => void;
  plans: Plan[];
  onSubmit: () => void;
  pending: boolean;
  error: string | null;
}) {
  return (
    <Form onSubmit={onSubmit}>
      <Title>Pick a plan</Title>
      <Sub>You can change this any time.</Sub>
      <div className="mb-4 inline-flex self-start gap-1 rounded-[12px] p-1" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        {(["monthly", "yearly"] as const).map((p) => {
          const active = period === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPeriod(p)}
              className="cursor-pointer rounded-[9px] px-3.5 py-2 text-[13px] font-semibold capitalize transition"
              style={
                active
                  ? {
                      background:
                        "linear-gradient(180deg, var(--accent), var(--accent-2))",
                      color: "#fff",
                      boxShadow: "0 6px 14px var(--accent-soft)",
                    }
                  : { background: "transparent", color: "var(--text-dim)" }
              }
            >
              {p}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((p) => (
          <PlanCard
            key={p.slug}
            plan={p}
            period={period}
            selected={planSlug === p.slug}
            onClick={() => onPlan(p.slug)}
          />
        ))}
      </div>
      <Error msg={error} />
      <Footer pending={pending} label="Continue" />
    </Form>
  );
}

/* ---------- Step 4: Payment ---------- */
function StepPayment({
  onSubmit,
  pending,
}: {
  onSubmit: () => void;
  pending: boolean;
}) {
  return (
    <Form onSubmit={onSubmit}>
      <Title>Payment</Title>
      <Sub>
        Card setup with Stripe is coming soon. You can wire this up later from
        Settings.
      </Sub>
      <div
        className="grid place-items-center rounded-[16px] p-10 text-center"
        style={{
          background: "var(--surface-2)",
          border: "1px dashed var(--border-strong)",
        }}
      >
        <div className="text-[14px] font-semibold">
          Stripe card capture goes here
        </div>
        <p
          className="mt-1 text-[12.5px]"
          style={{ color: "var(--text-dim)" }}
        >
          Skip for now and add a card later.
        </p>
      </div>
      <Footer pending={pending} label="Skip for now" />
    </Form>
  );
}

/* ---------- Step 5: Done ---------- */
function StepDone({
  companyName,
  planSlug,
  planPeriod,
  onFinish,
  pending,
}: {
  companyName: string;
  planSlug: string;
  planPeriod: string;
  onFinish: () => void;
  pending: boolean;
}) {
  return (
    <Form onSubmit={onFinish}>
      <div className="grid place-items-center pt-2">
        <div
          className="grid h-14 w-14 place-items-center rounded-full text-white"
          style={{
            background:
              "linear-gradient(140deg, var(--accent), var(--accent-2))",
            boxShadow: "0 10px 22px var(--accent-soft)",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12l5 5L20 7" />
          </svg>
        </div>
      </div>
      <Title>You're all set</Title>
      <Sub>Here's what we just set up for you.</Sub>
      <ul
        className="flex flex-col gap-2 rounded-[14px] p-4"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
        }}
      >
        <Row label="Workspace" value={companyName || "—"} />
        <Row
          label="Plan"
          value={`${planSlug[0].toUpperCase()}${planSlug.slice(1)} · ${planPeriod}`}
        />
        <Row label="Status" value="AI Onboarding" />
      </ul>
      <Footer pending={pending} label="Go to dashboard" />
    </Form>
  );
}

/* ---------- Shared form helpers ---------- */
function Form({
  children,
  onSubmit,
}: {
  children: React.ReactNode;
  onSubmit: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-4"
    >
      {children}
    </form>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[22px] font-bold"
      style={{ letterSpacing: "-0.02em" }}
    >
      {children}
    </h2>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <p className="-mt-2 text-sm" style={{ color: "var(--text-dim)" }}>
      {children}
    </p>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between text-[13px]">
      <span style={{ color: "var(--text-faint)" }}>{label}</span>
      <span className="font-semibold">{value}</span>
    </li>
  );
}

function Error({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div
      className="rounded-[10px] p-3 text-[12.5px] font-semibold"
      style={{
        background: "rgba(255,108,108,0.12)",
        color: "var(--red)",
        border: "1px solid rgba(255,108,108,0.3)",
      }}
    >
      {msg}
    </div>
  );
}

function Footer({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[13px] px-4 py-3.5 text-[14px] font-bold text-white disabled:opacity-70"
      style={{
        background: "linear-gradient(180deg, var(--accent), var(--accent-2))",
        boxShadow: "0 10px 26px var(--accent-soft)",
        border: "1px solid transparent",
      }}
    >
      {pending ? "Working…" : label}
    </button>
  );
}
