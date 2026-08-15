import { BillSummary } from "@/components/billing/BillSummary";
import { CustomerSelector } from "@/components/billing/CustomerSelector";
import { ProductSelector } from "@/components/billing/ProductSelector";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { calculateBill, lineAmount } from "@/lib/calculations";
import { formatCurrency } from "@/lib/currency";
import type { Customer, InvoiceLineItem, PaymentMethod, Product } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface NewBillSheetProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (invoiceId: string) => void;
}

export function NewBillSheet({ open, onClose, onCreated }: NewBillSheetProps) {
  const { settings, createInvoice } = useData();
  const { toast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<InvoiceLineItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [amountPaid, setAmountPaid] = useState(0);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCustomer(null);
    setItems([]);
    setDiscount(0);
    setPaymentMethod("upi");
    setAmountPaid(0);
    setCustomerOpen(false);
    setProductOpen(false);
    setGenerating(false);
  }, [open]);

  const totals = useMemo(
    () =>
      calculateBill({
        items,
        discount,
        taxRate: settings.invoice.taxRate,
        amountPaid: paymentMethod === "credit" ? 0 : amountPaid,
      }),
    [amountPaid, discount, items, paymentMethod, settings.invoice.taxRate],
  );

  useEffect(() => {
    if (paymentMethod === "credit") {
      setAmountPaid(0);
      return;
    }
    setAmountPaid(totals.grandTotal);
  }, [paymentMethod, totals.grandTotal]);

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
      const invoice = await createInvoice({
        customerId: customer.id,
        customerName: customer.name,
        items,
        discount,
        taxRate: settings.invoice.taxRate,
        amountPaid: paymentMethod === "credit" ? 0 : amountPaid,
        paymentMethod,
        notes: settings.invoice.defaultNotes,
      });
      toast("Invoice created successfully", "success");
      onClose();
      onCreated?.(invoice.id);
    } catch {
      toast("Unable to create invoice", "danger");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title="New Bill">
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
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Products</h3>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary"
                onClick={() => setProductOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>
            {items.length ? (
              <ul className="elevated divide-y divide-border rounded-2xl">
                {items.map((item) => (
                  <li key={item.productId} className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.rate)}
                      </p>
                    </div>
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(value) => updateQty(item.productId, value)}
                    />
                    <p className="w-20 text-right text-sm font-medium tabular-nums">
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
                  </li>
                ))}
              </ul>
            ) : (
              <button
                type="button"
                onClick={() => setProductOpen(true)}
                className="w-full rounded-2xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground"
              >
                Add products to this bill
              </button>
            )}
          </section>

          <BillSummary
            totals={totals}
            discount={discount}
            onDiscountChange={setDiscount}
            taxRate={settings.invoice.taxRate}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            amountPaid={amountPaid}
            onAmountPaidChange={setAmountPaid}
            enabledMethods={settings.invoice.enabledPaymentMethods}
            onGenerate={() => void generate()}
            generating={generating}
            disabled={!customer || items.length === 0}
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
      />
    </>
  );
}
