import { cn } from "@/lib/cn";
import { FilePlus2, IndianRupee, UserPlus, Wallet } from "lucide-react";

interface QuickActionsProps {
  onNewBill: () => void;
  onPayment: () => void;
  onExpense: () => void;
  onCustomer: () => void;
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
}: QuickActionsProps) {
  const handlers = {
    bill: onNewBill,
    payment: onPayment,
    expense: onExpense,
    customer: onCustomer,
  };

  return (
    <section>
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">Quick Actions</h2>
      <div className="grid grid-cols-4 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.key}
              type="button"
              onClick={handlers[action.key]}
              className={cn(
                "flex flex-col items-center gap-2 rounded-md border px-2 py-3 text-center text-xs font-medium",
                action.primary
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} />
              {action.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
