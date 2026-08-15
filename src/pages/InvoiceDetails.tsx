import { InvoicePreview } from "@/components/billing/InvoicePreview";
import { NewBillSheet } from "@/components/billing/NewBillSheet";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { inferBillKind } from "@/lib/billing";
import { canSharePdfFile, createInvoicePdfFile, downloadInvoicePdf, downloadPdfFile } from "@/lib/invoicePdf";
import { whatsappChatUrl } from "@/lib/whatsapp";
import { Download, LoaderCircle, Pencil, Printer, Share2 } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

export default function InvoiceDetails() {
  const { id } = useParams();
  const { invoices, customers, products, settings } = useData();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const invoice = invoices.find((item) => item.id === id);
  const customer = customers.find((item) => item.id === invoice?.customerId);
  const listPath = invoice
    ? inferBillKind(invoice, products) === "waterproofing"
      ? "/waterproofing-bills"
      : invoice.taxRate === 0
        ? "/non-gst-bills"
        : "/billing"
    : "/billing";

  if (!invoice) {
    return (
      <ErrorState
        title="Unable to load invoice"
        description="This invoice could not be found."
      />
    );
  }

  const share = async () => {
    const element = document.getElementById("invoice-print-root");
    if (!element) return;
    if (!customer?.phone) {
      toast("This customer has no WhatsApp number", "danger");
      return;
    }
    const filename = `${invoice.number.replace(/\s+/g, "-")}.pdf`;
    const caption = `Invoice ${invoice.number} from ${settings.business.legalName}`;
    setSharing(true);
    try {
      const file = await createInvoicePdfFile(element, filename);
      if (canSharePdfFile(file)) {
        await navigator.share({
          files: [file],
          title: `Invoice ${invoice.number}`,
          text: caption,
        });
        return;
      }
      downloadPdfFile(file);
      const url = whatsappChatUrl(customer.phone, caption);
      if (!url) {
        toast("Customer phone number is not valid for WhatsApp", "danger");
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
      toast("PDF downloaded. Attach the PDF in WhatsApp.", "success");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast("Unable to share PDF", "danger");
    } finally {
      setSharing(false);
    }
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
      <PageHeader
        title={`Invoice ${invoice.number}`}
        backTo={listPath}
        className="print:hidden"
        actions={
          invoice.status !== "cancelled" ? (
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground"
              aria-label="Edit bill"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </button>
          ) : null
        }
      />
      <div className="no-print mb-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="min-w-0 flex-1 px-2 whitespace-nowrap"
          disabled={sharing}
          icon={
            sharing ? (
              <LoaderCircle className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4 shrink-0" />
            )
          }
          onClick={() => void share()}
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
      {invoice.status !== "cancelled" ? (
        <NewBillSheet
          open={editOpen}
          kind={inferBillKind(invoice, products)}
          nonGst={invoice.taxRate === 0}
          existing={invoice}
          onClose={() => setEditOpen(false)}
        />
      ) : null}
    </div>
  );
}
