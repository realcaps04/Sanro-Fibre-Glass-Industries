import type {
  ExpenseCategory,
  InvoiceStatus,
  PaymentMethod,
  ProductCategory,
  TransactionType,
} from "@/types";

export const statusLabel: Record<InvoiceStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  partial: "Partial",
  cancelled: "Cancelled",
};

export const paymentLabel: Record<PaymentMethod, string> = {
  cash: "Cash",
  upi: "UPI",
  bank: "Bank",
  credit: "Credit",
};

export const productCategoryLabel: Record<ProductCategory, string> = {
  doors: "Doors",
  windows: "Windows",
  accessories: "Accessories",
  other: "Other",
};

export const expenseCategoryLabel: Record<ExpenseCategory, string> = {
  transport: "Transport",
  electricity: "Electricity",
  materials: "Materials",
  wages: "Wages",
  rent: "Rent",
  fuel: "Fuel",
  maintenance: "Maintenance",
  other: "Other",
};

export const transactionTypeLabel: Record<TransactionType, string> = {
  sale: "Sale",
  payment: "Payment",
  expense: "Expense",
  refund: "Refund",
};
