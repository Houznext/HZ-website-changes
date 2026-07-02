import { numberToIndianWords } from './number-to-words.util';

export type PricingMode = 'unit' | 'area';
export type DiscountType = 'percent' | 'amount';

export interface LineItemInput {
  pricing_mode: PricingMode;
  quantity?: number | null;
  unit_price?: number | null;
  area_value?: number | null;
  rate_per_unit?: number | null;
  item_discount_type?: DiscountType | null;
  item_discount_value?: number | null;
  gst_rate?: number | null;
}

export interface CalculatedLineItem extends LineItemInput {
  gross_amount: number;
  item_discount_amount: number;
  taxable_amount: number;
  gst_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  line_total: number;
}

export interface InvoiceCalculationInput {
  items: LineItemInput[];
  supplier_state_code: string;
  bill_to_state_code: string;
  invoice_discount_type?: DiscountType | null;
  invoice_discount_value?: number | null;
}

export interface CalculatedInvoiceTotals {
  subtotal: number;
  total_item_discount: number;
  invoice_discount_amount: number;
  taxable_value: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_tax: number;
  round_off: number;
  grand_total: number;
  amount_in_words: string;
  items: CalculatedLineItem[];
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateLineItem(
  item: LineItemInput,
  supplierStateCode: string,
  billToStateCode: string,
): CalculatedLineItem {
  let gross = 0;
  if (item.pricing_mode === 'unit') {
    gross = round2(
      Number(item.quantity || 0) * Number(item.unit_price || 0),
    );
  } else if (item.pricing_mode === 'area') {
    gross = round2(
      Number(item.area_value || 0) * Number(item.rate_per_unit || 0),
    );
  } else {
    throw new Error('Invalid pricing_mode');
  }

  let itemDiscount = 0;
  if (item.item_discount_type === 'percent') {
    itemDiscount = round2(
      gross * (Number(item.item_discount_value || 0) / 100),
    );
  } else if (item.item_discount_type === 'amount') {
    itemDiscount = round2(Number(item.item_discount_value || 0));
  }
  if (itemDiscount > gross) itemDiscount = gross;

  const taxable = round2(gross - itemDiscount);
  const gstRate = Number(item.gst_rate ?? 0);
  const gstAmount = round2((taxable * gstRate) / 100);

  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  if (supplierStateCode && billToStateCode && supplierStateCode === billToStateCode) {
    cgst = round2(gstAmount / 2);
    sgst = round2(gstAmount - cgst);
  } else {
    igst = gstAmount;
  }

  const lineTotal = round2(taxable + gstAmount);

  return {
    ...item,
    gross_amount: gross,
    item_discount_amount: itemDiscount,
    taxable_amount: taxable,
    gst_amount: gstAmount,
    cgst_amount: cgst,
    sgst_amount: sgst,
    igst_amount: igst,
    line_total: lineTotal,
  };
}

function computeInvoiceDiscount(
  type: DiscountType | null | undefined,
  value: number | null | undefined,
  base: number,
): number {
  const resolvedType =
    type || (value != null && Number(value) > 0 && base > 0 ? 'amount' : null);
  if (!resolvedType || value == null || value <= 0 || base <= 0) return 0;
  let amt = 0;
  if (resolvedType === 'percent') {
    amt = round2(base * (Number(value) / 100));
  } else {
    amt = round2(Number(value));
  }
  return amt > base ? base : amt;
}

/**
 * Invoice-level discount is applied proportionally across line taxable amounts
 * so CGST/SGST/IGST totals stay consistent after discount.
 */
export function calculateInvoice(
  input: InvoiceCalculationInput,
): CalculatedInvoiceTotals {
  const supplierCode = input.supplier_state_code || '';
  const billCode = input.bill_to_state_code || '';

  const items = input.items.map((item) =>
    calculateLineItem(item, supplierCode, billCode),
  );

  const subtotal = round2(items.reduce((s, i) => s + i.gross_amount, 0));
  const totalItemDiscount = round2(
    items.reduce((s, i) => s + i.item_discount_amount, 0),
  );

  const preInvoiceDiscountBase = round2(subtotal - totalItemDiscount);
  const invoiceDiscountAmount = computeInvoiceDiscount(
    input.invoice_discount_type,
    input.invoice_discount_value,
    preInvoiceDiscountBase,
  );

  const discountRatio =
    preInvoiceDiscountBase > 0
      ? invoiceDiscountAmount / preInvoiceDiscountBase
      : 0;

  const adjustedItems = items.map((item) => {
    const lineInvoiceDiscount = round2(item.taxable_amount * discountRatio);
    const adjustedTaxable = round2(item.taxable_amount - lineInvoiceDiscount);
    const gstRate = Number(item.gst_rate ?? 0);
    const gstAmount = round2((adjustedTaxable * gstRate) / 100);

    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    if (supplierCode && billCode && supplierCode === billCode) {
      cgst = round2(gstAmount / 2);
      sgst = round2(gstAmount - cgst);
    } else {
      igst = gstAmount;
    }

    return {
      ...item,
      taxable_amount: adjustedTaxable,
      gst_amount: gstAmount,
      cgst_amount: cgst,
      sgst_amount: sgst,
      igst_amount: igst,
      line_total: round2(adjustedTaxable + gstAmount),
    };
  });

  const taxableValue = round2(
    adjustedItems.reduce((s, i) => s + i.taxable_amount, 0),
  );
  const cgst = round2(adjustedItems.reduce((s, i) => s + i.cgst_amount, 0));
  const sgst = round2(adjustedItems.reduce((s, i) => s + i.sgst_amount, 0));
  const igst = round2(adjustedItems.reduce((s, i) => s + i.igst_amount, 0));
  const totalTax = round2(cgst + sgst + igst);

  const beforeRound = round2(taxableValue + totalTax);
  const grandTotal = Math.round(beforeRound);
  const roundOff = round2(grandTotal - beforeRound);

  return {
    subtotal,
    total_item_discount: totalItemDiscount,
    invoice_discount_amount: invoiceDiscountAmount,
    taxable_value: taxableValue,
    cgst_amount: cgst,
    sgst_amount: sgst,
    igst_amount: igst,
    total_tax: totalTax,
    round_off: roundOff,
    grand_total: grandTotal,
    amount_in_words: numberToIndianWords(grandTotal),
    items: adjustedItems,
  };
}
