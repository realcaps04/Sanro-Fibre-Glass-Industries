import { PageHeader } from "@/components/layout/PageHeader";
import { ProductForm } from "@/components/products/ProductForm";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchInput } from "@/components/ui/SearchInput";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { useData } from "@/context/DataContext";
import { formatCurrency } from "@/lib/currency";
import { productCategoryLabel } from "@/lib/labels";
import { matchesQuery } from "@/lib/search";
import { cn } from "@/lib/cn";
import type { ProductCategory } from "@/types";
import { Package, Plus } from "lucide-react";
import { useMemo, useState } from "react";

const filters: Array<{ value: ProductCategory | "all" | "low"; label: string }> = [
  { value: "all", label: "All" },
  { value: "doors", label: "Doors" },
  { value: "windows", label: "Windows" },
  { value: "accessories", label: "Accessories" },
  { value: "low", label: "Low Stock" },
];

export default function Products() {
  const { products, loading, error, refresh } = useData();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("all");
  const [open, setOpen] = useState(false);

  const visible = useMemo(
    () =>
      products.filter((product) => {
        const matchesFilter =
          filter === "all" ||
          (filter === "low" ? product.stock <= 5 : product.category === filter);
        return matchesFilter && matchesQuery(query, product.name, product.sku, product.description);
      }),
    [filter, products, query],
  );

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState title="Unable to load products" onRetry={() => void refresh()} />;

  return (
    <div>
      <PageHeader
        title="Products"
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>
            Add Product
          </Button>
        }
      />
      <SearchInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search products"
        aria-label="Search products"
        className="mb-4"
      />
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={cn(
              "shrink-0 rounded-md border px-3 py-1.5 text-sm",
              filter === item.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      {visible.length ? (
        <div className="elevated divide-y divide-border rounded-lg">
          {visible.map((product) => (
            <div key={product.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  SKU: {product.sku} · {productCategoryLabel[product.category]}
                </p>
                <p className="mt-1 text-sm font-semibold tabular-nums">
                  {formatCurrency(product.price)}
                </p>
              </div>
              <p
                className={cn(
                  "text-sm",
                  product.stock <= 5 ? "text-warning" : "text-muted-foreground",
                )}
              >
                Stock: {product.stock}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="No products yet"
          description="Add doors, windows and accessories to start creating bills."
          actionLabel="Add Product"
          onAction={() => setOpen(true)}
        />
      )}
      <ProductForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
