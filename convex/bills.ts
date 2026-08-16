import type { MutationCtx, QueryCtx } from "./_generated/server";
import { billTotals, statusFromBalances } from "./totals";

type BillTable = "Door_Bills" | "Non_Gst_Bills" | "Estimate";

type BillWrite = {
  customerId: string;
  customerName: string;
  items: Array<{
    productId: string;
    name: string;
    sku: string;
    quantity: number;
    rate: number;
    amount: number;
    hsnCode?: string;
    gstRate?: number;
    taxableAmount?: number;
    tax?: number;
  }>;
  discount: number;
  taxRate: number;
  amountPaid: number;
  paymentMethod: "cash" | "upi" | "bank" | "credit";
  notes?: string;
  date?: string;
  billKind?: "doors" | "waterproofing" | "mixed";
  prefix?: string;
};

export function productsUsed(items: Array<{ name: string; quantity: number }>) {
  return items
    .map((item) => (item.quantity > 1 ? `${item.name} × ${item.quantity}` : item.name))
    .join(", ");
}

export async function nextBillNumber(
  ctx: QueryCtx | MutationCtx,
  tables: BillTable[],
  prefix: string,
) {
  const rows = (
    await Promise.all(tables.map((table) => ctx.db.query(table).collect()))
  ).flat();
  const numbers = rows
    .map((row) => Number(String(row.number).replace(/\D/g, "")))
    .filter((value) => Number.isFinite(value));
  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return `${prefix}${next}`;
}

export function buildBillDoc(input: BillWrite, number: string, createdAt: string) {
  const date = input.date ?? createdAt;
  const nonGst = input.taxRate <= 0;
  const items = nonGst
    ? input.items.map((item) => ({ ...item, gstRate: 0, tax: 0 }))
    : input.items;
  const totals = billTotals({
    items,
    discount: input.discount,
    taxRate: nonGst ? 0 : input.taxRate,
    amountPaid: input.amountPaid,
  });
  return {
    number,
    customerId: input.customerId,
    customerName: input.customerName.trim(),
    date,
    items,
    ...totals,
    taxRate: nonGst ? 0 : input.taxRate,
    paymentMethod: input.paymentMethod,
    status: statusFromBalances(totals.amountPaid, totals.grandTotal),
    notes: input.notes?.trim() || undefined,
    billKind: input.billKind,
    gstBill: !nonGst,
    createdAt,
  };
}

export async function insertBill(ctx: MutationCtx, table: BillTable, input: BillWrite) {
  const createdAt = new Date().toISOString();
  const prefix = input.prefix ?? (table === "Estimate" ? "EST-" : "INV-");
  const number = await nextBillNumber(
    ctx,
    table === "Estimate" ? ["Estimate"] : ["Door_Bills", "Non_Gst_Bills"],
    prefix,
  );
  const id = await ctx.db.insert(table, {
    ...buildBillDoc(input, number, createdAt),
    shareToken: crypto.randomUUID().replace(/-/g, ""),
    deliveryStatus: table === "Estimate" ? undefined : "pending",
  });
  return await ctx.db.get(id);
}

export async function patchBill(
  ctx: MutationCtx,
  table: BillTable,
  id: string,
  input: BillWrite,
) {
  const normalized = ctx.db.normalizeId(table, id);
  if (!normalized) return null;
  const current = await ctx.db.get(normalized);
  if (!current) return null;
  const next = buildBillDoc(input, current.number, current.createdAt);
  await ctx.db.patch(normalized, next);
  return await ctx.db.get(normalized);
}

export async function findBill(ctx: QueryCtx | MutationCtx, id: string) {
  for (const table of ["Door_Bills", "Non_Gst_Bills", "Estimate"] as const) {
    const normalized = ctx.db.normalizeId(table, id);
    if (!normalized) continue;
    const doc = await ctx.db.get(normalized);
    if (doc) return { table, doc };
  }
  return null;
}
