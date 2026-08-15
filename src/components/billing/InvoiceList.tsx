import { InvoiceCard } from "@/components/billing/InvoiceCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Invoice } from "@/types";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  const navigate = useNavigate();

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
    <div className="elevated divide-y divide-border rounded-lg">
      {invoices.map((invoice) => (
        <InvoiceCard key={invoice.id} invoice={invoice} />
      ))}
    </div>
  );
}
