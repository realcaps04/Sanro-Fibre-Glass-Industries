import { brandConfig } from "@/brand/config";
import { cn } from "@/lib/cn";

export function BrandMark({
  compact = false,
  inverted = false,
}: {
  compact?: boolean;
  inverted?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={brandConfig.logo}
        alt=""
        className={cn(
          "shrink-0 bg-white object-contain shadow-[0_8px_18px_rgb(0_0_0/0.16)]",
          compact ? "h-9 w-9 rounded-xl" : "h-11 w-11 rounded-2xl",
        )}
      />
      {compact ? (
        <span className="sr-only">{brandConfig.businessName}</span>
      ) : (
        <div className="min-w-0 leading-tight">
          <p
            className={cn(
              "truncate text-[15px] font-semibold tracking-[-0.03em]",
              inverted ? "text-sidebar-foreground" : "text-foreground",
            )}
          >
            {brandConfig.businessName}
          </p>
          <p
            className={cn(
              "mt-0.5 truncate text-[10px] font-medium tracking-[0.14em] uppercase",
              inverted ? "text-sidebar-muted" : "text-muted-foreground",
            )}
          >
            {brandConfig.tagline}
          </p>
        </div>
      )}
    </div>
  );
}
