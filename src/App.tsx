import { AppShell } from "@/components/layout/AppShell";
import { BootSplashHandoff } from "@/components/layout/SplashScreen";
import { DataProvider } from "@/context/DataContext";
import { ToastProvider } from "@/context/ToastContext";
import { lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Billing = lazy(() => import("@/pages/Billing"));
const NewBill = lazy(() => import("@/pages/NewBill"));
const InvoiceDetails = lazy(() => import("@/pages/InvoiceDetails"));
const Transactions = lazy(() => import("@/pages/Transactions"));
const Customers = lazy(() => import("@/pages/Customers"));
const CustomerDetails = lazy(() => import("@/pages/CustomerDetails"));
const Products = lazy(() => import("@/pages/Products"));
const Expenses = lazy(() => import("@/pages/Expenses"));
const Reports = lazy(() => import("@/pages/Reports"));
const Settings = lazy(() => import("@/pages/Settings"));

export default function App() {
  return (
    <ToastProvider>
      <DataProvider>
        <BootSplashHandoff />
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/non-gst-bills" element={<Billing nonGst />} />
              <Route path="/billing/new" element={<NewBill />} />
              <Route path="/billing/:id" element={<InvoiceDetails />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id" element={<CustomerDetails />} />
              <Route path="/products" element={<Products />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </ToastProvider>
  );
}
