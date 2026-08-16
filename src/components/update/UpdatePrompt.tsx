import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { brandConfig } from "@/brand/config";
import { useAppUpdate } from "@/hooks/useAppUpdate";

export function UpdatePrompt() {
  const { available, updating, update, later } = useAppUpdate();

  return (
    <Modal open={available} onClose={updating ? () => undefined : later} title="Update available">
      <div className="space-y-5">
        <p className="text-sm leading-6 text-muted-foreground">
          A new version of {brandConfig.businessName} is available. Update now for the latest
          features and fixes.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button fullWidth onClick={update} disabled={updating}>
            {updating ? "Updating…" : "Update now"}
          </Button>
          <Button fullWidth variant="outline" onClick={later} disabled={updating}>
            Later
          </Button>
        </div>
      </div>
    </Modal>
  );
}
