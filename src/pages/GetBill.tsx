import { brandConfig } from "@/brand/config";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

export default function GetBill() {
  const { id = "", name: nameParam } = useParams();
  const [params] = useSearchParams();
  const name = nameParam || params.get("n") || "invoice.pdf";
  const [status, setStatus] = useState<"downloading" | "error">("downloading");

  const apiUrl = useMemo(() => {
    if (!id) return "";
    return `/api/invoice-file?${new URLSearchParams({ id, n: name }).toString()}`;
  }, [id, name]);

  const tmpfilesUrl = useMemo(() => {
    if (!id) return "";
    return `https://tmpfiles.org/dl/${id}/${encodeURIComponent(name)}`;
  }, [id, name]);

  useEffect(() => {
    if (!id) {
      setStatus("error");
      return;
    }
    window.location.replace(import.meta.env.DEV ? tmpfilesUrl : apiUrl);
  }, [apiUrl, id, tmpfilesUrl]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#f0f7f4] px-6 text-center text-[#003f34]">
      <img src={brandConfig.logo} alt="" className="mb-4 h-14 w-14 rounded-full bg-white object-contain" />
      <h1 className="text-lg font-semibold tracking-[-0.03em]">{brandConfig.businessName}</h1>
      <p className="mt-2 text-sm">
        {status === "error" ? "This invoice link is invalid." : "Downloading your invoice PDF…"}
      </p>
      {apiUrl ? (
        <a
          href={import.meta.env.DEV ? tmpfilesUrl : apiUrl}
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#003f34] px-6 text-sm font-semibold text-white"
        >
          Download PDF
        </a>
      ) : null}
    </div>
  );
}
