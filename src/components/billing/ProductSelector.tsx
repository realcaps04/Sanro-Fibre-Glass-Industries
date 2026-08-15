import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { SearchInput } from "@/components/ui/SearchInput";
import { Overlay } from "@/components/ui/Overlay";
import { useData } from "@/context/DataContext";
import { formatCurrency } from "@/lib/currency";
import { matchesQuery } from "@/lib/search";
import type { Product, ProductCategory } from "@/types";
import { useEffect, useMemo, useState } from "react";

const allCategories: ProductCategory[] = [
  "doors",
  "windows",
  "accessories",
  "waterproofing",
  "other",
];

interface ProductSelectorProps {
  open: boolean;
  onClose: () => void;
  onAdd: (product: Product, quantity: number) => void;
  allowedCategories?: ProductCategory[];
  title?: string;
  searchPlaceholder?: string;
}

export function ProductSelector({
  open,
  onClose,
  onAdd,
  allowedCategories,
  title = "Select product",
  searchPlaceholder = "Search products",
}: ProductSelectorProps) {
  const { products } = useData();
  const [query, setQuery] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const scopedCategories = allowedCategories ?? allCategories;

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setQuantities({});
  }, [open]);

  const catalog = useMemo(
    () => products.filter((product) => scopedCategories.includes(product.category)),
    [products, scopedCategories],
  );

  const filtered = useMemo(
    () =>
      catalog.filter((product) =>
        matchesQuery(query, product.name, product.sku, product.description),
      ),
    [catalog, query],
  );

  return (
    <Overlay open={open} onClose={onClose} title={title} nested>
      <div className="space-y-4">
        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
        <ul className="divide-y divide-border rounded-md border border-border">
          {filtered.map((product) => {
            const qty = quantities[product.id] ?? 1;
            return (
              <li key={product.id} className="flex items-center gap-3 px-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.sku} · Stock {product.stock}
                  </p>
                  <p className="mt-0.5 text-sm tabular-nums">{formatCurrency(product.price)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <QuantityStepper
                    value={qty}
                    max={Math.max(product.stock, 1)}
                    onChange={(value) =>
                      setQuantities((current) => ({ ...current, [product.id]: value }))
                    }
                  />
                  <button
                    type="button"
                    className="text-sm font-medium text-primary"
                    onClick={() => {
                      onAdd(product, qty);
                      onClose();
                    }}
                  >
                    Add
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        {!filtered.length ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No products match that search.
          </p>
        ) : null}
      </div>
    </Overlay>
  );
}
