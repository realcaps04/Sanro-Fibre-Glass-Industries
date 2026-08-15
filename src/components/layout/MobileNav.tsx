import { isNavActive, navItems } from "@/components/layout/nav";
import { cn } from "@/lib/cn";
import { NavLink, useLocation } from "react-router-dom";

export function MobileNav() {
  const location = useLocation();
  const items = navItems.filter((item) => item.mobile);
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => isNavActive(location.pathname, item.to)),
  );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 px-5 pb-[max(0.9rem,env(safe-area-inset-bottom))] print:hidden lg:hidden"
      aria-label="Primary"
    >
      <ul className="nav-gradient relative mx-auto flex h-[64px] max-w-md items-center rounded-full px-2">
        <span
          aria-hidden
          className="nav-indicator pointer-events-none absolute inset-y-0 left-2"
          style={{
            width: `calc((100% - 1rem) / ${items.length})`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
        {items.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(location.pathname, item.to);
          return (
            <li key={item.to} className="relative z-10 flex-1">
              <NavLink
                to={item.to}
                className={cn(
                  "nav-link relative flex h-12 w-full items-center justify-center rounded-full",
                  active ? "text-highlight" : "text-white/62",
                )}
              >
                <Icon
                  className={cn("nav-icon h-5 w-5", active && "nav-icon-active")}
                  strokeWidth={active ? 2.2 : 1.7}
                />
                <span className="sr-only">{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
