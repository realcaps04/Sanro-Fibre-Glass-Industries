import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { billFields, productCategory } from "./validators";

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

  Customers: defineTable({
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    houseName: v.optional(v.string()),
    place: v.optional(v.string()),
    pincode: v.optional(v.string()),
    address: v.string(),
    gstin: v.optional(v.string()),
    createdAt: v.string(),
  }).index("by_phone", ["phone"]),

  Door_Bills: defineTable(billFields)
    .index("by_customer", ["customerId"])
    .index("by_number", ["number"])
    .index("by_share_token", ["shareToken"])
    .index("by_delivery_status", ["deliveryStatus"]),

  Non_Gst_Bills: defineTable(billFields)
    .index("by_customer", ["customerId"])
    .index("by_number", ["number"])
    .index("by_share_token", ["shareToken"])
    .index("by_delivery_status", ["deliveryStatus"]),

  Estimate: defineTable(billFields)
    .index("by_customer", ["customerId"])
    .index("by_number", ["number"]),

  Payments: defineTable({
    customerId: v.string(),
    customerName: v.string(),
    amount: v.number(),
    paymentMethod: billFields.paymentMethod,
    date: v.string(),
    invoiceId: v.optional(v.string()),
    invoiceNumber: v.optional(v.string()),
    billKind: billFields.billKind,
    productsUsed: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.string(),
  }).index("by_customer", ["customerId"]),
});
