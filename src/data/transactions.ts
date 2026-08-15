import { mockInvoices } from "@/data/invoices";
import type { Expense, Invoice, Transaction } from "@/types";

function saleFromInvoice(invoice: Invoice): Transaction {
  return {
    id: `txn_sale_${invoice.id}`,
    type: "sale",
    reference: invoice.number,
    party: invoice.customerName,
    amount: invoice.grandTotal,
    direction: "in",
    status: invoice.status,
    paymentMethod: invoice.paymentMethod,
    date: invoice.date,
    invoiceId: invoice.id,
    customerId: invoice.customerId,
    description: `Invoice ${invoice.number}`,
  };
}

function paymentFromInvoice(invoice: Invoice): Transaction | null {
  if (invoice.amountPaid <= 0 || invoice.status === "cancelled") return null;
  return {
    id: `txn_pay_${invoice.id}`,
    type: "payment",
    reference: invoice.number,
    party: invoice.customerName,
    amount: invoice.amountPaid,
    direction: "in",
    status: invoice.status === "partial" ? "partial" : "paid",
    paymentMethod: invoice.paymentMethod === "credit" ? "cash" : invoice.paymentMethod,
    date: invoice.date,
    invoiceId: invoice.id,
    customerId: invoice.customerId,
    description: `Payment for ${invoice.number}`,
  };
}

function expenseTx(expense: Expense): Transaction {
  return {
    id: `txn_${expense.id}`,
    type: "expense",
    reference: expense.category,
    party: expense.vendor ?? "Workshop",
    amount: expense.amount,
    direction: "out",
    status: "paid",
    paymentMethod: expense.paymentMethod,
    date: expense.date,
    expenseId: expense.id,
    description: expense.description,
  };
}

export const mockTransactions: Transaction[] = [
  ...mockInvoices.filter((invoice) => invoice.status !== "cancelled").map(saleFromInvoice),
  ...mockInvoices
    .filter((invoice) => invoice.status === "partial")
    .map(paymentFromInvoice)
    .filter((tx): tx is Transaction => tx !== null),
];

export { saleFromInvoice, paymentFromInvoice, expenseTx };
