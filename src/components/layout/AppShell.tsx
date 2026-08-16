import { UpdatePrompt } from "@/components/update/UpdatePrompt";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { ToastViewport } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

const hideMobileNav = ["/billing/new"];

export function AppShell() {
  const location = useLocation();
  const showMobileNav = !hideMobileNav.some((path) => location.pathname.startsWith(path));
  const isHome = location.pathname === "/";
  const isReports = location.pathname === "/reports";

  useEffect(() => {
    if (!isReports) return;
    const roots = [document.documentElement, document.body];
    roots.forEach((el) => el.classList.add("no-scrollbar"));
    return () => {
      roots.forEach((el) => el.classList.remove("no-scrollbar"));
    };
  }, [isReports]);

  return (
    <div className={cn("min-h-dvh bg-background lg:flex", isReports && "h-dvh overflow-hidden")}>
      <Sidebar />
      <div
        className={cn("min-w-0 flex-1", isReports && "h-dvh min-h-0 overflow-y-auto no-scrollbar")}
      >
        <main
          className={cn(
            "mx-auto w-full max-w-6xl",
            isHome
              ? cn("px-0 py-0", showMobileNav ? "pb-nav lg:pb-8" : "pb-6 lg:pb-8", "lg:px-8 lg:py-8")
              : cn(
                  "px-4 py-5",
                  showMobileNav ? "pb-nav lg:pb-8" : "pb-6 lg:pb-8",
                  "lg:px-8 lg:py-8",
                ),
          )}
        >
          <Suspense fallback={<SplashScreen />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      {showMobileNav ? <MobileNav /> : null}
      <UpdatePrompt />
      <ToastViewport />
    </div>
  );
}
