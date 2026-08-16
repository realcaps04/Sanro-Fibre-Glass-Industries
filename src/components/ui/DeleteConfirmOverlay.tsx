import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Overlay } from "@/components/ui/Overlay";
import { DELETE_PASSWORD } from "@/lib/deletePin";
import { useEffect, useState } from "react";

export function DeleteConfirmOverlay({
  open,
  title,
  description,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (open) return;
    setPassword("");
    setError("");
    setDeleting(false);
  }, [open]);

  const close = () => {
    if (deleting) return;
    onClose();
  };

  const submit = async () => {
    if (password.trim() !== DELETE_PASSWORD) {
      setError("Incorrect password");
      return;
    }
    setDeleting(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Overlay open={open} onClose={close} title={title}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <p className="text-sm text-muted-foreground">{description}</p>
        <div>
          <Label htmlFor="delete-confirm-password">Password</Label>
          <Input
            id="delete-confirm-password"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="done"
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
          <Button variant="outline" fullWidth type="button" onClick={close} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" fullWidth type="submit" disabled={deleting || !password.trim()}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </form>
    </Overlay>
  );
}
