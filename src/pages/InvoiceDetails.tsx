import { InvoicePreview } from "@/components/billing/InvoicePreview";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaymentSheet } from "@/components/payments/PaymentSheet";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { Download, Printer, Share2 } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

export default function InvoiceDetails() {
  const { id } = useParams();
  const { invoices, customers, settings, cancelInvoice } = useData();
  const { toast } = useToast();
  const [payOpen, setPayOpen] = useState(false);
  const invoice = invoices.find((item) => item.id === id);
  const customer = customers.find((item) => item.id === invoice?.customerId);

  if (!invoice) {
    return (
      <ErrorState
        title="Unable to load invoice"
        description="This invoice could not be found."
      />
    );
  }

  const share = async () => {
    const text = `${invoice.number} · ${invoice.customerName}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: invoice.number, text });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast("Invoice details copied");
    } catch {
      toast("Unable to share invoice", "danger");
    }
  };

  const printInvoice = () => {
    window.print();
    toast("PDF ready");
  };

  return (
    <div>
      <PageHeader
        title={`Invoice #${invoice.number}`}
        backTo="/billing"
        actions={<StatusBadge status={invoice.status} />}
        className="print:hidden"
      />
      <div className="no-print mb-5 flex flex-wrap gap-2">
        <Button variant="outline" icon={<Share2 className="h-4 w-4" />} onClick={() => void share()}>
          Share
        </Button>
        <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={printInvoice}>
          Download PDF
        </Button>
        <Button variant="outline" icon={<Printer className="h-4 w-4" />} onClick={printInvoice}>
          Print
        </Button>
        {invoice.balance > 0 && invoice.status !== "cancelled" ? (
          <Button onClick={() => setPayOpen(true)}>Record Payment</Button>
        ) : null}
        {invoice.status !== "cancelled" && invoice.status !== "paid" ? (
          <Button
            variant="ghost"
            onClick={() => {
              void cancelInvoice(invoice.id);
              toast("Invoice cancelled");
            }}
          >
            Cancel
          </Button>
        ) : null}
      </div>
      <InvoicePreview invoice={invoice} settings={settings} customer={customer} />
      <PaymentSheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        presetCustomerId={invoice.customerId}
        presetInvoiceId={invoice.id}
      />
    </div>
  );
}
