type UpdateSW = (reloadPage?: boolean) => Promise<void>;

let updateSW: UpdateSW | undefined;

export async function registerPwa(options: { onNeedRefresh?: () => void }): Promise<void> {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

  const { registerSW } = await import("virtual:pwa-register");
  updateSW = registerSW({
    immediate: true,
    onNeedRefresh: options.onNeedRefresh,
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      window.setInterval(() => {
        void registration.update();
      }, 45_000);
    },
  });
}

function withTimeout(task: Promise<unknown>, ms: number): Promise<void> {
  return Promise.race([
    task.then(() => undefined),
    new Promise<void>((resolve) => window.setTimeout(resolve, ms)),
  ]);
}

export async function applyAppUpdate(): Promise<void> {
  if (updateSW) {
    void updateSW(false);
  }

  await withTimeout(
    (async () => {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(async (registration) => {
            registration.waiting?.postMessage({ type: "SKIP_WAITING" });
            await registration.unregister();
          }),
        );
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    })(),
    300,
  );

  const url = new URL(window.location.href);
  url.searchParams.set("updated", String(Date.now()));
  window.location.replace(url.href);
}

export function preparePwa(): void {
  // Registration is started from useAppUpdate so the prompt can be shown.
}
