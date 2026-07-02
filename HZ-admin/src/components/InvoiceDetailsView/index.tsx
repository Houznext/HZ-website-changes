import React from "react";
import { useRouter } from "next/router";
import InvoiceEditor from "../InvoiceView/InvoiceEditor";

/** @deprecated Use InvoiceEditor directly — kept for backward compatibility */
export default function InvoiceDetailsView() {
  const router = useRouter();
  const id = router.query.id as string | undefined;
  return <InvoiceEditor invoiceId={id} />;
}

export { InvoiceEstimatorTable } from "./legacy-table";
