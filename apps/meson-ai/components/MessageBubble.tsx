export function MessageBubble({
  ai,
  text,
  time,
  who,
}: {
  ai: boolean;
  text: string;
  time: string;
  who?: string;
}) {
  return (
    <div
      className={`flex max-w-[78%] flex-col gap-1 ${ai ? "self-start" : "self-end items-end"}`}
    >
      <div
        className="px-3.5 py-2.5 text-[13.5px] leading-[1.5]"
        style={
          ai
            ? {
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                borderRadius: "16px 16px 16px 4px",
              }
            : {
                background:
                  "linear-gradient(180deg, var(--accent), var(--accent-2))",
                color: "#fff",
                borderRadius: "16px 16px 4px 16px",
              }
        }
      >
        {text}
      </div>
      <div
        className="text-[11px]"
        style={{ color: "var(--text-faint)" }}
      >
        {who ? `${who} · ` : ""}
        {time}
      </div>
    </div>
  );
}
