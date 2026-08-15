import { InvoiceList } from "@/components/billing/InvoiceList";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchInput } from "@/components/ui/SearchInput";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { useData } from "@/context/DataContext";
import { formatCurrency } from "@/lib/currency";
import { matchesQuery } from "@/lib/search";
import { activeInvoices } from "@/lib/stats";
import { cn } from "@/lib/cn";
import type { InvoiceStatus } from "@/types";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const filters: Array<{ value: InvoiceStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partial" },
];

export default function Billing() {
  const { invoices, loading, error, refresh } = useData();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");

  const visible = useMemo(
    () =>
      invoices.filter((invoice) => {
        const matchesStatus = status === "all" || invoice.status === status;
        return (
          matchesStatus &&
          matchesQuery(query, invoice.number, invoice.customerName, invoice.status)
        );
      }),
    [invoices, query, status],
  );

  const summary = useMemo(() => {
    const active = activeInvoices(invoices);
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
  }, [invoices]);

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState title="Unable to load invoices" onRetry={() => void refresh()} />;

  return (
    <div>
      <PageHeader
        title="Billing"
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => navigate("/billing/new")}>
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
      <InvoiceList invoices={visible} />
    </div>
  );
}
