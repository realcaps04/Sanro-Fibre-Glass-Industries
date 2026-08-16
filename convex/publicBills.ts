import { v } from "convex/values";
import { query } from "./_generated/server";

export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const shareToken = token.trim();
    if (!shareToken) return null;
    for (const table of ["GST_Bills", "Door_Bills", "Non_Gst_Bills"] as const) {
      const bill = await ctx.db
        .query(table)
        .withIndex("by_share_token", (q) => q.eq("shareToken", shareToken))
        .unique();
      if (!bill || bill.status === "cancelled") continue;
      const customerId = ctx.db.normalizeId("Customers", bill.customerId);
      const customer = customerId ? await ctx.db.get(customerId) : null;
      return { bill, customer };
    }
    return null;
  },
});
