import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { brandConfig } from "@/brand/config";
import { useAppUpdate } from "@/hooks/useAppUpdate";

export function UpdatePrompt() {
  const { available, update, later } = useAppUpdate();

  return (
    <Modal open={available} onClose={later} title="Update available">
      <div className="space-y-5">
        <p className="text-sm leading-6 text-muted-foreground">
          A newer version of {brandConfig.businessName} is ready. Update now to keep billing
          and records in sync with the latest release.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button fullWidth onClick={update}>
            Update now
          </Button>
          <Button fullWidth variant="outline" onClick={later}>
            Later
          </Button>
        </div>
      </div>
    </Modal>
  );
}
