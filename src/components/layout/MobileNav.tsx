import { isNavActive, navItems } from "@/components/layout/nav";
import { cn } from "@/lib/cn";
import { NavLink, useLocation } from "react-router-dom";

export function MobileNav() {
  const location = useLocation();
  const items = navItems.filter((item) => item.mobile);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] print:hidden lg:hidden"
      aria-label="Primary"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 rounded-full bg-nav px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(location.pathname, item.to);
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={cn(
                  "flex h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[10px] font-semibold tracking-[-0.01em]",
                  active ? "bg-white/12 text-highlight" : "text-white/70",
                )}
              >
                <Icon
                  className="h-[18px] w-[18px]"
                  strokeWidth={active ? 2.2 : 1.7}
                />
                <span>{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
