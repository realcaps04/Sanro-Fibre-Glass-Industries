import { cn } from "@/lib/cn";
import { FilePlus2, IndianRupee, UserPlus, Wallet } from "lucide-react";

interface QuickActionsProps {
  onNewBill: () => void;
  onPayment: () => void;
  onExpense: () => void;
  onCustomer: () => void;
  variant?: "hero" | "tiles";
}

const actions = [
  { key: "bill", label: "New Bill", icon: FilePlus2, primary: true },
  { key: "payment", label: "Payment", icon: IndianRupee, primary: false },
  { key: "expense", label: "Expense", icon: Wallet, primary: false },
  { key: "customer", label: "Customer", icon: UserPlus, primary: false },
] as const;

export function QuickActions({
  onNewBill,
  onPayment,
  onExpense,
  onCustomer,
  variant = "tiles",
}: QuickActionsProps) {
  const handlers = {
    bill: onNewBill,
    payment: onPayment,
    expense: onExpense,
    customer: onCustomer,
  };

  if (variant === "hero") {
    const hero = [
      { key: "payment" as const, label: "Payment" },
      { key: "bill" as const, label: "New Bill", accent: true },
      { key: "expense" as const, label: "Expense" },
    ];
    return (
      <div className="grid grid-cols-3 gap-2">
        {hero.map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={handlers[action.key]}
            className={cn(
              "h-12 rounded-full text-sm font-semibold tracking-[-0.02em]",
              action.accent
                ? "bg-highlight text-highlight-foreground"
                : "bg-white/12 text-white hover:bg-white/18",
            )}
          >
            {action.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <section>
      <h2 className="section-label mb-3">Shortcuts</h2>
      <div className="grid grid-cols-4 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.key}
              type="button"
              onClick={handlers[action.key]}
              className="flex flex-col items-center gap-2 rounded-2xl bg-muted px-2 py-3 text-center"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-foreground">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="text-[11px] font-semibold tracking-[-0.01em]">{action.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
