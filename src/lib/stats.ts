import { isSameDay, parseDate, startOfDay } from "@/lib/dates";
import type { Expense, Invoice, SalesPeriod } from "@/types";

export function activeInvoices(invoices: Invoice[]): Invoice[] {
  return invoices.filter((invoice) => invoice.status !== "cancelled");
}

export function customerOutstanding(customerId: string, invoices: Invoice[]): number {
  return activeInvoices(invoices)
    .filter((invoice) => invoice.customerId === customerId)
    .reduce((sum, invoice) => sum + invoice.balance, 0);
}

export function customerPurchases(customerId: string, invoices: Invoice[]): number {
  return activeInvoices(invoices)
    .filter((invoice) => invoice.customerId === customerId)
    .reduce((sum, invoice) => sum + invoice.grandTotal, 0);
}

export function salesInRange(invoices: Invoice[], start: Date, end: Date): number {
  return activeInvoices(invoices)
    .filter((invoice) => {
      const date = parseDate(invoice.date);
      return date >= start && date <= end;
    })
    .reduce((sum, invoice) => sum + invoice.grandTotal, 0);
}

export function periodRange(period: SalesPeriod, now = new Date()): { start: Date; end: Date } {
  const end = new Date(now);
  if (period === "today") {
    return { start: startOfDay(now), end };
  }
  const start = startOfDay(now);
  start.setDate(start.getDate() - (period === "7d" ? 6 : 29));
  return { start, end };
}

export function todaySales(invoices: Invoice[], now = new Date()): number {
  return activeInvoices(invoices)
    .filter((invoice) => isSameDay(parseDate(invoice.date), now))
    .reduce((sum, invoice) => sum + invoice.grandTotal, 0);
}

export function receivablesTotal(invoices: Invoice[]): number {
  return activeInvoices(invoices).reduce((sum, invoice) => sum + invoice.balance, 0);
}

export function expensesInMonth(expenses: Expense[], now = new Date()): number {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return expenses
    .filter((expense) => parseDate(expense.date) >= start && parseDate(expense.date) <= now)
    .reduce((sum, expense) => sum + expense.amount, 0);
}

export function dailySalesSeries(
  invoices: Invoice[],
  days: number,
  now = new Date(),
): Array<{ label: string; value: number; date: Date }> {
  const series = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const value = activeInvoices(invoices)
      .filter((invoice) => isSameDay(parseDate(invoice.date), date))
      .reduce((sum, invoice) => sum + invoice.grandTotal, 0);
    series.push({
      label: String(date.getDate()),
      value,
      date,
    });
  }
  return series;
}
