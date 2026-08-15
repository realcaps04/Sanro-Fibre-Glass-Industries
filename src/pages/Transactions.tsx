import { PageHeader } from "@/components/layout/PageHeader";
import { TransactionFilterSheet } from "@/components/transactions/TransactionFilterSheet";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchInput } from "@/components/ui/SearchInput";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useData } from "@/context/DataContext";
import { formatCurrency } from "@/lib/currency";
import { formatDateTime, startOfDay, toISODate } from "@/lib/dates";
import { transactionTypeLabel } from "@/lib/labels";
import { cn } from "@/lib/cn";
import { transactionService, type TransactionFilters } from "@/services/transactionService";
import type { Transaction } from "@/types";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  FileText,
  SlidersHorizontal,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type DatePreset = "today" | "week" | "month" | "custom";

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
  const [visible, setVisible] = useState<Transaction[]>([]);

  const dateRange = useMemo(() => {
    const now = new Date();
    if (preset === "today") return { from: toISODate(startOfDay(now)), to: toISODate(now) };
    if (preset === "week") {
      const from = startOfDay(now);
      from.setDate(now.getDate() - 6);
      return { from: toISODate(from), to: toISODate(now) };
    }
    if (preset === "month") {
      return { from: toISODate(new Date(now.getFullYear(), now.getMonth(), 1)), to: toISODate(now) };
    }
    return { from: filters.from, to: filters.to };
  }, [filters.from, filters.to, preset]);

  useEffect(() => {
    let cancelled = false;
    void transactionService
      .searchTransactions({
        ...filters,
        query,
        from: dateRange.from,
        to: dateRange.to,
      })
      .then((result) => {
        if (!cancelled) setVisible(result);
      });
    return () => {
      cancelled = true;
    };
  }, [dateRange.from, dateRange.to, filters, query, transactions]);

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
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {(
          [
            ["today", "Today"],
            ["week", "This Week"],
            ["month", "This Month"],
            ["custom", "Custom"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setPreset(value)}
            className={cn(
              "shrink-0 rounded-md border px-3 py-1.5 text-sm",
              preset === value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
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
        onChange={(next) => {
          setFilters(next);
          if (next.from || next.to) setPreset("custom");
        }}
      />
    </div>
  );
}
