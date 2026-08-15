import { BillSummary } from "@/components/billing/BillSummary";
import { CustomerSelector } from "@/components/billing/CustomerSelector";
import { ProductSelector } from "@/components/billing/ProductSelector";
import { PageHeader } from "@/components/layout/PageHeader";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { calculateBill, lineAmount } from "@/lib/calculations";
import { formatCurrency } from "@/lib/currency";
import type { Customer, InvoiceLineItem, PaymentMethod, Product } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NewBill() {
  const { settings, createInvoice } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<InvoiceLineItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [amountPaid, setAmountPaid] = useState(0);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

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
      navigate(`/billing/${invoice.id}`);
    } catch {
      toast("Unable to create invoice", "danger");
    } finally {
      setGenerating(false);
    }
  };

  const summary = (
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
  );

  return (
    <div>
      <PageHeader title="New Bill" backTo="/billing" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <section>
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">Customer</h2>
            <button
              type="button"
              onClick={() => setCustomerOpen(true)}
              className="flex w-full items-center justify-between rounded-md border border-border bg-card px-4 py-3 text-left"
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
              <h2 className="text-sm font-medium text-muted-foreground">Products</h2>
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
              <ul className="divide-y divide-border rounded-md border border-border bg-card">
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
                className="w-full rounded-md border border-dashed border-border px-4 py-8 text-sm text-muted-foreground"
              >
                Add products to this bill
              </button>
            )}
          </section>
          <div className="lg:hidden">{summary}</div>
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-8">{summary}</div>
        </div>
      </div>
      <CustomerSelector
        open={customerOpen}
        onClose={() => setCustomerOpen(false)}
        onSelect={setCustomer}
      />
      <ProductSelector
        open={productOpen}
        onClose={() => setProductOpen(false)}
        onAdd={addProduct}
      />
    </div>
  );
}
