import { isNavActive, navItems } from "@/components/layout/nav";
import { cn } from "@/lib/cn";
import { NavLink, useLocation } from "react-router-dom";

export function MobileNav() {
  const location = useLocation();
  const items = navItems.filter((item) => item.mobile);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-nav safe-bottom print:hidden lg:hidden"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(location.pathname, item.to);
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon
                  className="h-[18px] w-[18px]"
                  strokeWidth={active ? 2.1 : 1.7}
                />
                {item.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
