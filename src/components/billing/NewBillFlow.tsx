import { BillKindPicker } from "@/components/billing/BillKindPicker";
import { NewBillSheet } from "@/components/billing/NewBillSheet";
import type { BillKind } from "@/lib/billing";
import { useEffect, useState } from "react";

interface NewBillFlowProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (invoiceId: string) => void;
  nonGst?: boolean;
  kind?: BillKind;
}

export function NewBillFlow({
  open,
  onClose,
  onCreated,
  nonGst = false,
  kind: forcedKind,
}: NewBillFlowProps) {
  const [kind, setKind] = useState<BillKind | null>(forcedKind ?? null);

  useEffect(() => {
    if (!open) setKind(forcedKind ?? null);
  }, [open, forcedKind]);

  const close = () => {
    setKind(forcedKind ?? null);
    onClose();
  };

  const selectedKind = forcedKind ?? kind;

  return (
    <>
      {!selectedKind ? (
        <BillKindPicker open={open} onClose={close} onSelect={setKind} />
      ) : (
        <NewBillSheet
          open={open}
          kind={selectedKind}
          nonGst={nonGst}
          onClose={close}
          onCreated={onCreated}
        />
      )}
    </>
  );
}
