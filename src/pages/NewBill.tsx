import { NewBillFlow } from "@/components/billing/NewBillFlow";
import { useNavigate } from "react-router-dom";

export default function NewBill() {
  const navigate = useNavigate();

  return (
    <NewBillFlow
      open
      onClose={() => navigate("/")}
      onCreated={(invoiceId) => navigate(`/billing/${invoiceId}`)}
    />
  );
}
