import React from "react";
import Link from "next/link";
import { DeliveryStatus } from ".";
import Image from "next/image";
import { HiOutlineShoppingBag, HiOutlineTruck } from "react-icons/hi2";
import { FiMessageCircle } from "react-icons/fi";

interface IOrderItemProps {
    item: {
        id: string | number;
        name: string;
        imageUrl: string;
        price: string;
        DeliveryStatus: DeliveryStatus;
        DeliveryDate: string;
        OrderDate: string;
        orderNo?: string;
        itemCount?: number;
        orderType?: string;
        rawStatus?: string;
        orderItemsForReview?: { productType: string; productId: string; name: string }[];
    };
    viewMode?: "list" | "grid";
    onTrackOrder?: (orderId: string) => void;
    onCancelOrder?: () => void;
    onEditOrder?: () => void;
    onWriteReview?: () => void;
}

const OrderItem = ({ item, viewMode = "list", onTrackOrder, onCancelOrder, onEditOrder, onWriteReview }: IOrderItemProps) => {
    // Helper: parse "dd/mm/yyyy" -> formatted date like "16 Nov 2024"
    const formatDisplayDate = (dateStr: string) => {
        if (!dateStr) return "-";
        // Expecting DD/MM/YYYY from parent
        const [d, m, y] = dateStr.split("/");
        if (!d || !m || !y) return dateStr;
        const parsed = new Date(`${y}-${m}-${d}`);
        if (Number.isNaN(parsed.getTime())) return dateStr;

        return parsed.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const deliveryDateDisplay = formatDisplayDate(item.DeliveryDate);
    const orderDateDisplay = formatDisplayDate(item.OrderDate);
    const orderLabel = item.orderNo ? `Order #${item.orderNo}` : `Order #${item.id}`;
    const priceNum = Number(item.price);
    const priceFormatted = Number.isFinite(priceNum)
        ? `₹${priceNum.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
        : `₹${item.price}`;

    // Status config: clearer labels for "Pending" (delivery pending vs service in progress)
    const getStatusConfig = () => {
        const raw = (item.rawStatus || "").toUpperCase();
        const orderType = (item.orderType || "").toUpperCase();
        const isPhysical = ["FURNITURE", "ELECTRONICS", "HOME_DECOR", "STORE", "MIXED"].some((t) => orderType.includes(t));
        switch (item.DeliveryStatus) {
            case DeliveryStatus.Delivered:
                return {
                    label: `Delivered on ${deliveryDateDisplay}`,
                    subText: "Your order has been delivered.",
                    colorClass: "text-[#16A34A]",
                    pillBg: "bg-[#ECFDF3]",
                };
            case DeliveryStatus.Pending:
                const pendingLabel =
                    isPhysical && ["SHIPPED", "OUT_FOR_DELIVERY"].includes(raw)
                        ? "Out for delivery"
                        : isPhysical
                            ? "Delivery pending"
                            : ["ASSIGNED", "IN_PROGRESS"].includes(raw)
                                ? "In progress"
                                : "Order confirmed";
                return {
                    label: pendingLabel,
                    subText: `Expected by ${deliveryDateDisplay}`,
                    colorClass: "text-[#EAB308]",
                    pillBg: "bg-[#FFFBEB]",
                };
            case DeliveryStatus.Cancelled:
                return {
                    label: "Cancelled",
                    subText: "This order has been cancelled.",
                    colorClass: "text-[#DC2626]",
                    pillBg: "bg-[#FEF2F2]",
                };
            default:
                return {
                    label: "Order confirmed",
                    subText: `Expected by ${deliveryDateDisplay}`,
                    colorClass: "text-[#6B7280]",
                    pillBg: "bg-gray-100",
                };
        }
    };

    const statusConfig = getStatusConfig();
    const isGrid = viewMode === "grid";

    if (isGrid) {
        return (
            <article className="group w-full bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-gray-300/80 transition-all duration-200">
                <div className="relative w-full aspect-[6/3] rounded-lg overflow-hidden bg-gray-100 ring-1 ring-gray-100">
                    <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 540px) 100vw, 20vw"
                    />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="font-semibold text-[14px] text-[#111827] leading-snug line-clamp-2">
                        {item.name}
                    </h3>
                    <p className="text-[12px] text-[#6B7280] mt-1">
                        {orderLabel} · {orderDateDisplay}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                        <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium ${statusConfig.pillBg} ${statusConfig.colorClass}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${item.DeliveryStatus === DeliveryStatus.Pending ? "animate-pulse bg-current" : "bg-current"}`} />
                            {statusConfig.label}
                        </span>
                    </div>
                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-bold text-[15px] text-[#111827]">{priceFormatted}</span>
                        <div className="flex items-center gap-2">
                            {onWriteReview && (
                                <button type="button" onClick={onWriteReview} className="text-[12px] font-medium text-amber-600 hover:text-amber-700">
                                    Review
                                </button>
                            )}
                            {onTrackOrder && item.DeliveryStatus !== DeliveryStatus.Cancelled && (
                                <button
                                    type="button"
                                    onClick={() => onTrackOrder(String(item.id))}
                                    className="flex items-center gap-1.5 text-[12px] font-medium text-[#3586FF] hover:text-blue-700"
                                >
                                    <HiOutlineTruck className="w-4 h-4" />
                                    Track
                                </button>
                            )}
                            <Link
                                href="/user/support"
                                className="flex items-center gap-1.5 text-[12px] font-medium text-[#6B7280] hover:text-[#3586FF]"
                            >
                                <FiMessageCircle className="w-4 h-4" />
                                Help
                            </Link>
                        </div>
                    </div>
                </div>
            </article>
        );
    }

    return (
        <article className="group w-full bg-white border border-gray-200 rounded-2xl p-5 md:p-6 flex flex-col gap-5 shadow-sm hover:shadow-lg hover:border-gray-300/80 transition-all duration-200">
            <div className="flex gap-5">
                <div className="relative w-28 h-28 md:w-36 md:h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 ring-1 ring-gray-100">
                    <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 112px, 144px"
                    />
                </div>

                <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                        <h3 className="font-semibold text-[15px] md:text-[17px] text-[#111827] leading-snug line-clamp-2">
                            {item.name}
                        </h3>
                        <p className="text-[12px] text-[#6B7280] mt-1.5">
                            {orderLabel} · Placed on {orderDateDisplay}
                        </p>
                        {item.itemCount != null && item.itemCount > 1 && (
                            <p className="inline-flex items-center gap-1.5 mt-2 text-[12px] text-[#9CA3AF]">
                                <HiOutlineShoppingBag className="w-4 h-4" />
                                {item.itemCount} items
                            </p>
                        )}
                    </div>

                    <div className="hidden md:flex items-center gap-2 mt-2">
                        <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium ${statusConfig.pillBg} ${statusConfig.colorClass}`}
                        >
                            <span
                                className={`w-2 h-2 rounded-full ${item.DeliveryStatus === DeliveryStatus.Pending ? "animate-pulse bg-current" : "bg-current"}`}
                            />
                            {statusConfig.label}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-4 border-t border-gray-100">
                <div className="flex flex-col">
                    <span className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wide">Total amount</span>
                    <span className="font-bold text-[17px] md:text-[19px] text-[#111827] mt-0.5">
                        {priceFormatted}
                    </span>
                </div>

                <div className="flex flex-col items-start md:items-end gap-1">
                    <div className="flex flex-wrap items-center gap-2 justify-end">
                        <div className="flex md:hidden items-center gap-2">
                            <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium ${statusConfig.pillBg} ${statusConfig.colorClass}`}
                            >
                                <span
                                    className={`w-2 h-2 rounded-full ${item.DeliveryStatus === DeliveryStatus.Pending ? "animate-pulse bg-current" : "bg-current"}`}
                                />
                                {statusConfig.label}
                            </span>
                        </div>
                        {onWriteReview && (
                            <button type="button" onClick={onWriteReview} className="inline-flex items-center gap-2 px-3 md:py-2 py-1 rounded-lg border border-amber-400 text-amber-700 text-sm font-medium hover:bg-amber-50 transition-colors">
                                Write review
                            </button>
                        )}
                        {onEditOrder && (
                            <button type="button" onClick={onEditOrder} className="inline-flex items-center gap-2 px-3 md:py-2 py-1 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                                Edit order
                            </button>
                        )}
                        {onCancelOrder && (
                            <button type="button" onClick={onCancelOrder} className="inline-flex items-center gap-2 px-3 md:py-2 py-1 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors">
                                Cancel order
                            </button>
                        )}
                        {onTrackOrder && item.DeliveryStatus !== DeliveryStatus.Cancelled && (
                            <button
                                type="button"
                                onClick={() => onTrackOrder(String(item.id))}
                                className="inline-flex items-center gap-2 px-3 md:py-2 py-1 rounded-lg border border-[#3586FF] text-[#3586FF] text-sm font-medium hover:bg-[#3586FF]/5 transition-colors"
                            >
                                <HiOutlineTruck className="w-4 h-4" />
                                Track order
                            </button>
                        )}
                        <Link
                            href="/user/support"
                            className="inline-flex items-center gap-2 px-3 md:py-2 py-1 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
                        >
                            <FiMessageCircle className="w-4 h-4" />
                            Help
                        </Link>
                    </div>
                    <p className="text-[13px] text-[#6B7280]">{statusConfig.subText}</p>
                </div>
            </div>
        </article>
    );
};

export default OrderItem;
