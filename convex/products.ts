import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { productCategory } from "./schema";

async function findProduct(ctx: MutationCtx, id: string) {
  const normalized = ctx.db.normalizeId("products", id);
  if (normalized) {
    const byId = await ctx.db.get(normalized);
    if (byId) return byId;
  }
  return await ctx.db
    .query("products")
    .withIndex("by_legacy_id", (q) => q.eq("legacyId", id))
    .unique();
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("products").collect();
    return rows.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    sku: v.string(),
    category: productCategory,
    price: v.number(),
    stock: v.number(),
    unit: v.string(),
    description: v.optional(v.string()),
    hsnCode: v.string(),
    gstRate: v.number(),
  },
  handler: async (ctx, args) => {
    const sku = args.sku.trim().toUpperCase();
    const existing = await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", sku))
      .unique();
    if (existing) {
      throw new Error("A product with this SKU already exists");
    }
    const id = await ctx.db.insert("products", {
      ...args,
      name: args.name.trim(),
      sku,
      description: args.description?.trim() || undefined,
    });
    return await ctx.db.get(id);
  },
});

export const adjustStock = mutation({
  args: {
    id: v.string(),
    delta: v.number(),
  },
  handler: async (ctx, { id, delta }) => {
    const product = await findProduct(ctx, id);
    if (!product) return;
    await ctx.db.patch(product._id, {
      stock: Math.max(0, product.stock + delta),
    });
  },
});

export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("products").collect();
    for (const row of rows) {
      await ctx.db.delete(row._id);
    }
    return { deleted: rows.length };
  },
});
