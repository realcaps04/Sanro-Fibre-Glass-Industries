import type { BillKind, ProductCategory } from "@/types";

export type { BillKind };

export const billKindLabel: Record<BillKind, string> = {
  doors: "Door Billing",
  waterproofing: "Water proof billing",
};

export const billKindCategories: Record<BillKind, ProductCategory[]> = {
  doors: ["doors", "windows", "accessories", "other"],
  waterproofing: ["waterproofing"],
};
