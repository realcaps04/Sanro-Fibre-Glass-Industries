import { mockCustomers } from "@/data/customers";
import { createId, matchesQuery } from "@/lib/search";
import { createCollection } from "@/services/collection";
import type { Customer } from "@/types";

const collection = createCollection("customers", mockCustomers);

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    return collection.read();
  },

  async getCustomerById(id: string): Promise<Customer | undefined> {
    return collection.read().find((customer) => customer.id === id);
  },

  async searchCustomers(query: string): Promise<Customer[]> {
    return collection
      .read()
      .filter((customer) =>
        matchesQuery(query, customer.name, customer.phone, customer.gstin, customer.address),
      );
  },

  async createCustomer(
    input: Omit<Customer, "id" | "createdAt">,
  ): Promise<Customer> {
    const customer: Customer = {
      ...input,
      id: createId("cus"),
      createdAt: new Date().toISOString(),
    };
    collection.write([customer, ...collection.read()]);
    return customer;
  },

  async updateCustomer(id: string, patch: Partial<Customer>): Promise<Customer> {
    const current = collection.read();
    const index = current.findIndex((customer) => customer.id === id);
    if (index === -1) {
      throw new Error("Customer not found");
    }
    const updated = { ...current[index], ...patch, id };
    const next = [...current];
    next[index] = updated;
    collection.write(next);
    return updated;
  },
};
