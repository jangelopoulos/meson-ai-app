export default function SignupLoading() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-9 w-9 animate-spin rounded-full"
          style={{
            border: "3px solid var(--surface-2)",
            borderTopColor: "var(--accent)",
          }}
        />
        <div
          className="text-[12px] font-semibold"
          style={{ color: "var(--text-faint)" }}
        >
          Loading…
        </div>
      </div>
    </div>
  );
}
