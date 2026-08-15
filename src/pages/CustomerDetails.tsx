import { InvoiceCard } from "@/components/billing/InvoiceCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaymentSheet } from "@/components/payments/PaymentSheet";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Overlay } from "@/components/ui/Overlay";
import { useData } from "@/context/DataContext";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/dates";
import { customerOutstanding, customerPurchases } from "@/lib/stats";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customers, invoices } = useData();
  const [payOpen, setPayOpen] = useState(false);
  const [statementOpen, setStatementOpen] = useState(false);
  const customer = customers.find((item) => item.id === id);

  if (!customer) {
    return (
      <ErrorState
        title="Unable to load customer"
        description="This customer could not be found."
      />
    );
  }

  const related = invoices.filter((invoice) => invoice.customerId === customer.id);
  const outstanding = customerOutstanding(customer.id, invoices);
  const purchases = customerPurchases(customer.id, invoices);

  return (
    <div>
      <PageHeader title={customer.name} backTo="/customers" />
      <section className="elevated rounded-lg px-4 py-4 text-sm">
        <p className="text-muted-foreground">Phone</p>
        <p className="mt-0.5 font-medium">{customer.phone}</p>
        {customer.houseName || customer.place || customer.pincode ? (
          <>
            {customer.houseName ? (
              <>
                <p className="mt-3 text-muted-foreground">House name</p>
                <p className="mt-0.5">{customer.houseName}</p>
              </>
            ) : null}
            {customer.place ? (
              <>
                <p className="mt-3 text-muted-foreground">Place</p>
                <p className="mt-0.5">{customer.place}</p>
              </>
            ) : null}
            {customer.pincode ? (
              <>
                <p className="mt-3 text-muted-foreground">Pincode</p>
                <p className="mt-0.5">{customer.pincode}</p>
              </>
            ) : null}
          </>
        ) : (
          <>
            <p className="mt-3 text-muted-foreground">Address</p>
            <p className="mt-0.5">{customer.address}</p>
          </>
        )}
        {customer.gstin ? (
          <>
            <p className="mt-3 text-muted-foreground">GSTIN</p>
            <p className="mt-0.5">{customer.gstin}</p>
          </>
        ) : null}
      </section>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="elevated rounded-lg px-4 py-3">
          <p className="text-xs text-muted-foreground">Outstanding</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{formatCurrency(outstanding)}</p>
        </div>
        <div className="elevated rounded-lg px-4 py-3">
          <p className="text-xs text-muted-foreground">Total Purchases</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{formatCurrency(purchases)}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        {outstanding > 0 ? (
          <Button onClick={() => setPayOpen(true)}>Record Payment</Button>
        ) : null}
        <Button variant="outline" onClick={() => setStatementOpen(true)}>
          View Statement
        </Button>
        <Button variant="outline" onClick={() => navigate("/billing/new")}>
          New Bill
        </Button>
      </div>
      <h2 className="mt-6 mb-3 text-sm font-medium text-muted-foreground">Transactions</h2>
      {related.length ? (
        <div className="divide-y divide-border elevated rounded-lg">
          {related.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No bills for this customer"
          description="Create a bill to start this customer's statement."
          actionLabel="Create New Bill"
          onAction={() => navigate("/billing/new")}
        />
      )}
      <PaymentSheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        presetCustomerId={customer.id}
      />
      <Overlay open={statementOpen} onClose={() => setStatementOpen(false)} title="Account Statement">
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">{customer.address}</p>
          {related.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between border-b border-border py-2">
              <span>
                {invoice.number}
                <span className="block text-xs text-muted-foreground">{formatDate(invoice.date)}</span>
              </span>
              <span className="tabular-nums">{formatCurrency(invoice.grandTotal)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 font-semibold">
            <span>Outstanding</span>
            <span className="tabular-nums">{formatCurrency(outstanding)}</span>
          </div>
          <Button fullWidth variant="outline" onClick={() => window.print()}>
            Print statement
          </Button>
        </div>
      </Overlay>
    </div>
  );
}
