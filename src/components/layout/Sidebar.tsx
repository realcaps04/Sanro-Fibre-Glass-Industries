import { BrandMark } from "@/components/layout/BrandMark";
import { isNavActive, navItems, settingsItem } from "@/components/layout/nav";
import { useData } from "@/context/DataContext";
import { cn } from "@/lib/cn";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useData();
  const location = useLocation();
  const desktopItems = navItems.filter((item) => item.desktop);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col hero-gradient text-sidebar-foreground print:hidden lg:flex",
        sidebarCollapsed ? "w-[72px]" : "w-[232px]",
      )}
    >
      <div className={cn("flex h-16 items-center px-3", sidebarCollapsed && "justify-center px-2")}>
        <BrandMark compact={sidebarCollapsed} inverted />
      </div>
      <div className="mx-4 h-px bg-white/10" />
      <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Primary">
        {desktopItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              className={({ isActive }) => {
                const active = isActive || isNavActive(location.pathname, item.to);
                return cn(
                  "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium",
                  sidebarCollapsed && "justify-center px-0",
                  active
                    ? "bg-white/8 text-sidebar-active"
                    : "text-sidebar-muted hover:bg-white/6 hover:text-sidebar-foreground",
                );
              }}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px]",
                      isActive || isNavActive(location.pathname, item.to)
                        ? "text-sidebar-active"
                        : "",
                    )}
                    strokeWidth={1.75}
                  />
                  {!sidebarCollapsed ? <span>{item.label}</span> : (
                    <span className="sr-only">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-3">
        <div className="mb-2 h-px bg-white/10" />
        <NavLink
          to={settingsItem.to}
          title={settingsItem.label}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium",
              sidebarCollapsed && "justify-center px-0",
              isActive
                ? "bg-white/8 text-sidebar-active"
                : "text-sidebar-muted hover:bg-white/6 hover:text-sidebar-foreground",
            )
          }
        >
          <settingsItem.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
          {!sidebarCollapsed ? <span>{settingsItem.label}</span> : (
            <span className="sr-only">{settingsItem.label}</span>
          )}
        </NavLink>
        <button
          type="button"
          className={cn(
            "mt-1 flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm text-sidebar-muted hover:bg-white/6 hover:text-sidebar-foreground",
            sidebarCollapsed && "justify-center px-0",
          )}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronsLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
