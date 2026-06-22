export default function AppLoading() {
  return (
    <div className="grid h-full min-h-[60vh] place-items-center">
      <Spinner />
    </div>
  );
}

function Spinner() {
  return (
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
  );
}
