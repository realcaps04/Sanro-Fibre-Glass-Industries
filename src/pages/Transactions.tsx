import { PageHeader } from "@/components/layout/PageHeader";
import { TransactionFilterSheet } from "@/components/transactions/TransactionFilterSheet";
import { DateRangeSheet } from "@/components/ui/DateRangeSheet";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchInput } from "@/components/ui/SearchInput";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useData } from "@/context/DataContext";
import { formatCurrency } from "@/lib/currency";
import {
  formatDate,
  formatDateTime,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  toISODate,
} from "@/lib/dates";
import { transactionTypeLabel } from "@/lib/labels";
import { cn } from "@/lib/cn";
import { filterTransactions, type TransactionFilters } from "@/services/transactionService";
import type { Transaction } from "@/types";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  FileText,
  SlidersHorizontal,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type DatePreset = "today" | "week" | "month" | "year" | "custom";

const presets: Array<{ value: DatePreset; label: string }> = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
  { value: "custom", label: "Custom" },
];

function TxIcon({ type }: { type: Transaction["type"] }) {
  if (type === "expense") return <Wallet className="h-4 w-4" />;
  if (type === "payment") return <Banknote className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

export default function Transactions() {
  const { loading, error, refresh, transactions } = useData();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [preset, setPreset] = useState<DatePreset>("month");
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);

  const dateRange = useMemo(() => {
    const now = new Date();
    const to = toISODate(now);
    if (preset === "today") return { from: toISODate(startOfDay(now)), to };
    if (preset === "week") return { from: toISODate(startOfWeek(now)), to };
    if (preset === "month") return { from: toISODate(startOfMonth(now)), to };
    if (preset === "year") return { from: toISODate(startOfYear(now)), to };
    return { from: filters.from, to: filters.to };
  }, [filters.from, filters.to, preset]);

  const visible = useMemo(
    () =>
      filterTransactions(transactions, {
        ...filters,
        query,
        from: dateRange.from,
        to: dateRange.to,
      }),
    [dateRange.from, dateRange.to, filters, query, transactions],
  );

  if (loading) return <PageSkeleton />;
  if (error) {
    return <ErrorState title="Unable to load transactions" onRetry={() => void refresh()} />;
  }

  return (
    <div>
      <PageHeader
        title="Transactions"
        actions={
          <button
            type="button"
            className="elevated-soft rounded-lg p-2"
            aria-label="Open filters"
            onClick={() => setFilterOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        }
      />
      <SearchInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search transactions"
        aria-label="Search transactions"
        className="mb-4"
      />
      <div className="mb-4 grid grid-cols-3 gap-2">
        {presets.map((item) => {
          const customLabel =
            item.value === "custom" && preset === "custom" && filters.from && filters.to
              ? `${formatDate(filters.from).replace(/ \d{4}$/, "")} – ${formatDate(filters.to).replace(/ \d{4}$/, "")}`
              : item.label;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                if (item.value === "custom") {
                  setRangeOpen(true);
                  return;
                }
                setPreset(item.value);
                setFilters((current) => ({ ...current, from: undefined, to: undefined }));
              }}
              className={cn(
                "h-9 rounded-full border px-2 text-[12px] font-semibold tracking-[-0.02em]",
                item.value === "custom" && "col-span-2",
                preset === item.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              {customLabel}
            </button>
          );
        })}
      </div>
      {visible.length ? (
        <div className="elevated divide-y divide-border rounded-lg">
          {visible.map((tx) => {
            const inflow = tx.direction === "in";
            return (
              <div key={tx.id} className="flex items-start gap-3 px-4 py-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                  <TxIcon type={tx.type} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{transactionTypeLabel[tx.type]}</p>
                  <p className="text-sm text-muted-foreground">
                    {tx.type === "sale" ? tx.reference : tx.description}
                  </p>
                  <p className="text-sm text-muted-foreground">{tx.party}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(tx.date)}</p>
                </div>
                <div className="text-right">
                  <p className="flex items-center justify-end gap-1 text-sm font-semibold tabular-nums">
                    {inflow ? (
                      <ArrowDownLeft className="h-3.5 w-3.5 text-success" aria-hidden />
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                    )}
                    <span>
                      {inflow ? "+" : "-"}
                      {formatCurrency(tx.amount).replace("₹", "₹")}
                    </span>
                    <span className="sr-only">{inflow ? "incoming" : "outgoing"}</span>
                  </p>
                  <div className="mt-1 flex justify-end">
                    <StatusBadge status={tx.status} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No transactions yet"
          description="Your transactions will appear here once you create your first bill."
          actionLabel="Create New Bill"
          onAction={() => navigate("/billing/new")}
        />
      )}
      <TransactionFilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={setFilters}
      />
      <DateRangeSheet
        open={rangeOpen}
        onClose={() => setRangeOpen(false)}
        from={filters.from}
        to={filters.to}
        onApply={(from, to) => {
          setPreset("custom");
          setFilters((current) => ({ ...current, from, to }));
        }}
      />
    </div>
  );
}
