import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("Customers").collect();
    return rows.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    houseName: v.optional(v.string()),
    place: v.optional(v.string()),
    pincode: v.optional(v.string()),
    address: v.string(),
    gstin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("Customers", {
      name: args.name.trim(),
      phone: args.phone.trim(),
      email: args.email?.trim() || undefined,
      houseName: args.houseName?.trim() || undefined,
      place: args.place?.trim() || undefined,
      pincode: args.pincode?.trim() || undefined,
      address: args.address.trim(),
      gstin: args.gstin?.trim() || undefined,
      createdAt: new Date().toISOString(),
    });
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    houseName: v.optional(v.string()),
    place: v.optional(v.string()),
    pincode: v.optional(v.string()),
    address: v.optional(v.string()),
    gstin: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const normalized = ctx.db.normalizeId("Customers", id);
    if (!normalized) throw new Error("Customer not found");
    const current = await ctx.db.get(normalized);
    if (!current) throw new Error("Customer not found");
    await ctx.db.patch(normalized, {
      name: patch.name?.trim() ?? current.name,
      phone: patch.phone?.trim() ?? current.phone,
      email: patch.email === undefined ? current.email : patch.email.trim() || undefined,
      houseName: patch.houseName === undefined ? current.houseName : patch.houseName.trim() || undefined,
      place: patch.place === undefined ? current.place : patch.place.trim() || undefined,
      pincode: patch.pincode === undefined ? current.pincode : patch.pincode.trim() || undefined,
      address: patch.address?.trim() ?? current.address,
      gstin: patch.gstin === undefined ? current.gstin : patch.gstin.trim() || undefined,
    });
    return await ctx.db.get(normalized);
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const normalized = ctx.db.normalizeId("Customers", id);
    if (!normalized) throw new Error("Customer not found");
    await ctx.db.delete(normalized);
  },
});
