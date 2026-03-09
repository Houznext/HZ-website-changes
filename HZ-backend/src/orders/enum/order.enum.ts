export enum OrderStatusEnum {
  CREATED = 'CREATED',
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',

  // Fulfillment
  SHIPPED = 'SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',

  // Cancellation / Returns
  CANCELLED = 'CANCELLED',
  RETURN_REQUESTED = 'RETURN_REQUESTED',
  RETURN_APPROVED = 'RETURN_APPROVED',
  RETURN_REJECTED = 'RETURN_REJECTED',
  RETURNED = 'RETURNED',

  // Service based orders (Interiors, Cleaning, Repairs, Legal)
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',

  // Payment lifecycle
  REFUNDED = 'REFUNDED',
}

export enum OrderType {
  STORE = 'STORE',
  SERVICE = 'SERVICE',
  /** Single order containing mixed item types (e.g. store + legal + property premium) */
  MIXED = 'MIXED',
  PROPERTY_PREMIUM = 'PROPERTY_PREMIUM',
  PROPERTY_BOOKING = 'PROPERTY_BOOKING',
  CUSTOM_BUILDER = 'CUSTOM_BUILDER',
  LEGAL = 'LEGAL',
  INTERIORS = 'INTERIORS',
  ELECTRONICS = 'ELECTRONICS',
  FURNITURE = 'FURNITURE',
  HOME_DECOR = 'HOME_DECOR',
  SOLAR = 'SOLAR',
}

export enum OrderItemType {
  PROPERTY_PREMIUM_PLAN = 'PROPERTY_PREMIUM_PLAN',
  PROPERTY_BOOKING_TOKEN = 'PROPERTY_BOOKING_TOKEN',

  FURNITURE_PRODUCT = 'FURNITURE_PRODUCT',
  ELECTRONICS_PRODUCT = 'ELECTRONICS_PRODUCT',
  HOME_DECOR_PRODUCT = 'HOME_DECOR_PRODUCT',

  LEGAL_PACKAGE = 'LEGAL_PACKAGE',
  INTERIOR_PACKAGE = 'INTERIOR_PACKAGE',
  CUSTOM_BUILDER_PACKAGE = 'CUSTOM_BUILDER_PACKAGE',
  SOLAR_PACKAGE = 'SOLAR_PACKAGE',
  PAINTING_SERVICE = 'PAINTING_SERVICE',
  PLUMBING_SERVICE = 'PLUMBING_SERVICE',

  GENERIC_SERVICE = 'GENERIC_SERVICE',
}

/** Store/product item types (physical goods). */
const STORE_ITEM_TYPES: readonly string[] = [
  OrderItemType.FURNITURE_PRODUCT,
  OrderItemType.ELECTRONICS_PRODUCT,
  OrderItemType.HOME_DECOR_PRODUCT,
];

/** Service item types (digital or on-site services). */
const SERVICE_ITEM_TYPES: readonly string[] = [
  OrderItemType.PROPERTY_PREMIUM_PLAN,
  OrderItemType.PROPERTY_BOOKING_TOKEN,
  OrderItemType.LEGAL_PACKAGE,
  OrderItemType.INTERIOR_PACKAGE,
  OrderItemType.CUSTOM_BUILDER_PACKAGE,
  OrderItemType.SOLAR_PACKAGE,
  OrderItemType.PAINTING_SERVICE,
  OrderItemType.PLUMBING_SERVICE,
  OrderItemType.GENERIC_SERVICE,
];

export function isStoreItemType(t: OrderItemType): boolean {
  return STORE_ITEM_TYPES.includes(t);
}

export function isServiceItemType(t: OrderItemType): boolean {
  return SERVICE_ITEM_TYPES.includes(t);
}

/** Derive order type from cart/order item types (single type → that type, mixed → MIXED). */
export function deriveOrderTypeFromItemTypes(
  itemTypes: OrderItemType[],
): OrderType {
  const set = new Set(itemTypes);
  if (set.size === 0) return OrderType.STORE;
  if (set.size > 1) return OrderType.MIXED;
  const single = itemTypes[0];
  if (isStoreItemType(single)) {
    if (single === OrderItemType.FURNITURE_PRODUCT) return OrderType.FURNITURE;
    if (single === OrderItemType.ELECTRONICS_PRODUCT) return OrderType.ELECTRONICS;
    if (single === OrderItemType.HOME_DECOR_PRODUCT) return OrderType.HOME_DECOR;
    return OrderType.STORE;
  }
  if (single === OrderItemType.PROPERTY_PREMIUM_PLAN) return OrderType.PROPERTY_PREMIUM;
  if (single === OrderItemType.PROPERTY_BOOKING_TOKEN) return OrderType.PROPERTY_BOOKING;
  if (single === OrderItemType.LEGAL_PACKAGE) return OrderType.LEGAL;
  if (single === OrderItemType.INTERIOR_PACKAGE) return OrderType.INTERIORS;
  if (single === OrderItemType.CUSTOM_BUILDER_PACKAGE) return OrderType.CUSTOM_BUILDER;
  if (single === OrderItemType.SOLAR_PACKAGE) return OrderType.SOLAR;
  return OrderType.SERVICE;
}

export enum ReturnReasonEnum {
  DAMAGED = 'DAMAGED',
  DEFECTIVE = 'DEFECTIVE',
  WRONG_ITEM = 'WRONG_ITEM',
  NOT_AS_DESCRIBED = 'NOT_AS_DESCRIBED',
  QUALITY_ISSUE = 'QUALITY_ISSUE',
  CHANGED_MIND = 'CHANGED_MIND',
  OTHER = 'OTHER',
}
