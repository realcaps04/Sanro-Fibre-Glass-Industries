import { brandConfig } from "@/brand/config";
import type { AppSettings } from "@/types";

export const defaultSettings: AppSettings = {
  business: {
    businessName: brandConfig.businessName,
    legalName: brandConfig.legalName,
    address: brandConfig.address,
    phone: brandConfig.phone,
    email: brandConfig.email,
    gstin: brandConfig.gstin,
    logo: "",
  },
  invoice: {
    prefix: "INV-",
    nextNumber: 1046,
    taxRate: 0.18,
    defaultNotes: "Thank you for your business.",
    enabledPaymentMethods: ["cash", "upi", "bank", "credit"],
  },
  appearance: {
    theme: "light",
  },
  openingCash: 32500,
};
