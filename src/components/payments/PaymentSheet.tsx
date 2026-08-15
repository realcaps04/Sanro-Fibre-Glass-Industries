import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Overlay } from "@/components/ui/Overlay";
import { Select } from "@/components/ui/Select";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { customerOutstanding } from "@/lib/stats";
import type { PaymentMethod } from "@/types";
import { useEffect, useMemo, useState } from "react";

interface PaymentSheetProps {
  open: boolean;
  onClose: () => void;
  presetCustomerId?: string;
  presetInvoiceId?: string;
}

export function PaymentSheet({
  open,
  onClose,
  presetCustomerId,
  presetInvoiceId,
}: PaymentSheetProps) {
  const { customers, invoices, recordPayment } = useData();
  const { toast } = useToast();
  const selectableCustomers = useMemo(
    () =>
      customers.filter(
        (customer) => customerOutstanding(customer.id, invoices) > 0 || customer.id === presetCustomerId,
      ),
    [customers, invoices, presetCustomerId],
  );
  const [customerId, setCustomerId] = useState(presetCustomerId ?? "");
  const [invoiceId, setInvoiceId] = useState(presetInvoiceId ?? "");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<Exclude<PaymentMethod, "credit">>("upi");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCustomerId(presetCustomerId ?? "");
    setInvoiceId(presetInvoiceId ?? "");
  }, [open, presetCustomerId, presetInvoiceId]);

  const customerInvoices = invoices.filter(
    (invoice) =>
      invoice.customerId === customerId &&
      invoice.balance > 0 &&
      invoice.status !== "cancelled",
  );
  const selectedOutstanding = customerId
    ? customerOutstanding(customerId, invoices)
    : 0;

  const close = () => {
    onClose();
    setAmount("");
    setInvoiceId(presetInvoiceId ?? "");
  };

  const submit = async () => {
    const value = Number(amount);
    if (!customerId || !value || value <= 0) return;
    setSubmitting(true);
    try {
      await recordPayment({
        customerId,
        invoiceId: invoiceId || undefined,
        amount: value,
        paymentMethod: method,
      });
      toast("Payment recorded", "success");
      close();
    } catch {
      toast("Unable to record payment", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Overlay open={open} onClose={close} title="Record Payment">
      <div className="space-y-4">
        <div>
          <Label htmlFor="pay-customer">Customer</Label>
          <Select
            id="pay-customer"
            value={customerId}
            onChange={(event) => {
              setCustomerId(event.target.value);
              setInvoiceId("");
            }}
          >
            <option value="">Select customer</option>
            {(selectableCustomers.length ? selectableCustomers : customers).map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </Select>
        </div>
        {customerId ? (
          <div>
            <Label htmlFor="pay-invoice">Invoice</Label>
            <Select
              id="pay-invoice"
              value={invoiceId}
              onChange={(event) => setInvoiceId(event.target.value)}
            >
              <option value="">Apply to oldest first</option>
              {customerInvoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.number}
                </option>
              ))}
            </Select>
            <p className="mt-1 text-xs text-muted-foreground">
              Outstanding ₹{selectedOutstanding.toLocaleString("en-IN")}
            </p>
          </div>
        ) : null}
        <div>
          <Label htmlFor="pay-amount">Amount</Label>
          <Input
            id="pay-amount"
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="pay-method">Payment method</Label>
          <Select
            id="pay-method"
            value={method}
            onChange={(event) =>
              setMethod(event.target.value as Exclude<PaymentMethod, "credit">)
            }
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank">Bank</option>
          </Select>
        </div>
        <Button fullWidth onClick={() => void submit()} disabled={submitting || !customerId}>
          Record Payment
        </Button>
      </div>
    </Overlay>
  );
}
