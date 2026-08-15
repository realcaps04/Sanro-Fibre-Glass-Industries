import { formatCurrency, formatCurrencySigned } from "@/lib/currency";
import { cn } from "@/lib/cn";

interface AmountProps {
  value: number;
  signed?: boolean;
  className?: string;
  tone?: "default" | "in" | "out";
}

export function Amount({ value, signed, className, tone = "default" }: AmountProps) {
  return (
    <span
      className={cn(
        "font-medium tabular-nums tracking-tight",
        tone === "in" && "text-foreground",
        tone === "out" && "text-muted-foreground",
        className,
      )}
    >
      {signed ? formatCurrencySigned(value) : formatCurrency(value)}
    </span>
  );
}
