"use client";

import { forwardRef } from "react";

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }
>(function Select({ label, className = "", style, children, ...rest }, ref) {
  if (!label) {
    return (
      <select
        ref={ref}
        {...rest}
        className={`w-full rounded-[10px] px-3 py-2 text-[13px] font-semibold outline-none ${className}`}
        style={{
          background: "var(--surface-2)",
          color: "var(--text)",
          border: "1px solid var(--border-strong)",
          ...style,
        }}
      >
        {children}
      </select>
    );
  }
  return (
    <label className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
      <span
        className="text-[11px] font-semibold uppercase"
        style={{ color: "var(--text-faint)", letterSpacing: "0.05em" }}
      >
        {label}
      </span>
      <select
        ref={ref}
        {...rest}
        className={`w-full rounded-[10px] px-3 py-2 text-[13px] font-semibold outline-none md:w-auto ${className}`}
        style={{
          background: "var(--surface-2)",
          color: "var(--text)",
          border: "1px solid var(--border-strong)",
          ...style,
        }}
      >
        {children}
      </select>
    </label>
  );
});
