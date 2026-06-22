"use client";

import { useMemo, useState } from "react";

const COUNTRIES = [
  { code: "+61", label: "AU +61" },
  { code: "+64", label: "NZ +64" },
  { code: "+1",  label: "US +1" },
  { code: "+44", label: "UK +44" },
  { code: "+353", label: "IE +353" },
  { code: "+65", label: "SG +65" },
  { code: "+91", label: "IN +91" },
  { code: "+27", label: "ZA +27" },
];

function format(countryCode: string, raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^0+/, "");
  if (!digits) return "";
  return `${countryCode}${digits}`;
}

export function PhoneInput({
  value,
  onChange,
  defaultCode = "+61",
}: {
  value: string;
  onChange: (e164: string) => void;
  defaultCode?: string;
}) {
  const initial = useMemo(() => {
    if (!value) return { code: defaultCode, local: "" };
    const match = COUNTRIES.find((c) => value.startsWith(c.code));
    if (match) return { code: match.code, local: value.slice(match.code.length) };
    return { code: defaultCode, local: value };
  }, [value, defaultCode]);

  const [code, setCode] = useState(initial.code);
  const [local, setLocal] = useState(initial.local);

  const onCode = (c: string) => {
    setCode(c);
    onChange(format(c, local));
  };
  const onLocal = (v: string) => {
    setLocal(v);
    onChange(format(code, v));
  };

  return (
    <div className="flex gap-2">
      <select
        value={code}
        onChange={(e) => onCode(e.target.value)}
        className="rounded-[12px] px-3 py-3 text-sm font-semibold outline-none"
        style={{
          background: "var(--surface-2)",
          color: "var(--text)",
          border: "1px solid var(--border-strong)",
        }}
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.label}
          </option>
        ))}
      </select>
      <input
        value={local}
        onChange={(e) => onLocal(e.target.value)}
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="0450 311 260"
        className="w-full rounded-[12px] px-3.5 py-3 text-sm font-medium outline-none placeholder:opacity-60"
        style={{
          background: "var(--surface-2)",
          color: "var(--text)",
          border: "1px solid var(--border-strong)",
        }}
      />
    </div>
  );
}
