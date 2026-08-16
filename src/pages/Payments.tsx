import { PageHeader } from "@/components/layout/PageHeader";
import { DeleteConfirmOverlay } from "@/components/ui/DeleteConfirmOverlay";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchInput } from "@/components/ui/SearchInput";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { inferBillKind, type BillKind } from "@/lib/billing";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/currency";
import { paymentLabel } from "@/lib/labels";
import { matchesQuery } from "@/lib/search";
import { activeInvoices } from "@/lib/stats";
import type { Invoice } from "@/types";
import { Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

type KindFilter = "all" | BillKind;

const kindFilters: Array<{ value: KindFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "doors", label: "Doors" },
  { value: "waterproofing", label: "Water proofing" },
  { value: "mixed", label: "Any Bill" },
];

function productUsed(invoice: Invoice): string {
  return invoice.items
    .map((item) => (item.quantity > 1 ? `${item.name} × ${item.quantity}` : item.name))
    .join(", ");
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="mt-1 text-sm font-semibold tracking-[-0.02em] text-foreground">{children}</div>
    </div>
  );
}

export default function Payments() {
  const { invoices, products, loading, error, refresh, deleteInvoice } = useData();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [pending, setPending] = useState<Invoice | null>(null);

  const payments = useMemo(
    () =>
      invoices
        .filter((invoice) => invoice.status !== "cancelled")
        .map((invoice) => ({
          invoice,
          kind: inferBillKind(invoice, products),
          products: productUsed(invoice),
        }))
        .sort((a, b) => new Date(b.invoice.date).getTime() - new Date(a.invoice.date).getTime()),
    [invoices, products],
  );

  const visible = useMemo(
    () =>
      payments.filter(({ invoice, kind: invoiceKind, products: used }) => {
        const matchesKind = kind === "all" || invoiceKind === kind;
        return (
          matchesKind &&
          matchesQuery(
            query,
            invoice.customerName,
            invoice.number,
            used,
            paymentLabel[invoice.paymentMethod],
            invoice.status,
          )
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
        description="Customer payments for every product type."
      />
      <SearchInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search customer or product"
        aria-label="Search payments"
        className="mb-4"
      />
      <div className="mb-4 flex gap-2">
        {kindFilters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setKind(item.value)}
            className={cn(
              "h-9 shrink-0 rounded-full border px-3 text-[12px] font-semibold tracking-[-0.02em] whitespace-nowrap",
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
        <div className="space-y-3">
          {visible.map(({ invoice, products: used }) => (
            <div key={invoice.id} className="elevated flex items-start rounded-[24px]">
              <Link to={`/billing/${invoice.id}`} className="min-w-0 flex-1 px-4 py-4">
                <div className="space-y-3.5">
                  <Field label="Customer name">{invoice.customerName}</Field>
                  <Field label="Product used">
                    <span className="leading-snug">{used}</span>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Payment status">
                      <StatusBadge status={invoice.status} />
                    </Field>
                    <Field label="Payment amount">
                      <span className="tabular-nums">{formatCurrency(invoice.amountPaid)}</span>
                    </Field>
                  </div>
                </div>
              </Link>
              <button
                type="button"
                aria-label={`Delete payment ${invoice.number}`}
                onClick={() => setPending(invoice)}
                className={cn(
                  "mt-3 mr-3 shrink-0 rounded-md p-2 text-muted-foreground",
                  "hover:bg-danger/10 hover:text-danger",
                )}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No payments yet"
          description="Payments from customers will show here for every product type."
        />
      )}
      <DeleteConfirmOverlay
        open={Boolean(pending)}
        title="Delete payment"
        description={`Enter the password to delete ${pending?.number ?? "this payment"}. This cannot be undone.`}
        onClose={() => setPending(null)}
        onConfirm={async () => {
          if (!pending) return;
          await deleteInvoice(pending.id);
          toast(`${pending.number} deleted`, "success");
        }}
      />
    </div>
  );
}
