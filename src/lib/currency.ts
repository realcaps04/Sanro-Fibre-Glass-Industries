const inr = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const inrDecimal = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

const inrMoney = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}₹${inr.format(Math.abs(Math.round(amount)))}`;
}

export function formatCurrencySigned(amount: number): string {
  const prefix = amount > 0 ? "+" : amount < 0 ? "-" : "";
  return `${prefix}₹${inr.format(Math.abs(Math.round(amount)))}`;
}

export function formatCurrencyDecimal(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}₹${inrDecimal.format(Math.abs(amount))}`;
}

export function formatInvoiceAmount(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}₹ ${inrMoney.format(Math.abs(amount))}`;
}
