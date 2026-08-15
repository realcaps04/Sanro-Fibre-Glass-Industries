import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Sparkline } from "@/components/ui/Sparkline";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { formatCurrency } from "@/lib/currency";
import { dailySalesSeries, expensesInMonth, receivablesTotal, todaySales } from "@/lib/stats";
import { paymentLabel, productCategoryLabel } from "@/lib/labels";
import { useMemo } from "react";

export default function Reports() {
  const { invoices, expenses, customers, products, transactions } = useData();
  const { toast } = useToast();
  const now = useMemo(() => new Date(), []);

  const sales = todaySales(invoices, now);
  const monthExpenses = expensesInMonth(expenses, now);
  const monthSales = invoices
    .filter((invoice) => {
      const date = new Date(invoice.date);
      return (
        invoice.status !== "cancelled" &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, invoice) => sum + invoice.grandTotal, 0);
  const profit = monthSales - monthExpenses;
  const tax = invoices
    .filter((invoice) => invoice.status !== "cancelled")
    .reduce((sum, invoice) => sum + invoice.tax, 0);
  const topCustomer = [...customers]
    .map((customer) => ({
      name: customer.name,
      total: invoices
        .filter((invoice) => invoice.customerId === customer.id && invoice.status !== "cancelled")
        .reduce((sum, invoice) => sum + invoice.grandTotal, 0),
    }))
    .sort((a, b) => b.total - a.total)[0];
  const categorySales = useMemo(() => {
    const map = new Map<string, number>();
    invoices
      .filter((invoice) => invoice.status !== "cancelled")
      .forEach((invoice) => {
        invoice.items.forEach((item) => {
          const product = products.find((entry) => entry.id === item.productId);
          const key = product?.category ?? "other";
          map.set(key, (map.get(key) ?? 0) + item.amount);
        });
      });
    return [...map.entries()].map(([label, value]) => ({ label, value }));
  }, [invoices, products]);

  const reports = [
    {
      title: "Sales Report",
      value: formatCurrency(monthSales),
      detail: "This month",
      series: dailySalesSeries(invoices, 14, now),
    },
    {
      title: "Expense Report",
      value: formatCurrency(monthExpenses),
      detail: "This month",
      series: expenses.slice(0, 8).map((expense, index) => ({
        label: String(index + 1),
        value: expense.amount,
      })),
    },
    {
      title: "Profit Report",
      value: formatCurrency(profit),
      detail: `Sales ${formatCurrency(monthSales)} − expenses`,
      series: dailySalesSeries(invoices, 14, now),
    },
    {
      title: "Customer Report",
      value: topCustomer ? topCustomer.name : "—",
      detail: topCustomer ? `${formatCurrency(topCustomer.total)} in purchases` : "No customers yet",
      series: dailySalesSeries(invoices, 10, now),
    },
    {
      title: "Product Report",
      value: categorySales[0]
        ? productCategoryLabel[categorySales[0].label as keyof typeof productCategoryLabel] ??
          categorySales[0].label
        : "—",
      detail: "Highest category by sales value",
      series: categorySales,
    },
    {
      title: "Tax Report",
      value: formatCurrency(tax),
      detail: `${Math.round((invoices.find((invoice) => invoice.status !== "cancelled")?.taxRate ?? 0.18) * 100)}% GST collected`,
      series: invoices
        .filter((invoice) => invoice.status !== "cancelled")
        .slice(0, 10)
        .reverse()
        .map((invoice) => ({ label: invoice.number.slice(-2), value: invoice.tax })),
    },
  ];

  return (
    <div>
      <PageHeader title="Reports" description="Figures are calculated from local billing data." />
      <div className="mb-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <div className="elevated rounded-lg px-3 py-3">
          <p className="text-xs text-muted-foreground">Today</p>
          <p className="mt-1 font-semibold tabular-nums">{formatCurrency(sales)}</p>
        </div>
        <div className="elevated rounded-lg px-3 py-3">
          <p className="text-xs text-muted-foreground">Receivables</p>
          <p className="mt-1 font-semibold tabular-nums">{formatCurrency(receivablesTotal(invoices))}</p>
        </div>
        <div className="elevated rounded-lg px-3 py-3">
          <p className="text-xs text-muted-foreground">Payments</p>
          <p className="mt-1 font-semibold tabular-nums">
            {formatCurrency(
              transactions
                .filter((tx) => tx.type === "payment" && tx.status !== "cancelled")
                .reduce((sum, tx) => sum + tx.amount, 0),
            )}
          </p>
        </div>
        <div className="elevated rounded-lg px-3 py-3">
          <p className="text-xs text-muted-foreground">Top method</p>
          <p className="mt-1 font-semibold">
            {paymentLabel[
              invoices.find((invoice) => invoice.paymentMethod !== "credit")?.paymentMethod ?? "upi"
            ]}
          </p>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {reports.map((report) => (
          <section key={report.title} className="elevated rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-medium">{report.title}</h2>
                <p className="mt-1 text-xl font-semibold tracking-tight">{report.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{report.detail}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toast("Report opened")}>
                  View
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    window.print();
                    toast("PDF ready");
                  }}
                >
                  Export PDF
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <Sparkline data={report.series.length ? report.series : [{ label: "0", value: 0 }]} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
