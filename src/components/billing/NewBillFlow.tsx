import { BillKindPicker } from "@/components/billing/BillKindPicker";
import { NewBillSheet } from "@/components/billing/NewBillSheet";
import type { BillKind } from "@/lib/billing";
import { useEffect, useState } from "react";

interface NewBillFlowProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (invoiceId: string) => void;
  nonGst?: boolean;
}

export function NewBillFlow({ open, onClose, onCreated, nonGst = false }: NewBillFlowProps) {
  const [kind, setKind] = useState<BillKind | null>(null);

  useEffect(() => {
    if (!open) setKind(null);
  }, [open]);

  const close = () => {
    setKind(null);
    onClose();
  };

  return (
    <>
      {!kind ? (
        <BillKindPicker open={open} onClose={close} onSelect={setKind} />
      ) : (
        <NewBillSheet
          open={open}
          kind={kind}
          nonGst={nonGst}
          onClose={close}
          onCreated={onCreated}
        />
      )}
    </>
  );
}
