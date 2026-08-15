import { composeCustomerAddress } from "@/lib/address";
import type { Customer } from "@/types";

export const mockCustomers: Customer[] = [
  {
    id: "cus_edison",
    name: "Edison Biju",
    phone: "7510483455",
    houseName: "Mullappallil",
    place: "Thopramkudy",
    pincode: "685609",
    address: composeCustomerAddress({
      houseName: "Mullappallil",
      place: "Thopramkudy",
      pincode: "685609",
    }),
    createdAt: "2026-08-15T10:00:00+05:30",
  },
];

export const dummyCustomerIds = [
  "cus_abc",
  "cus_john",
  "cus_xyz",
  "cus_malabar",
  "cus_greenleaf",
  "cus_horizon",
  "cus_royal",
  "cus_prestige",
];
