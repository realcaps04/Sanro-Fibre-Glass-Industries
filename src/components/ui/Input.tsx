import { cn } from "@/lib/cn";
import { type InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md border border-border bg-card px-3 text-[15px] text-foreground",
        "placeholder:text-muted-foreground disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
