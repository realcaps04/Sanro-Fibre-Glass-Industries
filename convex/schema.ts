import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const productCategory = v.union(
  v.literal("doors"),
  v.literal("windows"),
  v.literal("accessories"),
  v.literal("waterproofing"),
  v.literal("other"),
);

export default defineSchema({
  products: defineTable({
    name: v.string(),
    sku: v.string(),
    category: productCategory,
    price: v.number(),
    stock: v.number(),
    unit: v.string(),
    description: v.optional(v.string()),
    hsnCode: v.string(),
    gstRate: v.number(),
    legacyId: v.optional(v.string()),
  })
    .index("by_sku", ["sku"])
    .index("by_legacy_id", ["legacyId"]),
});
