import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { insertBill, patchBill } from "./bills";
import { billWriteArgs } from "./validators";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("Estimate").collect();
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  },
});

export const create = mutation({
  args: billWriteArgs,
  handler: async (ctx, args) =>
    insertBill(ctx, "Estimate", { ...args, amountPaid: 0, prefix: args.prefix ?? "EST-" }),
});

export const update = mutation({
  args: { id: v.string(), ...billWriteArgs },
  handler: async (ctx, { id, ...args }) => {
    const row = await patchBill(ctx, "Estimate", id, { ...args, amountPaid: 0 });
    if (!row) throw new Error("Estimate not found");
    return row;
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const normalized = ctx.db.normalizeId("Estimate", id);
    if (!normalized) throw new Error("Estimate not found");
    await ctx.db.delete(normalized);
  },
});
