import type { Product, ProductCategory } from "@/types";

export interface ConvexProductRow {
  _id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  price: number;
  stock: number;
  unit: string;
  description?: string;
  hsnCode: string;
  gstRate: number;
  imageId?: string;
  imageUrl?: string | null;
  legacyId?: string;
}

export function mapConvexProduct(row: ConvexProductRow): Product {
  return {
    id: row._id,
    name: row.name,
    sku: row.sku,
    category: row.category,
    price: row.price,
    stock: row.stock,
    unit: row.unit,
    description: row.description,
    hsnCode: row.hsnCode,
    gstRate: row.gstRate,
    imageId: row.imageId,
    imageUrl: row.imageUrl ?? undefined,
  };
}
