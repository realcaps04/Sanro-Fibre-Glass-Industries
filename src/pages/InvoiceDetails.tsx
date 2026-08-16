import { InvoicePreview } from "@/components/billing/InvoicePreview";
import { NewBillSheet } from "@/components/billing/NewBillSheet";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Overlay } from "@/components/ui/Overlay";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { inferBillKind, isAnyBill } from "@/lib/billing";
import { formatCurrency, formatInvoiceAmount } from "@/lib/currency";
import { invoiceWhatsAppMessage } from "@/lib/invoiceLink";
import { createInvoicePdfFile, downloadInvoicePdf, downloadPdfFile } from "@/lib/invoicePdf";
import { mapConvexBill } from "@/services/invoiceService";
import { openWhatsAppChat } from "@/lib/whatsapp";
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";
import { CircleCheck, Download, LoaderCircle, Pencil, Printer, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function InvoiceDetails() {
  const { id } = useParams();
  const { invoices, customers, products, settings, recordPayment } = useData();
  const { toast } = useToast();
  const remoteBill = useQuery(api.billActions.get, id ? { id } : "skip");
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [paidOpen, setPaidOpen] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const invoice =
    invoices.find((item) => item.id === id) ??
    (remoteBill ? mapConvexBill(remoteBill) : undefined);
  const customer = customers.find((item) => item.id === invoice?.customerId);
  const filename = invoice ? `${invoice.number.replace(/\s+/g, "-")}.pdf` : "invoice.pdf";
  const listPath = invoice
    ? isAnyBill(invoice)
      ? "/any-bills"
      : inferBillKind(invoice, products) === "waterproofing"
        ? "/waterproofing-bills"
        : "/billing"
    : "/billing";

  useEffect(() => {
    if (!invoice) {
      setPdfFile(null);
      return;
    }
    let cancelled = false;
    setPdfFile(null);
    const timer = window.setTimeout(() => {
      void (async () => {
        const element = document.getElementById("invoice-print-root");
        if (!element) return;
        try {
          const file = await createInvoicePdfFile(element, filename);
          if (!cancelled) setPdfFile(file);
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
    if (id && remoteBill === undefined) {
      return <PageSkeleton />;
    }
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
    const element = document.getElementById("invoice-print-root");
    setSharing(true);
    try {
      const file = pdfFile ?? (element ? await createInvoicePdfFile(element, filename) : null);
      if (!file) {
        toast("Unable to prepare PDF", "danger");
        return;
      }
      if (!pdfFile) setPdfFile(file);
      downloadPdfFile(file);
      openWhatsAppChat(
        customer.phone,
        invoiceWhatsAppMessage(
          customer.name,
          invoice.number,
          settings.business.legalName,
          formatInvoiceAmount(invoice.grandTotal),
          invoice.balance > 0 ? formatInvoiceAmount(invoice.balance) : "",
        ),
      );
      toast("PDF saved. Attach it in the WhatsApp chat.", "success");
    } catch {
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

  const markPaid = async () => {
    if (invoice.status === "paid" || invoice.balance <= 0) return;
    setMarkingPaid(true);
    try {
      await recordPayment({
        customerId: invoice.customerId,
        invoiceId: invoice.id,
        amount: invoice.balance,
        paymentMethod: invoice.paymentMethod === "credit" ? "upi" : invoice.paymentMethod,
        notes: "Marked as paid",
      });
      setPaidOpen(false);
      toast(`${invoice.number} marked as paid`, "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to mark as paid", "danger");
    } finally {
      setMarkingPaid(false);
    }
  };

  const unpaid = invoice.status !== "cancelled" && invoice.status !== "paid" && invoice.balance > 0;

  return (
    <div>
      <PageHeader
        title={`Invoice ${invoice.number}`}
        backTo={listPath}
        className="print:hidden"
        actions={
          invoice.status !== "cancelled" ? (
            <div className="flex items-center gap-2">
              {unpaid ? (
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground"
                  aria-label="Mark bill as paid"
                  onClick={() => setPaidOpen(true)}
                >
                  <CircleCheck className="h-4 w-4" />
                </button>
              ) : null}
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground"
                aria-label="Edit bill"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          ) : null
        }
      />
      <div className="no-print mb-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="min-w-0 flex-1 px-2 whitespace-nowrap"
          disabled={sharing || !pdfFile}
          icon={
            sharing || !pdfFile ? (
              <LoaderCircle className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4 shrink-0" />
            )
          }
          onClick={() => void share()}
        >
          {pdfFile ? "Share" : "Preparing"}
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
      <Overlay
        open={paidOpen}
        onClose={() => {
          if (!markingPaid) setPaidOpen(false);
        }}
        title="Mark as paid"
      >
        <div className="space-y-5">
          <p className="text-sm leading-6 text-muted-foreground">
            Mark {invoice.number} as fully paid? The outstanding{" "}
            <span className="font-semibold text-foreground">{formatCurrency(invoice.balance)}</span>{" "}
            will be recorded as received.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              fullWidth
              disabled={markingPaid}
              onClick={() => setPaidOpen(false)}
            >
              Cancel
            </Button>
            <Button fullWidth disabled={markingPaid} onClick={() => void markPaid()}>
              {markingPaid ? "Saving…" : "Mark as paid"}
            </Button>
          </div>
        </div>
      </Overlay>
    </div>
  );
}
