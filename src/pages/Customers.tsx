import { CustomerForm } from "@/components/customers/CustomerForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchInput } from "@/components/ui/SearchInput";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { useData } from "@/context/DataContext";
import { formatCurrency } from "@/lib/currency";
import { telUrl } from "@/lib/phone";
import { matchesQuery } from "@/lib/search";
import { customerOutstanding, customerPurchases } from "@/lib/stats";
import { FileText, Phone, Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function Customers() {
  const { customers, invoices, loading, error, refresh } = useData();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const visible = useMemo(
    () =>
      customers.filter((customer) =>
        matchesQuery(
          query,
          customer.name,
          customer.phone,
          customer.gstin,
          customer.address,
          customer.houseName,
          customer.place,
          customer.pincode,
        ),
      ),
    [customers, query],
  );

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState title="Unable to load customers" onRetry={() => void refresh()} />;

  return (
    <div>
      <PageHeader
        title="Customers"
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>
            Add Customer
          </Button>
        }
      />
      <SearchInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search customers"
        aria-label="Search customers"
        className="mb-4"
      />
      {visible.length ? (
        <div className="space-y-3">
          {visible.map((customer) => {
            const outstanding = customerOutstanding(customer.id, invoices);
            const purchases = customerPurchases(customer.id, invoices);
            const billCount = invoices.filter(
              (invoice) => invoice.customerId === customer.id && invoice.status !== "cancelled",
            ).length;
            const callLink = telUrl(customer.phone);

            return (
              <article key={customer.id} className="elevated rounded-[24px] px-4 py-4">
                <h2 className="text-[17px] font-semibold tracking-[-0.03em]">{customer.name}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">{customer.phone}</p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-muted px-3 py-3">
                    <p className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                      Outstanding
                    </p>
                    <p className="mt-1 text-sm font-semibold tabular-nums">{formatCurrency(outstanding)}</p>
                  </div>
                  <div className="rounded-2xl bg-muted px-3 py-3">
                    <p className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                      Total amount
                    </p>
                    <p className="mt-1 text-sm font-semibold tabular-nums">{formatCurrency(purchases)}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Link
                    to={`/customers/${customer.id}`}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card text-sm font-semibold tracking-[-0.02em] shadow-[var(--shadow-soft)]"
                  >
                    <FileText className="h-4 w-4" />
                    View all bills{billCount ? ` (${billCount})` : ""}
                  </Link>
                  {callLink ? (
                    <a
                      href={callLink}
                      aria-label={`Call ${customer.name}`}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#0b5c4d_0%,#003f34_100%)] text-primary-foreground shadow-[var(--shadow-button)]"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  ) : (
                    <span
                      aria-label="No phone number"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                    >
                      <Phone className="h-4 w-4" />
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No customers yet"
          description="Add your first contractor or interior client to start billing."
          actionLabel="Add Customer"
          onAction={() => setOpen(true)}
        />
      )}
      <CustomerForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
