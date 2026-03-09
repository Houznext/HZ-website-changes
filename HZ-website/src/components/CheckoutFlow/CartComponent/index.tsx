import React, { useEffect, useMemo, useState } from "react";
import Button from "@/common/Button";
import { CartItem, useCartStore } from "@/store/cart";
import {
  IoCartOutline,
  IoHeart,
  IoTrashOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import QuantitySelector from "@/common/QuantitySelector";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SolarCartItem } from "./SolarCartItem";

type CartComponentProps = {
  handleNext: () => void;
};

const INR = (v: any) => `₹${Number(v ?? 0).toFixed(0)}`;

const toNum = (v: any) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const getProductTypeLabel = (productType: string) => {
  const labels: Record<string, string> = {
    LEGAL_PACKAGE: "Legal Service",
    PROPERTY_PREMIUM_PLAN: "Property Boost",
    FURNITURE_PRODUCT: "Furniture",
    ELECTRONICS_PRODUCT: "Electronics",
    HOME_DECOR_PRODUCT: "Home Decor",
    INTERIOR_PACKAGE: "Interior",
    CUSTOM_BUILDER_PACKAGE: "Custom Builder",
    SOLAR_PACKAGE: "Solar",
    PAINTING_SERVICE: "Painting",
    PLUMBING_SERVICE: "Plumbing",
    GENERIC_SERVICE: "Service",
  };
  return labels[productType] || productType?.replace(/_/g, " ") || "Item";
};

const getAvailabilityLabel = (productType: string) => {
  const serviceTypes = [
    "LEGAL_PACKAGE",
    "PROPERTY_PREMIUM_PLAN",
    "INTERIOR_PACKAGE",
    "CUSTOM_BUILDER_PACKAGE",
    "SOLAR_PACKAGE",
    "PAINTING_SERVICE",
    "PLUMBING_SERVICE",
    "GENERIC_SERVICE",
  ];
  if (serviceTypes.includes(productType))
    return "Service • Confirmed after payment";
  return "In stock • Ready to ship";
};

const getItemImage = (item: CartItem) => {
  if (item.snapshot?.image) return item.snapshot.image;
  if (item.productType === "LEGAL_PACKAGE")
    return "/images/legalservices/herosection/legalservicesherosection.png";
  return "/images/custombuilder/subservices/furnitures/sofas/image-1.png";
};

const isServiceOnlyCart = (items: CartItem[]) => {
  const serviceTypes = ["LEGAL_PACKAGE", "PROPERTY_PREMIUM_PLAN", "INTERIOR_PACKAGE", "SOLAR_PACKAGE", "CUSTOM_BUILDER_PACKAGE", "PAINTING_SERVICE", "PLUMBING_SERVICE", "GENERIC_SERVICE"];
  return items.length > 0 && items.every((i) => serviceTypes.includes(i.productType));
};

export const CartComponent = ({ handleNext }: CartComponentProps) => {
  const session = useSession();
  const [user, setUser] = useState<any>();
  const router = useRouter();

  const {
    items,
    total,
    subTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCartStore();

  useEffect(() => {
    if (session.status === "authenticated") {
      setUser(session?.data?.user);
    } else {
      setUser(null);
    }
  }, [session?.status, session?.data?.user]);

  const isCartEmpty = items.length === 0;
  const isGuest = session.status !== "authenticated";

  const handleProceed = () => {
    if (isGuest) {
      router.push("/login?callbackUrl=" + encodeURIComponent("/cart"));
      return;
    }
    handleNext();
  };

  const originalTotal = useMemo(() => {
    return items.reduce((sum, i) => sum + toNum(i.mrp) * (i.quantity ?? 1), 0);
  }, [items]);

  const sellingTotal = useMemo(() => {
    return items.reduce((sum, i) => sum + toNum(i.sellingPrice) * (i.quantity ?? 1), 0);
  }, [items]);

  const computedDiscount = useMemo(
    () => Math.max(originalTotal - sellingTotal, 0),
    [originalTotal, sellingTotal]
  );
  const discountPercent = useMemo(
    () => (originalTotal > 0 ? (computedDiscount / originalTotal) * 100 : 0),
    [originalTotal, computedDiscount]
  );
  const hasDiscount = computedDiscount > 0;
  const serviceOnly = useMemo(() => isServiceOnlyCart(items), [items]);

  const handleRemoveItemAnalytics = (removedItem: CartItem) => {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: "remove_from_cart",
      items: [
        {
          item_id: removedItem.productId,
          item_name: removedItem.name,
          category: removedItem.productType,
          quantity: removedItem.quantity,
          price: toNum(removedItem.sellingPrice),
        },
      ],
    });
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] p-3 md:p-5 lg:p-6">
      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-[#1E293B]">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3586FF]/10 text-[#3586FF]">
            <IoShieldCheckmarkOutline className="text-lg" />
          </div>
          <span className="text-xs font-medium md:text-sm">
            {serviceOnly
              ? "100% secure payments. Your service is confirmed after payment."
              : "100% secure payments & verified quality. Safe checkout."}
          </span>
        </div>

        {!isCartEmpty && hasDiscount && (
          <p className="rounded-lg bg-[#ECFDF5] px-3 py-1.5 text-[11px] font-medium text-[#059669] md:text-xs">
            You&apos;re saving{" "}
            <span className="font-semibold">
              {INR(computedDiscount)} ({Math.round(discountPercent)}%)
            </span>{" "}
            on this order
          </p>
        )}
      </div>

      <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-6 lg:gap-8">
        <div className="w-full md:w-2/3">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-[17px] font-semibold text-[#0F172A] md:text-[20px]">
                  Your Cart
                </h2>
                <p className="mt-0.5 text-[12px] text-[#64748B] md:text-[13px]">
                  Review items and quantities before checkout.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-[#E0F2FE] px-3.5 py-1.5 text-[12px] font-medium text-[#0369A1] md:text-[13px]">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-[#E2E8F0] to-transparent" />

            {isCartEmpty ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] py-14 text-[#64748B]">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F1F5F9] text-[#94A3B8]">
                  <IoCartOutline className="text-4xl" />
                </div>
                <p className="mb-1 text-[15px] font-medium text-[#475569] md:text-[16px]">
                  Your cart is empty
                </p>
                <p className="mb-6 text-[12px] text-[#64748B] md:text-[13px]">
                  Add items from our store or services to get started.
                </p>
                <Button
                  className="rounded-xl bg-[#3586FF] px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#2563EB]"
                  onClick={() => router.push("/")}
                >
                  Continue shopping
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {items.map((item: CartItem) => {
                  // Solar items get a dedicated card
                  if (item.productType === "SOLAR_PACKAGE") {
                    return (
                      <SolarCartItem
                        key={item.id}
                        item={item}
                        onRemove={() => {
                          removeFromCart(item.id, user?.id);
                          handleRemoveItemAnalytics(item);
                        }}
                      />
                    );
                  }

                  const itemMrp = toNum(item.mrp);
                  const itemSell = toNum(item.sellingPrice);
                  const pctOff =
                    itemMrp > 0 ? ((itemMrp - itemSell) / itemMrp) * 100 : 0;

                  return (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-md"
                    >
                      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:gap-5 md:p-5">
                        <div className="relative h-[120px] w-full shrink-0 overflow-hidden rounded-lg bg-[#F8FAFC] md:h-[120px] md:w-[180px]">
                          <Image
                            src={getItemImage(item)}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex flex-1 flex-col gap-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="text-[15px] font-semibold text-[#0F172A] md:text-[16px]">
                                {item.name}
                              </h3>
                              <span className="mt-1.5 inline-flex rounded-full bg-[#E0F2FE] px-2.5 py-1 text-[11px] font-medium text-[#0369A1]">
                                {getProductTypeLabel(item.productType)}
                              </span>
                              {item.snapshot?.brand && (
                                <p className="mt-1 text-[11px] text-[#64748B]">
                                  Brand: <span className="font-medium text-[#475569]">{item.snapshot.brand}</span>
                                </p>
                              )}
                            </div>
                            <span className="text-[11px] font-medium text-[#059669] sm:text-[12px]">
                              {getAvailabilityLabel(item.productType)}
                            </span>
                          </div>
                          {item.description && (
                            <p className="line-clamp-2 text-[12px] text-[#64748B]">
                              {item.description}
                            </p>
                          )}

                          <div className="mt-1 flex flex-col gap-4 border-t border-[#F1F5F9] pt-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-[12px] font-medium text-[#64748B]">Qty</span>
                              <QuantitySelector
                                quantity={item.quantity}
                                onIncrease={() => increaseQuantity(item.id, user?.id)}
                                onDecrease={() => decreaseQuantity(item.id, user?.id)}
                              />
                            </div>
                            <div className="flex flex-col items-start gap-1 md:items-end">
                              <div className="flex items-baseline gap-2">
                                <span className="text-[18px] font-semibold text-[#3586FF] md:text-[20px]">
                                  {INR(itemSell)}
                                </span>
                                {itemMrp > itemSell && (
                                  <span className="text-[13px] text-[#94A3B8] line-through">
                                    {INR(itemMrp)}
                                  </span>
                                )}
                              </div>
                              {itemMrp > itemSell && (
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-md bg-[#DCFCE7] px-2 py-0.5 text-[11px] font-semibold text-[#16A34A]">
                                    {Math.round(pctOff)}% off
                                  </span>
                                  <span className="text-[11px] text-[#64748B]">
                                    Save {INR(itemMrp - itemSell)} on this item
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 border-t border-[#F1F5F9] bg-[#FAFBFC] px-4 py-3">
                        <Button
                          className="flex items-center gap-2 rounded-lg border border-[#FCA5A5] bg-white px-3 py-2 text-[12px] font-medium text-[#DC2626] hover:bg-[#FEF2F2] md:text-[13px]"
                          onClick={() => {
                            removeFromCart(item.id, user?.id);
                            handleRemoveItemAnalytics(item);
                          }}
                        >
                          <IoTrashOutline className="text-sm" />
                          Remove
                        </Button>
                        <Button className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-[12px] font-medium text-[#64748B] hover:bg-[#F8FAFC] md:text-[13px]">
                          <IoHeart className="text-sm" />
                          Save for later
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 w-full md:mt-0 md:w-[360px] md:shrink-0">
          <div className="sticky top-24 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.06)]">
            <div className="border-b border-[#F1F5F9] bg-[#FAFBFC] px-5 py-4">
              <h3 className="text-[15px] font-semibold text-[#0F172A] md:text-[16px]">
                Price details
              </h3>
            </div>
            <div className="p-5">

              {!isCartEmpty ? (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[13px] text-[#475569]">
                      <span>MRP ({items.length} {items.length === 1 ? "item" : "items"})</span>
                      <span className="font-medium text-[#0F172A]">{INR(originalTotal)}</span>
                    </div>

                    {hasDiscount && (
                      <>
                        <div className="flex justify-between text-[13px] text-[#059669]">
                          <span>Discount</span>
                          <span className="font-medium">-{INR(computedDiscount)} ({Math.round(discountPercent)}%)</span>
                        </div>
                        <div className="flex justify-between text-[13px] text-[#059669]">
                          <span>You save</span>
                          <span className="font-medium">{INR(computedDiscount)}</span>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between text-[13px] text-[#475569]">
                      <span>Sub total</span>
                      <span className="font-medium text-[#0F172A]">{INR(subTotal ?? sellingTotal)}</span>
                    </div>

                    <div className="flex justify-between text-[13px] text-[#475569]">
                      <span>Delivery</span>
                      <span className="font-medium text-[#059669]">Free</span>
                    </div>
                  </div>

                  <div className="my-4 h-px w-full bg-[#E2E8F0]" />

                  <div className="flex justify-between text-[15px] font-semibold text-[#0F172A] md:text-[16px]">
                    <span>Total amount</span>
                    <span>{INR(total ?? sellingTotal)}</span>
                  </div>

                  {hasDiscount && (
                    <p className="mt-2 text-[12px] text-[#059669]">
                      You save <span className="font-semibold">{INR(computedDiscount)}</span> on this order
                    </p>
                  )}

                <Button
                  className="mt-6 w-full rounded-xl bg-[#3586FF] py-3.5 text-[14px] font-semibold text-white shadow-sm hover:bg-[#2563EB] md:text-[15px]"
                  onClick={handleProceed}
                  disabled={isCartEmpty}
                >
                  {isGuest ? "Login to continue" : "Proceed to Address"}
                </Button>

                  <p className="mt-4 text-center text-[11px] text-[#94A3B8]">
                    Secure checkout powered by Razorpay
                  </p>
                </>
              ) : (
                <p className="py-8 text-center text-[13px] text-[#64748B]">
                  Add items to see price details here.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
