import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Overlay } from "@/components/ui/Overlay";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { productCategoryLabel } from "@/lib/labels";
import type { Product, ProductCategory } from "@/types";
import { useState } from "react";

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
}

const categories = Object.keys(productCategoryLabel) as ProductCategory[];

export function ProductForm({ open, onClose }: ProductFormProps) {
  const { addProduct } = useData();
  const { toast } = useToast();
  const [form, setForm] = useState<Omit<Product, "id">>({
    name: "",
    sku: "",
    category: "doors",
    price: 0,
    stock: 0,
    unit: "pcs",
    description: "",
  });
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!form.name.trim() || !form.sku.trim() || !price) return;
    setSubmitting(true);
    try {
      await addProduct({
        ...form,
        name: form.name.trim(),
        sku: form.sku.trim().toUpperCase(),
        price: Number(price),
        stock: Number(stock) || 0,
      });
      toast("Product added", "success");
      onClose();
      setForm({
        name: "",
        sku: "",
        category: "doors",
        price: 0,
        stock: 0,
        unit: "pcs",
        description: "",
      });
      setPrice("");
      setStock("");
    } catch {
      toast("Unable to add product", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Overlay open={open} onClose={onClose} title="Add Product">
      <div className="space-y-4">
        <div>
          <Label htmlFor="prd-name">Product name</Label>
          <Input
            id="prd-name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="prd-sku">SKU</Label>
          <Input
            id="prd-sku"
            value={form.sku}
            onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))}
            placeholder="SD-015"
          />
        </div>
        <div>
          <Label htmlFor="prd-cat">Category</Label>
          <Select
            id="prd-cat"
            value={form.category}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                category: event.target.value as ProductCategory,
              }))
            }
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {productCategoryLabel[category]}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="prd-price">Price</Label>
            <Input
              id="prd-price"
              inputMode="numeric"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="prd-stock">Stock</Label>
            <Input
              id="prd-stock"
              inputMode="numeric"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="prd-desc">Description</Label>
          <Textarea
            id="prd-desc"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
          />
        </div>
        <Button
          fullWidth
          disabled={submitting || !form.name.trim() || !form.sku.trim() || !price}
          onClick={() => void submit()}
        >
          Save Product
        </Button>
      </div>
    </Overlay>
  );
}
