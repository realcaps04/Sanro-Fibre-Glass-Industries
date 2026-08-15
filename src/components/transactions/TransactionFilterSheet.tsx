import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Overlay } from "@/components/ui/Overlay";
import { Select } from "@/components/ui/Select";
import { useData } from "@/context/DataContext";
import {
  paymentLabel,
  statusLabel,
  transactionTypeLabel,
} from "@/lib/labels";
import type { TransactionFilters } from "@/services/transactionService";
import type { InvoiceStatus, PaymentMethod, TransactionType } from "@/types";

interface TransactionFilterSheetProps {
  open: boolean;
  onClose: () => void;
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

export function TransactionFilterSheet({
  open,
  onClose,
  filters,
  onChange,
}: TransactionFilterSheetProps) {
  const { customers } = useData();

  const update = (patch: Partial<TransactionFilters>) => {
    onChange({ ...filters, ...patch });
  };

  const reset = () => {
    onChange({ from: filters.from, to: filters.to });
  };

  return (
    <Overlay open={open} onClose={onClose} title="Filters">
      <div className="space-y-4">
        <div>
          <Label htmlFor="flt-type">Type</Label>
          <Select
            id="flt-type"
            value={filters.type ?? "all"}
            onChange={(event) =>
              update({ type: event.target.value as TransactionType | "all" })
            }
          >
            <option value="all">All</option>
            {Object.entries(transactionTypeLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="flt-method">Payment method</Label>
          <Select
            id="flt-method"
            value={filters.paymentMethod ?? "all"}
            onChange={(event) =>
              update({ paymentMethod: event.target.value as PaymentMethod | "all" })
            }
          >
            <option value="all">All</option>
            {Object.entries(paymentLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="flt-status">Status</Label>
          <Select
            id="flt-status"
            value={filters.status ?? "all"}
            onChange={(event) =>
              update({ status: event.target.value as InvoiceStatus | "all" })
            }
          >
            <option value="all">All</option>
            {Object.entries(statusLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="flt-customer">Customer</Label>
          <Select
            id="flt-customer"
            value={filters.customerId ?? "all"}
            onChange={(event) => update({ customerId: event.target.value })}
          >
            <option value="all">All</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="flt-min">Min amount</Label>
            <Input
              id="flt-min"
              inputMode="numeric"
              value={filters.minAmount ?? ""}
              onChange={(event) =>
                update({
                  minAmount: event.target.value ? Number(event.target.value) : undefined,
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="flt-max">Max amount</Label>
            <Input
              id="flt-max"
              inputMode="numeric"
              value={filters.maxAmount ?? ""}
              onChange={(event) =>
                update({
                  maxAmount: event.target.value ? Number(event.target.value) : undefined,
                })
              }
            />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" fullWidth onClick={reset}>
            Reset
          </Button>
          <Button fullWidth onClick={onClose}>
            Apply
          </Button>
        </div>
      </div>
    </Overlay>
  );
}
