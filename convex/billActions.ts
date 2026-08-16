import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { findBill, patchBill } from "./bills";
import { statusFromBalances } from "./totals";
import { billWriteArgs } from "./validators";

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const found = await findBill(ctx, id);
    if (!found || found.table === "Estimate") return null;
    return found.doc;
  },
});

export const applyPayment = mutation({
  args: { id: v.string(), amount: v.number() },
  handler: async (ctx, { id, amount }) => {
    const found = await findBill(ctx, id);
    if (!found || found.table === "Estimate") throw new Error("Bill not found");
    const amountPaid = Math.min(found.doc.grandTotal, found.doc.amountPaid + amount);
    await ctx.db.patch(found.doc._id, {
      amountPaid,
      balance: Math.max(0, found.doc.grandTotal - amountPaid),
      status: statusFromBalances(amountPaid, found.doc.grandTotal),
    });
    return await ctx.db.get(found.doc._id);
  },
});

export const update = mutation({
  args: { id: v.string(), ...billWriteArgs },
  handler: async (ctx, { id, ...args }) => {
    const found = await findBill(ctx, id);
    if (!found || found.table === "Estimate") throw new Error("Bill not found");
    const row = await patchBill(
      ctx,
      found.table,
      id,
      found.table === "Non_Gst_Bills"
        ? {
            ...args,
            taxRate: 0,
            items: args.items.map((item) => ({ ...item, gstRate: 0, tax: 0 })),
          }
        : args,
    );
    if (!row) throw new Error("Bill not found");
    return row;
  },
});

export const cancel = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const found = await findBill(ctx, id);
    if (!found || found.table === "Estimate") throw new Error("Bill not found");
    await ctx.db.patch(found.doc._id, { status: "cancelled" });
    return await ctx.db.get(found.doc._id);
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const found = await findBill(ctx, id);
    if (!found || found.table === "Estimate") throw new Error("Bill not found");
    await ctx.db.delete(found.doc._id);
  },
});
