import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border rounded-md border border-border bg-card">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div>
      <div className="bg-primary px-5 pt-5 pb-14 lg:rounded-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-2xl bg-white/20" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24 bg-white/20" />
              <Skeleton className="h-5 w-32 bg-white/20" />
            </div>
          </div>
          <Skeleton className="h-10 w-10 rounded-2xl bg-white/20" />
        </div>
        <Skeleton className="mt-8 h-10 w-48 bg-white/20" />
        <Skeleton className="mt-6 h-12 w-full rounded-full bg-white/20" />
      </div>
      <div className="-mt-8 space-y-5 rounded-t-[28px] bg-background px-5 pt-6">
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-24 w-full rounded-lg" />
        <ListSkeleton rows={4} />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-11 w-full" />
      <ListSkeleton rows={6} />
    </div>
  );
}
