import { cn } from "@/lib/cn";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  tone?: "light" | "dark";
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  tone = "light",
}: SegmentedControlProps<T>) {
  const dark = tone === "dark";

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex rounded-full p-1",
        dark ? "bg-white/12" : "border border-border bg-muted",
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold tracking-[-0.01em] transition-colors",
              dark
                ? active
                  ? "bg-highlight text-highlight-foreground"
                  : "text-white/75 hover:text-white"
                : active
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
