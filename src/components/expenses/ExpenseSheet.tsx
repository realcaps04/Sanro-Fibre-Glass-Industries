import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Overlay } from "@/components/ui/Overlay";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { expenseCategoryLabel } from "@/lib/labels";
import { toISODate } from "@/lib/dates";
import type { CreateExpenseInput, ExpenseCategory, PaymentMethod } from "@/types";
import { useState } from "react";

interface ExpenseSheetProps {
  open: boolean;
  onClose: () => void;
}

const categories = Object.keys(expenseCategoryLabel) as ExpenseCategory[];

export function ExpenseSheet({ open, onClose }: ExpenseSheetProps) {
  const { addExpense } = useData();
  const { toast } = useToast();
  const [form, setForm] = useState<CreateExpenseInput>({
    category: "transport",
    amount: 0,
    date: new Date().toISOString(),
    paymentMethod: "cash",
    description: "",
    vendor: "",
  });
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(toISODate());
  const [submitting, setSubmitting] = useState(false);

  const close = () => {
    onClose();
    setAmount("");
    setDate(toISODate());
  };

  const submit = async () => {
    const value = Number(amount);
    if (!value || !form.description.trim()) return;
    setSubmitting(true);
    try {
      await addExpense({
        ...form,
        amount: value,
        date: new Date(`${date}T12:00:00`).toISOString(),
      });
      toast("Expense added", "success");
      close();
    } catch {
      toast("Unable to add expense", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Overlay open={open} onClose={close} title="Add Expense">
      <div className="space-y-4">
        <div>
          <Label htmlFor="exp-category">Category</Label>
          <Select
            id="exp-category"
            value={form.category}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                category: event.target.value as ExpenseCategory,
              }))
            }
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {expenseCategoryLabel[category]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="exp-amount">Amount</Label>
          <Input
            id="exp-amount"
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="exp-date">Date</Label>
          <Input
            id="exp-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="exp-method">Payment method</Label>
          <Select
            id="exp-method"
            value={form.paymentMethod}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                paymentMethod: event.target.value as Exclude<PaymentMethod, "credit">,
              }))
            }
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank">Bank</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="exp-vendor">Vendor</Label>
          <Input
            id="exp-vendor"
            value={form.vendor ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, vendor: event.target.value }))
            }
            placeholder="Optional"
          />
        </div>
        <div>
          <Label htmlFor="exp-desc">Description</Label>
          <Textarea
            id="exp-desc"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="What is this expense for?"
          />
        </div>
        <Button
          fullWidth
          onClick={() => void submit()}
          disabled={submitting || !amount || !form.description.trim()}
        >
          Add Expense
        </Button>
      </div>
    </Overlay>
  );
}
