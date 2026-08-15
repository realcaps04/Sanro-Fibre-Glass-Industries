import { dummyCustomerIds } from "@/data/customers";
import { fromCreateInput, mockInvoices, nextInvoiceNumber } from "@/data/invoices";
import { calculateBill, statusFromBalances } from "@/lib/calculations";
import { createId, matchesQuery } from "@/lib/search";
import { createCollection } from "@/services/collection";
import { settingsService } from "@/services/settingsService";
import type { CreateInvoiceInput, Invoice, InvoiceStatus } from "@/types";

const collection = createCollection("invoices", mockInvoices);

function normalizeInvoice(invoice: Invoice): Invoice {
  if (!dummyCustomerIds.includes(invoice.customerId)) return invoice;
  return {
    ...invoice,
    customerId: "cus_edison",
    customerName: "Edison Biju",
  };
}

function readInvoices(): Invoice[] {
  const stored = collection.read();
  const next = stored.map(normalizeInvoice);
  if (next.some((invoice, index) => invoice.customerId !== stored[index].customerId)) {
    collection.write(next);
  }
  return next;
}

export const invoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    return [...readInvoices()].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  },

  async getInvoiceById(id: string): Promise<Invoice | undefined> {
    return readInvoices().find((invoice) => invoice.id === id);
  },

  async searchInvoices(query: string, status?: InvoiceStatus | "all"): Promise<Invoice[]> {
    const invoices = await this.getInvoices();
    return invoices.filter((invoice) => {
      const matchesStatus = !status || status === "all" || invoice.status === status;
      return (
        matchesStatus &&
        matchesQuery(query, invoice.number, invoice.customerName, invoice.status)
      );
    });
  },

  async createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
    const settings = await settingsService.getSettings();
    const existing = collection.read();
    const number = nextInvoiceNumber(settings.invoice.prefix, existing);
    const invoice = fromCreateInput(createId("inv"), number, {
      ...input,
      taxRate: input.taxRate ?? settings.invoice.taxRate,
    });
    collection.write([invoice, ...existing]);
    await settingsService.updateSettings({
      invoice: { ...settings.invoice, nextNumber: settings.invoice.nextNumber + 1 },
    });
    return invoice;
  },

  async updateInvoice(id: string, input: CreateInvoiceInput): Promise<Invoice> {
    const current = collection.read();
    const index = current.findIndex((invoice) => invoice.id === id);
    if (index === -1) {
      throw new Error("Invoice not found");
    }
    const previous = current[index];
    const updated = {
      ...fromCreateInput(previous.id, previous.number, {
        ...input,
        date: previous.date,
        taxRate: input.taxRate ?? previous.taxRate,
      }),
      createdAt: previous.createdAt,
    };
    const next = [...current];
    next[index] = updated;
    collection.write(next);
    return updated;
  },
    const current = collection.read();
    const index = current.findIndex((invoice) => invoice.id === invoiceId);
    if (index === -1) {
      throw new Error("Invoice not found");
    }
    const invoice = current[index];
    const amountPaid = Math.min(invoice.grandTotal, invoice.amountPaid + amount);
    const totals = calculateBill({
      items: invoice.items,
      discount: invoice.discount,
      taxRate: invoice.taxRate,
      amountPaid,
    });
    const updated: Invoice = {
      ...invoice,
      ...totals,
      status: statusFromBalances(totals.amountPaid, totals.grandTotal),
      paymentMethod: invoice.paymentMethod === "credit" && amountPaid > 0
        ? invoice.paymentMethod
        : invoice.paymentMethod,
    };
    const next = [...current];
    next[index] = updated;
    collection.write(next);
    return updated;
  },

  async cancelInvoice(invoiceId: string): Promise<Invoice> {
    const current = collection.read();
    const index = current.findIndex((invoice) => invoice.id === invoiceId);
    if (index === -1) {
      throw new Error("Invoice not found");
    }
    const updated: Invoice = { ...current[index], status: "cancelled" };
    const next = [...current];
    next[index] = updated;
    collection.write(next);
    return updated;
  },
};
