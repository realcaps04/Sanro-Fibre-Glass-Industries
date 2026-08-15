import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/dates";
import type { Invoice } from "@/types";
import { Link } from "react-router-dom";

export function InvoiceCard({ invoice }: { invoice: Invoice }) {
  return (
    <Link
      to={`/billing/${invoice.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/70"
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium">{invoice.number}</p>
        <p className="truncate text-sm text-muted-foreground">{invoice.customerName}</p>
        <p className="text-xs text-muted-foreground">{formatDate(invoice.date)}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold tabular-nums">{formatCurrency(invoice.grandTotal)}</p>
        <div className="mt-1 flex justify-end">
          <StatusBadge status={invoice.status} />
        </div>
      </div>
    </Link>
  );
}
