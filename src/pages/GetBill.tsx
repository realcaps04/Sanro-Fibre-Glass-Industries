import { brandConfig } from "@/brand/config";

export default function GetBill() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#f0f7f4] px-6 text-center text-[#003f34]">
      <img src={brandConfig.logo} alt="" className="mb-4 h-14 w-14 rounded-full bg-white object-contain" />
      <h1 className="text-lg font-semibold tracking-[-0.03em]">{brandConfig.businessName}</h1>
      <p className="mt-3 max-w-sm text-sm leading-6">
        This invoice download link is no longer available. Please ask the shop to share the bill again
        from the app.
      </p>
    </div>
  );
}
