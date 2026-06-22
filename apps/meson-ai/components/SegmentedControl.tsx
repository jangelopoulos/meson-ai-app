"use client";

export type SegOption<T extends string> = { value: T; label: string };

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
}) {
  const padY = size === "sm" ? "py-1.5" : "py-2.5";
  const padX = size === "sm" ? "px-3" : "px-3.5";
  const fs = size === "sm" ? "text-[12px]" : "text-[13px]";
  return (
    <div
      className="inline-flex gap-1 rounded-[12px] p-1"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`cursor-pointer rounded-[9px] font-semibold transition ${padY} ${padX} ${fs}`}
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
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
