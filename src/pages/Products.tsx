import { PageHeader } from "@/components/layout/PageHeader";
import { ProductForm } from "@/components/products/ProductForm";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchInput } from "@/components/ui/SearchInput";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { useData } from "@/context/DataContext";
import { formatCurrency } from "@/lib/currency";
import { formatHsn, gstPercent } from "@/lib/hsn";
import { productCategoryLabel } from "@/lib/labels";
import { matchesQuery } from "@/lib/search";
import { cn } from "@/lib/cn";
import type { Product, ProductCategory } from "@/types";
import { Package, Pencil, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

const filters: Array<{ value: ProductCategory | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "doors", label: "Doors" },
  { value: "windows", label: "Windows" },
  { value: "accessories", label: "Accessories" },
  { value: "waterproofing", label: "Water proofing" },
];

export default function Products() {
  const { products, loading, error, refresh } = useData();
  const [searchParams] = useSearchParams();
  const requested = searchParams.get("category");
  const initialFilter =
    requested && filters.some((item) => item.value === requested)
      ? (requested as (typeof filters)[number]["value"])
      : "all";
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>(initialFilter);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  const visible = useMemo(
    () =>
      products.filter((product) => {
        const matchesFilter = filter === "all" || product.category === filter;
        return (
          matchesFilter &&
          matchesQuery(query, product.name, product.sku, product.description, product.hsnCode)
        );
      }),
    [filter, products, query],
  );

  const closeForm = () => {
    setOpen(false);
    setEditing(null);
  };

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState title="Unable to load products" onRetry={() => void refresh()} />;

  return (
    <div>
      <PageHeader
        title="Products"
        actions={
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
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
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm",
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
            <div key={product.id} className="flex items-start gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  SKU: {product.sku} · {productCategoryLabel[product.category]}
                </p>
                <p className="text-sm text-muted-foreground">
                  HSN {formatHsn(product.hsnCode)} · GST {gstPercent(product.gstRate)}%
                </p>
                <p className="mt-1 text-sm font-semibold tabular-nums">
                  {formatCurrency(product.price)}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Edit ${product.name}`}
                onClick={() => {
                  setEditing(product);
                  setOpen(true);
                }}
                className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="No products yet"
          description="Add doors, windows and accessories to start creating bills."
          actionLabel="Add Product"
          onAction={() => {
            setEditing(null);
            setOpen(true);
          }}
        />
      )}
      <ProductForm open={open} existing={editing ?? undefined} onClose={closeForm} />
    </div>
  );
}
