import { InvoiceCard } from "@/components/billing/InvoiceCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Overlay } from "@/components/ui/Overlay";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import type { Invoice } from "@/types";
import { FileText } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DELETE_PASSWORD = "151";

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
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const closePrompt = () => {
    if (deleting) return;
    setPending(null);
    setPassword("");
    setError("");
  };

  const confirmDelete = async () => {
    if (!pending) return;
    if (password.trim() !== DELETE_PASSWORD) {
      setError("Incorrect password");
      return;
    }
    setDeleting(true);
    setError("");
    try {
      await deleteInvoice(pending.id);
      toast(`${pending.number} deleted`, "success");
      setPending(null);
      setPassword("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete bill");
    } finally {
      setDeleting(false);
    }
  };

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
      <Overlay open={Boolean(pending)} onClose={closePrompt} title="Delete bill">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void confirmDelete();
          }}
        >
          <p className="text-sm text-muted-foreground">
            Enter the password to delete {pending?.number}. This cannot be undone.
          </p>
          <div>
            <Label htmlFor="delete-bill-password">Password</Label>
            <Input
              id="delete-bill-password"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              placeholder="Enter password"
            />
            {error ? <p className="mt-1.5 text-sm text-danger">{error}</p> : null}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" fullWidth onClick={closePrompt} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth type="submit" disabled={deleting || !password.trim()}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </form>
      </Overlay>
    </>
  );
}
