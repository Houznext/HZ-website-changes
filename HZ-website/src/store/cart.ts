import { create } from "zustand";
import apiClient from "@/utils/apiClient";
import { toast } from "react-hot-toast";
import router from "next/router";

export enum OrderItemType {
  PROPERTY_PREMIUM_PLAN = "PROPERTY_PREMIUM_PLAN",
  PROPERTY_BOOKING_TOKEN = "PROPERTY_BOOKING_TOKEN",
  FURNITURE_PRODUCT = "FURNITURE_PRODUCT",
  ELECTRONICS_PRODUCT = "ELECTRONICS_PRODUCT",
  HOME_DECOR_PRODUCT = "HOME_DECOR_PRODUCT",
  LEGAL_PACKAGE = "LEGAL_PACKAGE",
  INTERIOR_PACKAGE = "INTERIOR_PACKAGE",
  CUSTOM_BUILDER_PACKAGE = "CUSTOM_BUILDER_PACKAGE",
  SOLAR_PACKAGE = "SOLAR_PACKAGE",
  PAINTING_SERVICE = "PAINTING_SERVICE",
  PLUMBING_SERVICE = "PLUMBING_SERVICE",
  GENERIC_SERVICE = "GENERIC_SERVICE",
}

export type CartItem = {
  id: number | string;
  productId: number | string;
  variantId?: number | string | null;
  productType: string;
  name: string;
  description?: string | null;
  mrp: string;
  sellingPrice: string;
  unitDiscount: string;
  quantity: number;
  itemSubTotal: string;
  taxPercent: string;
  taxAmount: string;
  discountAmount: string;
  itemTotal: string;
  snapshot?: {
    image?: string;
    brand?: string;
    sku?: string;
    source?: string;
    attributes?: Record<string, any>;
    variantId?: number;
  };
  meta?: Record<string, any>;
};

export type Cart = {
  id: string;
  userId: string;
  currency: string;
  subTotal: string;
  discountTotal: string;
  couponDiscount: string;
  couponCode?: string | null;
  taxTotal: string;
  shippingTotal: string;
  feeTotal: string;
  grandTotal: string;
  items: CartItem[];
  shippingDetails?: any;
  serviceDetails?: any;
  billingDetails?: any;
  taxBreakup?: any;
  meta?: Record<string, any>;
};

export type AddToCartPayload = {
  productType: string;
  productId: number | string;
  variantId?: number | string;
  name: string;
  description?: string;
  mrp: number;
  sellingPrice: number;
  unitDiscount?: number;
  quantity?: number;
  taxPercent?: number;
  snapshot?: {
    image?: string;
    brand?: string;
    sku?: string;
    source?: string;
    attributes?: Record<string, any>;
    variantId?: number;
  };
  meta?: Record<string, any>;
};

type CartState = {
  cart: Cart | null;
  items: CartItem[];
  total: number;
  subTotal: number;
  taxTotal: number;
  discountTotal: number;
  hasSynced: boolean;
  hydrateFromGuest: () => void;
  fetchCart: (userId: string) => Promise<void>;
  addToCart: (payload: AddToCartPayload, userId?: string) => Promise<boolean>;
  increaseQuantity: (itemId: string | number, userId?: string) => Promise<void>;
  decreaseQuantity: (itemId: string | number, userId?: string) => Promise<void>;
  removeFromCart: (itemId: string | number, userId?: string) => Promise<void>;
  clearCart: (userId?: string, options?: { silent?: boolean }) => Promise<void>;
  syncCartWithBackend: (userId: string) => Promise<void>;
  /** Push current store items to backend (e.g. before creating order). Returns true if sync succeeded. */
  pushCurrentCartToBackend: (userId: string) => Promise<boolean>;
  updateCartMeta: (userId: string, meta: any) => Promise<void>;
};

const LS_KEY = "cart_v2";

const toNum = (v: any) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const computeDerived = (cart: Cart | null) => {
  const grand = toNum(cart?.grandTotal);
  const sub = toNum(cart?.subTotal);
  const tax = toNum(cart?.taxTotal);
  const disc = toNum(cart?.discountTotal) + toNum(cart?.couponDiscount);

  return {
    total: grand,
    subTotal: sub,
    taxTotal: tax,
    discountTotal: disc,
  };
};

const readGuest = (): AddToCartPayload[] => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
};

const writeGuest = (items: AddToCartPayload[]) => {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
};

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  items: [],
  total: 0,
  subTotal: 0,
  taxTotal: 0,
  discountTotal: 0,
  hasSynced: false,
  hydrateFromGuest: () => {
    const guestItems = readGuest();
    const pseudoTotal = guestItems.reduce(
      (sum, i) => sum + toNum(i.sellingPrice) * (i.quantity ?? 1),
      0
    );
    set({
      cart: null,
      items: guestItems.map((g, idx) => ({
        id: -(idx + 1),
        productId: g.productId,
        variantId: g.variantId ?? null,
        productType: g.productType,
        name: g.name,
        description: g.description ?? null,
        mrp: String(g.mrp ?? 0),
        sellingPrice: String(g.sellingPrice ?? 0),
        unitDiscount: String(g.unitDiscount ?? 0),
        quantity: g.quantity ?? 1,
        itemSubTotal: String(
          (toNum(g.sellingPrice) * (g.quantity ?? 1)).toFixed(2)
        ),
        taxPercent: String(g.taxPercent ?? 0),
        taxAmount: "0.00",
        discountAmount: "0.00",
        itemTotal: String(
          (toNum(g.sellingPrice) * (g.quantity ?? 1)).toFixed(2)
        ),
        snapshot: g.snapshot,
        meta: g.meta,
      })),
      total: pseudoTotal,
      subTotal: pseudoTotal,
      taxTotal: 0,
      discountTotal: 0,
    });
  },

  fetchCart: async (userId: string) => {
    if (!userId) return;
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.cart}/${userId}`,
        {},
        true
      );
      if (res.status === 200) {
        const cart: Cart = res.body;
        const derived = computeDerived(cart);
        set({
          cart,
          items: cart.items ?? [],
          ...derived,
        });
      }
    } catch (e) {
      console.error("fetchCart error", e);
      toast.error("Failed to fetch cart");
    }
  },

  addToCart: async (payload, userId) => {
    const qty = payload.quantity ?? 1;
    console.log("addToCarts", payload);

    if (userId) {
      try {
        const body = {
          ...payload,
          quantity: qty,
          productId: String(payload.productId),
          variantId: payload.variantId != null ? String(payload.variantId) : undefined,
        };
        const res = await apiClient.post(
          `${apiClient.URLS.cart}/${userId}/items`,
          body,
          true
        );

        if (res.status === 201 || res.status === 200) {
          const cart: Cart = res.body;
          const derived = computeDerived(cart);
          set({ cart, items: cart.items ?? [], ...derived });
          toast.success("Item added to cart");
          return true;
        }
        toast.error("Failed to add item");
        return false;
      } catch (e: any) {
        console.error("addToCart error", e);
        const msg = e?.body?.message || e?.message || "Failed to add item to cart";
        toast.error(msg);
        return false;
      }
    }
    const guest = readGuest();
    const keyMatch = (i: AddToCartPayload) =>
      String(i.productId) === String(payload.productId) &&
      String(i.variantId ?? "") === String(payload.variantId ?? "") &&
      i.productType === payload.productType;

    const existing = guest.find(keyMatch);
    let updated: AddToCartPayload[];

    if (existing) {
      updated = guest.map((i) =>
        keyMatch(i) ? { ...i, quantity: (i.quantity ?? 1) + qty } : i
      );
    } else {
      updated = [...guest, { ...payload, quantity: qty }];
    }

    writeGuest(updated);
    get().hydrateFromGuest();
    toast.success("Item added to cart");
    return true;
  },

  increaseQuantity: async (itemId, userId) => {
    const state = get();
    const isGuestItem = typeof itemId === "number" && itemId < 0;

    if (userId && !isGuestItem) {
      const item = state.items.find((i) => i.id === itemId || i.id === String(itemId));
      if (!item) return;

      try {
        const res = await apiClient.patch(
          `${apiClient.URLS.cart}/${userId}/items/${String(itemId)}`,
          { quantity: item.quantity + 1 },
          true
        );

        if (res.status === 200) {
          const cart: Cart = res.body;
          const derived = computeDerived(cart);
          set({ cart, items: cart.items ?? [], ...derived });
          return;
        }
      } catch (e) {
        console.error("increaseQuantity error", e);
        toast.error("Failed to increase quantity");
      }
      return;
    }

    const guest = readGuest();
    const guestIndex = typeof itemId === "number" ? Math.abs(itemId) - 1 : -1;
    if (guestIndex < 0 || !guest[guestIndex]) return;

    guest[guestIndex].quantity = (guest[guestIndex].quantity ?? 1) + 1;
    writeGuest(guest);
    get().hydrateFromGuest();
  },

  decreaseQuantity: async (itemId, userId) => {
    const state = get();
    const isGuestItem = typeof itemId === "number" && itemId < 0;

    if (userId && !isGuestItem) {
      const item = state.items.find((i) => i.id === itemId || i.id === String(itemId));
      if (!item) return;

      const nextQty = Math.max(item.quantity - 1, 0);

      if (nextQty === 0) {
        await get().removeFromCart(itemId, userId);
        return;
      }

      try {
        const res = await apiClient.patch(
          `${apiClient.URLS.cart}/${userId}/items/${String(itemId)}`,
          { quantity: nextQty },
          true
        );
        if (res.status === 200) {
          const cart: Cart = res.body;
          const derived = computeDerived(cart);
          set({ cart, items: cart.items ?? [], ...derived });
          return;
        }
      } catch (e) {
        console.error("decreaseQuantity error", e);
        toast.error("Failed to decrease quantity");
      }
      return;
    }

    const guest = readGuest();
    const guestIndex = typeof itemId === "number" ? Math.abs(itemId) - 1 : -1;
    if (guestIndex < 0 || !guest[guestIndex]) return;

    const nextQty = Math.max((guest[guestIndex].quantity ?? 1) - 1, 0);
    if (nextQty === 0) {
      guest.splice(guestIndex, 1);
    } else {
      guest[guestIndex].quantity = nextQty;
    }

    writeGuest(guest);
    get().hydrateFromGuest();
  },

  removeFromCart: async (itemId, userId) => {
    const isGuestItem = typeof itemId === "number" && itemId < 0;
    if (userId && !isGuestItem) {
      try {
        const res = await apiClient.delete(
          `${apiClient.URLS.cart}/${userId}/items/${String(itemId)}`,
          {},
          true
        );

        if (res.status === 200) {
          const cart: Cart = res.body?.cart ?? null;
          const derived = computeDerived(cart);
          set({ cart, items: cart?.items ?? [], ...derived });
          toast.success("Item removed");
          return;
        }
      } catch (e) {
        console.error("removeFromCart error", e);
        toast.error("Failed to remove item");
        return;
      }
    }

    const guest = readGuest();
    const guestIndex = typeof itemId === "number" ? Math.abs(itemId) - 1 : -1;
    if (guestIndex < 0 || !guest[guestIndex]) return;

    guest.splice(guestIndex, 1);
    writeGuest(guest);
    get().hydrateFromGuest();
    toast.success("Item removed");
  },

  clearCart: async (userId, options) => {
    const silent = options?.silent === true;
    if (userId) {
      try {
        const res = await apiClient.delete(
          `${apiClient.URLS.cart}/${userId}/clear`,
          {},
          true
        );
        if (res.status === 200) {
          set({
            cart: res.body?.cart ?? null,
            items: [],
            total: 0,
            subTotal: 0,
            taxTotal: 0,
            discountTotal: 0,
          });
          if (!silent) toast.success("Cart cleared");
          return;
        }
      } catch (e) {
        console.error("clearCart error", e);
        if (!silent) toast.error("Failed to clear cart");
        return;
      }
    }

    localStorage.removeItem(LS_KEY);
    set({
      cart: null,
      items: [],
      total: 0,
      subTotal: 0,
      taxTotal: 0,
      discountTotal: 0,
    });
    if (!silent) toast.success("Cart cleared");
  },

  syncCartWithBackend: async (userId) => {
    if (!userId || get().hasSynced) return;
    set({ hasSynced: true });

    try {
      const backendRes = await apiClient.get(
        `${apiClient.URLS.cart}/${userId}`,
        {},
        true
      );
      const backendCart: Cart | null =
        backendRes.status === 200 ? backendRes.body : null;

      const guestItems = readGuest();

      if (!guestItems.length) {
        const derived = computeDerived(backendCart);
        set({ cart: backendCart, items: backendCart?.items ?? [], ...derived });
        return;
      }
      const backendAsAdd: AddToCartPayload[] =
        (backendCart?.items ?? []).map((i) => ({
          productType: i.productType,
          productId: i.productId,
          variantId: i.variantId ?? undefined,
          name: i.name,
          description: i.description ?? undefined,
          mrp: toNum(i.mrp),
          sellingPrice: toNum(i.sellingPrice),
          unitDiscount: toNum(i.unitDiscount),
          quantity: i.quantity,
          taxPercent: toNum(i.taxPercent),
          snapshot: i.snapshot,
          meta: i.meta,
        })) ?? [];

      const key = (i: AddToCartPayload) =>
        `${i.productType}:${String(i.productId)}:${String(i.variantId ?? "null")}`;

      const map = new Map<string, AddToCartPayload>();
      backendAsAdd.forEach((i) => map.set(key(i), { ...i }));

      guestItems.forEach((g) => {
        const k = key(g);
        const existing = map.get(k);
        if (existing) {
          const mergedQty = Math.max(existing.quantity ?? 1, g.quantity ?? 1);
          map.set(k, { ...existing, quantity: mergedQty });
        } else {
          map.set(k, { ...g, quantity: g.quantity ?? 1 });
        }
      });

      const finalItems = Array.from(map.values()).map((i) => ({
        ...i,
        productId: String(i.productId),
        variantId: i.variantId != null ? String(i.variantId) : undefined,
      }));

      const syncRes = await apiClient.patch(
        `${apiClient.URLS.cart}/${userId}/sync`,
        { items: finalItems },
        true
      );

      if (syncRes.status === 200) {
        const cart: Cart = syncRes.body;
        const derived = computeDerived(cart);
        set({ cart, items: cart.items ?? [], ...derived });
        localStorage.removeItem(LS_KEY);
        return;
      }

      toast.error("Cart sync failed");
    } catch (e) {
      console.error("syncCartWithBackend error", e);
      toast.error("Failed to sync cart");
    }
  },

  pushCurrentCartToBackend: async (userId) => {
    if (!userId) return false;
    const state = get();
    const currentItems = state.items ?? [];
    if (currentItems?.length === 0) return false;
    try {
      const syncPayload = currentItems?.map((i) => ({
        productType: i?.productType,
        productId: String(i?.productId),
        variantId: i?.variantId != null ? String(i?.variantId) : undefined,
        name: i?.name,
        description: i?.description ?? undefined,
        mrp: toNum(i?.mrp),
        sellingPrice: toNum(i?.sellingPrice),
        unitDiscount: toNum(i?.unitDiscount),
        quantity: i?.quantity ?? 1,
        taxPercent: toNum(i?.taxPercent),
        snapshot: i?.snapshot,
        meta: i?.meta,
      }));
      const res = await apiClient.patch(
        `${apiClient.URLS.cart}/${userId}/sync`,
        { items: syncPayload },
        true
      );
      if (res.status === 200) {
        const cart: Cart = res?.body;
        const derived = computeDerived(cart);
        set({ cart, items: cart.items ?? [], ...derived });
        return true;
      }
      return false;
    } catch (e) {
      console.error("pushCurrentCartToBackend error", e);
      return false;
    }
  },

  updateCartMeta: async (userId, meta) => {
    if (!userId) return;
    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.cart}/${userId}/meta`,
        meta,
        true
      );
      if (res.status === 200) {
        const cart: Cart = res.body;
        const derived = computeDerived(cart);
        set({ cart, items: cart.items ?? [], ...derived });
      }
    } catch (e) {
      console.error("updateCartMeta error", e);
      toast.error("Failed to update cart");
    }
  },
}));
