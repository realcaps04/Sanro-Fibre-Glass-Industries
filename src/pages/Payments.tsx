import { PageHeader } from "@/components/layout/PageHeader";
import { PaymentSheet } from "@/components/payments/PaymentSheet";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchInput } from "@/components/ui/SearchInput";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useData } from "@/context/DataContext";
import { inferBillKind, type BillKind } from "@/lib/billing";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/dates";
import { paymentLabel } from "@/lib/labels";
import { matchesQuery } from "@/lib/search";
import { activeInvoices } from "@/lib/stats";
import { IndianRupee, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

type KindFilter = "all" | BillKind;

const kindFilters: Array<{ value: KindFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "doors", label: "Doors" },
  { value: "waterproofing", label: "Water proofing" },
];

const kindChip: Record<BillKind, string> = {
  doors: "Door bill",
  waterproofing: "Water proofing",
};

export default function Payments() {
  const { invoices, products, loading, error, refresh } = useData();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [recordOpen, setRecordOpen] = useState(false);

  const payments = useMemo(
    () =>
      invoices
        .filter((invoice) => invoice.status !== "cancelled" && invoice.amountPaid > 0)
        .map((invoice) => ({
          invoice,
          kind: inferBillKind(invoice, products),
        }))
        .sort((a, b) => new Date(b.invoice.date).getTime() - new Date(a.invoice.date).getTime()),
    [invoices, products],
  );

  const visible = useMemo(
    () =>
      payments.filter(({ invoice, kind: invoiceKind }) => {
        const matchesKind = kind === "all" || invoiceKind === kind;
        return (
          matchesKind &&
          matchesQuery(query, invoice.customerName, invoice.number, paymentLabel[invoice.paymentMethod])
        );
      }),
    [kind, payments, query],
  );

  const summary = useMemo(() => {
    const active = activeInvoices(invoices).filter((invoice) =>
      kind === "all" ? true : inferBillKind(invoice, products) === kind,
    );
    return {
      received: active.reduce((sum, invoice) => sum + invoice.amountPaid, 0),
      outstanding: active.reduce((sum, invoice) => sum + invoice.balance, 0),
    };
  }, [invoices, kind, products]);

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState title="Unable to load payments" onRetry={() => void refresh()} />;

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Customer payments for door, waterproofing, and other bills."
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setRecordOpen(true)}>
            Record
          </Button>
        }
      />
      <SearchInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search customer or invoice"
        aria-label="Search payments"
        className="mb-4"
      />
      <div className="mb-4 grid grid-cols-3 gap-2">
        {kindFilters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setKind(item.value)}
            className={cn(
              "h-9 rounded-full border px-2 text-[12px] font-semibold tracking-[-0.02em]",
              kind === item.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {[
          { label: "Received", value: summary.received },
          { label: "Outstanding", value: summary.outstanding },
        ].map((item) => (
          <div key={item.label} className="elevated rounded-lg px-3 py-3">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-sm font-semibold tabular-nums">{formatCurrency(item.value)}</p>
          </div>
        ))}
      </div>
      {visible.length ? (
        <div className="elevated divide-y divide-border rounded-lg">
          {visible.map(({ invoice, kind: invoiceKind }) => (
            <Link
              key={invoice.id}
              to={`/billing/${invoice.id}`}
              className="flex items-start gap-3 px-4 py-3 hover:bg-muted/70"
            >
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                <IndianRupee className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{invoice.customerName}</p>
                <p className="text-sm text-muted-foreground">
                  {invoice.number} · {paymentLabel[invoice.paymentMethod]}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                    {kindChip[invoiceKind]}
                  </span>
                  {invoice.taxRate === 0 ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      Non GST
                    </span>
                  ) : null}
                  <span className="text-xs text-muted-foreground">{formatDate(invoice.date)}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums text-success">
                  +{formatCurrency(invoice.amountPaid)}
                </p>
                {invoice.balance > 0 ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Due {formatCurrency(invoice.balance)}
                  </p>
                ) : null}
                <div className="mt-1 flex justify-end">
                  <StatusBadge status={invoice.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No payments yet"
          description="Payments from customers will show here for every product type."
          actionLabel="Record Payment"
          onAction={() => setRecordOpen(true)}
        />
      )}
      <PaymentSheet open={recordOpen} onClose={() => setRecordOpen(false)} />
    </div>
  );
}
