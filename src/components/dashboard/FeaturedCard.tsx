import { StatusBadge } from "@/components/ui/StatusBadge";
import { useData } from "@/context/DataContext";
import { formatCurrency } from "@/lib/currency";
import { formatDateTime } from "@/lib/dates";
import { transactionTypeLabel } from "@/lib/labels";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  FileText,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";

function TxIcon({ type }: { type: string }) {
  if (type === "expense") return <Wallet className="h-4 w-4" />;
  if (type === "payment") return <Banknote className="h-4 w-4" />;
  if (type === "refund") return <ArrowDownLeft className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

export function FeaturedCard() {
  const { transactions } = useData();
  const recent = transactions.slice(0, 5);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[17px] font-semibold tracking-[-0.03em]">Recent Transfers</h2>
        <Link to="/transactions" className="text-sm font-semibold text-primary">
          View all
        </Link>
      </div>
      {recent.length ? (
        <article className="divide-y divide-border overflow-hidden rounded-[24px] bg-white shadow-[0_14px_36px_rgb(0_63_52/0.08)]">
          {recent.map((tx) => {
            const inflow = tx.direction === "in";
            const href = tx.invoiceId
              ? `/billing/${tx.invoiceId}`
              : tx.type === "expense"
                ? "/expenses"
                : "/transactions";
            return (
              <Link
                key={tx.id}
                to={href}
                className="flex items-start gap-3 px-4 py-3.5 hover:bg-muted/70"
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground">
                  <TxIcon type={tx.type} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold tracking-[-0.02em]">
                    {tx.type === "sale" ? tx.reference : transactionTypeLabel[tx.type]}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">{tx.party}</p>
                  <p className="caption mt-0.5">{formatDateTime(tx.date)}</p>
                </div>
                <div className="text-right">
                  <p className="flex items-center justify-end gap-1 text-sm font-semibold tabular-nums tracking-[-0.02em]">
                    {inflow ? (
                      <ArrowDownLeft className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    {inflow ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </p>
                  <div className="mt-1 flex justify-end">
                    <StatusBadge status={tx.status} />
                  </div>
                </div>
              </Link>
            );
          })}
        </article>
      ) : (
        <p className="rounded-[24px] border border-dashed border-border bg-white px-4 py-8 text-center text-sm text-muted-foreground">
          Transfers will appear here after your first bill or payment.
        </p>
      )}
    </section>
  );
}
