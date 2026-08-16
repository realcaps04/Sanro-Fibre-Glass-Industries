import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Overlay } from "@/components/ui/Overlay";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { composeCustomerAddress } from "@/lib/address";
import { normalizeGstin, normalizePhone } from "@/lib/phone";
import type { Customer } from "@/types";
import { useState } from "react";

interface CustomerFormProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (customer: Customer) => void;
}

export function CustomerForm({ open, onClose, onCreated }: CustomerFormProps) {
  const { addCustomer, customers } = useData();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [houseName, setHouseName] = useState("");
  const [place, setPlace] = useState("");
  const [pincode, setPincode] = useState("");
  const [gstin, setGstin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setPhone("");
    setHouseName("");
    setPlace("");
    setPincode("");
    setGstin("");
  };

  const submit = async () => {
    if (!name.trim() || !phone.trim()) return;
    const phoneKey = normalizePhone(phone);
    if (phoneKey.length < 10) {
      toast("Enter a valid 10-digit phone number", "danger");
      return;
    }
    const gstinKey = normalizeGstin(gstin);
    if (customers.some((customer) => normalizePhone(customer.phone) === phoneKey)) {
      toast("A customer with this phone number already exists", "danger");
      return;
    }
    if (
      gstinKey &&
      customers.some((customer) => normalizeGstin(customer.gstin) === gstinKey)
    ) {
      toast("A customer with this GSTIN already exists", "danger");
      return;
    }
    setSubmitting(true);
    try {
      const trimmedHouse = houseName.trim();
      const trimmedPlace = place.trim();
      const trimmedPin = pincode.trim();
      const customer = await addCustomer({
        name: name.trim(),
        phone: phoneKey,
        houseName: trimmedHouse || undefined,
        place: trimmedPlace || undefined,
        pincode: trimmedPin || undefined,
        address: composeCustomerAddress({
          houseName: trimmedHouse,
          place: trimmedPlace,
          pincode: trimmedPin,
        }),
        gstin: gstinKey,
      });
      toast("Customer added", "success");
      reset();
      onCreated?.(customer);
      onClose();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to add customer", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Overlay open={open} onClose={onClose} title="Add Customer" nested>
      <div className="space-y-4">
        <div>
          <Label htmlFor="cus-name">Customer name</Label>
          <Input
            id="cus-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Business or person"
          />
        </div>
        <div>
          <Label htmlFor="cus-phone">Phone</Label>
          <Input
            id="cus-phone"
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="10-digit mobile"
          />
        </div>
        <div>
          <Label htmlFor="cus-house">House name</Label>
          <Input
            id="cus-house"
            value={houseName}
            onChange={(event) => setHouseName(event.target.value)}
            placeholder="House / building name"
          />
        </div>
        <div>
          <Label htmlFor="cus-place">Place</Label>
          <Input
            id="cus-place"
            value={place}
            onChange={(event) => setPlace(event.target.value)}
            placeholder="Town or locality"
          />
        </div>
        <div>
          <Label htmlFor="cus-pin">Pincode</Label>
          <Input
            id="cus-pin"
            inputMode="numeric"
            maxLength={6}
            value={pincode}
            onChange={(event) => setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit PIN"
          />
        </div>
        <div>
          <Label htmlFor="cus-gstin">GSTIN</Label>
          <Input
            id="cus-gstin"
            value={gstin}
            onChange={(event) => setGstin(event.target.value.toUpperCase())}
            placeholder="Optional"
          />
        </div>
        <Button fullWidth disabled={submitting || !name.trim() || !phone.trim()} onClick={() => void submit()}>
          Save Customer
        </Button>
      </div>
    </Overlay>
  );
}
