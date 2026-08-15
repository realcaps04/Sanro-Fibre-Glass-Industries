import { FinancialOverview } from "@/components/dashboard/FinancialOverview";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { SalesSummary } from "@/components/dashboard/SalesSummary";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { ExpenseSheet } from "@/components/expenses/ExpenseSheet";
import { PaymentSheet } from "@/components/payments/PaymentSheet";
import { BrandMark } from "@/components/layout/BrandMark";
import { Overlay } from "@/components/ui/Overlay";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useData } from "@/context/DataContext";
import { formatLongDate, greeting } from "@/lib/dates";
import { Bell } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { loading, error, refresh, invoices, products, settings } = useData();
  const navigate = useNavigate();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const alerts = useMemo(() => {
    const pending = invoices.filter(
      (invoice) => invoice.status === "pending" || invoice.status === "partial",
    );
    const lowStock = products.filter((product) => product.stock <= 5);
    return { pending, lowStock };
  }, [invoices, products]);

  const hasAlerts = alerts.pending.length + alerts.lowStock.length > 0;

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState title={error} onRetry={() => void refresh()} />;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{greeting()}</p>
          <div className="mt-1 lg:hidden">
            <BrandMark />
          </div>
          <h1 className="hidden text-xl font-semibold tracking-tight lg:block">
            {settings.business.businessName}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{formatLongDate()}</p>
        </div>
        <button
          type="button"
          className="relative rounded-md border border-border bg-card p-2 text-foreground"
          aria-label="Notifications"
          onClick={() => setNotesOpen(true)}
        >
          <Bell className="h-4 w-4" />
          {hasAlerts ? (
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-danger" />
          ) : null}
        </button>
      </header>

      <SalesSummary />
      <QuickActions
        onNewBill={() => navigate("/billing/new")}
        onPayment={() => setPaymentOpen(true)}
        onExpense={() => setExpenseOpen(true)}
        onCustomer={() => setCustomerOpen(true)}
      />
      <FinancialOverview />
      <RecentTransactions />

      <PaymentSheet open={paymentOpen} onClose={() => setPaymentOpen(false)} />
      <ExpenseSheet open={expenseOpen} onClose={() => setExpenseOpen(false)} />
      <CustomerForm open={customerOpen} onClose={() => setCustomerOpen(false)} />
      <Overlay open={notesOpen} onClose={() => setNotesOpen(false)} title="Notifications">
        <div className="space-y-4">
          {alerts.pending.slice(0, 4).map((invoice) => (
            <Link
              key={invoice.id}
              to={`/billing/${invoice.id}`}
              className="block rounded-md border border-border px-3 py-3"
              onClick={() => setNotesOpen(false)}
            >
              <p className="text-sm font-medium">{invoice.number} is {invoice.status}</p>
              <p className="text-sm text-muted-foreground">{invoice.customerName}</p>
            </Link>
          ))}
          {alerts.lowStock.slice(0, 4).map((product) => (
            <Link
              key={product.id}
              to="/products"
              className="block rounded-md border border-border px-3 py-3"
              onClick={() => setNotesOpen(false)}
            >
              <p className="text-sm font-medium">{product.name} is low on stock</p>
              <p className="text-sm text-muted-foreground">{product.stock} remaining</p>
            </Link>
          ))}
          {!hasAlerts ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              You are all caught up.
            </p>
          ) : null}
        </div>
      </Overlay>
    </div>
  );
}
