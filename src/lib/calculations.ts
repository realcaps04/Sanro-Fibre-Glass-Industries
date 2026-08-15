import type { BillTotals, InvoiceLineItem, InvoiceStatus } from "@/types";

export interface BillInput {
  items: Pick<InvoiceLineItem, "quantity" | "rate">[];
  discount?: number;
  taxRate?: number;
  amountPaid?: number;
}

export function calculateBill(input: BillInput): BillTotals {
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0,
  );
  const discount = Math.min(Math.max(input.discount ?? 0, 0), subtotal);
  const taxableAmount = Math.max(0, subtotal - discount);
  const taxRate = input.taxRate ?? 0.18;
  const tax = Math.round(taxableAmount * taxRate);
  const grandTotal = taxableAmount + tax;
  const amountPaid = Math.max(0, input.amountPaid ?? 0);
  const balance = Math.max(0, grandTotal - amountPaid);

  return {
    subtotal,
    discount,
    taxableAmount,
    tax,
    grandTotal,
    amountPaid: Math.min(amountPaid, grandTotal),
    balance,
  };
}

export function lineAmount(quantity: number, rate: number): number {
  return quantity * rate;
}

export function statusFromBalances(
  amountPaid: number,
  grandTotal: number,
  cancelled = false,
): InvoiceStatus {
  if (cancelled) return "cancelled";
  if (grandTotal <= 0 || amountPaid >= grandTotal) return "paid";
  if (amountPaid > 0) return "partial";
  return "pending";
}
