import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/dates";
import { formatHsn, gstPercent } from "@/lib/hsn";
import { paymentLabel } from "@/lib/labels";
import type { AppSettings, Customer, Invoice } from "@/types";

interface InvoicePreviewProps {
  invoice: Invoice;
  settings: AppSettings;
  customer?: Customer;
}

export function InvoicePreview({ invoice, settings, customer }: InvoicePreviewProps) {
  const { business } = settings;

  return (
    <article
      id="invoice-print-root"
      className="mx-auto w-full max-w-[210mm] bg-white text-[#1c1b19] shadow-[0_0_0_1px_#e4e1da]"
    >
      <div className="min-h-[297mm] px-8 py-9 sm:px-12">
        <header className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-3">
            {business.logo ? (
              <img
                src={business.logo}
                alt=""
                className="h-14 w-14 object-contain"
              />
            ) : null}
            <div>
              <p className="text-lg font-semibold tracking-[0.18em]">{business.businessName.toUpperCase()}</p>
              <p className="mt-1 max-w-xs text-xs leading-5 text-[#5f5c56]">
                {business.legalName}
                <br />
                {business.address}
                <br />
                {business.phone} · {business.email}
                <br />
                GSTIN {business.gstin}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs tracking-[0.22em] text-[#5f5c56]">INVOICE</p>
            <p className="mt-1 text-base font-semibold">{invoice.number}</p>
            <p className="mt-1 text-xs text-[#5f5c56]">{formatDate(invoice.date)}</p>
          </div>
        </header>

        <div className="my-6 h-px bg-[#d9d4cb]" />

        <section>
          <p className="text-[10px] tracking-[0.16em] text-[#8a857c] uppercase">Bill To</p>
          <p className="mt-1 font-medium">{invoice.customerName}</p>
          <p className="mt-1 max-w-sm text-xs leading-5 text-[#5f5c56]">
            {customer?.address}
            {customer?.phone ? (
              <>
                <br />
                {customer.phone}
              </>
            ) : null}
            {customer?.gstin ? (
              <>
                <br />
                GSTIN {customer.gstin}
              </>
            ) : null}
          </p>
        </section>

        <table className="mt-8 w-full border-collapse text-xs">
          <thead>
            <tr className="border-y border-[#d9d4cb] text-left text-[10px] tracking-[0.14em] text-[#8a857c] uppercase">
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 font-medium">HSN</th>
              <th className="py-2 text-right font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Rate</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={`${item.productId}-${item.sku}`} className="border-b border-[#eeeae3]">
                <td className="py-2.5">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-[10px] text-[#8a857c]">{item.sku}</p>
                </td>
                <td className="py-2.5 tabular-nums text-[#5f5c56]">
                  {item.hsnCode ? formatHsn(item.hsnCode) : "—"}
                </td>
                <td className="py-2.5 text-right tabular-nums">{item.quantity}</td>
                <td className="py-2.5 text-right tabular-nums">{formatCurrency(item.rate)}</td>
                <td className="py-2.5 text-right tabular-nums">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 ml-auto w-full max-w-[220px] space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-[#5f5c56]">Subtotal</span>
            <span className="tabular-nums">{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5f5c56]">Discount</span>
            <span className="tabular-nums">{formatCurrency(invoice.discount)}</span>
          </div>
          {invoice.taxRate > 0 ? (
            <>
              <div className="flex justify-between">
                <span className="text-[#5f5c56]">Taxable value</span>
                <span className="tabular-nums">{formatCurrency(invoice.taxableAmount ?? invoice.subtotal - invoice.discount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5f5c56]">
                  CGST ({gstPercent(invoice.taxRate) / 2}%)
                </span>
                <span className="tabular-nums">
                  {formatCurrency(invoice.cgst ?? Math.round(invoice.tax / 2))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5f5c56]">
                  SGST ({gstPercent(invoice.taxRate) / 2}%)
                </span>
                <span className="tabular-nums">
                  {formatCurrency(invoice.sgst ?? invoice.tax - Math.round(invoice.tax / 2))}
                </span>
              </div>
            </>
          ) : (
            <div className="flex justify-between">
              <span className="text-[#5f5c56]">Tax</span>
              <span className="tabular-nums">{formatCurrency(0)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-[#d9d4cb] pt-2 text-sm font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatCurrency(invoice.grandTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5f5c56]">Amount Paid</span>
            <span className="tabular-nums">{formatCurrency(invoice.amountPaid)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5f5c56]">Balance</span>
            <span className="tabular-nums">{formatCurrency(invoice.balance)}</span>
          </div>
        </div>

        <div className="my-8 h-px bg-[#d9d4cb]" />

        <footer className="text-xs text-[#5f5c56]">
          <p>Payment Method: {paymentLabel[invoice.paymentMethod]}</p>
          <p className="mt-4">{invoice.notes || settings.invoice.defaultNotes}</p>
          <p className="mt-8 tracking-[0.16em] uppercase">{business.businessName}</p>
        </footer>
      </div>
    </article>
  );
}
