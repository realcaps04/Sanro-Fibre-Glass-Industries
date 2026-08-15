import { FinancialOverview } from "@/components/dashboard/FinancialOverview";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { SalesSummary } from "@/components/dashboard/SalesSummary";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { ExpenseSheet } from "@/components/expenses/ExpenseSheet";
import { PaymentSheet } from "@/components/payments/PaymentSheet";
import { brandConfig } from "@/brand/config";
import { Overlay } from "@/components/ui/Overlay";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useData } from "@/context/DataContext";
import { formatLongDate, greeting } from "@/lib/dates";
import { Bell } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { loading, error, refresh, invoices, products } = useData();
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
    <div className="lg:space-y-6">
      <section className="bg-primary px-5 pt-5 pb-14 text-primary-foreground lg:rounded-3xl lg:pb-8">
        <header className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={brandConfig.logo}
              alt=""
              className="h-11 w-11 shrink-0 rounded-2xl bg-white object-contain"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white/70">{greeting()}</p>
              <h1 className="truncate text-lg font-semibold tracking-[-0.03em] text-white">
                {brandConfig.businessName}
              </h1>
            </div>
          </div>
          <button
            type="button"
            className="relative rounded-2xl bg-white/12 p-2.5 text-white"
            aria-label="Notifications"
            onClick={() => setNotesOpen(true)}
          >
            <Bell className="h-4 w-4" />
            {hasAlerts ? (
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-highlight" />
            ) : null}
          </button>
        </header>
        <p className="mt-3 text-xs font-medium tracking-[0.04em] text-white/55">
          {formatLongDate()}
        </p>
        <div className="mt-6">
          <SalesSummary variant="hero" />
        </div>
        <div className="mt-6">
          <QuickActions
            variant="hero"
            onNewBill={() => navigate("/billing/new")}
            onPayment={() => setPaymentOpen(true)}
            onExpense={() => setExpenseOpen(true)}
            onCustomer={() => setCustomerOpen(true)}
          />
        </div>
      </section>

      <section className="-mt-8 space-y-5 rounded-t-[28px] bg-background px-5 pt-6 pb-2 lg:mt-0 lg:rounded-3xl lg:px-0 lg:pt-0">
        <QuickActions
          onNewBill={() => navigate("/billing/new")}
          onPayment={() => setPaymentOpen(true)}
          onExpense={() => setExpenseOpen(true)}
          onCustomer={() => setCustomerOpen(true)}
        />
        <FinancialOverview />
        <RecentTransactions />
      </section>

      <PaymentSheet open={paymentOpen} onClose={() => setPaymentOpen(false)} />
      <ExpenseSheet open={expenseOpen} onClose={() => setExpenseOpen(false)} />
      <CustomerForm open={customerOpen} onClose={() => setCustomerOpen(false)} />
      <Overlay open={notesOpen} onClose={() => setNotesOpen(false)} title="Notifications">
        <div className="space-y-4">
          {alerts.pending.slice(0, 4).map((invoice) => (
            <Link
              key={invoice.id}
              to={`/billing/${invoice.id}`}
              className="block rounded-lg bg-muted px-3 py-3"
              onClick={() => setNotesOpen(false)}
            >
              <p className="text-sm font-semibold">
                {invoice.number} is {invoice.status}
              </p>
              <p className="text-sm text-muted-foreground">{invoice.customerName}</p>
            </Link>
          ))}
          {alerts.lowStock.slice(0, 4).map((product) => (
            <Link
              key={product.id}
              to="/products"
              className="block rounded-lg bg-muted px-3 py-3"
              onClick={() => setNotesOpen(false)}
            >
              <p className="text-sm font-semibold">{product.name} is low on stock</p>
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
