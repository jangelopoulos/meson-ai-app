import { CSSProperties } from "react";

export function Card({
  children,
  className = "",
  style,
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  padded?: boolean;
}) {
  return (
    <div
      className={`rounded-[18px] ${padded ? "p-5" : ""} ${className}`}
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        boxShadow: "inset 0 1px 0 var(--sheen)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
