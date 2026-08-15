import { cn } from "@/lib/cn";
import { X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  nested?: boolean;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
  nested = false,
}: BottomSheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setShown(true));
      });
      return () => window.cancelAnimationFrame(frame);
    }
    setShown(false);
    const timeout = window.setTimeout(() => setMounted(false), 420);
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 flex items-end justify-center",
        nested ? "z-[70]" : "z-50",
      )}
    >
      <button
        type="button"
        aria-label="Close sheet"
        className={cn(
          "absolute inset-0 bg-overlay transition-opacity duration-[400ms] ease-out",
          shown ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-10 flex max-h-[92dvh] w-full flex-col rounded-t-[28px] bg-card pb-[env(safe-area-inset-bottom)] shadow-[var(--shadow-hero)] transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          shown ? "translate-y-0" : "translate-y-full",
          className,
        )}
      >
        <div className="flex items-center justify-center px-4 pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-border" aria-hidden />
        </div>
        <div className="flex items-center justify-between px-5 pb-3">
          <h2 id={titleId} className="text-base font-semibold tracking-[-0.02em]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
      </div>
    </div>
  );
}
