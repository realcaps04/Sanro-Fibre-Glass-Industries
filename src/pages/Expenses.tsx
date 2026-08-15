import { ExpenseSheet } from "@/components/expenses/ExpenseSheet";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Overlay } from "@/components/ui/Overlay";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { SearchInput } from "@/components/ui/SearchInput";
import { useData } from "@/context/DataContext";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/dates";
import { expenseCategoryLabel, paymentLabel } from "@/lib/labels";
import { matchesQuery } from "@/lib/search";
import { expensesInMonth } from "@/lib/stats";
import type { Expense } from "@/types";
import { Plus, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

export default function Expenses() {
  const { expenses, loading, error, refresh } = useData();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Expense | null>(null);
  const monthTotal = expensesInMonth(expenses);

  const visible = useMemo(
    () =>
      expenses.filter((expense) =>
        matchesQuery(query, expense.category, expense.description, expense.vendor),
      ),
    [expenses, query],
  );

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState title="Unable to load expenses" onRetry={() => void refresh()} />;

  return (
    <div>
      <PageHeader
        title="Expenses"
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>
            Add Expense
          </Button>
        }
      />
      <div className="mb-4 rounded-md border border-border bg-card px-4 py-3">
        <p className="text-xs text-muted-foreground">This Month</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{formatCurrency(monthTotal)}</p>
      </div>
      <SearchInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search expenses"
        aria-label="Search expenses"
        className="mb-4"
      />
      {visible.length ? (
        <div className="divide-y divide-border rounded-md border border-border bg-card">
          {visible.map((expense) => (
            <button
              key={expense.id}
              type="button"
              className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-muted/70"
              onClick={() => setSelected(expense)}
            >
              <span>
                <span className="block font-medium">{expenseCategoryLabel[expense.category]}</span>
                <span className="text-sm text-muted-foreground">{expense.description}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {formatDate(expense.date)}
                </span>
              </span>
              <span className="text-sm font-semibold tabular-nums">
                {formatCurrency(expense.amount)}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Wallet className="h-6 w-6" />}
          title="No expenses yet"
          description="Workshop costs, transport and utilities will appear here."
          actionLabel="Add Expense"
          onAction={() => setOpen(true)}
        />
      )}
      <ExpenseSheet open={open} onClose={() => setOpen(false)} />
      <Overlay
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? expenseCategoryLabel[selected.category] : "Expense"}
      >
        {selected ? (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="mt-0.5 font-semibold tabular-nums">{formatCurrency(selected.amount)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Date</dt>
              <dd className="mt-0.5">{formatDate(selected.date)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Payment method</dt>
              <dd className="mt-0.5">{paymentLabel[selected.paymentMethod]}</dd>
            </div>
            {selected.vendor ? (
              <div>
                <dt className="text-muted-foreground">Vendor</dt>
                <dd className="mt-0.5">{selected.vendor}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-muted-foreground">Description</dt>
              <dd className="mt-0.5">{selected.description}</dd>
            </div>
          </dl>
        ) : null}
      </Overlay>
    </div>
  );
}
