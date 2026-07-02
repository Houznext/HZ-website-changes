import type { InvoiceItemForm } from "./invoice.types";

export function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function lineGross(item: InvoiceItemForm) {
  if (item.pricing_mode === "unit") {
    return round2(Number(item.quantity || 0) * Number(item.unit_price || 0));
  }
  return round2(Number(item.area_value || 0) * Number(item.rate_per_unit || 0));
}

function lineDiscount(gross: number, item: InvoiceItemForm) {
  let d = 0;
  if (item.item_discount_type === "percent") {
    d = round2(gross * (Number(item.item_discount_value || 0) / 100));
  } else if (item.item_discount_type === "amount") {
    d = round2(Number(item.item_discount_value || 0));
  }
  return d > gross ? gross : d;
}

export function previewLine(item: InvoiceItemForm, supplierCode: string, billCode: string) {
  const gross = lineGross(item);
  const disc = lineDiscount(gross, item);
  const taxable = round2(gross - disc);
  const gstRate = Number(item.gst_rate ?? 18);
  const gst = round2((taxable * gstRate) / 100);
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  if (supplierCode && billCode && supplierCode === billCode) {
    cgst = round2(gst / 2);
    sgst = round2(gst - cgst);
  } else {
    igst = gst;
  }
  return { gross, disc, taxable, gst, cgst, sgst, igst, lineTotal: round2(taxable + gst) };
}

export function previewInvoice(
  items: InvoiceItemForm[],
  supplierCode: string,
  billCode: string,
  invoiceDiscountType?: "percent" | "amount",
  invoiceDiscountValue?: number | string,
) {
  const lines = items.map((it) => previewLine(it, supplierCode, billCode));
  const subtotal = round2(lines.reduce((s, l) => s + l.gross, 0));
  const totalItemDiscount = round2(lines.reduce((s, l) => s + l.disc, 0));
  const preBase = round2(subtotal - totalItemDiscount);
  const discType =
    invoiceDiscountType || (invoiceDiscountValue != null && String(invoiceDiscountValue).trim() !== "" && Number(invoiceDiscountValue) > 0
      ? "amount"
      : undefined);
  let invoiceDiscount = 0;
  if (discType === "percent") {
    invoiceDiscount = round2(preBase * (Number(invoiceDiscountValue || 0) / 100));
  } else if (discType === "amount") {
    invoiceDiscount = round2(Number(invoiceDiscountValue || 0));
  }
  if (invoiceDiscount > preBase) invoiceDiscount = preBase;
  const ratio = preBase > 0 ? invoiceDiscount / preBase : 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let taxableValue = 0;
  lines.forEach((l) => {
    const adjTaxable = round2(l.taxable * (1 - ratio));
    taxableValue += adjTaxable;
    const gst = round2((adjTaxable * (l.gst / (l.taxable || 1)) || 0));
    if (supplierCode && billCode && supplierCode === billCode) {
      cgst += round2(gst / 2);
      sgst += round2(gst / 2);
    } else {
      igst += gst;
    }
  });
  taxableValue = round2(taxableValue);
  cgst = round2(cgst);
  sgst = round2(sgst);
  igst = round2(igst);
  const totalTax = round2(cgst + sgst + igst);
  const beforeRound = round2(taxableValue + totalTax);
  const grandTotal = Math.round(beforeRound);
  const roundOff = round2(grandTotal - beforeRound);
  return {
    subtotal,
    totalItemDiscount,
    invoiceDiscount,
    taxableValue,
    cgst,
    sgst,
    igst,
    totalTax,
    roundOff,
    grandTotal,
  };
}
