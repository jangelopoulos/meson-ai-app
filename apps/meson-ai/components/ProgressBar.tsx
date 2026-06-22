export function ProgressBar({
  value,
  height = 6,
  fill = "gradient",
}: {
  value: number;
  height?: number;
  fill?: "gradient" | "solid" | "sms" | "call";
}) {
  const bg =
    fill === "gradient"
      ? "linear-gradient(90deg, var(--accent), var(--accent-2))"
      : fill === "sms"
        ? "var(--sms)"
        : fill === "call"
          ? "var(--call)"
          : "var(--accent)";
  return (
    <div
      className="overflow-hidden rounded-full"
      style={{ height, background: "var(--surface)" }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.min(Math.max(value, 0), 100)}%`,
          background: bg,
        }}
      />
    </div>
  );
}
