"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Confetti from "react-confetti";

import Button from "@/common/Button";
import apiClient from "@/utils/apiClient";
import { useCartStore, OrderItemType } from "@/store/cart";

/** Product types for which COD is not available (online payment only). */
const PRODUCT_TYPES_NO_COD: string[] = [
  OrderItemType.SOLAR_PACKAGE,
  OrderItemType.LEGAL_PACKAGE,
  OrderItemType.PROPERTY_PREMIUM_PLAN,
];

type PayMethodKey = "upi" | "card" | "netbanking" | "wallet" | "paylater" | "cod";
type UpiAppKey = "gpay" | "phonepe" | "paytm" | "generic";

type PaySelection = {
  method: PayMethodKey;
  upiApp?: UpiAppKey;
};

type CodSuccessState = {
  orderId: string;
  orderNo: string;
} | null;

type RazorpaySuccessState = { orderId: string } | null;

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, total, discountTotal, pushCurrentCartToBackend, clearCart } = useCartStore();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [codSuccess, setCodSuccess] = useState<CodSuccessState>(null);
  const [razorpaySuccess, setRazorpaySuccess] = useState<RazorpaySuccessState>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // default to UPI (most common in India)
  const [selection, setSelection] = useState<PaySelection>({
    method: "upi",
    upiApp: "gpay",
  });

  useEffect(() => {
    if ((session as any)?.user) setUser((session as any).user);
  }, [session]);

  const mrpTotal = useMemo(() => {
    return (items ?? []).reduce((acc: number, i: any) => {
      const mrp = Number(i.mrp ?? i.originalPrice ?? 0);
      const qty = Number(i.quantity ?? 1);
      return acc + mrp * qty;
    }, 0);
  }, [items]);

  const codAllowed = useMemo(() => {
    const list = items ?? [];
    if (list.length === 0) return true;
    return !list.some((i: any) => PRODUCT_TYPES_NO_COD.includes(i.productType ?? ""));
  }, [items]);

  useEffect(() => {
    if (!codAllowed && selection.method === "cod") {
      setSelection((prev) => ({ method: "upi", upiApp: prev.upiApp ?? "gpay" }));
    }
  }, [codAllowed, selection.method]);

  const payable = Number(total ?? 0);
  const isCod = selection.method === "cod";

  const handlePlaceOrderCOD = async () => {
    if (loading) return;
    if (status !== "authenticated" || !user?.id) {
      toast.error("Please login to continue");
      router.push("/login?callbackUrl=" + encodeURIComponent("/cart"));
      return;
    }
    if (!items || items.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    setLoading(true);
    try {
      const synced = await pushCurrentCartToBackend(user?.id);
      if (!synced) {
        toast.error("Could not sync cart. Please try again.");
        setLoading(false);
        return;
      }
      const orderRes = await apiClient.post(
        `${apiClient.URLS.orders}/from-cart`,
        { paymentMethod: "COD" },
        true
      );
      const order = orderRes?.body;
      const orderId = order?.id;
      const orderNo = order?.orderNo;
      if (!orderId || !orderNo) {
        throw new Error("Order not created");
      }
      setCodSuccess({ orderId, orderNo });
      if (user?.id) {
        await clearCart(user.id, { silent: true });
      }
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      router.push("/user/orders");
    } catch (err: any) {
      console.error("COD order error:", err);
      toast.error(err?.body?.message || err?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const ensureRazorpayLoaded = async () => {
    if (typeof window === "undefined") return false;
    if (window.Razorpay) return true;

    // Script is already in JSX, but in case user clicks very fast
    await new Promise((r) => setTimeout(r, 350));
    return !!window.Razorpay;
  };

  const buildRazorpayDisplayConfig = (sel: PaySelection) => {
    const blocks: any = {
      upi: {
        name: "UPI",
        instruments: [
          { method: "upi" }, 
        ],
      },
      cards: {
        name: "Cards",
        instruments: [{ method: "card" }],
      },
      netbanking: {
        name: "Netbanking",
        instruments: [{ method: "netbanking" }],
      },
      wallet: {
        name: "Wallets",
        instruments: [{ method: "wallet" }],
      },
      paylater: {
        name: "Pay Later",
        instruments: [{ method: "paylater" }],
      },
    };

    const seqMap: Record<PayMethodKey, string[]> = {
      upi: ["block.upi", "block.cards", "block.netbanking", "block.wallet", "block.paylater"],
      card: ["block.cards", "block.upi", "block.netbanking", "block.wallet", "block.paylater"],
      netbanking: ["block.netbanking", "block.upi", "block.cards", "block.wallet", "block.paylater"],
      wallet: ["block.wallet", "block.upi", "block.cards", "block.netbanking", "block.paylater"],
      paylater: ["block.paylater", "block.upi", "block.cards", "block.netbanking", "block.wallet"],
      cod: ["block.upi", "block.cards", "block.netbanking", "block.wallet", "block.paylater"],
    };

    return {
      display: {
        blocks,
        sequence: seqMap[sel.method],
        preferences: {
          show_default_blocks: true,
        },
      },
    };
  };

  const buildRazorpayMethodFlags = (sel: PaySelection) => {
    // Restrict checkout to the selected mode so users are not forced into another tab.
    if (sel.method === "upi") {
      return {
        method: {
          upi: true,
          card: false,
          netbanking: false,
          wallet: false,
          paylater: false,
        },
      };
    }

    if (sel.method === "card") {
      return {
        method: {
          upi: false,
          card: true,
          netbanking: false,
          wallet: false,
          paylater: false,
        },
      };
    }

    if (sel.method === "netbanking") {
      return {
        method: {
          upi: false,
          card: false,
          netbanking: true,
          wallet: false,
          paylater: false,
        },
      };
    }

    if (sel.method === "wallet") {
      return {
        method: {
          upi: false,
          card: false,
          netbanking: false,
          wallet: true,
          paylater: false,
        },
      };
    }

    if (sel.method === "paylater") {
      return {
        method: {
          upi: false,
          card: false,
          netbanking: false,
          wallet: false,
          paylater: true,
        },
      };
    }

    return {
      method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: true,
        paylater: true,
      },
    };
  };

  const handlePayNow = async () => {
    try {
      if (loading) return;

      if (status !== "authenticated" || !user?.id) {
        toast.error("Please login to continue");
        router.push("/login?callbackUrl=" + encodeURIComponent("/cart"));
        return;
      }

      if (!items || items.length === 0) {
        toast.error("Cart is empty");
        return;
      }

      setLoading(true);

      const sdkOk = await ensureRazorpayLoaded();
      if (!sdkOk) {
        toast.error("Payment SDK not loaded. Please refresh and try again.");
        setLoading(false);
        return;
      }

      // 0) Sync cart to backend (ensures server side order is correct)
      const synced = await pushCurrentCartToBackend(user.id);
      if (!synced) {
        toast.error("Could not sync cart. Please try again.");
        setLoading(false);
        return;
      }

      // 1) Create order from cart
      const orderRes = await apiClient.post(`${apiClient.URLS.orders}/from-cart`, {}, true);
      const order = orderRes?.body;
      const orderId = order?.id;

      if (!orderId) {
        throw new Error("Order not created (missing order.id)");
      }

      // 2) Create payment session
      const paymentSessionRes = await apiClient.post(
        `${apiClient.URLS.payments}/session`,
        {
          orderId,
          currency: "INR",
          provider: "RAZORPAY",
        },
        true
      );

      const ps = paymentSessionRes?.body;

      const razorpayOrderId = ps?.razorpayOrderId ?? ps?.order_id;
      if (!razorpayOrderId) {
        throw new Error("Payment session not created (missing order_id)");
      }

      const amountPaise =
        typeof ps.amount === "number"
          ? ps.amount
          : Math.round(Number(ps.amount ?? order?.grandTotal ?? payable) * 100);

      const keyId = ps.keyId ?? ps.key ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!keyId) {
        throw new Error("Missing Razorpay keyId. Set NEXT_PUBLIC_RAZORPAY_KEY_ID.");
      }

      const displayCfg = buildRazorpayDisplayConfig(selection);
      const methodFlags = buildRazorpayMethodFlags(selection);

      let paymentSucceeded = false;

      const cancelCreatedOrder = async () => {
        try {
          await apiClient.delete(
            `${apiClient.URLS.orders}/${orderId}/cancel`,
            { reason: "Payment not completed" },
            true
          );
        } catch {
          // ignore; order may already be cancelled or not found
        }
      };

      const options: any = {
        key: keyId,
        amount: amountPaise,
        currency: ps.currency || "INR",
        name: "OneCasa",
        description: `Order ${order?.orderNo ?? orderId}`,
        order_id: razorpayOrderId,

        // Razorpay method UI config
        config: displayCfg,
        method: methodFlags.method,

        prefill: {
          name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
          email: user?.email,
          contact: user?.phone,
        },

        notes: {
          userId: user?.id,
          orderId,
          preferredMethod: selection.method,
          preferredUpiApp: selection.upiApp ?? "generic",
        },

        theme: { color: "#3586FF" },

        modal: {
          ondismiss: () => {
            if (!paymentSucceeded) cancelCreatedOrder();
          },
        },

        handler: async (response: any) => {
          try {
            const verifyRes = await apiClient.post(
              `${apiClient.URLS.payments}/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              true
            );
            paymentSucceeded = true;
            const body = verifyRes?.body as { orderId?: string } | undefined;
            const verifiedOrderId = body?.orderId;
            useCartStore.getState().clearCart(user?.id);
            if (verifiedOrderId) {
              setRazorpaySuccess({ orderId: verifiedOrderId });
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 5000);
              router.push("/user/orders");
            } else {
              toast.success("Payment successful! Your order has been placed.");
              router.push("/user/orders");
            }
          } catch (err) {
            console.error("Verification failed:", err);
            toast.error("Payment verification failed. Please contact support.");
            cancelCreatedOrder();
          }
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (resp: any) {
        console.error("Payment failed:", resp);
        toast.error(resp?.error?.description || "Payment failed");
        cancelCreatedOrder();
      });

      rzp.open();
    } catch (err: any) {
      console.log("Payment error:", err);
      toast.error(err?.message || "Unable to start payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full relative">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      {/* COD success overlay with confetti */}
      {codSuccess && (
        <>
          {showConfetti && typeof window !== "undefined" && (
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={400}
            />
          )}
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 md:p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Order placed!</h2>
              <p className="text-sm text-gray-600 mb-4">
                Your order <span className="font-semibold text-gray-900">{codSuccess.orderNo}</span> has been confirmed. Pay in cash when delivered.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    if (user?.id) await clearCart(user.id, { silent: true });
                    router.push("/user/orders");
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#3586FF] text-white font-semibold hover:bg-blue-600 transition-colors"
                >
                  View order details
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (user?.id) await clearCart(user.id, { silent: true });
                    router.push("/");
                  }}
                  className="w-full py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Continue shopping
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Razorpay payment success overlay with confetti */}
      {razorpaySuccess && (
        <>
          {showConfetti && typeof window !== "undefined" && (
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={400}
            />
          )}
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 md:p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Thank you for trusting OneCasa</h2>
              <p className="text-sm text-gray-600 mb-5">
                Thank you for shopping with us. Your payment was successful and your order has been placed.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/user/orders")}
                  className="w-full py-3 px-4 rounded-xl bg-[#3586FF] text-white font-semibold hover:bg-blue-600 transition-colors"
                >
                  View your order
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="w-full py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Shop more
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Payment methods */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-5 md:p-6 border-b bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-[18px] md:text-[20px] font-semibold text-gray-900">
                    Payment Options
                  </h2>
                  <p className="text-[12px] md:text-[13px] text-gray-600 mt-1">
                    Select a payment method. UPI will open in Razorpay with QR / intent / collect options.
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-gray-500">Total Payable</div>
                  <div className="text-[20px] md:text-[22px] font-bold text-gray-900">
                    ₹{payable.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>

            {/* Method Cards */}
            <div className="p-5 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <PayCard
                  title="UPI"
                  subtitle="Pay via UPI (GPay / PhonePe / Paytm / any UPI)"
                  active={selection.method === "upi"}
                  onClick={() => setSelection({ method: "upi", upiApp: selection.upiApp ?? "gpay" })}
                  icon="/images/payment/upi.png"
                  right={
                    selection.method === "upi" ? (
                      <div className="flex items-center gap-2">
                        <UpiChip
                          label="GPay"
                          active={selection.upiApp === "gpay"}
                          onClick={() => setSelection({ method: "upi", upiApp: "gpay" })}
                          icon="/images/payment/gpay.png"
                        />
                        <UpiChip
                          label="PhonePe"
                          active={selection.upiApp === "phonepe"}
                          onClick={() => setSelection({ method: "upi", upiApp: "phonepe" })}
                          icon="/images/payment/ppay.png"
                        />
                        <UpiChip
                          label="Paytm"
                          active={selection.upiApp === "paytm"}
                          onClick={() => setSelection({ method: "upi", upiApp: "paytm" })}
                          icon="/images/payment/paytm.png"
                        />
                      </div>
                    ) : null
                  }
                />

                <PayCard
                  title="Cards"
                  subtitle="Credit / Debit cards"
                  active={selection.method === "card"}
                  onClick={() => setSelection({ method: "card" })}
                  icon="/images/payment/cards.png"
                />

                <PayCard
                  title="Netbanking"
                  subtitle="All major banks supported"
                  active={selection.method === "netbanking"}
                  onClick={() => setSelection({ method: "netbanking" })}
                  icon="/images/payment/net-banking.png"
                />

                <PayCard
                  title="Wallets"
                  subtitle="Popular wallets supported"
                  active={selection.method === "wallet"}
                  onClick={() => setSelection({ method: "wallet" })}
                  icon="/images/payment/wallet.png"
                />

                <PayCard
                  title="Pay Later"
                  subtitle="Pay later options (availability varies)"
                  active={selection.method === "paylater"}
                  onClick={() => setSelection({ method: "paylater" })}
                  icon="/images/payment/paylater.png"
                />

                {codAllowed && (
                  <PayCard
                    title="Cash on Delivery"
                    subtitle="Pay when your order is delivered"
                    active={selection.method === "cod"}
                    onClick={() => setSelection({ method: "cod" })}
                    icon="/images/payment/wallet.png"
                  />
                )}
              </div>

              {/* CTA */}
              <div className="mt-5 flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <div className="flex-1 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <div className="text-[12px] font-medium text-blue-900">
                    Selected: {isCod ? "Cash on Delivery" : selection.method.toUpperCase()}
                    {selection.method === "upi" && selection.upiApp ? ` • ${selection.upiApp.toUpperCase()}` : ""}
                  </div>
                  <div className="text-[11px] text-blue-700 mt-1">
                    {isCod
                      ? "Place order and pay in cash when the order is delivered."
                      : `After clicking Pay, Razorpay will open with ${selection.method.toUpperCase()} on top.`}
                  </div>
                </div>

                {isCod ? (
                  <Button
                    onClick={handlePlaceOrderCOD}
                    disabled={loading}
                    className="md:w-[280px] w-full py-2.5 bg-[#5c1bb7] hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Placing order..." : "Place Order (Cash on Delivery)"}
                  </Button>
                ) : (
                  <Button
                    onClick={handlePayNow}
                    disabled={loading}
                    className="md:w-[260px] w-full py-2.5 bg-[#0B1220] text-white rounded-xl font-semibold hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Processing..." : `Pay ₹${payable.toLocaleString("en-IN")}`}
                  </Button>
                )}
              </div>

              <div className="mt-4 text-[11px] text-gray-500">
                By continuing, you agree to OneCasa’s terms. Payments are securely processed by Razorpay.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Order summary */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="p-5 md:p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-semibold text-gray-900">Order Summary</h3>
                <span className="text-[11px] text-gray-500">{(items?.length ?? 0)} item(s)</span>
              </div>
            </div>

            <div className="p-5 md:p-6">
              <div className="max-h-[280px] overflow-y-auto pr-1 space-y-3">
                {(items ?? []).map((item: any, idx: number) => (
                  <div
                    key={`${item.id ?? idx}-${item.productType}-${item.productId}`}
                    className="flex gap-3 pb-3 border-b last:border-none"
                  >
                    <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      <Image
                        src={item.snapshot?.image ?? item.meta?.image ?? "/images/buy_home.webp"}
                        fill
                        alt={item.name ?? "Item"}
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-gray-900 truncate">
                        {item.name ?? "Item"}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Qty: {item.quantity ?? 1}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        ₹{Number(item.price ?? item.salePrice ?? 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border bg-gray-50 p-4">
                <SummaryRow label="MRP" value={`₹${mrpTotal.toLocaleString("en-IN")}`} />
                <SummaryRow
                  label="Discount"
                  value={`-₹${Number(discountTotal ?? 0).toLocaleString("en-IN")}`}
                  green
                />
                <div className="my-3 border-t" />
                <SummaryRow
                  label="Total Payable"
                  value={`₹${payable.toLocaleString("en-IN")}`}
                  bold
                />
                <div className="mt-3 text-[11px] text-blue-700">
                  You saved ₹{Number(discountTotal ?? 0).toLocaleString("en-IN")} 🎉
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] text-gray-500">
                <span>Secured payments</span>
                <div className="flex items-center gap-2">
                  <Image src="/images/payment/upi.png" alt="Razorpay" width={72} height={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Small trust box */}
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
            <div className="text-[13px] font-semibold text-gray-900">Why OneCasa?</div>
            <ul className="mt-2 space-y-2 text-[12px] text-gray-600">
              <li className="flex gap-2">
                <span className="mt-[2px] h-1.5 w-1.5 rounded-full bg-green-600" />
                Verified service providers & secure payments
              </li>
              <li className="flex gap-2">
                <span className="mt-[2px] h-1.5 w-1.5 rounded-full bg-green-600" />
                Unified checkout: Products, Services, Legal, Premium listings
              </li>
              <li className="flex gap-2">
                <span className="mt-[2px] h-1.5 w-1.5 rounded-full bg-green-600" />
                Fast support via WhatsApp & email
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

/* ---------------------------------------
 * UI Components
 * ------------------------------------- */
const PayCard = ({
  title,
  subtitle,
  active,
  onClick,
  icon,
  right,
}: {
  title: string;
  subtitle: string;
  active: boolean;
  onClick: () => void;
  icon: string;
  right?: React.ReactNode;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-2xl border p-4 transition shadow-sm hover:shadow ${
        active ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-white border flex items-center justify-center overflow-hidden">
            <Image src={icon} alt={title} width={28} height={28} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold text-gray-900">{title}</span>
              {active ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white">
                  Selected
                </span>
              ) : null}
            </div>
            <div className="text-[11px] text-gray-600 mt-0.5">{subtitle}</div>
          </div>
        </div>
      </div>

      {right ? <div className="mt-3">{right}</div> : null}
    </button>
  );
};

const UpiChip = ({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: string;
}) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-[11px] transition ${
        active ? "border-blue-600 bg-white" : "border-gray-200 bg-white/60"
      }`}
    >
      <Image src={icon} alt={label} width={16} height={16} />
      <span className={`font-medium ${active ? "text-blue-700" : "text-gray-700"}`}>{label}</span>
    </button>
  );
};

const SummaryRow = ({
  label,
  value,
  green,
  bold,
}: {
  label: string;
  value: string;
  green?: boolean;
  bold?: boolean;
}) => (
  <div className="flex justify-between items-center py-1">
    <span className={`text-[12px] ${bold ? "font-semibold text-gray-900" : "text-gray-700"}`}>
      {label}
    </span>
    <span
      className={`text-[12px] ${bold ? "font-semibold" : ""} ${
        green ? "text-green-700" : bold ? "text-gray-900" : "text-gray-700"
      }`}
    >
      {value}
    </span>
  </div>
);
