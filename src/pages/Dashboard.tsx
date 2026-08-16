import { CategoryGrid } from "@/components/dashboard/CategoryGrid";
import { FeaturedCard } from "@/components/dashboard/FeaturedCard";
import { HeroWaves } from "@/components/dashboard/HeroWaves";
import { NewBillFlow } from "@/components/billing/NewBillFlow";
import { brandConfig } from "@/brand/config";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useData } from "@/context/DataContext";
import { formatCurrency } from "@/lib/currency";
import { greeting } from "@/lib/dates";
import { activeInvoices } from "@/lib/stats";
import { FilePlus2, ReceiptText } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { loading, error, refresh, invoices } = useData();
  const navigate = useNavigate();
  const [billOpen, setBillOpen] = useState(false);

  const totalSales = useMemo(
    () => activeInvoices(invoices).reduce((sum, invoice) => sum + invoice.grandTotal, 0),
    [invoices],
  );

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState title={error} onRetry={() => void refresh()} />;

  return (
    <div className="mx-auto w-full max-w-[430px] lg:max-w-none">
      <section className="hero-gradient relative overflow-hidden px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-16 text-white">
        <HeroWaves />
        <header className="relative z-10 flex items-center gap-3">
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
        </header>

        <div className="relative z-10 mt-6">
          <p className="text-[13px] leading-none text-white/70">Total Sales</p>
          <p className="display-number mt-2 text-white">{formatCurrency(totalSales)}</p>
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
            <ReceiptText className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="relative z-10 -mt-10 space-y-6 bg-background px-5 pt-2 pb-4">
        <CategoryGrid />
        <FeaturedCard />
      </section>

      <NewBillFlow
        open={billOpen}
        onClose={() => setBillOpen(false)}
        onCreated={(invoiceId) => navigate(`/billing/${invoiceId}`)}
      />
    </div>
  );
}
