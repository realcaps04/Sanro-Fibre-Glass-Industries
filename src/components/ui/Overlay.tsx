import { BottomSheet } from "@/components/ui/BottomSheet";
import { Modal } from "@/components/ui/Modal";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import type { ReactNode } from "react";

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  nested?: boolean;
}

export function Overlay({ open, onClose, title, children, className, nested }: OverlayProps) {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <Modal open={open} onClose={onClose} title={title} className={className}>
        {children}
      </Modal>
    );
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={title} className={className} nested={nested}>
      {children}
    </BottomSheet>
  );
}
