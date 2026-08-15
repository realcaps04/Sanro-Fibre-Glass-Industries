import { NewBillSheet } from "@/components/billing/NewBillSheet";
import { useNavigate } from "react-router-dom";

export default function NewBill() {
  const navigate = useNavigate();

  return (
    <NewBillSheet
      open
      onClose={() => navigate("/")}
      onCreated={(invoiceId) => navigate(`/billing/${invoiceId}`)}
    />
  );
}
