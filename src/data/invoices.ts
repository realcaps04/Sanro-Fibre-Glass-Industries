import { calculateBill, statusFromBalances } from "@/lib/calculations";
import type { CreateInvoiceInput, Invoice } from "@/types";

function buildInvoice(
  input: Omit<Invoice, "subtotal" | "tax" | "taxableAmount" | "cgst" | "sgst" | "grandTotal" | "balance" | "status"> & {
    cancelled?: boolean;
  },
): Invoice {
  const totals = calculateBill({
    items: input.items,
    discount: input.discount,
    taxRate: input.taxRate,
    amountPaid: input.amountPaid,
  });
  return {
    ...input,
    ...totals,
    status: statusFromBalances(totals.amountPaid, totals.grandTotal, input.cancelled),
  };
}

export function nextInvoiceNumber(prefix: string, existing: Invoice[]): string {
  const numbers = existing
    .map((invoice) => Number(invoice.number.replace(/\D/g, "")))
    .filter((value) => Number.isFinite(value));
  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return `${prefix}${next}`;
}

export function fromCreateInput(
  id: string,
  number: string,
  input: CreateInvoiceInput,
): Invoice {
  const date = input.date ?? new Date().toISOString();
  return buildInvoice({
    id,
    number,
    customerId: input.customerId,
    customerName: input.customerName,
    date,
    createdAt: date,
    items: input.items.map((line) => ({
      ...line,
      amount: line.quantity * line.rate,
    })),
    discount: input.discount,
    taxRate: input.taxRate,
    amountPaid: input.amountPaid,
    paymentMethod: input.paymentMethod,
    notes: input.notes,
    billKind: input.billKind,
  });
}
