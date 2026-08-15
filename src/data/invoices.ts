import { calculateBill, statusFromBalances } from "@/lib/calculations";
import { mockProducts } from "@/data/products";
import type { CreateInvoiceInput, Invoice, InvoiceLineItem } from "@/types";

let invoiceSeq = 1033;

function item(
  productId: string,
  name: string,
  sku: string,
  quantity: number,
  rate: number,
): InvoiceLineItem {
  const product = mockProducts.find((entry) => entry.id === productId);
  return {
    productId,
    name,
    sku,
    quantity,
    rate,
    amount: quantity * rate,
    hsnCode: product?.hsnCode,
    gstRate: product?.gstRate ?? 0.18,
  };
}

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

export const dummyInvoiceIds = [
  "inv_1044",
  "inv_1043",
  "inv_1042",
  "inv_1041",
  "inv_1040",
  "inv_1039",
  "inv_1038",
  "inv_1037",
  "inv_1036",
  "inv_1035",
  "inv_1034",
  "inv_1033",
];

export const seedInvoiceIds = ["inv_1045", "inv_1046"];

export const mockInvoices: Invoice[] = [
  buildInvoice({
    id: "inv_1045",
    number: "INV-1045",
    customerId: "cus_edison",
    customerName: "Edison Biju",
    date: "2026-08-15T18:42:00+05:30",
    createdAt: "2026-08-15T18:42:00+05:30",
    items: [
      item("prd_fibre", "Fibre Panel Door", "SD-004", 1, 9800),
      item("prd_handle", "Door Handle Set", "SD-009", 1, 1850),
    ],
    discount: 0,
    taxRate: 0.18,
    amountPaid: 13747,
    paymentMethod: "upi",
    billKind: "doors",
  }),
  buildInvoice({
    id: "inv_1046",
    number: "INV-1046",
    customerId: "cus_edison",
    customerName: "Edison Biju",
    date: "2026-08-15T17:15:00+05:30",
    createdAt: "2026-08-15T17:15:00+05:30",
    items: [
      item("prd_wp_coat", "Fibre Waterproof Coating", "SD-015", 2, 1850),
      item("prd_wp_sheet", "Waterproof Membrane Sheet", "SD-016", 1, 4200),
    ],
    discount: 0,
    taxRate: 0.18,
    amountPaid: 9322,
    paymentMethod: "upi",
    billKind: "waterproofing",
  }),
];

invoiceSeq = 1047;

export function nextInvoiceNumber(prefix: string, existing: Invoice[]): string {
  const numbers = existing
    .map((invoice) => Number(invoice.number.replace(/\D/g, "")))
    .filter((value) => Number.isFinite(value));
  const next = numbers.length ? Math.max(...numbers) + 1 : invoiceSeq;
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
