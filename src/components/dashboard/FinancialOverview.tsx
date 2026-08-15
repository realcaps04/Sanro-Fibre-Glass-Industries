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
    <section className="elevated rounded-lg px-1 py-1">
      <div className="px-4 pt-4 pb-2">
        <h2 className="section-label">Financial Overview</h2>
      </div>
      <div className="grid grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="px-4 py-3">
            <p className="caption">{item.label}</p>
            <p className="mt-1 text-[15px] font-semibold tracking-[-0.03em] tabular-nums">
              {formatCurrency(item.value)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
