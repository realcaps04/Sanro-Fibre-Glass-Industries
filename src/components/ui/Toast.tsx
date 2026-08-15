import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/cn";

export function ToastViewport() {
  const { toasts, dismiss } = useToast();

  if (!toasts.length) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-[70] flex flex-col items-center gap-2 px-4 print:hidden lg:top-4"
      aria-live="polite"
    >
      {toasts.map((item) => (
        <button
          key={item.id}
          type="button"
          className={cn(
            "pointer-events-auto animate-toast-in rounded-md border px-4 py-2.5 text-sm shadow-sm",
            item.tone === "danger"
              ? "border-danger/20 bg-danger text-danger-foreground"
              : item.tone === "success"
                ? "border-success/20 bg-primary text-primary-foreground"
                : "border-border bg-foreground text-background",
          )}
          onClick={() => dismiss(item.id)}
        >
          {item.message}
        </button>
      ))}
    </div>
  );
}
