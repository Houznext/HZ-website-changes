"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import apiClient from "@/utils/apiClient";
import Button from "@/common/Button";
import {
    HiCheckCircle,
    HiTruck,
    HiLocationMarker,
    HiCube,
    HiClipboardList,
    HiUser,
} from "react-icons/hi";

type StatusHistoryItem = { status: string; at: string; note?: string };
type ShippingDetails = {
    courierName?: string;
    trackingId?: string;
    shippedAt?: string;
    deliveredAt?: string;
    deliveryAddress?: any;
};

type OrderDetail = {
    id: string;
    orderNo: string;
    type: string;
    status: string;
    grandTotal: string;
    statusHistory?: StatusHistoryItem[];
    shippingDetails?: ShippingDetails;
    items?: { name: string; snapshot?: { image?: string }; meta?: any }[];
    createdAt: string;
};

const PHYSICAL_STEPS = [
    { key: "CREATED", label: "Order placed", icon: HiClipboardList },
    { key: "CONFIRMED", label: "Confirmed", icon: HiCheckCircle },
    { key: "SHIPPED", label: "Shipped", icon: HiCube },
    { key: "OUT_FOR_DELIVERY", label: "Out for delivery", icon: HiTruck },
    { key: "DELIVERED", label: "Delivered", icon: HiLocationMarker },
];

const SOLAR_STEPS = [
    { key: "CREATED", label: "Order placed", icon: HiClipboardList },
    { key: "CONFIRMED", label: "Confirmed", icon: HiCheckCircle },
    { key: "ASSIGNED", label: "Agent assigned for installation", icon: HiUser },
    { key: "IN_PROGRESS", label: "Installation in progress", icon: HiCube },
    { key: "COMPLETED", label: "Installation completed", icon: HiCheckCircle },
];

const LEGAL_STEPS = [
    { key: "CREATED", label: "Order placed", icon: HiClipboardList },
    { key: "CONFIRMED", label: "Confirmed", icon: HiCheckCircle },
    { key: "ASSIGNED", label: "Legal agent assigned", icon: HiUser },
    { key: "IN_PROGRESS", label: "Service in progress", icon: HiCube },
    { key: "COMPLETED", label: "Service completed", icon: HiCheckCircle },
];

const SERVICE_STEPS = [
    { key: "CREATED", label: "Order placed", icon: HiClipboardList },
    { key: "CONFIRMED", label: "Confirmed", icon: HiCheckCircle },
    { key: "ASSIGNED", label: "Agent assigned", icon: HiUser },
    { key: "IN_PROGRESS", label: "In progress", icon: HiCube },
    { key: "COMPLETED", label: "Completed", icon: HiCheckCircle },
];

function getStepsForOrder(orderType: string): { key: string; label: string; icon: any }[] {
    const t = (orderType || "").toUpperCase();
    const physical = ["FURNITURE", "ELECTRONICS", "HOME_DECOR", "STORE", "MIXED"];
    if (physical.some((p) => t.includes(p))) return PHYSICAL_STEPS;
    if (t === "SOLAR") return SOLAR_STEPS;
    if (t === "LEGAL") return LEGAL_STEPS;
    return SERVICE_STEPS;
}

const STATUS_RANK: Record<string, number> = {
    CREATED: 0,
    PENDING: 0,
    CONFIRMED: 1,
    ASSIGNED: 2,
    IN_PROGRESS: 3,
    SHIPPED: 3,
    OUT_FOR_DELIVERY: 4,
    DELIVERED: 5,
    COMPLETED: 5,
    CANCELLED: -1,
};

function isStepReached(
    status: string,
    stepKey: string,
    history: StatusHistoryItem[],
    steps: { key: string }[],
): boolean {
    const s = status.toUpperCase();
    if (s === "CANCELLED") return stepKey === "CREATED" || stepKey === "CONFIRMED";
    if (history.some((h) => (h.status || "").toUpperCase() === stepKey.toUpperCase())) return true;
    const currentRank = STATUS_RANK[s] ?? -1;
    const stepRank = STATUS_RANK[stepKey] ?? 99;
    return currentRank >= stepRank;
}

function getStepDate(stepKey: string, history: StatusHistoryItem[], order: OrderDetail): string | null {
    const found = history.find((h) => (h.status || "").toUpperCase() === stepKey.toUpperCase());
    if (found?.at) return found.at;
    if (stepKey === "CREATED" && order.createdAt) return order.createdAt;
    if (stepKey === "SHIPPED" && order.shippingDetails?.shippedAt) return order.shippingDetails.shippedAt;
    if (stepKey === "DELIVERED" && order.shippingDetails?.deliveredAt) return order.shippingDetails.deliveredAt;
    return null;
}

function formatTrackDate(iso: string | null): string {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

type OrderTrackingModalProps = {
    orderId: string;
    orderNo?: string;
    orderName?: string;
    onClose: () => void;
};

export default function OrderTrackingModal({
    orderId,
    orderNo,
    orderName,
    onClose,
}: OrderTrackingModalProps) {
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await apiClient.get(`${apiClient.URLS.orders}/${orderId}`, {}, true);
                const data = res?.body as OrderDetail;
                if (!cancelled && data) setOrder(data);
                else if (!data) setError("Order not found");
            } catch (e: any) {
                if (!cancelled) setError(e?.message || "Failed to load order");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [orderId]);

    const steps = order ? getStepsForOrder(order.type) : [];
    const history = order?.statusHistory ?? [];
    const currentStatus = (order?.status || "").toUpperCase();
    const shipping = order?.shippingDetails;
    const primaryImage =
        order?.items?.[0]?.snapshot?.image ||
        order?.items?.[0]?.meta?.imageUrl ||
        "/images/custombuilder/subservices/l-shape.png";

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image src={primaryImage} alt="" fill className="object-cover" sizes="48px" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="font-semibold text-gray-900 truncate">{orderName || `Order ${orderNo || orderId}`}</h2>
                            <p className="text-xs text-gray-500">
                                {orderNo ? `#${orderNo}` : `#${String(orderId).slice(0, 8)}`}
                            </p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-5">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-10 h-10 border-2 border-[#3586FF] border-t-transparent rounded-full animate-spin" />
                            <p className="mt-3 text-sm text-gray-500">Loading tracking…</p>
                        </div>
                    ) : error ? (
                        <div className="py-8 text-center">
                            <p className="text-red-600 text-sm">{error}</p>
                            <Button onClick={onClose} className="mt-4 bg-[#3586FF] text-white px-4 py-2 rounded-lg">
                                Close
                            </Button>
                        </div>
                    ) : order ? (
                        <>
                            {shipping?.trackingId && (
                                <div className="mb-5 p-3 rounded-xl bg-blue-50 border border-blue-100">
                                    <p className="text-xs font-medium text-blue-800 uppercase tracking-wide">Tracking ID</p>
                                    <p className="font-mono text-sm font-semibold text-blue-900 mt-1 break-all">
                                        {shipping.trackingId}
                                    </p>
                                    {shipping.courierName && (
                                        <p className="text-xs text-blue-700 mt-1">Courier: {shipping.courierName}</p>
                                    )}
                                </div>
                            )}

                            <p className="md:text-[16px] text-[14px] font-medium text-gray-700 mb-3">Order timeline :</p>
                            <div className="relative pl-1">
                                {/* Vertical line behind circles */}
                                {steps.length > 1 && (
                                    <div
                                        className="absolute left-5 w-0.5 bg-gray-200 top-5"
                                        style={{ height: `${(steps.length - 1) * 72}px` }}
                                    />
                                )}
                                {steps.map((step, index) => {
                                    const reached = isStepReached(currentStatus, step.key, history, steps);
                                    const stepDate = getStepDate(step.key, history, order);
                                    const Icon = step.icon;
                                    return (
                                        <div key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
                                            <div
                                                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${reached ? "bg-[#3586FF] text-white" : "bg-gray-200 text-gray-400"
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-medium ${reached ? "text-gray-900" : "text-gray-400"}`}>
                                                    {step.label}
                                                </p>
                                                {stepDate && (
                                                    <p className="text-xs text-gray-500 mt-0.5">{formatTrackDate(stepDate)}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
