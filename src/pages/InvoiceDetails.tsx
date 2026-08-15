import { InvoicePreview } from "@/components/billing/InvoicePreview";
import { NewBillSheet } from "@/components/billing/NewBillSheet";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { inferBillKind } from "@/lib/billing";
import { createInvoicePdfFile, downloadInvoicePdf, downloadPdfFile, sharePdfFile } from "@/lib/invoicePdf";
import { customerPdfLink, invoiceWhatsAppMessage, publishInvoicePdf } from "@/lib/invoiceLink";
import { openPreparingWindow, openWhatsAppChat, openWhatsAppChatIn } from "@/lib/whatsapp";
import { Download, LoaderCircle, Pencil, Printer, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function InvoiceDetails() {
  const { id } = useParams();
  const { invoices, customers, products, settings } = useData();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [publishFailed, setPublishFailed] = useState(false);
  const invoice = invoices.find((item) => item.id === id);
  const customer = customers.find((item) => item.id === invoice?.customerId);
  const filename = invoice ? `${invoice.number.replace(/\s+/g, "-")}.pdf` : "invoice.pdf";
  const listPath = invoice
    ? inferBillKind(invoice, products) === "waterproofing"
      ? "/waterproofing-bills"
      : invoice.taxRate === 0
        ? "/non-gst-bills"
        : "/billing"
    : "/billing";

  useEffect(() => {
    if (!invoice) {
      setPdfFile(null);
      setShareUrl(null);
      setPublishFailed(false);
      return;
    }
    let cancelled = false;
    setPdfFile(null);
    setShareUrl(null);
    setPublishFailed(false);
    const timer = window.setTimeout(() => {
      void (async () => {
        const element = document.getElementById("invoice-print-root");
        if (!element) return;
        try {
          const file = await createInvoicePdfFile(element, filename);
          if (cancelled) return;
          setPdfFile(file);
          try {
            const published = await publishInvoicePdf(file);
            if (!cancelled) setShareUrl(customerPdfLink(published));
          } catch {
            if (!cancelled) setPublishFailed(true);
          }
        } catch {
          if (!cancelled) setPdfFile(null);
        }
      })();
    }, 700);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [filename, invoice, invoice?.amountPaid, invoice?.grandTotal, invoice?.id, invoice?.items, invoice?.notes]);

  if (!invoice) {
    return (
      <ErrorState
        title="Unable to load invoice"
        description="This invoice could not be found."
      />
    );
  }

  const share = async () => {
    if (!customer?.phone) {
      toast("This customer has no WhatsApp number", "danger");
      return;
    }

    const messageFor = (downloadUrl: string) =>
      invoiceWhatsAppMessage(
        customer.name,
        invoice.number,
        settings.business.legalName,
        downloadUrl,
      );

    if (shareUrl) {
      openWhatsAppChat(customer.phone, messageFor(shareUrl));
      return;
    }

    const element = document.getElementById("invoice-print-root");
    const popup = openPreparingWindow("Preparing invoice PDF for WhatsApp…");
    setSharing(true);
    try {
      const file = pdfFile ?? (element ? await createInvoicePdfFile(element, filename) : null);
      if (!file) {
        popup?.close();
        toast("Unable to prepare PDF", "danger");
        return;
      }
      if (!pdfFile) setPdfFile(file);

      try {
        const published = await publishInvoicePdf(file);
        const downloadUrl = customerPdfLink(published);
        setShareUrl(downloadUrl);
        const sent = openWhatsAppChatIn(popup, customer.phone, messageFor(downloadUrl));
        if (!sent) toast("Unable to open WhatsApp", "danger");
        return;
      } catch {
        const result = await sharePdfFile(file, `Invoice ${invoice.number} for ${customer.name}`);
        if (result === "shared" || result === "aborted") {
          popup?.close();
          return;
        }
        downloadPdfFile(file);
        openWhatsAppChatIn(
          popup,
          customer.phone,
          `Invoice ${invoice.number} from ${settings.business.legalName}. Please attach the downloaded PDF.`,
        );
        toast("PDF saved. Attach it in WhatsApp.", "success");
      }
    } catch {
      popup?.close();
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
      await downloadInvoicePdf(element, filename);
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
          disabled={sharing || (!shareUrl && !publishFailed)}
          icon={
            sharing || (!shareUrl && !publishFailed) ? (
              <LoaderCircle className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4 shrink-0" />
            )
          }
          onClick={() => void share()}
        >
          {shareUrl || publishFailed ? "Share" : "Preparing"}
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
          icon={<Printer className="h-4 w-4" />}
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
