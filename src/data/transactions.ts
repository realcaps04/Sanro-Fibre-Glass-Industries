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

export { saleFromInvoice, expenseTx };
