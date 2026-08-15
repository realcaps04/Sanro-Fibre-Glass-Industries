export function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[430px]">
      <div className="hero-gradient px-5 pt-6 pb-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full bg-white/20" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24 bg-white/20" />
              <Skeleton className="h-5 w-32 bg-white/20" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-11 w-11 rounded-full bg-white/20" />
            <Skeleton className="h-11 w-11 rounded-full bg-white/20" />
          </div>
        </div>
        <Skeleton className="mt-10 h-4 w-24 bg-white/20" />
        <Skeleton className="mt-3 h-10 w-48 bg-white/20" />
        <div className="mt-8 flex gap-2">
          <Skeleton className="h-12 flex-1 rounded-full bg-white/20" />
          <Skeleton className="h-12 flex-1 rounded-full bg-white/20" />
          <Skeleton className="h-12 w-12 rounded-full bg-white/20" />
        </div>
      </div>
      <div className="-mt-10 space-y-6 rounded-t-[36px] bg-[#f0f7f4] px-5 pt-7">
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-[18px]" />
          ))}
        </div>
        <Skeleton className="h-40 w-full rounded-[24px]" />
      </div>
    </div>
  );
}