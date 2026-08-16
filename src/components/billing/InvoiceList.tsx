import { InvoiceCard } from "@/components/billing/InvoiceCard";
import { DeleteConfirmOverlay } from "@/components/ui/DeleteConfirmOverlay";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import type { Invoice } from "@/types";
import { FileText } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function InvoiceList({
  invoices,
  allowDelete = false,
}: {
  invoices: Invoice[];
  allowDelete?: boolean;
}) {
  const navigate = useNavigate();
  const { deleteInvoice } = useData();
  const { toast } = useToast();
  const [pending, setPending] = useState<Invoice | null>(null);

  if (!invoices.length) {
    return (
      <EmptyState
        icon={<FileText className="h-6 w-6" />}
        title="No invoices yet"
        description="Your invoices will appear here once you create your first bill."
        actionLabel="Create New Bill"
        onAction={() => navigate("/billing/new")}
      />
    );
  }

  return (
    <>
      <div className="elevated divide-y divide-border rounded-lg">
        {invoices.map((invoice) => (
          <InvoiceCard
            key={invoice.id}
            invoice={invoice}
            onDelete={allowDelete ? setPending : undefined}
          />
        ))}
      </div>
      <DeleteConfirmOverlay
        open={Boolean(pending)}
        title="Delete bill"
        description={`Enter the password to delete ${pending?.number ?? "this bill"}. This cannot be undone.`}
        onClose={() => setPending(null)}
        onConfirm={async () => {
          if (!pending) return;
          await deleteInvoice(pending.id);
          toast(`${pending.number} deleted`, "success");
        }}
      />
    </>
  );
}
