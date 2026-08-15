export function invoiceWhatsAppMessage(
  customerName: string,
  invoiceNumber: string,
  businessName: string,
  amount: string,
  balance: string,
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
  lines.push("", "Thank you.");
  return lines.join("\n");
}
