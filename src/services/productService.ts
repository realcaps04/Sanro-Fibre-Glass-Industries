import { api } from "../../convex/_generated/api";
import { convex } from "@/lib/convex";
import { mapConvexProduct } from "@/lib/productMap";
import { inferProductHsn } from "@/lib/hsn";
import { matchesQuery } from "@/lib/search";
import type { Product, ProductCategory } from "@/types";

export type ProductWrite = Omit<Product, "id"> & { clearImage?: boolean };

function normalizeInput(input: ProductWrite): ProductWrite {
  const inferred = inferProductHsn(input);
  return {
    ...input,
    name: input.name.trim(),
    sku: input.sku.trim().toUpperCase(),
    hsnCode: input.hsnCode || inferred.hsnCode,
    gstRate: input.gstRate ?? inferred.gstRate,
    description: input.description?.trim() || undefined,
  };
}

export const productService = {
  async getProducts(): Promise<Product[]> {
    const rows = await convex.query(api.products.list);
    return rows.map(mapConvexProduct);
  },

  async getProductById(id: string): Promise<Product | undefined> {
    const products = await this.getProducts();
    return products.find((product) => product.id === id);
  },

  async searchProducts(query: string, category?: ProductCategory | "all"): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter((product) => {
      const matchesCategory = !category || category === "all" || product.category === category;
      return (
        matchesCategory &&
        matchesQuery(query, product.name, product.sku, product.description, product.hsnCode)
      );
    });
  },

  async createProduct(input: ProductWrite): Promise<Product> {
    const payload = normalizeInput(input);
    const row = await convex.mutation(api.products.create, {
      name: payload.name,
      sku: payload.sku,
      category: payload.category,
      price: payload.price,
      stock: payload.stock,
      unit: payload.unit,
      description: payload.description,
      hsnCode: payload.hsnCode,
      gstRate: payload.gstRate,
      ...(payload.imageId ? { imageId: payload.imageId as never } : {}),
    });
    if (!row) {
      throw new Error("Unable to create product");
    }
    return mapConvexProduct(row);
  },

  async updateProduct(id: string, input: ProductWrite): Promise<Product> {
    const payload = normalizeInput(input);
    const row = await convex.mutation(api.products.update, {
      id,
      name: payload.name,
      sku: payload.sku,
      category: payload.category,
      price: payload.price,
      stock: payload.stock,
      unit: payload.unit,
      description: payload.description,
      hsnCode: payload.hsnCode,
      gstRate: payload.gstRate,
      ...(payload.imageId && !payload.clearImage ? { imageId: payload.imageId as never } : {}),
      clearImage: Boolean(payload.clearImage),
    });
    if (!row) {
      throw new Error("Unable to update product");
    }
    if (payload.imageId && !payload.clearImage) {
      const withImage = await convex.mutation(api.products.setImage, {
        id: row._id,
        imageId: payload.imageId as never,
      });
      if (withImage) return mapConvexProduct(withImage);
    }
    return mapConvexProduct(row);
  },

  async adjustStock(id: string, delta: number): Promise<void> {
    await convex.mutation(api.products.adjustStock, { id, delta });
  },
};
