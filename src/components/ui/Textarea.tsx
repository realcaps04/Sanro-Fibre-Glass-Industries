import { cn } from "@/lib/cn";
import { type TextareaHTMLAttributes } from "react";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-md border border-border bg-card px-3 py-2.5 text-[15px] text-foreground",
        "placeholder:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
