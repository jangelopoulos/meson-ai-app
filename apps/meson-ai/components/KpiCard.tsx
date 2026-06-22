import { Card } from "./Card";
import { Sparkline } from "./Sparkline";
import type { Kpi } from "@/lib/mock-data";

export function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <Card>
      <div
        className="mb-1.5 text-[12px] font-semibold uppercase"
        style={{ color: "var(--text-faint)", letterSpacing: "0.05em" }}
      >
        {kpi.label}
      </div>
      <div className="mb-1 flex items-baseline gap-2">
        <div
          className="text-[28px] font-extrabold"
          style={{ letterSpacing: "-0.02em" }}
        >
          {kpi.value}
        </div>
        <div
          className="text-[12px] font-bold"
          style={{ color: kpi.positive ? "var(--green)" : "var(--red)" }}
        >
          {kpi.delta}
        </div>
      </div>
      <Sparkline data={kpi.spark} />
    </Card>
  );
}
