import {
  ArrowLeftRight,
  BarChart3,
  FileText,
  Home,
  LayoutGrid,
  Package,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  mobile?: boolean;
  mobileOnly?: boolean;
  desktop?: boolean;
  more?: boolean;
}

export const navItems: NavItem[] = [
  { to: "/", label: "Home", icon: Home, mobile: true, desktop: true },
  { to: "/billing", label: "Billing", icon: FileText, mobile: true, desktop: true },
  {
    to: "/transactions",
    label: "Transactions",
    icon: ArrowLeftRight,
    mobile: true,
    desktop: true,
  },
  { to: "/customers", label: "Customers", icon: Users, mobile: true, desktop: true },
  { to: "/products", label: "Products", icon: Package, desktop: true, more: true },
  { to: "/expenses", label: "Expenses", icon: Wallet, desktop: true, more: true },
  { to: "/reports", label: "Reports", icon: BarChart3, desktop: true, more: true },
  { to: "/more", label: "More", icon: LayoutGrid, mobile: true, mobileOnly: true },
];

export const settingsItem: NavItem = {
  to: "/settings",
  label: "Settings",
  icon: Settings,
  desktop: true,
  more: true,
};

export function isNavActive(pathname: string, to: string): boolean {
  if (to === "/") return pathname === "/";
  if (to === "/more") {
    return ["/products", "/expenses", "/reports", "/settings"].some((path) =>
      pathname.startsWith(path),
    );
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}
