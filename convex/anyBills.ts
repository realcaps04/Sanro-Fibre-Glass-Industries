import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { insertBill } from "./bills";
import { queueBillDelivery } from "./billDelivery";
import { billWriteArgs } from "./validators";

export const create = mutation({
  args: {
    ...billWriteArgs,
    gst: v.boolean(),
  },
  handler: async (ctx, { gst, ...args }) => {
    const taxRate = gst ? args.taxRate : 0;
    const table = gst ? "Door_Bills" : "Non_Gst_Bills";
    const row = await insertBill(ctx, table, {
      ...args,
      taxRate,
      billKind: "mixed",
      items: gst
        ? args.items
        : args.items.map((item) => ({ ...item, gstRate: 0, tax: 0 })),
    });
    if (row) await queueBillDelivery(ctx, row._id);
    return row;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const [doors, nonGst] = await Promise.all([
      ctx.db.query("Door_Bills").collect(),
      ctx.db.query("Non_Gst_Bills").collect(),
    ]);
    return [...doors, ...nonGst]
      .filter((row) => row.billKind === "mixed" || row.taxRate === 0)
      .sort((a, b) => b.date.localeCompare(a.date));
  },
});
