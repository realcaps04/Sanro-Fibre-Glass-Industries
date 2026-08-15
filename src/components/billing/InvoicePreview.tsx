import { amountInWords } from "@/lib/amountWords";
import { formatInvoiceAmount } from "@/lib/currency";
import { addDays, formatIndianDate } from "@/lib/dates";
import { formatHsn, gstPercent } from "@/lib/hsn";
import { INVOICE_SHEET_WIDTH } from "@/lib/invoiceSheet";
import { paymentLabel } from "@/lib/labels";
import type { AppSettings, Customer, Invoice, InvoiceStatus, PaymentMethod } from "@/types";
import { useEffect, useRef, useState } from "react";

const accent = "#2563eb";
const line = "#111111";
const headerBg = "#f3f4f6";

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

function stampTone(status: InvoiceStatus) {
  if (status === "paid") return "#16a34a";
  if (status === "cancelled") return "#6b7280";
  return "#dc2626";
}

function statusText(status: InvoiceStatus) {
  const stamp = stampLabel(status);
  return stamp[0] + stamp.slice(1).toLowerCase();
}

const cell = { borderColor: line, borderWidth: 1, borderStyle: "solid" as const };

interface InvoicePreviewProps {
  invoice: Invoice;
  settings: AppSettings;
  customer?: Customer;
}

export function InvoicePreview({ invoice, settings, customer }: InvoicePreviewProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const [scale, setScale] = useState(1);
  const [sheetHeight, setSheetHeight] = useState(1100);
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
  const tone = stampTone(invoice.status);
  const hasBank = Boolean(business.bankAccountNumber || business.bankIfsc || business.bankName);
  const hasUpi = Boolean(business.upiId);
  const upiLink = hasUpi
    ? `upi://pay?pa=${encodeURIComponent(business.upiId)}&pn=${encodeURIComponent(business.legalName)}&am=${invoice.grandTotal}&cu=INR&tn=${encodeURIComponent(invoice.number)}`
    : "";
  const billType = gstBill ? "GST Tax Invoice" : "Non-GST Invoice";
  const serviceType =
    invoice.billKind === "waterproofing"
      ? gstBill
        ? "Water proof billing (GST)"
        : "Water proof billing (Non-GST)"
      : gstBill
        ? "Door Billing (GST)"
        : "Door Billing (Non-GST)";

  useEffect(() => {
    const wrap = wrapRef.current;
    const sheet = sheetRef.current;
    if (!wrap || !sheet) return;
    const update = () => {
      setScale(Math.min(1, wrap.clientWidth / INVOICE_SHEET_WIDTH));
      setSheetHeight(sheet.offsetHeight);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(wrap);
    observer.observe(sheet);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="invoice-preview-frame w-full overflow-hidden print:h-auto print:overflow-visible"
      style={{ height: sheetHeight * scale }}
    >
      <div
        className="invoice-scale origin-top-left print:!transform-none"
        style={{
          width: INVOICE_SHEET_WIDTH,
          transform: `scale(${scale})`,
        }}
      >
        <article
          id="invoice-print-root"
          ref={sheetRef}
          className="bg-white text-[#111]"
          style={{
            width: INVOICE_SHEET_WIDTH,
            border: `1px solid ${line}`,
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 12,
            lineHeight: 1.35,
          }}
        >
          <div className="border-b py-2.5 text-center" style={{ borderColor: line }}>
            <h1 className="text-[26px] font-bold tracking-[0.14em]" style={{ color: accent }}>
              INVOICE
            </h1>
          </div>

          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="w-[58%] align-top p-3" style={{ ...cell, borderTop: "none", borderLeft: "none" }}>
                  <div className="flex items-start gap-2.5">
                    {business.logo ? (
                      <img src={business.logo} alt="" className="h-11 w-11 object-contain" />
                    ) : null}
                    <div>
                      <p className="text-[16px] font-bold" style={{ color: accent }}>
                        {business.legalName}
                      </p>
                      <p className="text-[12px] font-semibold" style={{ color: accent }}>
                        {billType}
                      </p>
                      <p className="mt-1.5 text-[11px] leading-[16px] text-[#222]">
                        {business.address}
                        <br />
                        Phone: {business.phone}
                        <br />
                        Email: {business.email}
                        {gstBill && business.gstin ? (
                          <>
                            <br />
                            GSTIN: {business.gstin}
                          </>
                        ) : null}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="align-top p-0" style={{ ...cell, borderTop: "none", borderRight: "none" }}>
                  <table className="w-full border-collapse text-[11px]">
                    <tbody>
                      {[
                        ["Invoice #", invoice.number],
                        ["Invoice Date", formatIndianDate(invoice.date)],
                        ["Due Date", formatIndianDate(dueDate)],
                        ["Payment Mode", paymentMode[invoice.paymentMethod] ?? paymentLabel[invoice.paymentMethod]],
                        ["Status", statusText(invoice.status)],
                      ].map(([label, value], index, rows) => (
                        <tr key={label}>
                          <td
                            className="w-[44%] px-2.5 py-1.5 font-semibold"
                            style={{
                              background: headerBg,
                              borderBottom: index === rows.length - 1 ? "none" : `1px solid ${line}`,
                              borderRight: `1px solid ${line}`,
                            }}
                          >
                            {label}
                          </td>
                          <td
                            className="px-2.5 py-1.5 text-right"
                            style={{
                              borderBottom: index === rows.length - 1 ? "none" : `1px solid ${line}`,
                            }}
                          >
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="w-1/2 px-3 py-1.5 font-bold" style={{ ...cell, borderLeft: "none", background: headerBg }}>
                  Customer Details
                </td>
                <td className="w-1/2 px-3 py-1.5 font-bold" style={{ ...cell, borderRight: "none", background: headerBg }}>
                  Service Details
                </td>
              </tr>
              <tr>
                <td className="w-1/2 align-top p-3 text-[11px]" style={{ ...cell, borderLeft: "none", borderTop: "none" }}>
                  <p className="font-semibold">{invoice.customerName}</p>
                  <p className="mt-1 leading-[16px]">
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
                </td>
                <td className="w-1/2 align-top p-3 text-[11px] leading-[18px]" style={{ ...cell, borderRight: "none", borderTop: "none" }}>
                  Service Type: {serviceType}
                  <br />
                  Payment Due: {formatIndianDate(dueDate)}
                  <br />
                  Balance Due: {formatInvoiceAmount(invoice.balance)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="relative">
            <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center" aria-hidden>
              <div
                className="flex h-[148px] w-[148px] rotate-[-22deg] items-center justify-center rounded-full border-[6px] text-[22px] font-black tracking-[0.18em]"
                style={{ borderColor: `${tone}55`, color: `${tone}59` }}
              >
                {stamp}
              </div>
            </div>

            <table className="relative w-full border-collapse text-[11px]">
              <thead>
                <tr className="font-bold">
                  {["#", "Item", "Rate / Item", "Qty", "Amount"].map((heading, index, rows) => (
                    <th
                      key={heading}
                      className={`px-2 py-2 ${index === 0 ? "w-8 text-left" : index === 1 ? "text-left" : "text-right"} ${index === 3 ? "w-14" : ""} ${index === 2 || index === 4 ? "w-[22%]" : ""}`}
                      style={{
                        background: headerBg,
                        borderBottom: `1px solid ${line}`,
                        borderRight: index === rows.length - 1 ? "none" : `1px solid ${line}`,
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={`${item.productId}-${item.sku}`}>
                    <td className="px-2 py-2.5 tabular-nums" style={{ borderBottom: `1px solid ${line}`, borderRight: `1px solid ${line}` }}>
                      {index + 1}
                    </td>
                    <td className="px-2 py-2.5" style={{ borderBottom: `1px solid ${line}`, borderRight: `1px solid ${line}` }}>
                      <p className="font-medium">{item.name}</p>
                      {item.hsnCode ? (
                        <p className="text-[10px] text-[#555]">HSN {formatHsn(item.hsnCode)}</p>
                      ) : null}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums" style={{ borderBottom: `1px solid ${line}`, borderRight: `1px solid ${line}` }}>
                      {formatInvoiceAmount(item.rate)}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums" style={{ borderBottom: `1px solid ${line}`, borderRight: `1px solid ${line}` }}>
                      {item.quantity.toFixed(2)}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums" style={{ borderBottom: `1px solid ${line}` }}>
                      {formatInvoiceAmount(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <table className="w-full border-collapse text-[11px]">
            <tbody>
              <tr>
                <td className="w-[52%] align-top p-3 font-semibold" style={{ ...cell, borderLeft: "none", borderTop: "none" }}>
                  Total Items / Qty : {itemCount} / {qtyTotal.toFixed(2)}
                </td>
                <td className="p-0" style={{ ...cell, borderRight: "none", borderTop: "none" }}>
                  <table className="w-full border-collapse">
                    <tbody>
                      {[
                        ["Subtotal", formatInvoiceAmount(invoice.subtotal), false],
                        ["Discount", formatInvoiceAmount(invoice.discount), false],
                        ...(gstBill
                          ? [
                              ["Taxable value", formatInvoiceAmount(taxable), false],
                              [`CGST (${gstHalf}%)`, formatInvoiceAmount(cgst), false],
                              [`SGST (${gstHalf}%)`, formatInvoiceAmount(sgst), false],
                            ]
                          : []),
                        ["Total", formatInvoiceAmount(invoice.grandTotal), true],
                        ["Paid Amount", formatInvoiceAmount(invoice.amountPaid), false],
                        ["Balance Due", formatInvoiceAmount(invoice.balance), true],
                      ].map(([label, value, bold], index, rows) => (
                        <tr key={String(label)} className={bold ? "font-bold" : undefined}>
                          <td
                            className="px-2.5 py-1.5"
                            style={{
                              borderBottom: index === rows.length - 1 ? "none" : `1px solid ${line}`,
                              borderRight: `1px solid ${line}`,
                            }}
                          >
                            {label}
                          </td>
                          <td
                            className="w-[46%] px-2.5 py-1.5 text-right tabular-nums"
                            style={{
                              borderBottom: index === rows.length - 1 ? "none" : `1px solid ${line}`,
                            }}
                          >
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="border-b px-3 py-2 text-[11px]" style={{ borderColor: line }}>
            <span className="font-semibold">Total amount (in words): </span>
            {amountInWords(invoice.grandTotal)}
          </div>

          <table className="w-full border-collapse text-[11px]">
            <tbody>
              <tr>
                <td className="w-1/2 align-top p-3" style={{ ...cell, borderLeft: "none", borderTop: "none" }}>
                  <p className="mb-1 font-bold" style={{ color: accent }}>
                    Bank Details
                  </p>
                  {hasBank ? (
                    <p className="leading-[18px]">
                      Account Holder Name: {business.bankAccountName || business.legalName}
                      <br />
                      Account Number: {business.bankAccountNumber || "—"}
                      <br />
                      IFSC Code: {business.bankIfsc || "—"}
                      <br />
                      Bank Name: {business.bankName || "—"}
                    </p>
                  ) : (
                    <p className="text-[#555]">Add bank details in Settings to show them here.</p>
                  )}
                </td>
                <td className="w-1/2 align-top p-3" style={{ ...cell, borderRight: "none", borderTop: "none" }}>
                  <p className="mb-1 font-bold" style={{ color: accent }}>
                    Pay using UPI
                  </p>
                  {hasUpi ? (
                    <div className="flex items-start gap-3">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=8&data=${encodeURIComponent(upiLink)}`}
                        alt="UPI QR code"
                        className="h-[110px] w-[110px] border bg-white"
                        style={{ borderColor: line }}
                      />
                      <p className="leading-[18px]">
                        UPI ID: {business.upiId}
                        <br />
                        Payee: {business.bankAccountName || business.legalName}
                        <br />
                        Amount: {formatInvoiceAmount(invoice.grandTotal)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[#555]">Add a UPI ID in Settings to show a payment QR here.</p>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="border-b px-3 py-2.5 text-[11px]" style={{ borderColor: line }}>
            <p className="font-bold">Notes</p>
            <p className="mt-1">{invoice.notes || settings.invoice.defaultNotes}</p>
          </div>

          <table className="w-full border-collapse text-[11px]">
            <tbody>
              <tr>
                <td className="w-[62%] align-top p-3" style={{ ...cell, borderLeft: "none", borderTop: "none", borderBottom: "none" }}>
                  <p className="font-bold">Terms and conditions</p>
                  <ol className="mt-1 list-decimal space-y-0.5 pl-4 leading-[16px]">
                    <li>Goods once sold will not be taken back or exchanged.</li>
                    <li>Please pay the balance within 7 days of the invoice date.</li>
                    <li>Subject to Idukki jurisdiction only.</li>
                  </ol>
                </td>
                <td className="align-bottom p-3 text-right" style={{ ...cell, borderRight: "none", borderTop: "none", borderBottom: "none" }}>
                  <div className="ml-auto w-[180px]">
                    <div className="h-12" />
                    <div className="border-t pt-1" style={{ borderColor: line }}>
                      <p className="font-semibold">Authorized Signatory</p>
                      <p className="font-bold" style={{ color: accent }}>
                        {business.legalName}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </article>
      </div>
    </div>
  );
}
