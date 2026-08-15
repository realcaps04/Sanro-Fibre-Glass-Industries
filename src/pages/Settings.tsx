import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { paymentLabel } from "@/lib/labels";
import type { PaymentMethod } from "@/types";
import { useState } from "react";

export default function Settings() {
  const { settings, updateSettings } = useData();
  const { toast } = useToast();
  const [business, setBusiness] = useState(settings.business);
  const [invoice, setInvoice] = useState({
    ...settings.invoice,
    taxPercent: Math.round(settings.invoice.taxRate * 100),
  });

  const saveBusiness = async () => {
    await updateSettings({ business });
    toast("Business profile saved", "success");
  };

  const saveInvoice = async () => {
    await updateSettings({
      invoice: {
        prefix: invoice.prefix,
        nextNumber: Number(invoice.nextNumber) || settings.invoice.nextNumber,
        taxRate: Number(invoice.taxPercent) / 100,
        defaultNotes: invoice.defaultNotes,
        enabledPaymentMethods: invoice.enabledPaymentMethods,
      },
    });
    toast("Invoice settings saved", "success");
  };

  const toggleMethod = (method: PaymentMethod) => {
    const enabled = invoice.enabledPaymentMethods.includes(method)
      ? invoice.enabledPaymentMethods.filter((item) => item !== method)
      : [...invoice.enabledPaymentMethods, method];
    setInvoice((current) => ({
      ...current,
      enabledPaymentMethods: enabled.length ? enabled : current.enabledPaymentMethods,
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" />

      <section className="elevated rounded-lg p-4">
        <h2 className="text-sm font-semibold">Business Profile</h2>
        <div className="mt-4 space-y-3">
          <div>
            <Label htmlFor="biz-name">Business Name</Label>
            <Input
              id="biz-name"
              value={business.businessName}
              onChange={(event) =>
                setBusiness((current) => ({ ...current, businessName: event.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="biz-address">Address</Label>
            <Textarea
              id="biz-address"
              value={business.address}
              onChange={(event) =>
                setBusiness((current) => ({ ...current, address: event.target.value }))
              }
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="biz-phone">Phone</Label>
              <Input
                id="biz-phone"
                value={business.phone}
                onChange={(event) =>
                  setBusiness((current) => ({ ...current, phone: event.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="biz-email">Email</Label>
              <Input
                id="biz-email"
                type="email"
                value={business.email}
                onChange={(event) =>
                  setBusiness((current) => ({ ...current, email: event.target.value }))
                }
              />
            </div>
          </div>
          <div>
            <Label htmlFor="biz-gstin">GSTIN</Label>
            <Input
              id="biz-gstin"
              value={business.gstin}
              onChange={(event) =>
                setBusiness((current) => ({ ...current, gstin: event.target.value.toUpperCase() }))
              }
            />
          </div>
          <div>
            <Label htmlFor="biz-logo">Logo</Label>
            <Input
              id="biz-logo"
              value={business.logo}
              onChange={(event) =>
                setBusiness((current) => ({ ...current, logo: event.target.value }))
              }
              placeholder="/logo.png"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Optional path. A wordmark is used until a logo file is added.
            </p>
          </div>
          <Button onClick={() => void saveBusiness()}>Save profile</Button>
        </div>
      </section>

      <section className="elevated rounded-lg p-4">
        <h2 className="text-sm font-semibold">Invoice Settings</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="inv-prefix">Prefix</Label>
            <Input
              id="inv-prefix"
              value={invoice.prefix}
              onChange={(event) =>
                setInvoice((current) => ({ ...current, prefix: event.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="inv-next">Next number</Label>
            <Input
              id="inv-next"
              inputMode="numeric"
              value={invoice.nextNumber}
              onChange={(event) =>
                setInvoice((current) => ({
                  ...current,
                  nextNumber: Number(event.target.value) || 0,
                }))
              }
            />
          </div>
        </div>
        <div className="mt-3">
          <Label htmlFor="inv-notes">Default notes</Label>
          <Textarea
            id="inv-notes"
            value={invoice.defaultNotes}
            onChange={(event) =>
              setInvoice((current) => ({ ...current, defaultNotes: event.target.value }))
            }
          />
        </div>
        <Button className="mt-4" onClick={() => void saveInvoice()}>
          Save invoice settings
        </Button>
      </section>

      <section className="elevated rounded-lg p-4">
        <h2 className="text-sm font-semibold">Tax Settings</h2>
        <div className="mt-4 max-w-xs">
          <Label htmlFor="tax-rate">GST rate (%)</Label>
          <Input
            id="tax-rate"
            inputMode="numeric"
            value={invoice.taxPercent}
            onChange={(event) =>
              setInvoice((current) => ({
                ...current,
                taxPercent: Number(event.target.value) || 0,
              }))
            }
          />
        </div>
        <Button className="mt-4" onClick={() => void saveInvoice()}>
          Save tax settings
        </Button>
      </section>

      <section className="elevated rounded-lg p-4">
        <h2 className="text-sm font-semibold">Payment Methods</h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {(Object.keys(paymentLabel) as PaymentMethod[]).map((method) => (
            <label
              key={method}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={invoice.enabledPaymentMethods.includes(method)}
                onChange={() => toggleMethod(method)}
              />
              {paymentLabel[method]}
            </label>
          ))}
        </div>
        <Button className="mt-4" onClick={() => void saveInvoice()}>
          Save payment methods
        </Button>
      </section>

      <section className="elevated rounded-lg p-4">
        <h2 className="text-sm font-semibold">About</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sanro Doors billing app · frontend preview. Data is stored on this device until
          Supabase is connected.
        </p>
      </section>
    </div>
  );
}
