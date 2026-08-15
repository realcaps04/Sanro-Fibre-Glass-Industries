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

export function openWhatsAppChatIn(target: Window | null, phone: string, text = "") {
  const url = whatsappChatUrl(phone, text);
  if (!url) return false;
  if (target && !target.closed) {
    target.location.href = url;
    return true;
  }
  return Boolean(openWhatsAppChat(phone, text));
}

export function openPreparingWindow(message = "Preparing invoice PDF…") {
  const popup = window.open("about:blank", "_blank");
  if (!popup) return null;
  try {
    popup.document.write(
      `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1" /></head><body style="margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center;background:#f0f7f4;color:#003f34;font-family:sans-serif;padding:24px;text-align:center">${message}</body></html>`,
    );
    popup.document.close();
  } catch {
    /* ignore */
  }
  return popup;
}
