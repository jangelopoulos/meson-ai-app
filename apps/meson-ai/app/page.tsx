"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BgBlobs } from "@/components/BgBlobs";
import { LogoMark, Wordmark } from "@/components/Logo";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const isSignup = mode === "signup";
  const router = useRouter();
  const submit = () => router.push("/app/dashboard");

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
          <div className="flex flex-col justify-center p-8 sm:p-11">
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
                input={<Input placeholder="David Chen" autoComplete="name" />}
              />
            )}

            <Field
              label="Work email"
              input={
                <Input
                  placeholder="david@agency.com.au"
                  type="email"
                  autoComplete="email"
                />
              }
            />
            <Field
              label="Password"
              input={
                <Input
                  type="password"
                  placeholder="••••••••••"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                />
              }
            />

            <button
              type="button"
              onClick={submit}
              className="mt-1.5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[13px] px-4 py-3.5 text-[15px] font-bold text-white"
              style={{
                background:
                  "linear-gradient(180deg, var(--accent), var(--accent-2))",
                boxShadow: "0 10px 26px var(--accent-soft)",
                border: "1px solid transparent",
              }}
            >
              {isSignup ? "Create account" : "Sign in"}
            </button>

            <div
              className="my-5 flex items-center gap-3 text-xs"
              style={{ color: "var(--text-faint)" }}
            >
              <div
                className="h-px flex-1"
                style={{ background: "var(--border)" }}
              />
              or
              <div
                className="h-px flex-1"
                style={{ background: "var(--border)" }}
              />
            </div>

            <button
              type="button"
              onClick={submit}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-[13px] px-4 py-3 text-sm font-semibold"
              style={{
                background: "var(--surface-2)",
                color: "var(--text)",
                border: "1px solid var(--border-strong)",
                backdropFilter: "var(--glass-blur)",
              }}
            >
              <GoogleGlyph />
              Continue with Google
            </button>

            <p
              className="mt-6 text-center text-xs"
              style={{ color: "var(--text-faint)" }}
            >
              By continuing you agree to our Terms &amp; Privacy.
            </p>
          </div>
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

function GoogleGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
