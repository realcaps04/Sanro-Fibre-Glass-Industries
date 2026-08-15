import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { findBill, productsUsed } from "./bills";
import { statusFromBalances } from "./totals";
import { paymentMethod } from "./validators";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("Payments").collect();
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  },
});

export const record = mutation({
  args: {
    customerId: v.string(),
    amount: v.number(),
    paymentMethod: v.union(v.literal("cash"), v.literal("upi"), v.literal("bank")),
    invoiceId: v.optional(v.string()),
    date: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const customerId = ctx.db.normalizeId("Customers", args.customerId);
    if (!customerId) throw new Error("Customer not found");
    const customer = await ctx.db.get(customerId);
    if (!customer) throw new Error("Customer not found");

    const amount = Math.max(0, args.amount);
    if (!amount) throw new Error("Enter a payment amount");

    const targets = [];
    if (args.invoiceId) {
      const found = await findBill(ctx, args.invoiceId);
      if (!found || found.table === "Estimate") throw new Error("Bill not found");
      targets.push(found);
    } else {
      const doors = await ctx.db
        .query("Door_Bills")
        .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
        .collect();
      const nonGst = await ctx.db
        .query("Non_Gst_Bills")
        .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
        .collect();
      targets.push(
        ...[...doors, ...nonGst]
          .filter((doc) => doc.balance > 0 && doc.status !== "cancelled")
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((doc) => ({
            table: (doc.taxRate === 0 ? "Non_Gst_Bills" : "Door_Bills") as "Door_Bills" | "Non_Gst_Bills",
            doc,
          })),
      );
    }

    let remaining = amount;
    let last:
      | {
          id: string;
          number: string;
          billKind?: "doors" | "waterproofing";
          productsUsed: string;
        }
      | undefined;

    for (const target of targets) {
      if (remaining <= 0) break;
      const applied = Math.min(remaining, target.doc.balance);
      const amountPaid = target.doc.amountPaid + applied;
      await ctx.db.patch(target.doc._id, {
        amountPaid,
        balance: Math.max(0, target.doc.grandTotal - amountPaid),
        status: statusFromBalances(amountPaid, target.doc.grandTotal),
      });
      remaining -= applied;
      last = {
        id: target.doc._id,
        number: target.doc.number,
        billKind: target.doc.billKind,
        productsUsed: productsUsed(target.doc.items),
      };
    }

    const date = args.date ?? new Date().toISOString();
    const id = await ctx.db.insert("Payments", {
      customerId: args.customerId,
      customerName: customer.name,
      amount,
      paymentMethod: args.paymentMethod,
      date,
      invoiceId: last?.id ?? args.invoiceId,
      invoiceNumber: last?.number,
      billKind: last?.billKind,
      productsUsed: last?.productsUsed,
      notes: args.notes?.trim() || undefined,
      createdAt: date,
    });
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    amount: v.optional(v.number()),
    paymentMethod: v.optional(paymentMethod),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const normalized = ctx.db.normalizeId("Payments", id);
    if (!normalized) throw new Error("Payment not found");
    const current = await ctx.db.get(normalized);
    if (!current) throw new Error("Payment not found");
    await ctx.db.patch(normalized, {
      amount: patch.amount ?? current.amount,
      paymentMethod: patch.paymentMethod ?? current.paymentMethod,
      notes: patch.notes === undefined ? current.notes : patch.notes.trim() || undefined,
    });
    return await ctx.db.get(normalized);
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const normalized = ctx.db.normalizeId("Payments", id);
    if (!normalized) throw new Error("Payment not found");
    await ctx.db.delete(normalized);
  },
});
