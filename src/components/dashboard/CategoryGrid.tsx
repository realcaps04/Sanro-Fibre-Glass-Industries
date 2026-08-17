import {
  AnyBillLogo,
  CustomersLogo,
  DoorBillsLogo,
  EstimateLogo,
  PaymentsLogo,
  ProductsLogo,
  ReportsLogo,
  WaterproofingLogo,
} from "@/components/dashboard/categoryLogos";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const categories: Array<{
  to: string;
  label: string;
  logo: ReactNode;
}> = [
  { to: "/billing", label: "Door Bills", logo: <DoorBillsLogo /> },
  { to: "/waterproofing-bills", label: "Water proofing", logo: <WaterproofingLogo /> },
  { to: "/any-bills?new=1", label: "Any Bill", logo: <AnyBillLogo /> },
  { to: "/payments", label: "Payments", logo: <PaymentsLogo /> },
  { to: "/customers", label: "Customers", logo: <CustomersLogo /> },
  { to: "/products", label: "Products", logo: <ProductsLogo /> },
  { to: "/reports", label: "Reports", logo: <ReportsLogo /> },
  { to: "/estimates", label: "Estimate", logo: <EstimateLogo /> },
];

export function CategoryGrid() {
  return (
    <section>
      <h2 className="mb-4 text-[17px] font-semibold tracking-[-0.03em]">Categories</h2>
      <div className="grid grid-cols-4 gap-x-3 gap-y-4">
        {categories.map((item) => (
          <Link key={item.label} to={item.to} className="flex flex-col items-center gap-2">
            <span className="flex h-14 w-14 overflow-hidden rounded-[18px] shadow-[0_10px_24px_rgb(0_63_52/0.12)]">
              {item.logo}
            </span>
            <span className="text-center text-[11px] leading-tight font-semibold tracking-[-0.02em] text-foreground">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
