import { BillKindPicker } from "@/components/billing/BillKindPicker";
import { NewBillSheet } from "@/components/billing/NewBillSheet";
import { TaxModePicker } from "@/components/billing/TaxModePicker";
import type { BillKind } from "@/lib/billing";
import { useEffect, useState } from "react";

interface NewBillFlowProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (invoiceId: string) => void;
  nonGst?: boolean;
  kind?: BillKind;
  mixed?: boolean;
}

export function NewBillFlow({
  open,
  onClose,
  onCreated,
  nonGst = false,
  kind: forcedKind,
  mixed = false,
}: NewBillFlowProps) {
  const [kind, setKind] = useState<BillKind | null>(mixed ? "mixed" : (forcedKind ?? null));
  const [taxMode, setTaxMode] = useState<"gst" | "nongst" | null>(
    mixed ? null : nonGst ? "nongst" : "gst",
  );

  useEffect(() => {
    if (!open) {
      setKind(mixed ? "mixed" : (forcedKind ?? null));
      setTaxMode(mixed ? null : nonGst ? "nongst" : "gst");
    }
  }, [open, forcedKind, mixed, nonGst]);

  const close = () => {
    setKind(mixed ? "mixed" : (forcedKind ?? null));
    setTaxMode(mixed ? null : nonGst ? "nongst" : "gst");
    onClose();
  };

  const selectedKind = mixed ? "mixed" : (forcedKind ?? kind);

  if (mixed && taxMode === null) {
    return (
      <TaxModePicker
        open={open}
        onClose={close}
        onSelect={(gst) => setTaxMode(gst ? "gst" : "nongst")}
      />
    );
  }

  if (!selectedKind) {
    return <BillKindPicker open={open} onClose={close} onSelect={setKind} />;
  }

  return (
    <NewBillSheet
      open={open}
      kind={selectedKind}
      nonGst={taxMode === "nongst"}
      onClose={close}
      onCreated={onCreated}
    />
  );
}
