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

export async function applyAppUpdate(): Promise<void> {
  if (updateSW) {
    await updateSW(true);
    return;
  }
  window.location.reload();
}

export function preparePwa(): void {
  // Registration is started from useAppUpdate so the prompt can be shown.
}
