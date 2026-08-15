export type DoorHsnKind = "frp" | "flush" | "wpc";

export interface HsnPreset {
  id: DoorHsnKind | "coating" | "membrane" | "other";
  label: string;
  hsnCode: string;
  gstRate: number;
  detail: string;
}

export const doorHsnPresets: HsnPreset[] = [
  {
    id: "frp",
    label: "FRP / fibreglass door",
    hsnCode: "39252000",
    gstRate: 0.18,
    detail: "Plastic-composite or FRP doors · HSN 3925 20 00 · GST 18%",
  },
  {
    id: "flush",
    label: "Flush / MDF / HDF door",
    hsnCode: "44182910",
    gstRate: 0.18,
    detail: "Fibreboard or engineered-wood flush doors · HSN 4418 20 / 4418 29 10 · GST 18%",
  },
  {
    id: "wpc",
    label: "WPC door",
    hsnCode: "39252000",
    gstRate: 0.18,
    detail: "Wood-plastic composite doors · HSN 3925 20 00 · GST 18%",
  },
];

export const waterproofHsnPresets: HsnPreset[] = [
  {
    id: "coating",
    label: "Waterproof coating",
    hsnCode: "32091090",
    gstRate: 0.18,
    detail: "Fibre-reinforced coatings · HSN 3209 10 90 · GST 18%",
  },
  {
    id: "membrane",
    label: "Waterproof membrane",
    hsnCode: "39219099",
    gstRate: 0.18,
    detail: "Flexible membrane sheets · HSN 3921 90 99 · GST 18%",
  },
];

export function formatHsn(code: string): string {
  const digits = code.replace(/\D/g, "");
  if (digits.length === 8) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`;
  }
  if (digits.length === 6) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  }
  return code;
}

export function gstPercent(rate: number): number {
  return Math.round(rate * 100);
}

export function inferProductHsn(input: {
  name: string;
  category?: string;
  description?: string;
}): Pick<HsnPreset, "hsnCode" | "gstRate"> {
  const text = `${input.name} ${input.description ?? ""}`.toLowerCase();
  if (text.includes("wpc")) return doorHsnPresets[2];
  if (
    text.includes("flush") ||
    text.includes("mdf") ||
    text.includes("hdf") ||
    text.includes("fibreboard") ||
    text.includes("fiberboard") ||
    text.includes("engineered")
  ) {
    return doorHsnPresets[1];
  }
  if (text.includes("teak") || text.includes("wood") || text.includes("carved")) {
    return { hsnCode: "441820", gstRate: 0.18 };
  }
  if (input.category === "waterproofing" || text.includes("membrane")) {
    return text.includes("membrane") || text.includes("sheet")
      ? waterproofHsnPresets[1]
      : waterproofHsnPresets[0];
  }
  return doorHsnPresets[0];
}
