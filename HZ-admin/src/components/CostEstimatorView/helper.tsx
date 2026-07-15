
export interface QuotationItem {
  id: null | number;
  item_name: string;
  description: string;
  /** "unit" = qty × price; "area" = area × price */
  pricing_mode?: "unit" | "area";
  quantity: number | null;
  unit_price: number | null;
  /** Taxable line total (before GST) */
  amount: number | null;
  area: number | null;
  gst_enabled?: boolean;
  gst_percentage?: number | null;
}

export interface CEformValues {
  userId: string;
  firstname: string;
  lastname: string;
  customerMobile: string;
  email: string;
  phone: number | null;
  date: string | null;
  property_name: string;
  property_type: null | string;
  bhk: null | string;
  subTotal: number;
  workType?: string | null;
  currentStage?: string | null;
  floor_plan?: string;
  property_image?: string;
  designerName: string;
  details?: string;
  itemGroups: {
    id?: number;
    title: string;
    order: number;
    items: QuotationItem[];
  }[];
  location: {
    city: string;
    state: string;
    pincode: string;
    landmark: string;
    locality: string;
    sub_locality: string;
    address_line_1: string;
  };
  discount: number;
  /** @deprecated Overall GST removed — kept optional for legacy quotes */
  gstEnabled?: boolean;
  gstPercentage?: number;
  approvedByName?: string | null;
  status?: "draft" | "confirmed" | "revised";
}

export interface CostEstimator extends CEformValues {
  id?: string | number;
  postedBy?: any;
  quotationNumber?: number | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CEformProps {
  closeDrawer: () => void;
  editingEstimation?: CostEstimator | null;
  setCostEstimators?: any;
  fetchDetails?: () => Promise<void>;
  setEditingEstimation?: React.Dispatch<React.SetStateAction<CostEstimator | null>>;
  userId: string;
  category?: string;
  onSuccessRefetch?: () => void;
  /** Register handler so parent Modal/Drawer close also prompts to save */
  registerCloseAttempt?: (fn: (() => void) | null) => void;
}

export const validateFormValues = (formValues: CEformValues) => {
  const errors: any = {};

  if (!formValues.firstname) errors.firstname = "First name is required";
  if (!formValues.lastname) errors.lastname = "Last name is required";
  if (!formValues.date) errors.date = "Date is required";
  if (!formValues.designerName) errors.designerName = "Designer name is required";
  if (!formValues.workType?.trim()) errors.workType = "Work type is required";
  if (!formValues.currentStage?.trim())
    errors.currentStage = "Current stage is required";

  const locationErrors: any = {};
  if (!formValues.location.city) locationErrors.city = "City is required";
  if (!formValues.location.state) locationErrors.state = "State is required";

  if (Object.keys(locationErrors).length > 0) {
    errors.location = locationErrors;
  }

  return errors;
};

export const calcItemAmount = (item: {
  pricing_mode?: "unit" | "area" | null;
  quantity?: number | null;
  area?: number | null;
  unit_price?: number | null;
}) => {
  const mode = item.pricing_mode || "area";
  const price = Number(item.unit_price) || 0;
  if (mode === "unit") {
    return (Number(item.quantity) || 0) * price;
  }
  return (Number(item.area) || 0) * price;
};

/** GST amount for a line (0 when unchecked / invalid %). */
export const calcItemGst = (item: {
  amount?: number | null;
  gst_enabled?: boolean | null;
  gst_percentage?: number | null;
  pricing_mode?: "unit" | "area" | null;
  quantity?: number | null;
  area?: number | null;
  unit_price?: number | null;
}) => {
  if (!item.gst_enabled) return 0;
  const pct = Number(item.gst_percentage);
  if (!Number.isFinite(pct) || pct <= 0) return 0;
  const taxable =
    item.amount != null && Number.isFinite(Number(item.amount))
      ? Number(item.amount)
      : calcItemAmount(item);
  return (taxable * pct) / 100;
};

/** Line total including GST when enabled. */
export const calcItemTotalWithGst = (item: Parameters<typeof calcItemGst>[0]) => {
  const taxable =
    item.amount != null && Number.isFinite(Number(item.amount))
      ? Number(item.amount)
      : calcItemAmount(item as Parameters<typeof calcItemAmount>[0]);
  return taxable + calcItemGst(item);
};

/** Display value for GST column — dash when no GST. */
export const itemGstDisplay = (item: {
  gst_enabled?: boolean | null;
  gst_percentage?: number | null;
  amount?: number | null;
  pricing_mode?: "unit" | "area" | null;
  quantity?: number | null;
  area?: number | null;
  unit_price?: number | null;
}) => {
  if (!item.gst_enabled) return "—";
  const pct = Number(item.gst_percentage);
  if (!Number.isFinite(pct) || pct <= 0) return "—";
  const gst = calcItemGst(item);
  return `₹${gst.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/** Sum of GST across all items. */
export const sumItemsGst = (
  itemGroups?: { items?: Parameters<typeof calcItemGst>[0][] }[] | null,
) => {
  if (!itemGroups?.length) return 0;
  return itemGroups.reduce(
    (total, group) =>
      total +
      (group.items || []).reduce((sum, item) => sum + calcItemGst(item), 0),
    0,
  );
};

/** Value shown in the Area/Qty PDF column based on pricing mode. */
export const itemAreaOrQty = (item: {
  pricing_mode?: "unit" | "area" | null;
  quantity?: number | null;
  area?: number | null;
}) => {
  const mode = item.pricing_mode;
  if (mode === "unit") return item.quantity ?? "—";
  if (mode === "area") return item.area ?? "—";
  // Legacy items (no mode): prefer area when set, else qty
  if (item.area != null && Number(item.area) !== 0) return item.area;
  return item.quantity ?? "—";
};

export const validateItemInformation = (itemInformation: any) => {
  const errors: any = {};
  const mode = itemInformation.pricing_mode || "area";

  if (!itemInformation.item_name) errors.item_name = "Item name is required";
  if (!itemInformation.description) errors.description = "Description is required";
  if (!itemInformation.unit_price) errors.unit_price = "Amount is required";
  if (mode === "unit") {
    if (!itemInformation.quantity) errors.quantity = "Quantity is required";
  } else if (!itemInformation.area) {
    errors.area = "Area is required";
  }
  if (!itemInformation.amount) errors.amount = "Total is required";
  if (itemInformation.gst_enabled) {
    const pct = Number(itemInformation.gst_percentage);
    if (!Number.isFinite(pct) || pct <= 0) {
      errors.gst_percentage = "Enter a GST percentage";
    }
  }

  return errors;
};
