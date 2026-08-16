export function invoiceWhatsAppMessage(
  customerName: string,
  invoiceNumber: string,
  businessName: string,
  amount: string,
  balance: string,
  viewUrl = "",
) {
  const lines = [
    `Hello ${customerName},`,
    "",
    `Invoice ${invoiceNumber} from ${businessName}.`,
    `Amount: ${amount}`,
  ];
  if (balance) {
    lines.push(`Balance: ${balance}`);
  }
  if (viewUrl) {
    lines.push("", `View bill: ${viewUrl}`);
  }
  lines.push("", "Thank you.");
  return lines.join("\n");
}

export function publicBillUrl(token: string) {
  return `${window.location.origin}/b/${token}`;
}
