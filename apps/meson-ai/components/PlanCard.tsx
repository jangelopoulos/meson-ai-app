"use client";

export type Plan = {
  slug: string;
  name: string;
  priceMonthly: number;
  priceYearly: number | null;
  perCall: string;
  perSms: string;
  features: string[];
  badge?: string;
};

export function PlanCard({
  plan,
  period,
  selected,
  onClick,
}: {
  plan: Plan;
  period: "monthly" | "yearly";
  selected: boolean;
  onClick: () => void;
}) {
  const price =
    period === "yearly" ? plan.priceYearly ?? plan.priceMonthly : plan.priceMonthly;
  const priceLabel =
    plan.slug === "free"
      ? "$0"
      : `$${price}`;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer flex-col gap-4 rounded-[18px] p-5 text-left transition"
      style={{
        background: selected ? "var(--surface-2)" : "var(--surface-2)",
        border: selected
          ? "2px solid var(--accent)"
          : "1px solid var(--border)",
        boxShadow: selected
          ? "0 14px 30px var(--accent-soft)"
          : "inset 0 1px 0 var(--sheen)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[16px] font-bold">{plan.name}</div>
          {plan.badge && (
            <div
              className="mt-1 inline-flex rounded-[6px] px-1.5 py-[1px] text-[10.5px] font-bold uppercase"
              style={{
                background: "var(--accent-soft)",
                color: "var(--accent)",
                letterSpacing: "0.04em",
              }}
            >
              {plan.badge}
            </div>
          )}
        </div>
        {selected && (
          <span
            className="grid h-6 w-6 place-items-center rounded-full text-white"
            style={{ background: "var(--accent)" }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12l5 5L20 7" />
            </svg>
          </span>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-1">
          <span
            className="text-[26px] font-extrabold"
            style={{ letterSpacing: "-0.02em" }}
          >
            {priceLabel}
          </span>
          {plan.slug !== "free" && (
            <span
              className="text-[12px] font-semibold"
              style={{ color: "var(--text-dim)" }}
            >
              /month
              {period === "yearly" ? ", billed yearly" : ""}
            </span>
          )}
        </div>
        <div
          className="mt-1 text-[11.5px] font-semibold"
          style={{ color: "var(--text-faint)" }}
        >
          {plan.perCall} per call · {plan.perSms} per sms
        </div>
      </div>

      <ul className="flex flex-col gap-1.5">
        {plan.features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2 text-[12.5px]"
            style={{ color: "var(--text-dim)" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 flex-none"
            >
              <path d="M5 12l5 5L20 7" />
            </svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}
