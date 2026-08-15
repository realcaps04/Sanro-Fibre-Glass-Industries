import { defaultSettings } from "@/data/settings";
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

function applyTheme(theme: AppSettings["appearance"]["theme"]) {
  const root = document.documentElement;
  if (theme === "system") {
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.setAttribute("data-theme", dark ? "dark" : "light");
    return;
  }
  root.setAttribute("data-theme", theme);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
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
      const [nextInvoices, nextCustomers, nextProducts, nextTransactions, nextExpenses, nextSettings] =
        await Promise.all([
          invoiceService.getInvoices(),
          customerService.getCustomers(),
          productService.getProducts(),
          transactionService.getTransactions(),
          expenseService.getExpenses(),
          settingsService.getSettings(),
        ]);
      setInvoices(nextInvoices);
      setCustomers(nextCustomers);
      setProducts(nextProducts);
      setTransactions(nextTransactions);
      setExpenses(nextExpenses);
      setSettings(nextSettings);
      applyTheme(nextSettings.appearance.theme);
    } catch {
      setError("Unable to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
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

  const addCustomer = useCallback(
    async (input: Omit<Customer, "id" | "createdAt">) => {
      const customer = await customerService.createCustomer(input);
      await refresh();
      return customer;
    },
    [refresh],
  );

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
      applyTheme(next.appearance.theme);
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
