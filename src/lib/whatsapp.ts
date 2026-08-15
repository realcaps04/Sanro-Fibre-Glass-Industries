export function toWhatsAppNumber(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  if (digits.length >= 10) return digits;
  return null;
}

export function whatsappChatUrl(phone: string, text = ""): string | null {
  const number = toWhatsAppNumber(phone);
  if (!number) return null;
  return text
    ? `https://wa.me/${number}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${number}`;
}

export function openWhatsAppChat(phone: string, text = "") {
  const url = whatsappChatUrl(phone, text);
  if (!url) return null;
  const opened = window.open(url, "_blank");
  if (opened) return opened;
  window.location.assign(url);
  return null;
}
