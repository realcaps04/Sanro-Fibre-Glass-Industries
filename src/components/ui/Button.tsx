import { cn } from "@/lib/cn";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  icon?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-[linear-gradient(180deg,#0b5c4d_0%,#003f34_100%)] text-primary-foreground shadow-[var(--shadow-button)] hover:opacity-92 disabled:opacity-50",
  secondary:
    "bg-secondary text-secondary-foreground shadow-[var(--shadow-soft)] hover:opacity-92 disabled:opacity-50",
  ghost:
    "bg-transparent text-foreground hover:bg-muted disabled:opacity-50",
  outline:
    "border border-border bg-card text-foreground shadow-[var(--shadow-soft)] hover:bg-muted disabled:opacity-50",
  danger:
    "bg-danger text-danger-foreground shadow-[var(--shadow-soft)] hover:opacity-92 disabled:opacity-50",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-[15px]",
  lg: "h-12 px-5 text-[15px] font-medium",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  icon,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.02em] transition-opacity active:opacity-80",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
