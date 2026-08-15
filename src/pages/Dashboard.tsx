import { CategoryGrid } from "@/components/dashboard/CategoryGrid";
import { FeaturedCard } from "@/components/dashboard/FeaturedCard";
import { NewBillSheet } from "@/components/billing/NewBillSheet";
import { PaymentSheet } from "@/components/payments/PaymentSheet";
import { brandConfig } from "@/brand/config";
import { Overlay } from "@/components/ui/Overlay";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useData } from "@/context/DataContext";
import { formatCurrency } from "@/lib/currency";
import { greeting } from "@/lib/dates";
import { activeInvoices } from "@/lib/stats";
import { Bell, FilePlus2, Files } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { loading, error, refresh, invoices, products } = useData();
  const navigate = useNavigate();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [billOpen, setBillOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const alerts = useMemo(() => {
    const pending = invoices.filter(
      (invoice) => invoice.status === "pending" || invoice.status === "partial",
    );
    const lowStock = products.filter((product) => product.stock <= 5);
    return { pending, lowStock };
  }, [invoices, products]);

  const hasAlerts = alerts.pending.length + alerts.lowStock.length > 0;
  const totalSales = useMemo(
    () => activeInvoices(invoices).reduce((sum, invoice) => sum + invoice.grandTotal, 0),
    [invoices],
  );

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState title={error} onRetry={() => void refresh()} />;

  return (
    <div className="mx-auto w-full max-w-[430px] lg:max-w-none">
      <section className="hero-gradient px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-12 text-white">
        <header className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={brandConfig.logo}
              alt=""
              className="h-11 w-11 shrink-0 rounded-full bg-white object-contain shadow-[0_8px_20px_rgb(0_0_0/0.18)]"
            />
            <div className="min-w-0 leading-none">
              <p className="text-[13px] font-medium text-white/75">{greeting()}!</p>
              <h1 className="mt-1 truncate text-[17px] font-semibold tracking-[-0.03em]">
                {brandConfig.businessName}
              </h1>
            </div>
          </div>
          <button
            type="button"
            className="glass-circle relative flex h-11 w-11 items-center justify-center rounded-full"
            aria-label="Notifications"
            onClick={() => setNotesOpen(true)}
          >
            <Bell className="h-4 w-4" />
            {hasAlerts ? (
              <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-highlight" />
            ) : null}
          </button>
        </header>

        <div className="mt-6">
          <p className="text-[13px] leading-none text-white/70">Total Sales</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="display-number text-white">{formatCurrency(totalSales)}</p>
            <span className="mb-0.5 rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-white/90 backdrop-blur-md">
              INR
            </span>
          </div>
        </div>

        <div className="relative z-20 mt-6 flex items-center gap-2.5">
          <button
            type="button"
            className="btn-glass flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold"
            onClick={() => setBillOpen(true)}
          >
            <FilePlus2 className="h-4 w-4" />
            New Bill
          </button>
          <button
            type="button"
            className="btn-lime flex h-12 flex-[1.15] items-center justify-center gap-2 rounded-full text-sm font-semibold"
            onClick={() => navigate("/billing")}
          >
            My Bills
            <Files className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="relative z-10 -mt-8 space-y-6 rounded-t-[36px] bg-background px-5 pt-7 pb-4">
        <CategoryGrid onPayment={() => setPaymentOpen(true)} />
        <FeaturedCard />
      </section>

      <PaymentSheet open={paymentOpen} onClose={() => setPaymentOpen(false)} />
      <NewBillSheet
        open={billOpen}
        onClose={() => setBillOpen(false)}
        onCreated={(invoiceId) => navigate(`/billing/${invoiceId}`)}
      />

      <Overlay open={notesOpen} onClose={() => setNotesOpen(false)} title="Notifications">
        <div className="space-y-3">
          {alerts.pending.slice(0, 4).map((invoice) => (
            <Link
              key={invoice.id}
              to={`/billing/${invoice.id}`}
              className="block rounded-[20px] bg-muted px-3 py-3"
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
              className="block rounded-[20px] bg-muted px-3 py-3"
              onClick={() => setNotesOpen(false)}
            >
              <p className="text-sm font-semibold">{product.name} is low on stock</p>
              <p className="text-sm text-muted-foreground">{product.stock} remaining</p>
            </Link>
          ))}
          {!hasAlerts ? (
            <p className="py-6 text-center text-sm text-muted-foreground">You are all caught up.</p>
          ) : null}
        </div>
      </Overlay>
    </div>
  );
}
