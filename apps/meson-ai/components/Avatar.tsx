export function Avatar({
  initials,
  size = 38,
  unread = false,
}: {
  initials: string;
  size?: number;
  unread?: boolean;
}) {
  return (
    <div className="relative flex-none">
      <div
        className="grid place-items-center rounded-full font-bold text-white"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(140deg, var(--sms), var(--call))",
          fontSize: Math.round(size * 0.34),
        }}
      >
        {initials}
      </div>
      {unread && (
        <span
          className="absolute -right-px -top-px h-[11px] w-[11px] rounded-full"
          style={{
            background: "var(--accent)",
            border: "2px solid var(--surface-2)",
          }}
        />
      )}
    </div>
  );
}
