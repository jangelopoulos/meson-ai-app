"use client";

import { useActionState, useState } from "react";
import { BgBlobs } from "@/components/BgBlobs";
import { LogoMark, Wordmark } from "@/components/Logo";
import { signIn, type SignInState } from "@/lib/auth/actions";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const isSignup = mode === "signup";
  const [state, formAction, pending] = useActionState<SignInState, FormData>(
    signIn,
    null
  );

  return (
    <main className="relative min-h-screen">
      <BgBlobs />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-8">
        <div
          className="animate-pop grid w-full max-w-[980px] overflow-hidden rounded-[28px] md:grid-cols-[1.05fr_1fr]"
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
              minHeight: 560,
              background:
                "linear-gradient(150deg, var(--accent-soft), transparent 55%), linear-gradient(320deg, rgba(167,123,255,.14), transparent 50%)",
              borderRight: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-3">
              <LogoMark />
              <Wordmark />
            </div>

            <div>
              <div
                className="mb-3.5 text-[13px] font-semibold uppercase"
                style={{ color: "var(--accent)", letterSpacing: "0.04em" }}
              >
                Client Portal
              </div>
              <h1
                className="mb-3.5 text-[34px] font-extrabold leading-[1.12]"
                style={{ letterSpacing: "-0.03em", textWrap: "balance" }}
              >
                Your AI campaigns, working while you sleep.
              </h1>
              <p
                className="max-w-[340px] text-[15px] leading-[1.55]"
                style={{ color: "var(--text-dim)" }}
              >
                Launch AI SMS &amp; voice outreach, watch conversations
                convert, and book more meetings — all in one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-6">
              <Stat value="1,500+" label="hours saved" />
              <Stat value="2–5%" label="dormant lead conv." />
              <Stat value="100%" label="AU support" />
            </div>
          </div>

          {/* Form panel */}
          <form action={formAction} className="flex flex-col justify-center p-8 sm:p-11">
            <div
              className="mb-6 flex gap-1.5 rounded-[13px] p-1.5"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
              }}
            >
              <TabButton active={!isSignup} onClick={() => setMode("signin")}>
                Sign in
              </TabButton>
              <TabButton active={isSignup} onClick={() => setMode("signup")}>
                Create account
              </TabButton>
            </div>

            <h2
              className="mb-1.5 text-[23px] font-bold"
              style={{ letterSpacing: "-0.02em" }}
            >
              {isSignup ? "Create your account" : "Welcome back"}
            </h2>
            <p className="mb-6 text-sm" style={{ color: "var(--text-dim)" }}>
              {isSignup
                ? "Get your AI agents running in under five minutes."
                : "Sign in to manage your campaigns."}
            </p>

            {isSignup && (
              <Field
                label="Full name"
                input={
                  <Input name="name" placeholder="David Chen" autoComplete="name" />
                }
              />
            )}

            <Field
              label="Work email"
              input={
                <Input
                  name="email"
                  placeholder="david@agency.com.au"
                  type="email"
                  autoComplete="email"
                  required
                />
              }
            />
            <Field
              label="Password"
              input={
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••••"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  required
                />
              }
            />

            {state?.error && (
              <div
                className="mb-3 rounded-[11px] px-3 py-2 text-[12.5px] font-semibold"
                style={{
                  background: "rgba(255,108,108,0.12)",
                  color: "var(--red)",
                  border: "1px solid rgba(255,108,108,0.3)",
                }}
              >
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-1.5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[13px] px-4 py-3.5 text-[15px] font-bold text-white disabled:opacity-70"
              style={{
                background:
                  "linear-gradient(180deg, var(--accent), var(--accent-2))",
                boxShadow: "0 10px 26px var(--accent-soft)",
                border: "1px solid transparent",
              }}
            >
              {pending
                ? "Signing in…"
                : isSignup
                  ? "Create account"
                  : "Sign in"}
            </button>

            <p
              className="mt-6 text-center text-xs"
              style={{ color: "var(--text-faint)" }}
            >
              By continuing you agree to our Terms &amp; Privacy.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div
        className="text-[22px] font-extrabold"
        style={{ letterSpacing: "-0.02em" }}
      >
        {value}
      </div>
      <div className="text-xs" style={{ color: "var(--text-faint)" }}>
        {label}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 cursor-pointer rounded-[10px] px-3 py-2.5 text-[13px] font-semibold transition"
      style={
        active
          ? {
              background:
                "linear-gradient(180deg, var(--accent), var(--accent-2))",
              color: "#fff",
              boxShadow: "0 6px 16px var(--accent-soft)",
            }
          : { background: "transparent", color: "var(--text-dim)" }
      }
    >
      {children}
    </button>
  );
}

function Field({
  label,
  input,
}: {
  label: string;
  input: React.ReactNode;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-[13px] font-semibold">{label}</span>
      {input}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-[12px] px-3.5 py-3 text-sm font-medium outline-none placeholder:opacity-60"
      style={{
        background: "var(--surface-2)",
        color: "var(--text)",
        border: "1px solid var(--border-strong)",
      }}
    />
  );
}
