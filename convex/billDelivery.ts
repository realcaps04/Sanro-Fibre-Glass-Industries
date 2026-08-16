import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation, type MutationCtx } from "./_generated/server";
import { findBill } from "./bills";

const HOUR_MS = 60 * 60 * 1000;
const RETRY_AFTER_MS = [0, 10 * 60 * 1000, 30 * 60 * 1000, 55 * 60 * 1000];

export async function queueBillDelivery(ctx: MutationCtx, billId: string) {
  for (const delay of RETRY_AFTER_MS) {
    await ctx.scheduler.runAfter(delay, internal.billDelivery.attempt, { id: billId });
  }
}

export const markSent = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const found = await findBill(ctx, id);
    if (!found || found.table === "Estimate") return;
    await ctx.db.patch(found.doc._id, {
      deliveryStatus: "sent",
      deliveredAt: new Date().toISOString(),
    });
  },
});

export const attempt = internalMutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const found = await findBill(ctx, id);
    if (!found || found.table === "Estimate") return;
    if (found.doc.deliveryStatus === "sent" || found.doc.deliveryStatus === "skipped") return;

    const age = Date.now() - new Date(found.doc.createdAt).getTime();
    if (age >= HOUR_MS) {
      await ctx.db.patch(found.doc._id, { deliveryStatus: "expired" });
    }
  },
});

export const expireOld = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - HOUR_MS;
    for (const table of ["GST_Bills", "Door_Bills", "Non_Gst_Bills"] as const) {
      const rows = await ctx.db
        .query(table)
        .withIndex("by_delivery_status", (q) => q.eq("deliveryStatus", "pending"))
        .collect();
      for (const row of rows) {
        if (new Date(row.createdAt).getTime() < cutoff) {
          await ctx.db.patch(row._id, { deliveryStatus: "expired" });
        }
      }
    }
  },
});
