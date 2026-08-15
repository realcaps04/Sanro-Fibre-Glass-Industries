import { mockProducts } from "@/data/products";
import { createId, matchesQuery } from "@/lib/search";
import { createCollection } from "@/services/collection";
import type { Product, ProductCategory } from "@/types";

const collection = createCollection("products", mockProducts);

export const productService = {
  async getProducts(): Promise<Product[]> {
    return collection.read();
  },

  async getProductById(id: string): Promise<Product | undefined> {
    return collection.read().find((product) => product.id === id);
  },

  async searchProducts(query: string, category?: ProductCategory | "all"): Promise<Product[]> {
    return collection.read().filter((product) => {
      const matchesCategory = !category || category === "all" || product.category === category;
      return (
        matchesCategory &&
        matchesQuery(query, product.name, product.sku, product.description)
      );
    });
  },

  async createProduct(input: Omit<Product, "id">): Promise<Product> {
    const product: Product = { ...input, id: createId("prd") };
    collection.write([product, ...collection.read()]);
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
