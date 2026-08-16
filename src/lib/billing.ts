import type { BillKind, ProductCategory } from "@/types";

export type { BillKind };

export const billKindLabel: Record<BillKind, string> = {
  doors: "Door Billing",
  waterproofing: "Water proof billing",
  mixed: "Any Bill",
};

export const billKindCategories: Record<BillKind, ProductCategory[]> = {
  doors: ["doors"],
  waterproofing: ["waterproofing"],
  mixed: ["doors", "windows", "accessories", "waterproofing", "other"],
};

export const billKindSearchPlaceholder: Record<BillKind, string> = {
  doors: "Search doors",
  waterproofing: "Search waterproof products",
  mixed: "Search all products",
};

export function inferBillKind(
  invoice: { billKind?: BillKind; items: Array<{ productId: string }> },
  products: Array<{ id: string; category: ProductCategory }>,
): BillKind {
  if (invoice.billKind) return invoice.billKind;
  const ids = new Set(invoice.items.map((item) => item.productId));
  const categories = products.filter((product) => ids.has(product.id)).map((product) => product.category);
  if (categories.length && categories.every((category) => category === "waterproofing")) {
    return "waterproofing";
  }
  return "doors";
}

export function isAnyBill(invoice: { billKind?: BillKind; taxRate: number }): boolean {
  return invoice.billKind === "mixed" || invoice.taxRate === 0;
}
