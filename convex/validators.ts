import { v } from "convex/values";

export const paymentMethod = v.union(
  v.literal("cash"),
  v.literal("upi"),
  v.literal("bank"),
  v.literal("credit"),
);

export const invoiceStatus = v.union(
  v.literal("paid"),
  v.literal("pending"),
  v.literal("partial"),
  v.literal("cancelled"),
);

export const billKind = v.union(v.literal("doors"), v.literal("waterproofing"));

export const productCategory = v.union(
  v.literal("doors"),
  v.literal("windows"),
  v.literal("accessories"),
  v.literal("waterproofing"),
  v.literal("other"),
);

export const lineItem = v.object({
  productId: v.string(),
  name: v.string(),
  sku: v.string(),
  quantity: v.number(),
  rate: v.number(),
  amount: v.number(),
  hsnCode: v.optional(v.string()),
  gstRate: v.optional(v.number()),
  taxableAmount: v.optional(v.number()),
  tax: v.optional(v.number()),
});

export const billFields = {
  number: v.string(),
  customerId: v.string(),
  customerName: v.string(),
  date: v.string(),
  items: v.array(lineItem),
  subtotal: v.number(),
  discount: v.number(),
  taxableAmount: v.optional(v.number()),
  taxRate: v.number(),
  tax: v.number(),
  cgst: v.optional(v.number()),
  sgst: v.optional(v.number()),
  grandTotal: v.number(),
  amountPaid: v.number(),
  balance: v.number(),
  paymentMethod,
  status: invoiceStatus,
  notes: v.optional(v.string()),
  billKind: v.optional(billKind),
  createdAt: v.string(),
  shareToken: v.optional(v.string()),
  deliveryStatus: v.optional(
    v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("skipped"),
      v.literal("expired"),
    ),
  ),
  deliveredAt: v.optional(v.string()),
};

export const billWriteArgs = {
  customerId: v.string(),
  customerName: v.string(),
  items: v.array(lineItem),
  discount: v.number(),
  taxRate: v.number(),
  amountPaid: v.number(),
  paymentMethod,
  notes: v.optional(v.string()),
  date: v.optional(v.string()),
  billKind: v.optional(billKind),
  prefix: v.optional(v.string()),
};
