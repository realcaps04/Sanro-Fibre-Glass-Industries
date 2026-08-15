import { billKindLabel, type BillKind } from "@/lib/billing";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Droplets, DoorClosed } from "lucide-react";

const options: Array<{ kind: BillKind; icon: typeof DoorClosed; detail: string }> = [
  {
    kind: "doors",
    icon: DoorClosed,
    detail: "Doors, windows and fittings",
  },
  {
    kind: "waterproofing",
    icon: Droplets,
    detail: "Waterproof coatings and membranes",
  },
];

export function BillKindPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (kind: BillKind) => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="New Bill">
      <p className="mb-4 text-sm text-muted-foreground">Choose the type of bill to create.</p>
      <div className="grid gap-3">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.kind}
              type="button"
              onClick={() => onSelect(option.kind)}
              className="elevated flex items-center gap-4 rounded-[22px] px-4 py-4 text-left"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-primary">
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <span>
                <span className="block text-[15px] font-semibold tracking-[-0.02em]">
                  {billKindLabel[option.kind]}
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
