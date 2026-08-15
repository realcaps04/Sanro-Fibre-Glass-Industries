import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Overlay } from "@/components/ui/Overlay";
import { Textarea } from "@/components/ui/Textarea";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import type { Customer } from "@/types";
import { useState } from "react";

interface CustomerFormProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (customer: Customer) => void;
}

export function CustomerForm({ open, onClose, onCreated }: CustomerFormProps) {
  const { addCustomer } = useData();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [gstin, setGstin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setPhone("");
    setAddress("");
    setGstin("");
  };

  const submit = async () => {
    if (!name.trim() || !phone.trim()) return;
    setSubmitting(true);
    try {
      const customer = await addCustomer({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim() || "Kerala",
        gstin: gstin.trim() || undefined,
      });
      toast("Customer added", "success");
      reset();
      onCreated?.(customer);
      onClose();
    } catch {
      toast("Unable to add customer", "danger");
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
          <Label htmlFor="cus-address">Address</Label>
          <Textarea
            id="cus-address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Street, city, PIN"
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
