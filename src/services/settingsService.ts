import { defaultSettings } from "@/data/settings";
import { storage } from "@/lib/storage";
import type { AppSettings } from "@/types";

const KEY = "settings";

function mergeSettings(stored: Partial<AppSettings> | null): AppSettings {
  if (!stored) return structuredClone(defaultSettings);
  return {
    business: { ...defaultSettings.business, ...stored.business },
    invoice: { ...defaultSettings.invoice, ...stored.invoice },
    appearance: { ...defaultSettings.appearance, ...stored.appearance },
    openingCash: stored.openingCash ?? defaultSettings.openingCash,
  };
}

export const settingsService = {
  async getSettings(): Promise<AppSettings> {
    return mergeSettings(storage.get<Partial<AppSettings> | null>(KEY, null));
  },

  async updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const next: AppSettings = {
      business: { ...current.business, ...patch.business },
      invoice: { ...current.invoice, ...patch.invoice },
      appearance: { ...current.appearance, ...patch.appearance },
      openingCash: patch.openingCash ?? current.openingCash,
    };
    storage.set(KEY, next);
    return next;
  },
};
