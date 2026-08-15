import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Overlay } from "@/components/ui/Overlay";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/cn";
import { doorHsnPresets, formatHsn, gstPercent, waterproofHsnPresets, type HsnPreset } from "@/lib/hsn";
import { productCategoryLabel } from "@/lib/labels";
import type { Product, ProductCategory } from "@/types";
import { useEffect, useState } from "react";

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
}

const categories = Object.keys(productCategoryLabel) as ProductCategory[];

const emptyForm = (): Omit<Product, "id"> => ({
  name: "",
  sku: "",
  category: "doors",
  price: 0,
  stock: 0,
  unit: "pcs",
  description: "",
  hsnCode: doorHsnPresets[0].hsnCode,
  gstRate: doorHsnPresets[0].gstRate,
});

export function ProductForm({ open, onClose }: ProductFormProps) {
  const { addProduct } = useData();
  const { toast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [hsnKind, setHsnKind] = useState<HsnPreset["id"]>(doorHsnPresets[0].id);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const presets = form.category === "waterproofing" ? waterproofHsnPresets : doorHsnPresets;

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm());
    setHsnKind(doorHsnPresets[0].id);
    setPrice("");
    setStock("");
  }, [open]);

  const applyPreset = (preset: HsnPreset) => {
    setHsnKind(preset.id);
    setForm((current) => ({
      ...current,
      hsnCode: preset.hsnCode,
      gstRate: preset.gstRate,
    }));
  };

  const changeCategory = (category: ProductCategory) => {
    const nextPresets = category === "waterproofing" ? waterproofHsnPresets : doorHsnPresets;
    setHsnKind(nextPresets[0].id);
    setForm((current) => ({
      ...current,
      category,
      hsnCode: nextPresets[0].hsnCode,
      gstRate: nextPresets[0].gstRate,
    }));
  };

  const submit = async () => {
    if (!form.name.trim() || !form.sku.trim() || !price || !form.hsnCode) return;
    setSubmitting(true);
    try {
      await addProduct({
        ...form,
        name: form.name.trim(),
        sku: form.sku.trim().toUpperCase(),
        price: Number(price),
        stock: Number(stock) || 0,
        hsnCode: form.hsnCode.replace(/\s/g, ""),
        gstRate: form.gstRate,
      });
      toast("Product added", "success");
      onClose();
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Unable to add product",
        "danger",
      );
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
            onChange={(event) => changeCategory(event.target.value as ProductCategory)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {productCategoryLabel[category]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">
            {form.category === "waterproofing"
              ? "Waterproof type / HSN"
              : form.category === "doors"
                ? "Door type / HSN"
                : "HSN / GST type"}
          </p>
          <div className="grid gap-2">
            {presets.map((preset) => {
              const active = hsnKind === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={cn(
                    "rounded-2xl border px-3 py-3 text-left",
                    active
                      ? "border-primary bg-primary/8"
                      : "border-border bg-card text-muted-foreground",
                  )}
                >
                  <span className="block text-sm font-semibold text-foreground">{preset.label}</span>
                  <span className="mt-0.5 block text-xs leading-5">{preset.detail}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="prd-hsn">HSN code</Label>
            <Input
              id="prd-hsn"
              value={hsnKind === "flush" ? "4418 20 / 4418 29 10" : formatHsn(form.hsnCode)}
              readOnly
            />
          </div>
          <div>
            <Label htmlFor="prd-gst">GST rate</Label>
            <Input id="prd-gst" value={`${gstPercent(form.gstRate)}%`} readOnly />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="prd-price">Price (ex-GST)</Label>
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
          disabled={submitting || !form.name.trim() || !form.sku.trim() || !price || !form.hsnCode}
          onClick={() => void submit()}
        >
          Save Product
        </Button>
      </div>
    </Overlay>
  );
}
