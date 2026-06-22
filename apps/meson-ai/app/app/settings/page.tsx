"use client";

import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { SegmentedControl } from "@/components/SegmentedControl";
import { useTheme } from "@/components/ThemeProvider";
import { useAppUser } from "@/components/UserContext";
import { numbers } from "@/lib/mock-data";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAppUser();
  const fullName = `${user.first_name} ${user.last_name}`.trim() || user.email;
  const initials =
    (user.first_name?.[0] ?? "") + (user.last_name?.[0] ?? "") ||
    user.email[0].toUpperCase();

  return (
    <div className="animate-pop mx-auto flex w-full max-w-[760px] flex-col gap-6">
      <div>
        <h1
          className="text-[26px] font-extrabold"
          style={{ letterSpacing: "-0.025em" }}
        >
          Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-dim)" }}>
          Manage your profile, lines, and workspace preferences.
        </p>
      </div>

      <Card>
        <div className="mb-4 text-[15px] font-bold">Profile</div>
        <div className="mb-5 flex items-center gap-4">
          <div
            className="grid h-[58px] w-[58px] place-items-center rounded-full text-[20px] font-bold text-white"
            style={{
              background: "linear-gradient(140deg, var(--sms), var(--call))",
            }}
          >
            {initials}
          </div>
          <button
            type="button"
            className="cursor-pointer rounded-[11px] px-3.5 py-2 text-[13px] font-semibold"
            style={{
              background: "var(--surface)",
              color: "var(--text)",
              border: "1px solid var(--border-strong)",
            }}
          >
            Change photo
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" defaultValue={fullName} />
          <Field label="Email" type="email" defaultValue={user.email} />
        </div>
      </Card>

      <Card>
        <div className="mb-4 text-[15px] font-bold">Connected numbers</div>
        <ul className="flex flex-col gap-3">
          {numbers.map((n) => (
            <li
              key={n.number}
              className="flex items-center gap-3 rounded-[14px] p-3.5"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="grid h-10 w-10 place-items-center rounded-[10px] text-white"
                style={{
                  background:
                    n.type === "sms" ? "var(--sms)" : "var(--call)",
                }}
              >
                {n.type === "sms" ? (
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.4 8.4 0 0 1-3.4-.6L3 21l1.7-5.6A8.4 8.4 0 1 1 21 11.5z" />
                  </svg>
                ) : (
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.6 2.8a2 2 0 0 1-.5 2L7.9 9.9a16 16 0 0 0 6.2 6.2l1.4-1.4a2 2 0 0 1 2-.4c.9.3 1.8.5 2.8.6A2 2 0 0 1 22 16.9z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="text-[13.5px] font-bold">{n.number}</div>
                <div
                  className="text-[12px]"
                  style={{ color: "var(--text-faint)" }}
                >
                  {n.label} · {n.provider}
                </div>
              </div>
              <span
                className="inline-flex items-center gap-1.5 rounded-[8px] px-2 py-1 text-[11px] font-bold"
                style={{
                  background: "rgba(61,220,151,0.16)",
                  color: "var(--green)",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--green)" }}
                />
                Active
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <div className="mb-1 text-[15px] font-bold">Appearance</div>
        <p
          className="mb-4 text-[13px]"
          style={{ color: "var(--text-dim)" }}
        >
          Choose how Meson AI looks on this device.
        </p>
        <SegmentedControl
          value={theme}
          onChange={setTheme}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
      </Card>
    </div>
  );
}

function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold">{label}</span>
      <Input {...rest} />
    </label>
  );
}
