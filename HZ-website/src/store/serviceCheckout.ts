import { create } from "zustand";
import { persist } from "zustand/middleware";

type BHK = "1BHK" | "2BHK" | "3BHK" | "4BHK";

export type PaintingConfig = {
  bhkType?: BHK;
  sqft: number;
  ratePerSqft: number;
  coats?: number;
  includeCeiling?: boolean;
  addons?: Array<{ name: string; price: number }>;
};

type PaintingCheckoutItem = {
  type: "service";
  serviceKey: "painting";
  title: string;
  config: PaintingConfig;
  unitPrice: number;
  lineTotal: number;
};

type ServiceCheckoutState = {
  mode: "cart" | "service";
  item?: PaintingCheckoutItem;
  addressId?: number;
  addressPreview?: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    landmark?: string;
  };
  total: number;

  setServiceItem: (item: PaintingCheckoutItem) => void;
  setAddressId: (
    id: number,
    preview?: ServiceCheckoutState["addressPreview"]
  ) => void;
  reset: () => void;
};

export const useServiceCheckout = create<ServiceCheckoutState>()(
  persist(
    (set) => ({
      mode: "cart",
      item: undefined,
      addressId: undefined,
      addressPreview: undefined,
      total: 0,

      setServiceItem: (item) =>
        set({ mode: "service", item, total: item.lineTotal }),

      setAddressId: (id, preview) =>
        set({ addressId: id, addressPreview: preview }),

      reset: () =>
        set({
          mode: "cart",
          item: undefined,
          addressId: undefined,
          addressPreview: undefined,
          total: 0,
        }),
    }),
    { name: "service-checkout" }
  )
);
