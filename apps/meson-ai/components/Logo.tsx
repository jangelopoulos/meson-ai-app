export function LogoMark({ size = 38 }: { size?: number }) {
  const inner = Math.round(size * 0.55);
  return (
    <div
      className="grid place-items-center text-white"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.29),
        background: "linear-gradient(180deg, var(--accent), var(--accent-2))",
        boxShadow: "0 8px 22px var(--accent-soft)",
      }}
    >
      <svg
        width={inner}
        height={inner}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="6" cy="12" r="2.3" />
        <circle cx="18" cy="6" r="2.3" />
        <circle cx="18" cy="18" r="2.3" />
        <path d="M8 11l8-4M8 13l8 4" />
      </svg>
    </div>
  );
}

export function Wordmark({ size = 18 }: { size?: number }) {
  return (
    <div
      className="font-extrabold"
      style={{ fontSize: size, letterSpacing: "-0.02em" }}
    >
      Meson<span style={{ color: "var(--accent)" }}>AI</span>
    </div>
  );
}
