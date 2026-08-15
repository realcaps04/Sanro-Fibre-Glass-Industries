import { UpdatePrompt } from "@/components/update/UpdatePrompt";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { ToastViewport } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";

const hideMobileNav = ["/billing/new"];

export function AppShell() {
  const location = useLocation();
  const showMobileNav = !hideMobileNav.some((path) => location.pathname.startsWith(path));
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-dvh bg-background lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
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
          <Suspense fallback={<PageSkeleton />}>
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
