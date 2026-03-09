/**
 * Predefined offer types for product-level offers.
 * Shared across Electronics, Furniture (and later Home Decors) so catalog offer types stay in sync.
 */
export enum ProductOfferType {
  PAY_ON_ORDER = "Pay on order",
  CASH_ON_DELIVERY = "Cash on delivery",
  BANK = "Bank",
  PARTNER = "Partner",
  EMI = "EMI",
  SEASONAL = "Seasonal",
}

/** Ordered list of offer type labels for dropdowns */
export const PRODUCT_OFFER_TYPE_OPTIONS: string[] = Object.values(ProductOfferType);
