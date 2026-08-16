import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

function normalizePhone(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

function normalizeGstin(gstin?: string) {
  const value = gstin?.replace(/\s/g, "").toUpperCase() ?? "";
  return value || undefined;
}

async function assertUniqueCustomer(
  ctx: MutationCtx,
  input: { phone: string; gstin?: string },
  exceptId?: Id<"Customers">,
) {
  const phone = normalizePhone(input.phone);
  if (phone.length < 10) {
    throw new Error("Enter a valid 10-digit phone number");
  }
  const gstin = normalizeGstin(input.gstin);
  const rows = await ctx.db.query("Customers").collect();
  const duplicatePhone = rows.find(
    (row) => row._id !== exceptId && normalizePhone(row.phone) === phone,
  );
  if (duplicatePhone) {
    throw new Error("A customer with this phone number already exists");
  }
  if (gstin) {
    const duplicateGstin = rows.find(
      (row) =>
        row._id !== exceptId && normalizeGstin(row.gstin) === gstin,
    );
    if (duplicateGstin) {
      throw new Error("A customer with this GSTIN already exists");
    }
  }
  return { phone, gstin };
}

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
    const { phone, gstin } = await assertUniqueCustomer(ctx, args);
    const id = await ctx.db.insert("Customers", {
      name: args.name.trim(),
      phone,
      email: args.email?.trim() || undefined,
      houseName: args.houseName?.trim() || undefined,
      place: args.place?.trim() || undefined,
      pincode: args.pincode?.trim() || undefined,
      address: args.address.trim(),
      gstin,
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
    const nextPhone = patch.phone ?? current.phone;
    const nextGstin = patch.gstin === undefined ? current.gstin : patch.gstin;
    const { phone, gstin } = await assertUniqueCustomer(
      ctx,
      { phone: nextPhone, gstin: nextGstin },
      normalized,
    );
    await ctx.db.patch(normalized, {
      name: patch.name?.trim() ?? current.name,
      phone,
      email: patch.email === undefined ? current.email : patch.email.trim() || undefined,
      houseName: patch.houseName === undefined ? current.houseName : patch.houseName.trim() || undefined,
      place: patch.place === undefined ? current.place : patch.place.trim() || undefined,
      pincode: patch.pincode === undefined ? current.pincode : patch.pincode.trim() || undefined,
      address: patch.address?.trim() ?? current.address,
      gstin,
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
