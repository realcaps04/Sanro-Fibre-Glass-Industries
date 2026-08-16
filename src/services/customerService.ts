import { api } from "../../convex/_generated/api";
import { convex } from "@/lib/convex";
import { matchesQuery } from "@/lib/search";
import type { Customer } from "@/types";

export interface ConvexCustomerRow {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  houseName?: string;
  place?: string;
  pincode?: string;
  address: string;
  gstin?: string;
  createdAt: string;
}

export function mapConvexCustomer(row: ConvexCustomerRow): Customer {
  return {
    id: row._id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    houseName: row.houseName,
    place: row.place,
    pincode: row.pincode,
    address: row.address,
    gstin: row.gstin,
    createdAt: row.createdAt,
  };
}

function optional(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    const rows = await convex.query(api.customers.list);
    return rows.map(mapConvexCustomer);
  },

  async getCustomerById(id: string): Promise<Customer | undefined> {
    const customers = await this.getCustomers();
    return customers.find((customer) => customer.id === id);
  },

  async searchCustomers(query: string): Promise<Customer[]> {
    const customers = await this.getCustomers();
    return customers.filter((customer) =>
      matchesQuery(
        query,
        customer.name,
        customer.phone,
        customer.gstin,
        customer.address,
        customer.houseName,
        customer.place,
        customer.pincode,
      ),
    );
  },

  async createCustomer(input: Omit<Customer, "id" | "createdAt">): Promise<Customer> {
    const row = await convex.mutation(api.customers.create, {
      name: input.name.trim(),
      phone: input.phone.trim(),
      address: input.address.trim(),
      email: optional(input.email),
      houseName: optional(input.houseName),
      place: optional(input.place),
      pincode: optional(input.pincode),
      gstin: optional(input.gstin),
    });
    if (!row) throw new Error("Unable to create customer");
    return mapConvexCustomer(row);
  },

  async updateCustomer(id: string, patch: Partial<Customer>): Promise<Customer> {
    const row = await convex.mutation(api.customers.update, {
      id,
      name: patch.name,
      phone: patch.phone,
      address: patch.address,
      email: patch.email,
      houseName: patch.houseName,
      place: patch.place,
      pincode: patch.pincode,
      gstin: patch.gstin,
    });
    if (!row) throw new Error("Customer not found");
    return mapConvexCustomer(row);
  },

  async deleteCustomer(id: string): Promise<void> {
    await convex.mutation(api.customers.remove, { id });
  },
};
