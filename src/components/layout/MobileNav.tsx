import { isNavActive, navItems } from "@/components/layout/nav";
import { cn } from "@/lib/cn";
import { NavLink, useLocation } from "react-router-dom";

export function MobileNav() {
  const location = useLocation();
  const items = navItems.filter((item) => item.mobile);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 px-5 pb-[max(0.9rem,env(safe-area-inset-bottom))] print:hidden lg:hidden"
      aria-label="Primary"
    >
      <ul className="nav-gradient mx-auto flex h-[64px] max-w-md items-center justify-around rounded-full px-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(location.pathname, item.to);
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={cn(
                  "relative flex h-12 w-12 items-center justify-center rounded-full",
                  active ? "text-highlight" : "text-white/72",
                )}
              >
                {active ? (
                  <span className="nav-active-glow pointer-events-none absolute inset-[-6px] rounded-full" />
                ) : null}
                <Icon className="relative h-5 w-5" strokeWidth={active ? 2.2 : 1.7} />
                <span className="sr-only">{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
