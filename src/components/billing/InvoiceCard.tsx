import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/dates";
import { cn } from "@/lib/cn";
import type { Invoice } from "@/types";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export function InvoiceCard({
  invoice,
  onDelete,
  showTaxKind = false,
}: {
  invoice: Invoice;
  onDelete?: (invoice: Invoice) => void;
  showTaxKind?: boolean;
}) {
  return (
    <div className="flex items-center gap-1 hover:bg-muted/70">
      <Link
        to={`/billing/${invoice.id}`}
        className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3"
      >
        <div className="min-w-0 flex-1">
          <p className="font-medium">{invoice.number}</p>
          <p className="truncate text-sm text-muted-foreground">{invoice.customerName}</p>
          <p className="text-xs text-muted-foreground">{formatDate(invoice.date)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold tabular-nums">{formatCurrency(invoice.grandTotal)}</p>
          <div className="mt-1 flex flex-col items-end gap-1">
            {showTaxKind ? (
              <p className="text-[11px] font-medium text-muted-foreground">
                {invoice.taxRate === 0 ? "Non GST" : "GST"}
              </p>
            ) : null}
            <StatusBadge status={invoice.status} />
          </div>
        </div>
      </Link>
      {onDelete ? (
        <button
          type="button"
          aria-label={`Delete ${invoice.number}`}
          onClick={() => onDelete(invoice)}
          className={cn(
            "mr-2 shrink-0 rounded-md p-2 text-muted-foreground",
            "hover:bg-danger/10 hover:text-danger",
          )}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
