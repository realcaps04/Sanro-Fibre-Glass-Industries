import { BottomSheet } from "@/components/ui/BottomSheet";
import { BadgePercent, Receipt } from "lucide-react";

const options = [
  {
    gst: true,
    label: "GST Bill",
    detail: "Tax invoice with GST calculation",
    icon: BadgePercent,
  },
  {
    gst: false,
    label: "Non GST Bill",
    detail: "Invoice without GST calculation",
    icon: Receipt,
  },
] as const;

export function TaxModePicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (gst: boolean) => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Any Bill">
      <p className="mb-4 text-sm text-muted-foreground">
        Mix any products on one bill. Choose GST or Non GST.
      </p>
      <div className="grid gap-3">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.label}
              type="button"
              onClick={() => onSelect(option.gst)}
              className="elevated flex items-center gap-4 rounded-[22px] px-4 py-4 text-left"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-primary">
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <span>
                <span className="block text-[15px] font-semibold tracking-[-0.02em]">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{option.detail}</span>
              </span>
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
