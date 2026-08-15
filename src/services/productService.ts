import { inferProductHsn } from "@/lib/hsn";
import { mockProducts } from "@/data/products";
import { createId, matchesQuery } from "@/lib/search";
import { createCollection } from "@/services/collection";
import type { Product, ProductCategory } from "@/types";

const collection = createCollection("products", mockProducts);

function normalizeProduct(product: Product): Product {
  const inferred = inferProductHsn(product);
  return {
    ...product,
    hsnCode: product.hsnCode || inferred.hsnCode,
    gstRate: product.gstRate ?? inferred.gstRate,
  };
}

function readCatalog(): Product[] {
  const stored = collection.read();
  const byId = new Set(stored.map((product) => product.id));
  const missing = mockProducts.filter((product) => !byId.has(product.id));
  const next = [...missing, ...stored.map(normalizeProduct)];
  const needsWrite =
    missing.length > 0 || stored.some((product) => !product.hsnCode || product.gstRate == null);
  if (needsWrite) collection.write(next);
  return next;
}

export const productService = {
  async getProducts(): Promise<Product[]> {
    return readCatalog();
  },

  async getProductById(id: string): Promise<Product | undefined> {
    return readCatalog().find((product) => product.id === id);
  },

  async searchProducts(query: string, category?: ProductCategory | "all"): Promise<Product[]> {
    return readCatalog().filter((product) => {
      const matchesCategory = !category || category === "all" || product.category === category;
      return (
        matchesCategory &&
        matchesQuery(query, product.name, product.sku, product.description, product.hsnCode)
      );
    });
  },

  async createProduct(input: Omit<Product, "id">): Promise<Product> {
    const product = normalizeProduct({ ...input, id: createId("prd") });
    collection.write([product, ...readCatalog()]);
    return product;
  },

  async updateProduct(id: string, patch: Partial<Product>): Promise<Product> {
    const current = collection.read();
    const index = current.findIndex((product) => product.id === id);
    if (index === -1) {
      throw new Error("Product not found");
    }
    const updated = { ...current[index], ...patch, id };
    const next = [...current];
    next[index] = updated;
    collection.write(next);
    return updated;
  },

  async adjustStock(id: string, delta: number): Promise<void> {
    const product = await this.getProductById(id);
    if (!product) return;
    await this.updateProduct(id, { stock: Math.max(0, product.stock + delta) });
  },
};
