export function BarChart({
  data,
}: {
  data: { day: string; sent: number; replied: number }[];
}) {
  const max = Math.max(...data.map((d) => d.sent));
  return (
    <div className="flex h-[200px] items-end gap-3">
      {data.map((d) => {
        const sentH = (d.sent / max) * 100;
        const repliedH = (d.replied / max) * 100;
        return (
          <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative flex h-full w-full items-end justify-center gap-1">
              <div
                className="w-3 rounded-t-[4px]"
                style={{
                  height: `${sentH}%`,
                  background:
                    "linear-gradient(180deg, var(--accent), var(--accent-2))",
                }}
                title={`${d.sent} sent`}
              />
              <div
                className="w-3 rounded-t-[4px]"
                style={{
                  height: `${repliedH}%`,
                  background: "var(--sms)",
                  opacity: 0.85,
                }}
                title={`${d.replied} replied`}
              />
            </div>
            <div
              className="text-[11px] font-semibold"
              style={{ color: "var(--text-faint)" }}
            >
              {d.day}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ChartLegend() {
  return (
    <div className="flex items-center gap-4 text-[12px]">
      <span className="inline-flex items-center gap-1.5">
        <span
          className="h-2.5 w-2.5 rounded-sm"
          style={{
            background:
              "linear-gradient(180deg, var(--accent), var(--accent-2))",
          }}
        />
        <span style={{ color: "var(--text-dim)" }}>Sent</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span
          className="h-2.5 w-2.5 rounded-sm"
          style={{ background: "var(--sms)" }}
        />
        <span style={{ color: "var(--text-dim)" }}>Replied</span>
      </span>
    </div>
  );
}
