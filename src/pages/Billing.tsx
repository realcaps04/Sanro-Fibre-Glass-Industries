import { InvoiceList } from "@/components/billing/InvoiceList";
import { NewBillFlow } from "@/components/billing/NewBillFlow";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchInput } from "@/components/ui/SearchInput";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { useData } from "@/context/DataContext";
import { inferBillKind, isAnyBill, type BillKind } from "@/lib/billing";
import { formatCurrency } from "@/lib/currency";
import { matchesQuery } from "@/lib/search";
import { activeInvoices } from "@/lib/stats";
import { cn } from "@/lib/cn";
import type { InvoiceStatus } from "@/types";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const filters: Array<{ value: InvoiceStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partial" },
];

export default function Billing({
  kind,
  mixed = false,
}: {
  kind?: BillKind;
  mixed?: boolean;
}) {
  const { invoices, products, loading, error, refresh } = useData();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const [billOpen, setBillOpen] = useState(false);

  useEffect(() => {
    if (!mixed || searchParams.get("new") !== "1") return;
    setBillOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete("new");
    setSearchParams(next, { replace: true });
  }, [mixed, searchParams, setSearchParams]);

  const scoped = useMemo(
    () =>
      invoices.filter((invoice) => {
        if (mixed) return isAnyBill(invoice);
        const invoiceKind = inferBillKind(invoice, products);
        if (invoiceKind === "mixed" || invoice.taxRate === 0) return false;
        if (kind) return invoiceKind === kind;
        return invoice.taxRate > 0;
      }),
    [invoices, kind, mixed, products],
  );

  const visible = useMemo(
    () =>
      scoped.filter((invoice) => {
        const matchesStatus = status === "all" || invoice.status === status;
        return (
          matchesStatus &&
          matchesQuery(query, invoice.number, invoice.customerName, invoice.status)
        );
      }),
    [query, scoped, status],
  );

  const summary = useMemo(() => {
    const active = activeInvoices(scoped);
    return {
      total: active.reduce((sum, invoice) => sum + invoice.grandTotal, 0),
      pending: active
        .filter((invoice) => invoice.status === "pending")
        .reduce((sum, invoice) => sum + invoice.grandTotal, 0),
      paid: active
        .filter((invoice) => invoice.status === "paid")
        .reduce((sum, invoice) => sum + invoice.grandTotal, 0),
      outstanding: active.reduce((sum, invoice) => sum + invoice.balance, 0),
    };
  }, [scoped]);

  const title =
    kind === "waterproofing"
      ? "Water proofing"
      : kind === "doors"
        ? "Door Bills"
        : mixed
          ? "Any Bills"
          : "Billing";

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState title="Unable to load invoices" onRetry={() => void refresh()} />;

  return (
    <div>
      <PageHeader
        title={title}
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setBillOpen(true)}>
            New Bill
          </Button>
        }
      />
      <SearchInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search invoices"
        aria-label="Search invoices"
        className="mb-4"
      />
      <div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {[
          { label: "Total Sales", value: summary.total },
          { label: "Pending", value: summary.pending },
          { label: "Paid", value: summary.paid },
          { label: "Outstanding", value: summary.outstanding },
        ].map((item) => (
          <div key={item.label} className="elevated rounded-lg px-3 py-3">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-sm font-semibold tabular-nums">{formatCurrency(item.value)}</p>
          </div>
        ))}
      </div>
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setStatus(item.value)}
            className={cn(
              "shrink-0 rounded-md border px-3 py-1.5 text-sm",
              status === item.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <InvoiceList
        invoices={visible}
        allowDelete
        showTaxKind={mixed}
        onCreate={() => setBillOpen(true)}
      />
      <NewBillFlow
        open={billOpen}
        onClose={() => setBillOpen(false)}
        mixed={mixed}
        kind={kind}
        onCreated={(invoiceId) => navigate(`/billing/${invoiceId}`)}
      />
    </div>
  );
}
