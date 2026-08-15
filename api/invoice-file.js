function safeName(value) {
  return String(value || "invoice.pdf").replace(/[^\w.\-]+/g, "_");
}

function tmpfilesCandidates(id, name) {
  const encoded = encodeURIComponent(name);
  return [
    `https://tmpfiles.org/dl/${id}`,
    `https://tmpfiles.org/dl/${id}/${encoded}`,
    `https://tmpfiles.org/dl/${id}/${name}`,
  ];
}

function looksLikePdf(buffer, contentType) {
  const type = contentType.toLowerCase();
  if (type.includes("application/pdf") || type.includes("octet-stream")) return true;
  if (type.includes("text/html")) return false;
  return buffer.slice(0, 5).toString() === "%PDF-";
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).end();
    return;
  }

  const id = String(req.query.id || "").replace(/[^\w-]/g, "");
  const name = safeName(req.query.n);
  if (!id) {
    res.status(400).send("Missing invoice id");
    return;
  }

  let file = null;
  for (const url of tmpfilesCandidates(id, name)) {
    const upstream = await fetch(url, { redirect: "follow" });
    if (!upstream.ok) continue;
    const buffer = Buffer.from(await upstream.arrayBuffer());
    const contentType = upstream.headers.get("content-type") || "";
    if (!looksLikePdf(buffer, contentType)) continue;
    file = buffer;
    break;
  }

  if (!file) {
    res.status(502).send("Unable to fetch invoice");
    return;
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${name}"; filename*=UTF-8''${encodeURIComponent(name)}`,
  );
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.send(file);
}
