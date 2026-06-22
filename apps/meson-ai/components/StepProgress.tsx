"use client";

export function StepProgress({
  steps,
  current,
}: {
  steps: number;
  current: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: steps }).map((_, i) => {
        const done = i + 1 <= current;
        return (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{
              background: done
                ? "linear-gradient(90deg, var(--accent), var(--accent-2))"
                : "var(--surface-2)",
            }}
          />
        );
      })}
    </div>
  );
}
