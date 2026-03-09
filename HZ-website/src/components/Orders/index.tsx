"use client";

import React, { useMemo, useEffect, useState, useCallback } from "react";
import OrderItem from "./OrderItem";
import OrderTrackingModal from "./OrderTrackingModal";
import CancelOrderModal from "./CancelOrderModal";
import EditOrderModal from "./EditOrderModal";
import WriteReviewModal from "./WriteReviewModal";
import Image from "next/image";
import { useSession } from "next-auth/react";
import apiClient from "@/utils/apiClient";
import ReusableSearchFilter from "@/common/SearchFilter";
import { FiList, FiGrid } from "react-icons/fi";


export enum DeliveryStatus {
    Delivered,
    Pending,
    Cancelled,
    All,
}

/** Reviewable order item: productType + productId map to reviews API type and entity id */
export type OrderItemForReview = { productType: string; productId: string; name: string };

export type Item = {
    id: string | number;
    name: string;
    imageUrl: string;
    price: string;
    DeliveryStatus: DeliveryStatus;
    DeliveryDate: string;
    OrderDate: string;
    createdAt?: string;
    orderNo?: string;
    itemCount?: number;
    orderType?: string;
    rawStatus?: string;
    /** For delivered orders: items that can be reviewed (furniture, electronics, homeDecor) */
    orderItemsForReview?: OrderItemForReview[];
};

/** Map order type to display category and sort order for grouping */
const CATEGORY_CONFIG: Record<string, { label: string; sort: number }> = {
    PROPERTY_PREMIUM: { label: "Property & Ads", sort: 0 },
    PROPERTY_BOOKING: { label: "Property & Ads", sort: 0 },
    LEGAL: { label: "Legal", sort: 1 },
    FURNITURE: { label: "Furniture", sort: 2 },
    INTERIORS: { label: "Interiors", sort: 3 },
    ELECTRONICS: { label: "Electronics", sort: 4 },
    HOME_DECOR: { label: "Home Decor", sort: 5 },
    SOLAR: { label: "Solar", sort: 6 },
    CUSTOM_BUILDER: { label: "Custom Builder", sort: 7 },
    STORE: { label: "Store", sort: 8 },
    SERVICE: { label: "Services", sort: 9 },
    MIXED: { label: "Other", sort: 10 },
};

function getCategoryLabel(orderType: string | undefined): string {
    if (!orderType) return "Other";
    return CATEGORY_CONFIG?.[orderType]?.label ?? "Other";
}

function getCategorySortKey(orderType: string | undefined): number {
    if (!orderType) return 99;
    return CATEGORY_CONFIG?.[orderType]?.sort ?? 99;
}

type ApiOrderItem = {
    id: string | number;
    name: string;
    productType: string;
    productId: string | number;
    unitPrice?: string;
    sellingPrice?: string;
    itemTotal?: string;
    quantity: number;
    meta?: any;
    snapshot?: { image?: string;[key: string]: any };
    lineTotal?: string;
};

type ApiOrder = {
    id: string | number;
    orderNo?: string;
    type: string;
    status: string;
    grandTotal?: string;
    totalAmount?: string;
    currency: string;
    items: ApiOrderItem[];
    meta?: any;
    createdAt: string;
    updatedAt: string;
};

type ApiPaginatedOrders = {
    data: ApiOrder[];
    total: number;
    page: number;
    limit: number;
};

const OrdersView = () => {
    const { data: session, status } = useSession();

    const [selectedType, setSelectedType] = useState<DeliveryStatus>(
        DeliveryStatus.All
    );

    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [query, setQuery] = useState("");
    const [selectedFilters, setSelectedFilters] = useState<any>({});
    const [allItems, setAllItems] = useState<Item[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [trackingOrder, setTrackingOrder] = useState<Item | null>(null);
    const [cancelOrder, setCancelOrder] = useState<Item | null>(null);
    const [editOrder, setEditOrder] = useState<Item | null>(null);
    const [reviewOrder, setReviewOrder] = useState<Item | null>(null);

    const cancellableStatuses = ["CREATED", "PENDING", "CONFIRMED"];
    const editableStatuses = ["CREATED", "PENDING"];
    const orderTypesWithDeliveryAddress = ["FURNITURE", "ELECTRONICS", "HOME_DECOR", "STORE", "MIXED"];

    const refetchOrders = useCallback(async () => {
        if (status !== "authenticated") return;
        try {
            const res = await apiClient.get(`${apiClient.URLS.orders}/my`, { page: 1, limit: 50 }, true);
            const payload = res.body || {};
            const orderList = Array.isArray(payload) ? payload : (payload.data || []);
            const mappedItems = orderList.map((order: ApiOrder) => mapOrderToItem(order));
            setAllItems(mappedItems);
            setFilteredItems(mappedItems);
        } catch {
            setAllItems([]);
            setFilteredItems([]);
        }
    }, [status]);

    // ---- Map backend OrderStatusEnum → UI DeliveryStatus bucket ----
    const mapOrderStatusToDeliveryStatus = (status: string): DeliveryStatus => {
        const s = (status || "").toUpperCase();

        if (["CANCELLED"].includes(s)) return DeliveryStatus.Cancelled;
        if (["DELIVERED", "COMPLETED"].includes(s)) return DeliveryStatus.Delivered;

        return DeliveryStatus.Pending;
    };

    const formatDate = (iso: string | undefined): string => {
        if (!iso) return "-";
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "-";
        return d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const mapOrderToItem = (order: ApiOrder): Item => {
        const primaryItem = order.items?.[0];
        const orderId = order.id;
        const displayOrderNo = order.orderNo || (typeof orderId === "string" ? orderId.slice(0, 8) : `#${orderId}`);

        const imageUrl =
            primaryItem?.snapshot?.image ||
            primaryItem?.meta?.imageUrl ||
            primaryItem?.meta?.image ||
            (primaryItem?.productType === "LEGAL_PACKAGE"
                ? "/images/legalservices/herosection/legalservicesherosection.png"
                : "/images/custombuilder/subservices/l-shape.png");

        const priceDisplay =
            order.grandTotal != null
                ? String(order.grandTotal)
                : order.totalAmount != null
                    ? String(order.totalAmount)
                    : primaryItem?.itemTotal || primaryItem?.lineTotal || primaryItem?.unitPrice || "0";

        const deliveryStatus = mapOrderStatusToDeliveryStatus(order.status);

        const deliveryDate =
            (order.meta && order.meta.deliveryDate) || order.updatedAt || order.createdAt;

        const itemCount = order.items?.length ?? 0;
        const title = primaryItem?.name || `Order ${displayOrderNo}`;
        const name = itemCount > 1 ? `${title} +${itemCount - 1} more` : title;

        const reviewableTypes = [
            "FURNITURE_PRODUCT",
            "ELECTRONICS_PRODUCT",
            "HOME_DECOR_PRODUCT",
            "LEGAL_PACKAGE",
            "INTERIOR_PACKAGE",
            "SOLAR_PACKAGE",
            "CUSTOM_BUILDER_PACKAGE",
        ];
        const orderItemsForReview: OrderItemForReview[] = (order.items ?? [])
            .filter((i: ApiOrderItem) => reviewableTypes.includes((i.productType || "").toUpperCase()))
            .map((i: ApiOrderItem) => ({
                productType: i.productType || "",
                productId: String(i.productId ?? i.id ?? ""),
                name: i.name || "Item",
            }))
            .filter((i) => i.productId);

        return {
            id: orderId,
            name,
            imageUrl,
            price: priceDisplay,
            DeliveryStatus: deliveryStatus,
            DeliveryDate: formatDate(deliveryDate),
            OrderDate: formatDate(order.createdAt),
            createdAt: order.createdAt,
            orderNo: displayOrderNo,
            itemCount,
            orderType: order.type,
            rawStatus: order.status,
            orderItemsForReview: orderItemsForReview.length > 0 ? orderItemsForReview : undefined,
        };
    };

    // ---- Fetch orders from backend ----
    useEffect(() => {
        const fetchOrders = async () => {
            if (status !== "authenticated") return;

            try {
                setLoading(true);

                const res = await apiClient.get(
                    `${apiClient.URLS.orders}/my`,
                    { page: 1, limit: 50 },
                    true
                );

                const payload = res.body || {};
                const orderList = Array.isArray(payload) ? payload : (payload.data || []);
                const mappedItems = orderList.map((order: ApiOrder) => mapOrderToItem(order));

                setAllItems(mappedItems);
                setFilteredItems(mappedItems);
            } catch (err) {
                console.error("Failed to fetch orders", err);
                setAllItems([]);
                setFilteredItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [status]);

    // ---- Filter items whenever filters / query / status change ----
    useEffect(() => {
        let items = [...allItems];

        // 1) Status (All / Pending / Cancelled)
        if (selectedType !== DeliveryStatus.All) {
            items = items.filter((item) => item.DeliveryStatus === selectedType);
        }

        // 2) Search
        if (query.trim() !== "") {
            const q = query.toLowerCase();
            items = items.filter((item) => item.name.toLowerCase().includes(q));
        }

        // 3) Last X days filter from ReusableSearchFilter
        const lastDays: number | undefined = selectedFilters?.lastDays;
        if (lastDays) {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - lastDays);

            items = items.filter((item) => {
                if (!item.createdAt) return true;
                const created = new Date(item.createdAt);
                if (Number.isNaN(created.getTime())) return true;
                return created >= cutoff;
            });
        }

        setFilteredItems(items);
    }, [allItems, selectedType, query, selectedFilters]);

    // ---- Group filtered items by category for section headers ----
    const itemsByCategory = useMemo(() => {
        const groups: Record<string, Item[]> = {};
        filteredItems.forEach((item) => {
            const cat = getCategoryLabel(item.orderType);
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        });
        const categorySortKey: Record<string, number> = {};
        Object.keys(groups).forEach((cat) => {
            const firstItem = groups[cat][0];
            categorySortKey[cat] = getCategorySortKey(firstItem?.orderType);
        });
        const sortedCategories = Object.keys(groups).sort(
            (a, b) => (categorySortKey[a] ?? 99) - (categorySortKey[b] ?? 99)
        );
        return sortedCategories.map((cat) => ({ category: cat, items: groups[cat] }));
    }, [filteredItems]);

    // ---- Filter config for ReusableSearchFilter ----
    // ⚠️ If your ReusableSearchFilter expects a different shape, adjust this object.
    const filterConfig = [
        {
            id: "lastDays",
            label: "Order Date",
            type: "single-select",
            options: [
                { label: "Last 10 days", value: 10 },
                { label: "Last 15 days", value: 15 },
                { label: "Last 20 days", value: 20 },
                { label: "Last 30 days", value: 30 },
            ],
        },
    ];

    return (
        <div className="w-full min-h-[60vh]">
            {trackingOrder && (
                <OrderTrackingModal
                    orderId={String(trackingOrder.id)}
                    orderNo={trackingOrder.orderNo}
                    orderName={trackingOrder.name}
                    onClose={() => setTrackingOrder(null)}
                />
            )}
            {cancelOrder && (
                <CancelOrderModal
                    orderId={String(cancelOrder.id)}
                    orderNo={cancelOrder.orderNo}
                    orderType={cancelOrder.orderType}
                    onClose={() => setCancelOrder(null)}
                    onSuccess={() => { refetchOrders(); setCancelOrder(null); }}
                />
            )}
            {editOrder && (
                <EditOrderModal
                    orderId={String(editOrder.id)}
                    orderNo={editOrder.orderNo}
                    onClose={() => setEditOrder(null)}
                    onSuccess={() => { refetchOrders(); setEditOrder(null); }}
                />
            )}

            {reviewOrder && reviewOrder.orderItemsForReview && reviewOrder.orderItemsForReview.length > 0 && (
                <WriteReviewModal
                    orderId={String(reviewOrder.id)}
                    orderNo={reviewOrder.orderNo}
                    orderItemsForReview={reviewOrder.orderItemsForReview}
                    onClose={() => setReviewOrder(null)}
                    onSuccess={() => { setReviewOrder(null); }}
                />
            )}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                <div className="p-5 md:p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <p className="text-sm text-[#6B7280]">
                            Track orders across furniture, interiors, legal, and more.
                        </p>
                        <ReusableSearchFilter
                            searchText={query}
                            onSearchChange={setQuery}
                            placeholder="Search by order name..."
                            filters={filterConfig}
                            selectedFilters={selectedFilters}
                            onFilterChange={setSelectedFilters}
                            rootCls="w-full md:w-[380px]"
                        />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="flex flex-wrap gap-2">
                            {[
                                { key: DeliveryStatus.All, label: "All Orders" },
                                { key: DeliveryStatus.Pending, label: "Pending", sub: "Not yet delivered or completed" },
                                { key: DeliveryStatus.Delivered, label: "Delivered" },
                                { key: DeliveryStatus.Cancelled, label: "Cancelled" },
                            ].map(({ key, label, sub }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setSelectedType(key)}
                                    title={sub}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedType === key
                                        ? "bg-[#3586FF] text-white shadow-sm"
                                        : "bg-white text-[#4B5563] border border-gray-200 hover:border-[#3586FF]/40 hover:text-[#3586FF]"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="ml-auto flex rounded-lg border border-gray-200 bg-white p-0.5">
                            <button
                                type="button"
                                onClick={() => setViewMode("list")}
                                title="List view"
                                className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-[#3586FF] text-white" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                <FiList className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode("grid")}
                                title="Grid view"
                                className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-[#3586FF] text-white" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                <FiGrid className="w-4 h-4" />
                            </button>
                        </div>
                        {selectedType === DeliveryStatus.Pending && (
                            <p className="w-full mt-2 text-[12px] text-[#6B7280]">
                                Pending = not yet delivered or completed. Physical orders show &quot;Delivery pending&quot;; services may show &quot;In progress&quot; or &quot;Order confirmed&quot;.
                            </p>
                        )}
                    </div>
                </div>

                <div className="p-5 md:p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center min-h-[280px] text-[#6B7280]">
                            <div className="w-10 h-10 border-2 border-[#3586FF] border-t-transparent rounded-full animate-spin" />
                            <p className="mt-4 text-sm font-medium">Loading your orders…</p>
                        </div>
                    ) : filteredItems && filteredItems.length > 0 ? (
                        <div className="flex flex-col gap-8">
                            {itemsByCategory.map(({ category, items: categoryItems }) => (
                                <section key={category}>
                                    <h2 className="text-sm font-bold text-[#252b36] uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">
                                        {category}: {categoryItems.length}
                                    </h2>
                                    {viewMode === "list" ? (
                                        <div className="flex flex-col gap-5">
                                            {categoryItems.map((item) => (
                                                <OrderItem
                                                    key={item.id}
                                                    item={item}
                                                    viewMode="list"
                                                    onTrackOrder={(id) => setTrackingOrder(categoryItems.find((i) => String(i.id) === id) ?? null)}
                                                    onCancelOrder={
                                                        cancellableStatuses.includes((item.rawStatus || "").toUpperCase()) &&
                                                            (item.orderType || "").toUpperCase() !== "PROPERTY_PREMIUM"
                                                            ? () => setCancelOrder(item)
                                                            : undefined
                                                    }
                                                    onEditOrder={
                                                        editableStatuses.includes((item.rawStatus || "").toUpperCase()) &&
                                                            orderTypesWithDeliveryAddress.includes((item.orderType || "").toUpperCase())
                                                            ? () => setEditOrder(item)
                                                            : undefined
                                                    }
                                                    onWriteReview={item.DeliveryStatus === DeliveryStatus.Delivered && item.orderItemsForReview?.length ? () => setReviewOrder(item) : undefined}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {categoryItems.map((item) => (
                                                <OrderItem
                                                    key={item.id}
                                                    item={item}
                                                    viewMode="grid"
                                                    onTrackOrder={(id) => setTrackingOrder(categoryItems.find((i) => String(i.id) === id) ?? null)}
                                                    onCancelOrder={
                                                        cancellableStatuses.includes((item.rawStatus || "").toUpperCase()) &&
                                                            (item.orderType || "").toUpperCase() !== "PROPERTY_PREMIUM"
                                                            ? () => setCancelOrder(item)
                                                            : undefined
                                                    }
                                                    onEditOrder={
                                                        editableStatuses.includes((item.rawStatus || "").toUpperCase()) &&
                                                            orderTypesWithDeliveryAddress.includes((item.orderType || "").toUpperCase())
                                                            ? () => setEditOrder(item)
                                                            : undefined
                                                    }
                                                    onWriteReview={item.DeliveryStatus === DeliveryStatus.Delivered && item.orderItemsForReview?.length ? () => setReviewOrder(item) : undefined}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </section>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center min-h-[320px] text-center px-4">
                            <div className="relative w-48 h-48 md:w-56 md:h-56">
                                <Image
                                    src="/orders/no-orders.jpeg"
                                    className="object-contain"
                                    alt="No orders yet"
                                    fill
                                />
                            </div>
                            <p className="mt-6 text-lg font-semibold text-[#111827]">No orders found</p>
                            <p className="mt-2 text-sm text-[#6B7280] max-w-sm">
                                When you place an order, it will appear here.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrdersView;
