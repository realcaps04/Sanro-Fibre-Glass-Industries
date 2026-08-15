import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClipboardPen } from "lucide-react";

export default function Estimates() {
  return (
    <div>
      <PageHeader title="Estimate" />
      <EmptyState
        icon={<ClipboardPen className="h-6 w-6" />}
        title="No estimates yet"
        description="Create an estimate for a customer before converting it into a bill."
      />
    </div>
  );
}
