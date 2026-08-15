import { amountInWords } from "@/lib/amountWords";
import { formatInvoiceAmount } from "@/lib/currency";
import { addDays, formatIndianDate } from "@/lib/dates";
import { formatHsn, gstPercent } from "@/lib/hsn";
import { paymentLabel } from "@/lib/labels";
import type { AppSettings, Customer, Invoice, InvoiceStatus, PaymentMethod } from "@/types";

const accent = "#003f34";
const line = "#111111";

const paymentMode: Record<PaymentMethod, string> = {
  cash: "Cash",
  upi: "UPI",
  bank: "Bank Transfer",
  credit: "Credit",
};

function stampLabel(status: InvoiceStatus) {
  if (status === "paid") return "PAID";
  if (status === "cancelled") return "CANCELLED";
  if (status === "partial") return "PARTIAL";
  return "UNPAID";
}

function stampColor(status: InvoiceStatus) {
  if (status === "paid") return "rgba(22, 163, 74, 0.18)";
  if (status === "cancelled") return "rgba(107, 114, 128, 0.22)";
  return "rgba(220, 38, 38, 0.16)";
}

function MetaRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <tr>
      <td className={`w-[42%] border-r px-2.5 py-1.5 font-semibold ${last ? "" : "border-b"}`} style={{ borderColor: line }}>
        {label}
      </td>
      <td className={`px-2.5 py-1.5 text-right ${last ? "" : "border-b"}`} style={{ borderColor: line }}>
        {value}
      </td>
    </tr>
  );
}

function TotalsRow({
  label,
  value,
  bold = false,
  last = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
  last?: boolean;
}) {
  return (
    <tr className={bold ? "font-semibold" : undefined}>
      <td className={`px-2.5 py-1.5 ${last ? "" : "border-b"}`} style={{ borderColor: line }}>
        {label}
      </td>
      <td
        className={`w-[42%] border-l px-2.5 py-1.5 text-right tabular-nums ${last ? "" : "border-b"}`}
        style={{ borderColor: line }}
      >
        {value}
      </td>
    </tr>
  );
}

interface InvoicePreviewProps {
  invoice: Invoice;
  settings: AppSettings;
  customer?: Customer;
}

export function InvoicePreview({ invoice, settings, customer }: InvoicePreviewProps) {
  const { business } = settings;
  const gstBill = invoice.taxRate > 0;
  const dueDate = addDays(invoice.date, 7);
  const taxable = invoice.taxableAmount ?? Math.max(0, invoice.subtotal - invoice.discount);
  const cgst = invoice.cgst ?? Math.round(invoice.tax / 2);
  const sgst = invoice.sgst ?? invoice.tax - cgst;
  const gstHalf = gstPercent(invoice.taxRate) / 2;
  const itemCount = invoice.items.length;
  const qtyTotal = invoice.items.reduce((sum, item) => sum + item.quantity, 0);
  const stamp = stampLabel(invoice.status);
  const hasBank = Boolean(business.bankAccountNumber || business.bankIfsc || business.bankName);
  const hasUpi = Boolean(business.upiId);
  const upiLink = hasUpi
    ? `upi://pay?pa=${encodeURIComponent(business.upiId)}&pn=${encodeURIComponent(business.legalName)}&am=${invoice.grandTotal}&cu=INR&tn=${encodeURIComponent(invoice.number)}`
    : "";
  const billType = gstBill ? "GST Tax Invoice" : "Non-GST Invoice";
  const kindLabel =
    invoice.billKind === "waterproofing" ? "Water proof billing" : "Door Billing";

  return (
    <article
      id="invoice-print-root"
      className="mx-auto w-full bg-white text-[#111111]"
      style={{ border: `1px solid ${line}`, fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      <div className="border-b px-3 py-2.5 text-center" style={{ borderColor: line }}>
        <h1 className="text-[22px] font-bold tracking-[0.18em]" style={{ color: accent }}>
          INVOICE
        </h1>
      </div>

      <div className="grid grid-cols-1 border-b sm:grid-cols-[1.15fr_0.85fr]" style={{ borderColor: line }}>
        <div className="flex gap-3 border-b p-3 sm:border-r sm:border-b-0" style={{ borderColor: line }}>
          {business.logo ? (
            <img src={business.logo} alt="" className="h-12 w-12 shrink-0 object-contain" />
          ) : null}
          <div className="min-w-0">
            <p className="text-[15px] font-bold leading-tight" style={{ color: accent }}>
              {business.legalName}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold" style={{ color: accent }}>
              {billType}
            </p>
            <p className="mt-1.5 text-[11px] leading-4 text-[#333]">
              {business.address}
              <br />
              Phone: {business.phone}
              <br />
              Email: {business.email}
              {business.gstin ? (
                <>
                  <br />
                  GSTIN: {business.gstin}
                </>
              ) : null}
            </p>
          </div>
        </div>
        <table className="w-full border-collapse text-[11px]">
          <tbody>
            <MetaRow label="Invoice #" value={invoice.number} />
            <MetaRow label="Invoice Date" value={formatIndianDate(invoice.date)} />
            <MetaRow label="Due Date" value={formatIndianDate(dueDate)} />
            <MetaRow label="Payment Mode" value={paymentMode[invoice.paymentMethod] ?? paymentLabel[invoice.paymentMethod]} />
            <MetaRow label="Status" value={stamp === "UNPAID" ? "Unpaid" : stamp[0] + stamp.slice(1).toLowerCase()} last />
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 border-b text-[11px] sm:grid-cols-2" style={{ borderColor: line }}>
        <div className="border-b p-3 sm:border-r sm:border-b-0" style={{ borderColor: line }}>
          <p className="mb-1 font-bold uppercase tracking-wide" style={{ color: accent }}>
            Customer Details
          </p>
          <p className="font-semibold">{invoice.customerName}</p>
          <p className="mt-1 leading-4 text-[#333]">
            {customer?.address}
            {customer?.phone ? (
              <>
                <br />
                Phone: {customer.phone}
              </>
            ) : null}
            {customer?.gstin ? (
              <>
                <br />
                GSTIN: {customer.gstin}
              </>
            ) : null}
          </p>
        </div>
        <div className="p-3">
          <p className="mb-1 font-bold uppercase tracking-wide" style={{ color: accent }}>
            Bill Details
          </p>
          <p className="leading-5">
            Bill Type: {kindLabel}
            <br />
            {gstBill ? `GST: ${gstPercent(invoice.taxRate)}% (CGST ${gstHalf}% + SGST ${gstHalf}%)` : "GST: Not applicable"}
            <br />
            Payment Due: {formatIndianDate(dueDate)}
            <br />
            Balance Due: {formatInvoiceAmount(invoice.balance)}
          </p>
        </div>
      </div>

      <div className="relative">
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <span
            className="rotate-[-22deg] text-[64px] font-black tracking-[0.2em]"
            style={{ color: stampColor(invoice.status) }}
          >
            {stamp}
          </span>
        </div>

        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="bg-[#f3f3f3] text-left font-bold">
              <th className="w-8 border-b border-r px-2 py-2" style={{ borderColor: line }}>
                #
              </th>
              <th className="border-b border-r px-2 py-2" style={{ borderColor: line }}>
                Item
              </th>
              <th className="w-[18%] border-b border-r px-2 py-2" style={{ borderColor: line }}>
                HSN
              </th>
              <th className="w-[16%] border-b border-r px-2 py-2 text-right" style={{ borderColor: line }}>
                Rate / Item
              </th>
              <th className="w-12 border-b border-r px-2 py-2 text-right" style={{ borderColor: line }}>
                Qty
              </th>
              <th className="w-[18%] border-b px-2 py-2 text-right" style={{ borderColor: line }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={`${item.productId}-${item.sku}`}>
                <td className="border-b border-r px-2 py-2 tabular-nums" style={{ borderColor: line }}>
                  {index + 1}
                </td>
                <td className="border-b border-r px-2 py-2" style={{ borderColor: line }}>
                  <p className="font-medium">{item.name}</p>
                  {item.sku ? <p className="text-[10px] text-[#555]">{item.sku}</p> : null}
                </td>
                <td className="border-b border-r px-2 py-2 tabular-nums" style={{ borderColor: line }}>
                  {item.hsnCode ? formatHsn(item.hsnCode) : "—"}
                </td>
                <td className="border-b border-r px-2 py-2 text-right tabular-nums" style={{ borderColor: line }}>
                  {formatInvoiceAmount(item.rate)}
                </td>
                <td className="border-b border-r px-2 py-2 text-right tabular-nums" style={{ borderColor: line }}>
                  {item.quantity.toFixed(2)}
                </td>
                <td className="border-b px-2 py-2 text-right tabular-nums" style={{ borderColor: line }}>
                  {formatInvoiceAmount(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 border-b text-[11px] sm:grid-cols-2" style={{ borderColor: line }}>
        <div className="border-b p-3 sm:border-r sm:border-b-0" style={{ borderColor: line }}>
          <p className="font-semibold">
            Total Items / Qty : {itemCount} / {qtyTotal.toFixed(2)}
          </p>
        </div>
        <table className="w-full border-collapse">
          <tbody>
            <TotalsRow label="Subtotal" value={formatInvoiceAmount(invoice.subtotal)} />
            <TotalsRow label="Discount" value={formatInvoiceAmount(invoice.discount)} />
            {gstBill ? (
              <>
                <TotalsRow label="Taxable value" value={formatInvoiceAmount(taxable)} />
                <TotalsRow label={`CGST (${gstHalf}%)`} value={formatInvoiceAmount(cgst)} />
                <TotalsRow label={`SGST (${gstHalf}%)`} value={formatInvoiceAmount(sgst)} />
              </>
            ) : (
              <TotalsRow label="GST" value={formatInvoiceAmount(0)} />
            )}
            <TotalsRow label="Total" value={formatInvoiceAmount(invoice.grandTotal)} bold />
            <TotalsRow label="Paid Amount" value={formatInvoiceAmount(invoice.amountPaid)} />
            <TotalsRow label="Balance Due" value={formatInvoiceAmount(invoice.balance)} bold last />
          </tbody>
        </table>
      </div>

      <div className="border-b px-3 py-2 text-[11px]" style={{ borderColor: line }}>
        <span className="font-semibold">Total amount (in words): </span>
        {amountInWords(invoice.grandTotal)}
      </div>

      <div className="grid grid-cols-1 border-b text-[11px] sm:grid-cols-2" style={{ borderColor: line }}>
        <div className="border-b p-3 sm:border-r sm:border-b-0" style={{ borderColor: line }}>
          <p className="mb-1.5 font-bold uppercase tracking-wide" style={{ color: accent }}>
            Bank Details
          </p>
          {hasBank ? (
            <p className="leading-5">
              Account Holder Name: {business.bankAccountName || business.legalName}
              <br />
              Account Number: {business.bankAccountNumber || "—"}
              <br />
              IFSC Code: {business.bankIfsc || "—"}
              <br />
              Bank Name: {business.bankName || "—"}
            </p>
          ) : (
            <p className="leading-5 text-[#555]">
              Add bank details in Settings to show them on invoices.
            </p>
          )}
        </div>
        <div className="p-3">
          <p className="mb-1.5 font-bold uppercase tracking-wide" style={{ color: accent }}>
            Pay using UPI
          </p>
          {hasUpi ? (
            <div className="flex items-start gap-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=6&data=${encodeURIComponent(upiLink)}`}
                alt="UPI QR code"
                className="h-[92px] w-[92px] border bg-white"
                style={{ borderColor: line }}
              />
              <p className="leading-5">
                UPI ID: {business.upiId}
                <br />
                Payee: {business.bankAccountName || business.legalName}
                <br />
                Amount: {formatInvoiceAmount(invoice.grandTotal)}
              </p>
            </div>
          ) : (
            <p className="leading-5 text-[#555]">
              Add a UPI ID in Settings to show a payment QR on invoices.
            </p>
          )}
        </div>
      </div>

      <div className="border-b px-3 py-2.5 text-[11px]" style={{ borderColor: line }}>
        <p className="font-bold" style={{ color: accent }}>
          Notes
        </p>
        <p className="mt-1">{invoice.notes || settings.invoice.defaultNotes}</p>
      </div>

      <div className="grid grid-cols-1 text-[11px] sm:grid-cols-2">
        <div className="border-b p-3 sm:border-r sm:border-b-0" style={{ borderColor: line }}>
          <p className="font-bold" style={{ color: accent }}>
            Terms and Conditions
          </p>
          <ol className="mt-1 list-decimal space-y-0.5 pl-4 leading-4">
            <li>Goods once sold will not be taken back or exchanged.</li>
            <li>Please pay the balance within 7 days of the invoice date.</li>
            <li>Subject to Idukki jurisdiction only.</li>
          </ol>
        </div>
        <div className="flex flex-col items-end justify-end p-3 text-right">
          <div className="h-10" />
          <div className="w-40 border-t pt-1" style={{ borderColor: line }}>
            <p className="font-semibold">Authorized Signatory</p>
            <p className="mt-0.5 font-bold" style={{ color: accent }}>
              {business.legalName}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
