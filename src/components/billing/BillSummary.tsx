import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { formatCurrency } from "@/lib/currency";
import { paymentLabel } from "@/lib/labels";
import { cn } from "@/lib/cn";
import type { BillTotals, PaymentMethod } from "@/types";

interface BillSummaryProps {
  totals: BillTotals;
  discount: number;
  onDiscountChange: (value: number) => void;
  taxRate: number;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (value: PaymentMethod) => void;
  amountPaid: number;
  onAmountPaidChange: (value: number) => void;
  enabledMethods: PaymentMethod[];
  onGenerate: () => void;
  generating?: boolean;
  disabled?: boolean;
}

export function BillSummary({
  totals,
  discount,
  onDiscountChange,
  taxRate,
  paymentMethod,
  onPaymentMethodChange,
  amountPaid,
  onAmountPaidChange,
  enabledMethods,
  onGenerate,
  generating,
  disabled,
}: BillSummaryProps) {
  const gstHalf = Math.round(taxRate * 50);
  const rows =
    taxRate > 0
      ? [
          { label: "Subtotal", value: totals.subtotal },
          { label: "Taxable value", value: totals.taxableAmount },
          { label: `CGST (${gstHalf}%)`, value: totals.cgst },
          { label: `SGST (${gstHalf}%)`, value: totals.sgst },
          { label: "Total", value: totals.grandTotal, emphasis: true },
          { label: "Balance", value: totals.balance },
        ]
      : [
          { label: "Subtotal", value: totals.subtotal },
          { label: "Total", value: totals.grandTotal, emphasis: true },
          { label: "Balance", value: totals.balance },
        ];

  return (
    <section className="elevated rounded-lg p-4">
      <h2 className="mb-4 text-sm font-medium text-muted-foreground">Invoice Summary</h2>
      <div className="space-y-3 text-sm">
        {rows.slice(0, 1).map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="tabular-nums">{formatCurrency(row.value)}</span>
          </div>
        ))}
        <div>
          <Label htmlFor="discount">Discount</Label>
          <Input
            id="discount"
            inputMode="numeric"
            value={discount || ""}
            onChange={(event) => onDiscountChange(Number(event.target.value) || 0)}
            placeholder="0"
          />
        </div>
        {rows.slice(1).map((row) => (
          <div
            key={row.label}
            className={cn(
              "flex items-center justify-between",
              row.emphasis && "border-t border-border pt-3 text-base font-semibold",
            )}
          >
            <span className={row.emphasis ? "text-foreground" : "text-muted-foreground"}>
              {row.label}
            </span>
            <span className="tabular-nums">{formatCurrency(row.value)}</span>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <p className="mb-2 text-sm font-medium">Payment</p>
        <div className="grid grid-cols-3 gap-2">
          {enabledMethods.filter((method) => method !== "credit").map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => onPaymentMethodChange(method)}
              className={cn(
                "rounded-md border px-2 py-2 text-sm font-medium",
                paymentMethod === method
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground",
              )}
            >
              {paymentLabel[method]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <Label htmlFor="amount-paid">Amount paid (optional)</Label>
        <Input
          id="amount-paid"
          inputMode="numeric"
          value={amountPaid || ""}
          onChange={(event) => onAmountPaidChange(Number(event.target.value) || 0)}
          placeholder="0"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Leave as 0 to collect payment later.
        </p>
      </div>

      <Button
        className="mt-5"
        fullWidth
        size="lg"
        disabled={disabled || generating}
        onClick={onGenerate}
      >
        Generate Invoice
      </Button>
    </section>
  );
}
