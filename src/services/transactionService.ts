import { dummyExpenseIds } from "@/data/expenses";
import { dummyInvoiceIds, seedInvoiceIds } from "@/data/invoices";
import { dummyTransactionIds, expenseTx, saleFromInvoice } from "@/data/transactions";
import { createId, matchesQuery } from "@/lib/search";
import { createCollection } from "@/services/collection";
import type {
  Expense,
  Invoice,
  InvoiceStatus,
  PaymentMethod,
  Transaction,
  TransactionType,
} from "@/types";

const collection = createCollection<Transaction>("transactions", []);

function isDummyTransaction(tx: Transaction): boolean {
  if (dummyTransactionIds.includes(tx.id)) return true;
  if (tx.invoiceId && dummyInvoiceIds.includes(tx.invoiceId)) return true;
  if (tx.expenseId && dummyExpenseIds.includes(tx.expenseId)) return true;
  if (tx.id.startsWith("txn_sale_inv_") || tx.id.startsWith("txn_pay_inv_")) {
    const invoiceId = tx.invoiceId ?? tx.id.replace(/^txn_(?:sale|pay)_/, "");
    if (invoiceId && seedInvoiceIds.includes(invoiceId)) return true;
  }
  return false;
}

function readTransactions(): Transaction[] {
  const stored = collection.read();
  const next = stored.filter((tx) => !isDummyTransaction(tx));
  if (next.length !== stored.length) {
    collection.write(next);
  }
  return next;
}

export interface TransactionFilters {
  query?: string;
  type?: TransactionType | "all";
  paymentMethod?: PaymentMethod | "all";
  status?: InvoiceStatus | "all";
  customerId?: string | "all";
  minAmount?: number;
  maxAmount?: number;
  from?: string;
  to?: string;
}

export const transactionService = {
  async getTransactions(): Promise<Transaction[]> {
    return [...readTransactions()].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  },

  async searchTransactions(filters: TransactionFilters = {}): Promise<Transaction[]> {
    const transactions = await this.getTransactions();
    return transactions.filter((tx) => {
      if (filters.type && filters.type !== "all" && tx.type !== filters.type) return false;
      if (
        filters.paymentMethod &&
        filters.paymentMethod !== "all" &&
        tx.paymentMethod !== filters.paymentMethod
      ) {
        return false;
      }
      if (filters.status && filters.status !== "all" && tx.status !== filters.status) {
        return false;
      }
      if (filters.customerId && filters.customerId !== "all" && tx.customerId !== filters.customerId) {
        return false;
      }
      if (filters.minAmount !== undefined && tx.amount < filters.minAmount) return false;
      if (filters.maxAmount !== undefined && tx.amount > filters.maxAmount) return false;
      if (filters.from && new Date(tx.date) < new Date(filters.from)) return false;
      if (filters.to) {
        const end = new Date(filters.to);
        end.setHours(23, 59, 59, 999);
        if (new Date(tx.date) > end) return false;
      }
      return matchesQuery(
        filters.query ?? "",
        tx.reference,
        tx.party,
        tx.description,
        tx.type,
      );
    });
  },

  async recordSale(invoice: Invoice): Promise<Transaction> {
    const tx = saleFromInvoice(invoice);
    collection.write([tx, ...collection.read()]);
    return tx;
  },

  async recordPayment(input: {
    customerId: string;
    party: string;
    amount: number;
    paymentMethod: PaymentMethod;
    invoiceId?: string;
    reference?: string;
    date?: string;
    notes?: string;
  }): Promise<Transaction> {
    const tx: Transaction = {
      id: createId("txn"),
      type: "payment",
      reference: input.reference ?? "Payment",
      party: input.party,
      amount: input.amount,
      direction: "in",
      status: "paid",
      paymentMethod: input.paymentMethod,
      date: input.date ?? new Date().toISOString(),
      invoiceId: input.invoiceId,
      customerId: input.customerId,
      description: input.notes ?? "Payment received",
    };
    collection.write([tx, ...collection.read()]);
    return tx;
  },

  async recordExpense(expense: Expense): Promise<Transaction> {
    const tx = expenseTx(expense);
    collection.write([tx, ...collection.read()]);
    return tx;
  },

  async syncSale(invoice: Invoice): Promise<void> {
    const current = collection.read();
    const index = current.findIndex((tx) => tx.invoiceId === invoice.id && tx.type === "sale");
    const sale = saleFromInvoice(invoice);
    if (index === -1) {
      collection.write([sale, ...current]);
      return;
    }
    const next = [...current];
    next[index] = { ...sale, id: current[index].id };
    collection.write(next);
  },

  async markInvoiceCancelled(invoiceId: string): Promise<void> {
    const next = collection.read().map((tx) =>
      tx.invoiceId === invoiceId ? { ...tx, status: "cancelled" as const } : tx,
    );
    collection.write(next);
  },
};
