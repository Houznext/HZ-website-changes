
export interface CEformValues {
  userId: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: number | null;
  date: string | null;
  property_name: string;
  property_type: null | string;
  bhk: null | string;
  subTotal: number;
  workType?: string | null;
  floor_plan?: string;
  property_image?: string;
  designerName: string;
  details?: string;
  itemGroups: {
    title: string;
    order: number;
    items: {
      id: null;
      item_name: string;
      description: string;
      quantity: number | null;
      unit_price: number | null;
      amount: number | null;
      area: number | null;
    }[];
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
}

export interface CostEstimator extends CEformValues {
  id?: number;
  postedBy?: any;
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
}

export const validateFormValues = (formValues: CEformValues) => {
  const errors: any = {};

  if (!formValues.firstname) errors.firstname = "First name is required";
  if (!formValues.lastname) errors.lastname = "Last name is required";
  if (!formValues.email) errors.email = "Email is required";
  if (!formValues.phone) errors.phone = "Phone number is required";
  if (!formValues.date) errors.date = "Date is required";
  if (!formValues.designerName) errors.designerName = "Designer name is required";

  const locationErrors: any = {};
  if (!formValues.location.city) locationErrors.city = "City is required";
  if (!formValues.location.locality) locationErrors.locality = "Locality is required";
  if (!formValues.location.landmark) locationErrors.landmark = "Landmark is required";
  if (!formValues.location.pincode) locationErrors.pincode = "Pincode is required";
  if (!formValues.location.state) locationErrors.state = "State is required";
  if (!formValues.location.address_line_1)
    locationErrors.address_line_1 = "Address line 1 is required";

  if (Object.keys(locationErrors).length > 0) {
    errors.location = locationErrors;
  }

  return errors;
};

export const validateItemInformation = (itemInformation: any) => {
  const errors: any = {};

  if (!itemInformation.item_name) errors.item_name = "Item name is required";
  if (!itemInformation.description) errors.description = "Description is required";
  if (!itemInformation.quantity) errors.quantity = "Quantity is required";
  if (!itemInformation.unit_price) errors.unit_price = "Unit price is required";
  if (!itemInformation.amount) errors.amount = "Amount is required";

  return errors;
};

