import { CustomerForm } from "@/components/customers/CustomerForm";
import { Overlay } from "@/components/ui/Overlay";
import { SearchInput } from "@/components/ui/SearchInput";
import { useData } from "@/context/DataContext";
import { matchesQuery } from "@/lib/search";
import type { Customer } from "@/types";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

interface CustomerSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
}

export function CustomerSelector({ open, onClose, onSelect }: CustomerSelectorProps) {
  const { customers } = useData();
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(
    () =>
      customers.filter((customer) =>
        matchesQuery(query, customer.name, customer.phone, customer.gstin, customer.address),
      ),
    [customers, query],
  );

  return (
    <>
      <Overlay open={open && !adding} onClose={onClose} title="Select Customer" nested>
        <div className="space-y-4">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customer"
            aria-label="Search customer"
          />
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border py-2.5 text-sm font-medium text-primary"
            onClick={() => setAdding(true)}
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </button>
          <ul className="divide-y divide-border rounded-md border border-border">
            {filtered.map((customer) => (
              <li key={customer.id}>
                <button
                  type="button"
                  className="flex w-full flex-col items-start px-3 py-3 text-left hover:bg-muted/70"
                  onClick={() => {
                    onSelect(customer);
                    onClose();
                  }}
                >
                  <span className="font-medium">{customer.name}</span>
                  <span className="text-sm text-muted-foreground">{customer.phone}</span>
                </button>
              </li>
            ))}
          </ul>
          {!filtered.length ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No customers match that search.
            </p>
          ) : null}
        </div>
      </Overlay>
      <CustomerForm
        open={adding}
        onClose={() => setAdding(false)}
        onCreated={(customer) => {
          setAdding(false);
          onSelect(customer);
          onClose();
        }}
      />
    </>
  );
}
