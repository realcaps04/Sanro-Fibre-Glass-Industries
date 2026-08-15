import { dummyCustomerIds, mockCustomers } from "@/data/customers";
import { createId, matchesQuery } from "@/lib/search";
import { createCollection } from "@/services/collection";
import type { Customer } from "@/types";

const collection = createCollection("customers", mockCustomers);

function readCatalog(): Customer[] {
  const stored = collection.read();
  const withoutDummy = stored.filter((customer) => !dummyCustomerIds.includes(customer.id));
  const hasEdison = withoutDummy.some(
    (customer) => customer.id === "cus_edison" || customer.phone === "7510483455",
  );
  const next = hasEdison ? withoutDummy : [...mockCustomers, ...withoutDummy];
  if (next.length !== stored.length || stored.some((customer) => dummyCustomerIds.includes(customer.id))) {
    collection.write(next);
  }
  return next;
}

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    return readCatalog();
  },

  async getCustomerById(id: string): Promise<Customer | undefined> {
    return readCatalog().find((customer) => customer.id === id);
  },

  async searchCustomers(query: string): Promise<Customer[]> {
    return readCatalog().filter((customer) =>
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

  async createCustomer(
    input: Omit<Customer, "id" | "createdAt">,
  ): Promise<Customer> {
    const customer: Customer = {
      ...input,
      id: createId("cus"),
      createdAt: new Date().toISOString(),
    };
    collection.write([customer, ...readCatalog()]);
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
