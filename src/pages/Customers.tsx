import { CustomerForm } from "@/components/customers/CustomerForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchInput } from "@/components/ui/SearchInput";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { useData } from "@/context/DataContext";
import { formatCurrency } from "@/lib/currency";
import { matchesQuery } from "@/lib/search";
import { customerOutstanding } from "@/lib/stats";
import { Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function Customers() {
  const { customers, invoices, loading, error, refresh } = useData();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const visible = useMemo(
    () =>
      customers.filter((customer) =>
        matchesQuery(query, customer.name, customer.phone, customer.gstin, customer.address, customer.houseName, customer.place, customer.pincode),
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
        <div className="elevated divide-y divide-border rounded-lg">
          {visible.map((customer) => {
            const outstanding = customerOutstanding(customer.id, invoices);
            return (
              <Link
                key={customer.id}
                to={`/customers/${customer.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/70"
              >
                <div className="min-w-0">
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                </div>
                <p className="text-sm tabular-nums text-muted-foreground">
                  {formatCurrency(outstanding)} outstanding
                </p>
              </Link>
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
