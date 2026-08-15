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
    <div className="flex items-center gap-2.5">
      <svg
        viewBox="0 0 32 32"
        className="h-8 w-8 shrink-0"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="7" fill={inverted ? "#C4A574" : "#2C4A3E"} />
        <rect
          x="9"
          y="6"
          width="14"
          height="20"
          rx="1.2"
          fill="none"
          stroke={inverted ? "#171916" : "#C4A574"}
          strokeWidth="1.6"
        />
        <path
          d="M16 6v20"
          stroke={inverted ? "#171916" : "#C4A574"}
          strokeWidth="1.2"
          opacity="0.7"
        />
        <circle cx="20.2" cy="16.5" r="1.05" fill={inverted ? "#171916" : "#C4A574"} />
      </svg>
      {compact ? (
        <span className="sr-only">{brandConfig.businessName}</span>
      ) : (
        <div className="min-w-0 leading-tight">
          <p
            className={cn(
              "truncate text-[15px] font-semibold tracking-tight",
              inverted ? "text-sidebar-foreground" : "text-foreground",
            )}
          >
            {brandConfig.businessName}
          </p>
          <p
            className={cn(
              "text-[11px] tracking-wide uppercase",
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
