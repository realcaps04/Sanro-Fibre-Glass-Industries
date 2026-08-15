import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { insertBill, patchBill } from "./bills";
import { billWriteArgs } from "./validators";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("Non_Gst_Bills").collect();
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  },
});

export const create = mutation({
  args: billWriteArgs,
  handler: async (ctx, args) => insertBill(ctx, "Non_Gst_Bills", { ...args, taxRate: 0 }),
});

export const update = mutation({
  args: { id: v.string(), ...billWriteArgs },
  handler: async (ctx, { id, ...args }) => {
    const row = await patchBill(ctx, "Non_Gst_Bills", id, { ...args, taxRate: 0 });
    if (!row) throw new Error("Bill not found");
    return row;
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const normalized = ctx.db.normalizeId("Non_Gst_Bills", id);
    if (!normalized) throw new Error("Bill not found");
    await ctx.db.delete(normalized);
  },
});
