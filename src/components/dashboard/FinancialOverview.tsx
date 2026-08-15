import { useData } from "@/context/DataContext";
import { formatCurrency } from "@/lib/currency";
import { expensesInMonth, receivablesTotal } from "@/lib/stats";

export function FinancialOverview() {
  const { invoices, expenses, settings } = useData();
  const receivables = receivablesTotal(invoices);
  const monthExpenses = expensesInMonth(expenses);
  const cash = settings.openingCash;

  const items = [
    { label: "Receivables", value: receivables },
    { label: "Expenses", value: monthExpenses },
    { label: "Cash", value: cash },
  ];

  return (
    <section className="rounded-md border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium text-muted-foreground">Financial Overview</h2>
      </div>
      <div className="grid grid-cols-3 divide-x divide-border">
        {items.map((item) => (
          <div key={item.label} className="px-4 py-3">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-base font-semibold tracking-tight tabular-nums">
              {formatCurrency(item.value)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
