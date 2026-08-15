import {
  BarChart3,
  ClipboardPen,
  Droplets,
  FileText,
  IndianRupee,
  Package,
  Receipt,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

const categories: Array<{
  to?: string;
  action?: "payment";
  label: string;
  icon: LucideIcon;
}> = [
  { to: "/billing", label: "Door Bills", icon: FileText },
  { to: "/waterproofing-bills", label: "Water proofing", icon: Droplets },
  { action: "payment", label: "Payments", icon: IndianRupee },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/products", label: "Products", icon: Package },
  { to: "/non-gst-bills", label: "Non GST Bills", icon: Receipt },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/estimates", label: "Estimate", icon: ClipboardPen },
];

export function CategoryGrid({ onPayment }: { onPayment: () => void }) {
  return (
    <section>
      <h2 className="mb-4 text-[17px] font-semibold tracking-[-0.03em]">Categories</h2>
      <div className="grid grid-cols-4 gap-x-3 gap-y-4">
        {categories.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-white text-foreground shadow-[0_10px_24px_rgb(0_63_52/0.08)]">
                <Icon className="h-5 w-5" strokeWidth={1.7} />
              </span>
              <span className="text-center text-[11px] leading-tight font-semibold tracking-[-0.02em] text-foreground">
                {item.label}
              </span>
            </>
          );

          if (item.action === "payment") {
            return (
              <button
                key={item.label}
                type="button"
                onClick={onPayment}
                className="flex flex-col items-center gap-2"
              >
                {content}
              </button>
            );
          }

          return (
            <Link key={item.label} to={item.to ?? "/"} className="flex flex-col items-center gap-2">
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
