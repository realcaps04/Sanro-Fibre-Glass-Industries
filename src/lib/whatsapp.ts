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
  const query = new URLSearchParams({ phone: number });
  if (text) query.set("text", text);
  return `https://api.whatsapp.com/send?${query.toString()}`;
}

export function openWhatsAppChat(phone: string, text = "", target?: Window | null) {
  const number = toWhatsAppNumber(phone);
  const url = whatsappChatUrl(phone, text);
  if (!number || !url) return false;
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const dest = mobile
    ? `whatsapp://send?phone=${number}${text ? `&text=${encodeURIComponent(text)}` : ""}`
    : url;
  if (target && !target.closed) {
    target.location.href = dest;
    return true;
  }
  const opened = window.open(dest, "_blank");
  if (!opened) {
    window.location.href = dest;
  }
  return true;
}
