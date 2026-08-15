import { useData } from "@/context/DataContext";
import { formatCurrency } from "@/lib/currency";
import { expensesInMonth, receivablesTotal } from "@/lib/stats";
import { ArrowUpRight, Heart } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export function FeaturedCard() {
  const { invoices, expenses } = useData();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  const stats = useMemo(() => {
    const outstanding = receivablesTotal(invoices);
    const monthExpenses = expensesInMonth(expenses);
    const pending = invoices.filter(
      (invoice) => invoice.status === "pending" || invoice.status === "partial",
    ).length;
    const active = invoices.filter((invoice) => invoice.status !== "cancelled");
    const billed = active.reduce((sum, invoice) => sum + invoice.grandTotal, 0);
    const collected = active.reduce((sum, invoice) => sum + invoice.amountPaid, 0);
    const collection = billed > 0 ? Math.min(100, Math.round((collected / billed) * 100)) : 0;
    return { outstanding, monthExpenses, pending, collection };
  }, [expenses, invoices]);

  return (
    <section>
      <h2 className="mb-4 text-[17px] font-semibold tracking-[-0.03em]">Great Deals</h2>
      <article className="rounded-[24px] bg-white p-4 shadow-[0_14px_36px_rgb(0_63_52/0.08)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold tracking-[-0.02em]">Outstanding</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Open invoices · Receivables</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label={saved ? "Remove from saved" : "Save"}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              onClick={() => setSaved((value) => !value)}
            >
              <Heart className={saved ? "h-4 w-4 fill-danger text-danger" : "h-4 w-4"} />
            </button>
            <button
              type="button"
              aria-label="Open billing"
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              onClick={() => navigate("/billing")}
            >
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-[11px] text-muted-foreground">Amount</p>
            <p className="mt-1 font-semibold tracking-[-0.03em] tabular-nums">
              {formatCurrency(stats.outstanding)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">This month</p>
            <p className="mt-1 font-semibold tracking-[-0.03em] tabular-nums">
              {formatCurrency(stats.monthExpenses)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Duration</p>
            <p className="mt-1 font-semibold tracking-[-0.03em]">
              {stats.pending} invoices
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="progress-lime h-full rounded-full" style={{ width: `${stats.collection}%` }} />
          </div>
          <div className="progress-stripe h-2 rounded-full" />
        </div>

        <div className="mt-4">
          <span className="inline-flex rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold text-background">
            GST 18%
          </span>
        </div>
      </article>
    </section>
  );
}
