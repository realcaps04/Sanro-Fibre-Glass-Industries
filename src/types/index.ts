export type PaymentMethod = "cash" | "upi" | "bank" | "credit";
export type InvoiceStatus = "paid" | "pending" | "partial" | "cancelled";
export type TransactionType = "sale" | "payment" | "expense" | "refund";
export type TransactionDirection = "in" | "out";
export type ProductCategory = "doors" | "windows" | "accessories" | "waterproofing" | "other";
export type ExpenseCategory =
  | "transport"
  | "electricity"
  | "materials"
  | "wages"
  | "rent"
  | "fuel"
  | "maintenance"
  | "other";
export type AppearanceTheme = "light" | "dark" | "system";
export type SalesPeriod = "today" | "7d" | "30d";
export type BillKind = "doors" | "waterproofing";

export interface Customer {
  id: string;
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

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  price: number;
  stock: number;
  unit: string;
  description?: string;
  hsnCode: string;
  gstRate: number;
}

export interface InvoiceLineItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  rate: number;
  amount: number;
  hsnCode?: string;
  gstRate?: number;
  taxableAmount?: number;
  tax?: number;
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  date: string;
  items: InvoiceLineItem[];
  subtotal: number;
  discount: number;
  taxableAmount?: number;
  taxRate: number;
  tax: number;
  cgst?: number;
  sgst?: number;
  grandTotal: number;
  amountPaid: number;
  balance: number;
  paymentMethod: PaymentMethod;
  status: InvoiceStatus;
  notes?: string;
  billKind?: BillKind;
  createdAt: string;
}

export interface CreateInvoiceInput {
  customerId: string;
  customerName: string;
  items: InvoiceLineItem[];
  discount: number;
  taxRate: number;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  date?: string;
  billKind?: BillKind;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  reference: string;
  party: string;
  amount: number;
  direction: TransactionDirection;
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  date: string;
  invoiceId?: string;
  expenseId?: string;
  customerId?: string;
  description?: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: Exclude<PaymentMethod, "credit">;
  description: string;
  vendor?: string;
}

export interface CreateExpenseInput {
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: Exclude<PaymentMethod, "credit">;
  description: string;
  vendor?: string;
}

export interface BusinessSettings {
  businessName: string;
  legalName: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  logo: string;
}

export interface InvoiceSettings {
  prefix: string;
  nextNumber: number;
  taxRate: number;
  defaultNotes: string;
  enabledPaymentMethods: PaymentMethod[];
}

export interface AppearanceSettings {
  theme: AppearanceTheme;
}

export interface AppSettings {
  business: BusinessSettings;
  invoice: InvoiceSettings;
  appearance: AppearanceSettings;
  openingCash: number;
}

export interface BillTotals {
  subtotal: number;
  discount: number;
  taxableAmount: number;
  tax: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  amountPaid: number;
  balance: number;
}

export interface RecordPaymentInput {
  customerId: string;
  invoiceId?: string;
  amount: number;
  paymentMethod: Exclude<PaymentMethod, "credit">;
  date?: string;
  notes?: string;
}
