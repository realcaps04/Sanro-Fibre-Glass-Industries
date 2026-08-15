import { calculateBill, statusFromBalances } from "@/lib/calculations";
import type { CreateInvoiceInput, Invoice, InvoiceLineItem } from "@/types";

let invoiceSeq = 1033;

function item(
  productId: string,
  name: string,
  sku: string,
  quantity: number,
  rate: number,
): InvoiceLineItem {
  return { productId, name, sku, quantity, rate, amount: quantity * rate };
}

function buildInvoice(
  input: Omit<Invoice, "subtotal" | "tax" | "grandTotal" | "balance" | "status"> & {
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

export const mockInvoices: Invoice[] = [
  buildInvoice({
    id: "inv_1045",
    number: "INV-1045",
    customerId: "cus_abc",
    customerName: "ABC Interiors",
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
    notes: "Site delivery to MG Road showroom.",
  }),
  buildInvoice({
    id: "inv_1044",
    number: "INV-1044",
    customerId: "cus_john",
    customerName: "John Builders",
    date: "2026-08-15T16:20:00+05:30",
    createdAt: "2026-08-15T16:20:00+05:30",
    items: [item("prd_upvc", "UPVC Window", "SD-006", 1, 8750)],
    discount: 0,
    taxRate: 0.18,
    amountPaid: 10325,
    paymentMethod: "cash",
  }),
  buildInvoice({
    id: "inv_1043",
    number: "INV-1043",
    customerId: "cus_malabar",
    customerName: "Malabar Homes",
    date: "2026-08-15T14:10:00+05:30",
    createdAt: "2026-08-15T14:10:00+05:30",
    items: [item("prd_sliding", "Sliding Glass Door", "SD-005", 1, 28900)],
    discount: 0,
    taxRate: 0.18,
    amountPaid: 34102,
    paymentMethod: "bank",
  }),
  buildInvoice({
    id: "inv_1042",
    number: "INV-1042",
    customerId: "cus_greenleaf",
    customerName: "Greenleaf Interiors",
    date: "2026-08-15T11:30:00+05:30",
    createdAt: "2026-08-15T11:30:00+05:30",
    items: [
      item("prd_teak", "Classic Teak Door", "SD-001", 2, 18500),
      item("prd_handle", "Door Handle Set", "SD-009", 2, 1850),
    ],
    discount: 2500,
    taxRate: 0.18,
    amountPaid: 0,
    paymentMethod: "credit",
  }),
  buildInvoice({
    id: "inv_1041",
    number: "INV-1041",
    customerId: "cus_xyz",
    customerName: "XYZ Constructions",
    date: "2026-08-14T17:05:00+05:30",
    createdAt: "2026-08-14T17:05:00+05:30",
    items: [
      item("prd_aluminium", "Aluminium Window", "SD-007", 2, 6400),
      item("prd_french", "French Window", "SD-008", 1, 11200),
    ],
    discount: 0,
    taxRate: 0.18,
    amountPaid: 0,
    paymentMethod: "credit",
  }),
  buildInvoice({
    id: "inv_1040",
    number: "INV-1040",
    customerId: "cus_horizon",
    customerName: "Horizon Builders",
    date: "2026-08-13T12:48:00+05:30",
    createdAt: "2026-08-13T12:48:00+05:30",
    items: [
      item("prd_flush", "Premium Flush Door", "SD-002", 1, 24500),
      item("prd_lock", "Digital Door Lock", "SD-010", 1, 9200),
    ],
    discount: 0,
    taxRate: 0.18,
    amountPaid: 39766,
    paymentMethod: "upi",
  }),
  buildInvoice({
    id: "inv_1039",
    number: "INV-1039",
    customerId: "cus_prestige",
    customerName: "Prestige Contractors",
    date: "2026-08-12T10:15:00+05:30",
    createdAt: "2026-08-12T10:15:00+05:30",
    items: [item("prd_main", "Designer Main Door", "SD-003", 2, 32000)],
    discount: 4000,
    taxRate: 0.18,
    amountPaid: 40000,
    paymentMethod: "bank",
  }),
  buildInvoice({
    id: "inv_1038",
    number: "INV-1038",
    customerId: "cus_royal",
    customerName: "Royal Wood Works",
    date: "2026-08-11T15:22:00+05:30",
    createdAt: "2026-08-11T15:22:00+05:30",
    items: [
      item("prd_bath", "Bathroom Fibre Door", "SD-013", 1, 7200),
      item("prd_closer", "Door Closer", "SD-011", 1, 1450),
    ],
    discount: 0,
    taxRate: 0.18,
    amountPaid: 10207,
    paymentMethod: "cash",
  }),
  buildInvoice({
    id: "inv_1037",
    number: "INV-1037",
    customerId: "cus_abc",
    customerName: "ABC Interiors",
    date: "2026-08-08T11:05:00+05:30",
    createdAt: "2026-08-08T11:05:00+05:30",
    items: [
      item("prd_teak", "Classic Teak Door", "SD-001", 1, 18500),
      item("prd_lock", "Digital Door Lock", "SD-010", 1, 9200),
    ],
    discount: 0,
    taxRate: 0.18,
    amountPaid: 0,
    paymentMethod: "credit",
  }),
  buildInvoice({
    id: "inv_1036",
    number: "INV-1036",
    customerId: "cus_john",
    customerName: "John Builders",
    date: "2026-08-05T09:40:00+05:30",
    createdAt: "2026-08-05T09:40:00+05:30",
    items: [item("prd_upvc", "UPVC Window", "SD-006", 2, 8750)],
    discount: 0,
    taxRate: 0.18,
    amountPaid: 20650,
    paymentMethod: "upi",
  }),
  buildInvoice({
    id: "inv_1035",
    number: "INV-1035",
    customerId: "cus_xyz",
    customerName: "XYZ Constructions",
    date: "2026-07-28T16:18:00+05:30",
    createdAt: "2026-07-28T16:18:00+05:30",
    items: [item("prd_fibre", "Fibre Panel Door", "SD-004", 3, 9800)],
    discount: 0,
    taxRate: 0.18,
    amountPaid: 34692,
    paymentMethod: "bank",
  }),
  buildInvoice({
    id: "inv_1034",
    number: "INV-1034",
    customerId: "cus_malabar",
    customerName: "Malabar Homes",
    date: "2026-07-20T13:00:00+05:30",
    createdAt: "2026-07-20T13:00:00+05:30",
    items: [item("prd_flush", "Premium Flush Door", "SD-002", 1, 24500)],
    discount: 0,
    taxRate: 0.18,
    amountPaid: 0,
    paymentMethod: "credit",
    cancelled: true,
  }),
  buildInvoice({
    id: "inv_1033",
    number: "INV-1033",
    customerId: "cus_prestige",
    customerName: "Prestige Contractors",
    date: "2026-08-01T10:12:00+05:30",
    createdAt: "2026-08-01T10:12:00+05:30",
    items: [
      item("prd_sliding", "Sliding Glass Door", "SD-005", 1, 28900),
      item("prd_handle", "Door Handle Set", "SD-009", 1, 1850),
    ],
    discount: 0,
    taxRate: 0.18,
    amountPaid: 36285,
    paymentMethod: "upi",
  }),
];

invoiceSeq = 1046;

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
