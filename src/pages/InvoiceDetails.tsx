import { InvoicePreview } from "@/components/billing/InvoicePreview";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { formatInvoiceAmount } from "@/lib/currency";
import { downloadInvoicePdf } from "@/lib/invoicePdf";
import { whatsappChatUrl } from "@/lib/whatsapp";
import { Download, LoaderCircle, Printer, Share2 } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

function invoiceShareText(
  invoice: {
    number: string;
    customerName: string;
    grandTotal: number;
    amountPaid: number;
    balance: number;
    items: Array<{ name: string; quantity: number; amount: number }>;
  },
  businessName: string,
) {
  const items = invoice.items
    .map(
      (item, index) =>
        `${index + 1}. ${item.name} x ${item.quantity} = ${formatInvoiceAmount(item.amount)}`,
    )
    .join("\n");
  return [
    `Hello ${invoice.customerName},`,
    "",
    `Invoice ${invoice.number} from ${businessName}.`,
    "",
    items,
    "",
    `Total: ${formatInvoiceAmount(invoice.grandTotal)}`,
    `Paid: ${formatInvoiceAmount(invoice.amountPaid)}`,
    `Balance: ${formatInvoiceAmount(invoice.balance)}`,
    "",
    "Please check the bill. Thank you.",
  ].join("\n");
}

export default function InvoiceDetails() {
  const { id } = useParams();
  const { invoices, customers, settings } = useData();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
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

  const share = () => {
    if (!customer?.phone) {
      toast("This customer has no WhatsApp number", "danger");
      return;
    }
    const url = whatsappChatUrl(
      customer.phone,
      invoiceShareText(invoice, settings.business.legalName),
    );
    if (!url) {
      toast("Customer phone number is not valid for WhatsApp", "danger");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const downloadPdf = async () => {
    const element = document.getElementById("invoice-print-root");
    if (!element) return;
    setDownloading(true);
    try {
      await downloadInvoicePdf(element, `${invoice.number.replace(/\s+/g, "-")}.pdf`);
      toast("PDF downloaded", "success");
    } catch {
      toast("Unable to download PDF", "danger");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <PageHeader title={`Invoice ${invoice.number}`} backTo="/billing" className="print:hidden" />
      <div className="no-print mb-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="min-w-0 flex-1 px-2 whitespace-nowrap"
          icon={<Share2 className="h-4 w-4 shrink-0" />}
          onClick={share}
        >
          Share
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="min-w-0 flex-1 px-2 whitespace-nowrap"
          disabled={downloading}
          icon={
            downloading ? (
              <LoaderCircle className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <Download className="h-4 w-4 shrink-0" />
            )
          }
          onClick={() => void downloadPdf()}
        >
          PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="min-w-0 flex-1 px-2 whitespace-nowrap"
          icon={<Printer className="h-4 w-4 shrink-0" />}
          onClick={() => window.print()}
        >
          Print
        </Button>
      </div>
      <div className="overflow-x-auto pb-4">
        <InvoicePreview invoice={invoice} settings={settings} customer={customer} />
      </div>
    </div>
  );
}
