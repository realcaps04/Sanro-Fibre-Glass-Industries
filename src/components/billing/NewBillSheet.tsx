import { BillSummary } from "@/components/billing/BillSummary";
import { CustomerSelector } from "@/components/billing/CustomerSelector";
import { ProductSelector } from "@/components/billing/ProductSelector";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { calculateBill, lineAmount } from "@/lib/calculations";
import { billKindCategories, billKindSearchPlaceholder } from "@/lib/billing";
import { formatHsn } from "@/lib/hsn";
import { formatCurrency } from "@/lib/currency";
import type { BillKind, Customer, Invoice, InvoiceLineItem, PaymentMethod, Product } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface NewBillSheetProps {
  open: boolean;
  kind: BillKind;
  onClose: () => void;
  onCreated?: (invoiceId: string) => void;
  nonGst?: boolean;
  existing?: Invoice;
}

function sheetTitle(kind: BillKind, nonGst: boolean, editing: boolean) {
  if (kind === "mixed") {
    if (editing) return nonGst ? "Edit Non GST Bill" : "Edit GST Bill";
    return nonGst ? "New Non GST Bill" : "New GST Bill";
  }
  if (editing) {
    return kind === "waterproofing" ? "Edit Water proof Bill" : "Edit Door Bill";
  }
  if (nonGst) {
    return kind === "waterproofing" ? "New Non GST Water proof Bill" : "New Non GST Door Bill";
  }
  return kind === "waterproofing" ? "New Water proof Bill" : "New Door Bill";
}

function productPrompt(kind: BillKind) {
  if (kind === "mixed") return "Choose from all products";
  return kind === "waterproofing" ? "waterproof products" : "doors";
}

function productSelectorTitle(kind: BillKind) {
  if (kind === "mixed") return "Select product";
  return kind === "waterproofing" ? "Select waterproof product" : "Select door";
}

export function NewBillSheet({
  open,
  kind,
  onClose,
  onCreated,
  nonGst = false,
  existing,
}: NewBillSheetProps) {
  const { settings, customers, createInvoice, updateInvoice } = useData();
  const { toast } = useToast();
  const taxRate = nonGst ? 0 : settings.invoice.taxRate;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<InvoiceLineItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [amountPaid, setAmountPaid] = useState(0);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) {
      setCustomer(null);
      setItems([]);
      setDiscount(0);
      setPaymentMethod("upi");
      setAmountPaid(0);
      setCustomerOpen(false);
      setProductOpen(false);
      setGenerating(false);
      return;
    }
    if (!existing) return;
    const matched =
      customers.find((item) => item.id === existing.customerId) ??
      ({
        id: existing.customerId,
        name: existing.customerName,
        phone: "",
        address: "",
        createdAt: existing.createdAt,
      } satisfies Customer);
    setCustomer(matched);
    setItems(existing.items.map((item) => ({ ...item })));
    setDiscount(existing.discount);
    setPaymentMethod(existing.paymentMethod === "credit" ? "upi" : existing.paymentMethod);
    setAmountPaid(existing.amountPaid);
  }, [customers, existing, open]);

  const totals = useMemo(
    () =>
      calculateBill({
        items,
        discount,
        taxRate,
        amountPaid,
      }),
    [amountPaid, discount, items, taxRate],
  );

  useEffect(() => {
    if (amountPaid > totals.grandTotal) {
      setAmountPaid(totals.grandTotal);
    }
  }, [amountPaid, totals.grandTotal]);

  const addProduct = (product: Product, quantity: number) => {
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                amount: lineAmount(item.quantity + quantity, item.rate),
              }
            : item,
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          quantity,
          rate: product.price,
          amount: lineAmount(quantity, product.price),
          hsnCode: product.hsnCode,
          gstRate: nonGst ? 0 : product.gstRate,
        },
      ];
    });
  };

  const updateQty = (productId: string, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? { ...item, quantity, amount: lineAmount(quantity, item.rate) }
          : item,
      ),
    );
  };

  const generate = async () => {
    if (!customer || !items.length) return;
    setGenerating(true);
    try {
      const payload = {
        customerId: customer.id,
        customerName: customer.name,
        items: nonGst
          ? items.map((item) => ({ ...item, gstRate: 0, tax: 0 }))
          : items,
        discount,
        taxRate: nonGst ? 0 : taxRate,
        amountPaid,
        paymentMethod,
        notes: existing?.notes ?? settings.invoice.defaultNotes,
        billKind: kind,
      };
      const invoice = existing
        ? await updateInvoice(existing.id, payload)
        : await createInvoice(payload);
      toast(existing ? "Invoice updated" : "Invoice created successfully", "success");
      onClose();
      onCreated?.(invoice.id);
    } catch (error) {
      toast(
        existing
          ? "Unable to update invoice"
          : error instanceof Error
            ? error.message
            : "Unable to create invoice",
        "danger",
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title={sheetTitle(kind, nonGst, Boolean(existing))}>
        <div className="space-y-5">
          <section>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Customer</h3>
            <button
              type="button"
              onClick={() => setCustomerOpen(true)}
              className="elevated flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left"
            >
              {customer ? (
                <span>
                  <span className="block font-medium">{customer.name}</span>
                  <span className="text-sm text-muted-foreground">{customer.phone}</span>
                </span>
              ) : (
                <span className="text-muted-foreground">Select customer</span>
              )}
            </button>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Products</h3>
            {items.length ? (
              <div className="space-y-2">
                <ul className="elevated divide-y divide-border rounded-2xl">
                  {items.map((item) => (
                    <li key={item.productId} className="px-4 py-3">
                      <p className="font-medium">{item.name}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.rate)}
                        {item.hsnCode ? ` · HSN ${formatHsn(item.hsnCode)}` : ""}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(value) => updateQty(item.productId, value)}
                        />
                        <p className="min-w-0 flex-1 text-right text-sm font-medium tabular-nums">
                          {formatCurrency(item.amount)}
                        </p>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-danger"
                          onClick={() =>
                            setItems((current) =>
                              current.filter((line) => line.productId !== item.productId),
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setProductOpen(true)}
                  className="inline-flex w-full items-center justify-center gap-1 rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground"
                >
                  <Plus className="h-4 w-4" />
                  Add another product
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setProductOpen(true)}
                className="w-full rounded-2xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground"
              >
                {kind === "mixed"
                  ? productPrompt(kind)
                  : `Choose from ${productPrompt(kind)}`}
              </button>
            )}
          </section>

          <BillSummary
            totals={totals}
            discount={discount}
            onDiscountChange={setDiscount}
            taxRate={taxRate}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            amountPaid={amountPaid}
            onAmountPaidChange={setAmountPaid}
            enabledMethods={settings.invoice.enabledPaymentMethods.filter(
              (method) => method !== "credit",
            )}
            onGenerate={() => void generate()}
            generating={generating}
            disabled={!customer || items.length === 0}
            submitLabel={existing ? "Update Invoice" : "Generate Invoice"}
          />
        </div>
      </BottomSheet>
      <CustomerSelector
        open={customerOpen}
        onClose={() => setCustomerOpen(false)}
        onSelect={(selected) => {
          setCustomer(selected);
          setCustomerOpen(false);
        }}
      />
      <ProductSelector
        open={productOpen}
        onClose={() => setProductOpen(false)}
        onAdd={addProduct}
        allowedCategories={billKindCategories[kind]}
        title={productSelectorTitle(kind)}
        searchPlaceholder={billKindSearchPlaceholder[kind]}
        hideGst={nonGst}
      />
    </>
  );
}
