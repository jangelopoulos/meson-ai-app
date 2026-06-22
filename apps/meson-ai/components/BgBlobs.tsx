export function BgBlobs() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div
        className="animate-blob absolute -top-[12%] -left-[6%] rounded-full"
        style={{
          width: "52vw",
          height: "52vw",
          background:
            "radial-gradient(circle, var(--accent), transparent 62%)",
          opacity: "var(--blob-op)",
          filter: "blur(46px)",
        }}
      />
      <div
        className="animate-blob2 absolute -bottom-[16%] -right-[6%] rounded-full"
        style={{
          width: "46vw",
          height: "46vw",
          background:
            "radial-gradient(circle, var(--accent-2), transparent 62%)",
          opacity: "var(--blob-op)",
          filter: "blur(46px)",
        }}
      />
      <div
        className="animate-blob-slow absolute top-[28%] right-[24%] rounded-full"
        style={{
          width: "30vw",
          height: "30vw",
          background:
            "radial-gradient(circle, var(--sms), transparent 60%)",
          opacity: "var(--blob-op2)",
          filter: "blur(48px)",
        }}
      />
    </div>
  );
}
