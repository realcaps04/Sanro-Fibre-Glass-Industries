function rupees(value: number) {
  return Math.round(value);
}

export function billTotals(input: {
  items: Array<{ quantity: number; rate: number; gstRate?: number }>;
  discount?: number;
  taxRate?: number;
  amountPaid?: number;
}) {
  const lines = input.items.map((item) => ({
    amount: item.quantity * item.rate,
    gstRate: item.gstRate,
  }));
  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const discount = Math.min(Math.max(input.discount ?? 0, 0), subtotal);
  const invoiceTaxRate = input.taxRate ?? 0.18;
  const applyGst = invoiceTaxRate > 0;
  let allocated = 0;
  let tax = 0;
  let taxableAmount = 0;

  lines.forEach((line, index) => {
    const share =
      subtotal <= 0
        ? 0
        : index === lines.length - 1
          ? discount - allocated
          : rupees((discount * line.amount) / subtotal);
    allocated += share;
    const taxable = Math.max(0, line.amount - share);
    const rate = applyGst ? (line.gstRate ?? invoiceTaxRate) : 0;
    taxableAmount += taxable;
    tax += rupees(taxable * rate);
  });

  tax = rupees(tax);
  taxableAmount = rupees(taxableAmount);
  const cgst = rupees(tax / 2);
  const sgst = tax - cgst;
  const grandTotal = taxableAmount + tax;
  const amountPaid = Math.min(Math.max(0, input.amountPaid ?? 0), grandTotal);

  return {
    subtotal,
    discount,
    taxableAmount,
    tax,
    cgst,
    sgst,
    grandTotal,
    amountPaid,
    balance: Math.max(0, grandTotal - amountPaid),
  };
}

export function statusFromBalances(amountPaid: number, grandTotal: number, cancelled = false) {
  if (cancelled) return "cancelled" as const;
  if (grandTotal <= 0 || amountPaid >= grandTotal) return "paid" as const;
  if (amountPaid > 0) return "partial" as const;
  return "pending" as const;
}
