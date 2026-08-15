import { defaultSettings } from "@/data/settings";
import { mapConvexProduct } from "@/lib/productMap";
import { mapConvexCustomer } from "@/services/customerService";
import { storage } from "@/lib/storage";
import {
  customerOutstanding,
  customerPurchases,
} from "@/lib/stats";
import {
  customerService,
  expenseService,
  invoiceService,
  productService,
  settingsService,
  transactionService,
} from "@/services";
import type {
  AppSettings,
  CreateExpenseInput,
  CreateInvoiceInput,
  Customer,
  Expense,
  Invoice,
  Product,
  RecordPaymentInput,
  Transaction,
} from "@/types";
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface DataContextValue {
  loading: boolean;
  error: string | null;
  invoices: Invoice[];
  customers: Customer[];
  products: Product[];
  transactions: Transaction[];
  expenses: Expense[];
  settings: AppSettings;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  refresh: () => Promise<void>;
  createInvoice: (input: CreateInvoiceInput) => Promise<Invoice>;
  updateInvoice: (id: string, input: CreateInvoiceInput) => Promise<Invoice>;
  recordPayment: (input: RecordPaymentInput) => Promise<void>;
  addCustomer: (input: Omit<Customer, "id" | "createdAt">) => Promise<Customer>;
  addProduct: (input: Omit<Product, "id">) => Promise<Product>;
  addExpense: (input: CreateExpenseInput) => Promise<Expense>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  cancelInvoice: (invoiceId: string) => Promise<void>;
  getCustomerOutstanding: (customerId: string) => number;
  getCustomerPurchases: (customerId: string) => number;
}

const DataContext = createContext<DataContextValue | null>(null);

function applyTheme() {
  document.documentElement.setAttribute("data-theme", "light");
}

export function DataProvider({ children }: { children: ReactNode }) {
  const remoteProducts = useQuery(api.products.list);
  const products = useMemo(
    () => (remoteProducts ?? []).map(mapConvexProduct),
    [remoteProducts],
  );
  const remoteCustomers = useQuery(api.customers.list);
  const customers = useMemo(
    () => (remoteCustomers ?? []).map(mapConvexCustomer),
    [remoteCustomers],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [sidebarCollapsed, setCollapsed] = useState(() =>
    storage.get("sidebarCollapsed", false),
  );

  const setSidebarCollapsed = useCallback((value: boolean) => {
    setCollapsed(value);
    storage.set("sidebarCollapsed", value);
  }, []);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [nextInvoices, nextTransactions, nextExpenses, nextSettings] =
        await Promise.all([
          invoiceService.getInvoices(),
          transactionService.getTransactions(),
          expenseService.getExpenses(),
          settingsService.getSettings(),
        ]);
      setInvoices(nextInvoices);
      setTransactions(nextTransactions);
      setExpenses(nextExpenses);
      setSettings(nextSettings);
      applyTheme();
    } catch {
      setError("Unable to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    applyTheme();
    void refresh();
  }, [refresh]);

  const adjustCash = useCallback(async (delta: number) => {
    const current = await settingsService.getSettings();
    await settingsService.updateSettings({
      openingCash: Math.max(0, current.openingCash + delta),
    });
  }, []);

  const createInvoice = useCallback(
    async (input: CreateInvoiceInput) => {
      const invoice = await invoiceService.createInvoice(input);
      await transactionService.recordSale(invoice);
      await Promise.all(
        invoice.items.map((item) => productService.adjustStock(item.productId, -item.quantity)),
      );
      if (invoice.amountPaid > 0 && invoice.paymentMethod !== "credit") {
        await adjustCash(invoice.amountPaid);
      }
      await refresh();
      return invoice;
    },
    [adjustCash, refresh],
  );

  const updateInvoice = useCallback(
    async (id: string, input: CreateInvoiceInput) => {
      const previous =
        invoices.find((invoice) => invoice.id === id) ??
        (await invoiceService.getInvoiceById(id));
      if (!previous) {
        throw new Error("Invoice not found");
      }
      const invoice = await invoiceService.updateInvoice(id, input);
      await transactionService.syncSale(invoice);

      const oldQty = new Map<string, number>();
      previous.items.forEach((item) => {
        oldQty.set(item.productId, (oldQty.get(item.productId) ?? 0) + item.quantity);
      });
      const newQty = new Map<string, number>();
      invoice.items.forEach((item) => {
        newQty.set(item.productId, (newQty.get(item.productId) ?? 0) + item.quantity);
      });
      const productIds = new Set([...oldQty.keys(), ...newQty.keys()]);
      await Promise.all(
        [...productIds].map((productId) => {
          const delta = (oldQty.get(productId) ?? 0) - (newQty.get(productId) ?? 0);
          return delta ? productService.adjustStock(productId, delta) : undefined;
        }),
      );

      const paidDelta = invoice.amountPaid - previous.amountPaid;
      if (paidDelta) {
        await adjustCash(paidDelta);
      }
      await refresh();
      return invoice;
    },
    [adjustCash, invoices, refresh],
  );

  const recordPayment = useCallback(
    async (input: RecordPaymentInput) => {
      const customer = customers.find((item) => item.id === input.customerId);
      if (!customer) {
        throw new Error("Customer not found");
      }

      let remaining = input.amount;
      const targets = input.invoiceId
        ? invoices.filter((invoice) => invoice.id === input.invoiceId)
        : invoices
            .filter(
              (invoice) =>
                invoice.customerId === input.customerId &&
                invoice.balance > 0 &&
                invoice.status !== "cancelled",
            )
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      let lastInvoice: Invoice | undefined;
      for (const invoice of targets) {
        if (remaining <= 0) break;
        const applied = Math.min(remaining, invoice.balance);
        lastInvoice = await invoiceService.applyPayment(invoice.id, applied);
        remaining -= applied;
      }

      await transactionService.recordPayment({
        customerId: input.customerId,
        party: customer.name,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        invoiceId: lastInvoice?.id ?? input.invoiceId,
        reference: lastInvoice?.number ?? "Payment",
        date: input.date,
        notes: input.notes,
      });
      await adjustCash(input.amount);
      await refresh();
    },
    [adjustCash, customers, invoices, refresh],
  );

  const addCustomer = useCallback(async (input: Omit<Customer, "id" | "createdAt">) => {
    return customerService.createCustomer(input);
  }, []);

  const addProduct = useCallback(
    async (input: Omit<Product, "id">) => {
      const product = await productService.createProduct(input);
      await refresh();
      return product;
    },
    [refresh],
  );

  const addExpense = useCallback(
    async (input: CreateExpenseInput) => {
      const expense = await expenseService.createExpense(input);
      await transactionService.recordExpense(expense);
      await adjustCash(-input.amount);
      await refresh();
      return expense;
    },
    [adjustCash, refresh],
  );

  const updateSettings = useCallback(
    async (patch: Partial<AppSettings>) => {
      const next = await settingsService.updateSettings(patch);
      setSettings(next);
      applyTheme();
    },
    [],
  );

  const cancelInvoice = useCallback(
    async (invoiceId: string) => {
      const invoice = await invoiceService.cancelInvoice(invoiceId);
      await transactionService.markInvoiceCancelled(invoiceId);
      await Promise.all(
        invoice.items.map((item) => productService.adjustStock(item.productId, item.quantity)),
      );
      await refresh();
    },
    [refresh],
  );

  const getCustomerOutstanding = useCallback(
    (customerId: string) => customerOutstanding(customerId, invoices),
    [invoices],
  );

  const getCustomerPurchases = useCallback(
    (customerId: string) => customerPurchases(customerId, invoices),
    [invoices],
  );

  const value = useMemo<DataContextValue>(
    () => ({
      loading,
      error,
      invoices,
      customers,
      products,
      transactions,
      expenses,
      settings,
      sidebarCollapsed,
      setSidebarCollapsed,
      refresh,
      createInvoice,
      updateInvoice,
      recordPayment,
      addCustomer,
      addProduct,
      addExpense,
      updateSettings,
      cancelInvoice,
      getCustomerOutstanding,
      getCustomerPurchases,
    }),
    [
      addCustomer,
      addExpense,
      addProduct,
      cancelInvoice,
      createInvoice,
      updateInvoice,
      customers,
      error,
      expenses,
      getCustomerOutstanding,
      getCustomerPurchases,
      invoices,
      loading,
      products,
      recordPayment,
      refresh,
      setSidebarCollapsed,
      settings,
      sidebarCollapsed,
      transactions,
      updateSettings,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }
  return context;
}
