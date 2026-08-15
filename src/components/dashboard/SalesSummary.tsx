import { Amount } from "@/components/ui/Amount";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Sparkline } from "@/components/ui/Sparkline";
import { useData } from "@/context/DataContext";
import { formatCurrency } from "@/lib/currency";
import { daysAgo, startOfDay } from "@/lib/dates";
import { dailySalesSeries, periodRange, salesInRange } from "@/lib/stats";
import type { SalesPeriod } from "@/types";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

const options: Array<{ value: SalesPeriod; label: string }> = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
];

export function SalesSummary() {
  const { invoices } = useData();
  const [period, setPeriod] = useState<SalesPeriod>("today");
  const now = useMemo(() => new Date(), []);

  const { current, previous, series, label } = useMemo(() => {
    const range = periodRange(period, now);
    const currentValue = salesInRange(invoices, range.start, range.end);
    const span = period === "today" ? 1 : period === "7d" ? 7 : 30;
    const prevEnd = new Date(range.start);
    prevEnd.setMilliseconds(-1);
    const prevStart = startOfDay(daysAgo(span, prevEnd));
    const previousValue = salesInRange(invoices, prevStart, prevEnd);
    const days = period === "today" ? 7 : span;
    return {
      current: currentValue,
      previous: previousValue,
      series: dailySalesSeries(invoices, days, now),
      label: period === "today" ? "vs yesterday" : `vs prior ${span} days`,
    };
  }, [invoices, now, period]);

  const delta = previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;
  const positive = delta >= 0;

  return (
    <section className="rounded-md border border-border bg-card px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {period === "today" ? "Today's Sales" : period === "7d" ? "7-day Sales" : "30-day Sales"}
          </p>
          <p className="mt-1 text-[2rem] leading-none font-semibold tracking-tight">
            {formatCurrency(current)}
          </p>
          <p className="mt-2 flex items-center gap-1 text-sm">
            {positive ? (
              <TrendingUp className="h-3.5 w-3.5 text-success" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-danger" />
            )}
            <span className={positive ? "text-success" : "text-danger"}>
              {positive ? "+" : ""}
              {delta.toFixed(1)}%
            </span>
            <span className="text-muted-foreground">{label}</span>
          </p>
        </div>
        <SegmentedControl
          ariaLabel="Sales period"
          value={period}
          options={options}
          onChange={setPeriod}
        />
      </div>
      <div className="mt-4">
        <Sparkline data={series} />
      </div>
      <p className="sr-only">
        Current sales {formatCurrency(current)}, previous period <Amount value={previous} />
      </p>
    </section>
  );
}
