import { cn } from "@/lib/cn";
import { type SelectHTMLAttributes } from "react";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-md border border-border bg-card px-3 text-[15px] text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
