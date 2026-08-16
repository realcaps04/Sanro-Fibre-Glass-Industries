import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { productCategory } from "./validators";

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

async function withImageUrl<T extends { imageId?: string }>(
  ctx: { storage: { getUrl: (id: T["imageId"] & string) => Promise<string | null> } },
  row: T,
) {
  return {
    ...row,
    imageUrl: row.imageId ? await ctx.storage.getUrl(row.imageId) : null,
  };
}

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("products").collect();
    const withImages = await Promise.all(rows.map((row) => withImageUrl(ctx, row)));
    return withImages.sort((a, b) => a.name.localeCompare(b.name));
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
    imageId: v.optional(v.id("_storage")),
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
      name: args.name.trim(),
      sku,
      category: args.category,
      price: args.price,
      stock: args.stock,
      unit: args.unit,
      description: args.description?.trim() || undefined,
      hsnCode: args.hsnCode,
      gstRate: args.gstRate,
      imageId: args.imageId,
    });
    const row = await ctx.db.get(id);
    return row ? await withImageUrl(ctx, row) : row;
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    name: v.optional(v.string()),
    sku: v.optional(v.string()),
    category: v.optional(productCategory),
    price: v.optional(v.number()),
    stock: v.optional(v.number()),
    unit: v.optional(v.string()),
    description: v.optional(v.string()),
    hsnCode: v.optional(v.string()),
    gstRate: v.optional(v.number()),
    imageId: v.optional(v.id("_storage")),
    clearImage: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, clearImage, ...patch }) => {
    const product = await findProduct(ctx, id);
    if (!product) throw new Error("Product not found");
    const sku = patch.sku?.trim().toUpperCase();
    if (sku && sku !== product.sku) {
      const existing = await ctx.db
        .query("products")
        .withIndex("by_sku", (q) => q.eq("sku", sku))
        .unique();
      if (existing) throw new Error("A product with this SKU already exists");
    }
    const nextImageId = clearImage ? undefined : (patch.imageId ?? product.imageId);
    if ((clearImage || patch.imageId) && product.imageId && product.imageId !== nextImageId) {
      await ctx.storage.delete(product.imageId);
    }
    await ctx.db.patch(product._id, {
      name: patch.name?.trim() ?? product.name,
      sku: sku ?? product.sku,
      category: patch.category ?? product.category,
      price: patch.price ?? product.price,
      stock: patch.stock ?? product.stock,
      unit: patch.unit ?? product.unit,
      description:
        patch.description === undefined ? product.description : patch.description.trim() || undefined,
      hsnCode: patch.hsnCode ?? product.hsnCode,
      gstRate: patch.gstRate ?? product.gstRate,
    });
    if (clearImage) {
      const current = await ctx.db.get(product._id);
      if (!current) throw new Error("Product not found");
      const { imageId: _removed, ...rest } = current;
      await ctx.db.replace(product._id, {
        name: rest.name,
        sku: rest.sku,
        category: rest.category,
        price: rest.price,
        stock: rest.stock,
        unit: rest.unit,
        description: rest.description,
        hsnCode: rest.hsnCode,
        gstRate: rest.gstRate,
        legacyId: rest.legacyId,
      });
    } else if (patch.imageId) {
      await ctx.db.patch(product._id, { imageId: patch.imageId });
    }
    const row = await ctx.db.get(product._id);
    return row ? await withImageUrl(ctx, row) : row;
  },
});

export const setImage = mutation({
  args: {
    id: v.string(),
    imageId: v.id("_storage"),
  },
  handler: async (ctx, { id, imageId }) => {
    const product = await findProduct(ctx, id);
    if (!product) throw new Error("Product not found");
    if (product.imageId && product.imageId !== imageId) {
      await ctx.storage.delete(product.imageId);
    }
    await ctx.db.patch(product._id, { imageId });
    const row = await ctx.db.get(product._id);
    return row ? await withImageUrl(ctx, row) : row;
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const product = await findProduct(ctx, id);
    if (!product) throw new Error("Product not found");
    await ctx.db.delete(product._id);
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

export const seedStarter = mutation({
  args: {},
  handler: async (ctx) => {
    const starters = [
      {
        name: "Fibre Panel Door",
        sku: "SD-DOOR",
        category: "doors" as const,
        price: 9800,
        stock: 10,
        unit: "pcs",
        description: "Fibre glass panel door.",
        hsnCode: "39252000",
        gstRate: 0.18,
      },
      {
        name: "Fibre Waterproof Coating",
        sku: "SD-WP",
        category: "waterproofing" as const,
        price: 1850,
        stock: 20,
        unit: "ltr",
        description: "Fibre-reinforced waterproof coating.",
        hsnCode: "32091090",
        gstRate: 0.18,
      },
    ];
    let inserted = 0;
    for (const product of starters) {
      const existing = await ctx.db
        .query("products")
        .withIndex("by_sku", (q) => q.eq("sku", product.sku))
        .unique();
      if (existing) continue;
      await ctx.db.insert("products", product);
      inserted += 1;
    }
    return { inserted };
  },
});
