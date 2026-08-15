import { statusLabel } from "@/lib/labels";
import type { InvoiceStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";

const tones: Record<InvoiceStatus, string> = {
  paid: "bg-success/10 text-success",
  pending: "bg-warning/12 text-warning",
  partial: "bg-primary/10 text-primary",
  cancelled: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge className={tones[status]}>{statusLabel[status]}</Badge>;
}
