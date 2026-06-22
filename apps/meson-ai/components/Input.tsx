import { forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className = "", style, ...rest }, ref) {
  return (
    <input
      ref={ref}
      {...rest}
      className={`w-full rounded-[12px] px-3.5 py-3 text-sm font-medium outline-none placeholder:opacity-60 ${className}`}
      style={{
        background: "var(--surface-2)",
        color: "var(--text)",
        border: "1px solid var(--border-strong)",
        ...style,
      }}
    />
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = "", style, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      {...rest}
      className={`w-full rounded-[12px] px-3.5 py-3 text-sm font-medium outline-none placeholder:opacity-60 ${className}`}
      style={{
        background: "var(--surface-2)",
        color: "var(--text)",
        border: "1px solid var(--border-strong)",
        resize: "vertical",
        minHeight: 110,
        fontFamily: "inherit",
        ...style,
      }}
    />
  );
});
