"use client";

import React, { useState } from "react";
import apiClient from "@/utils/apiClient";
import Button from "@/common/Button";
import toast from "react-hot-toast";
import type { OrderItemForReview } from "./index";
import CustomInput from "@/common/FormElements/CustomInput";

/** Maps order item productType to backend review API type (e.g. reviews/legal/:id) */
const PRODUCT_TYPE_TO_REVIEW_TYPE: Record<string, string> = {
    FURNITURE_PRODUCT: "furniture",
    ELECTRONICS_PRODUCT: "electronics",
    HOME_DECOR_PRODUCT: "homedecor",
    LEGAL_PACKAGE: "legal",
    INTERIOR_PACKAGE: "interiors",
    SOLAR_PACKAGE: "solar",
    CUSTOM_BUILDER_PACKAGE: "custombuilder",
};

type WriteReviewModalProps = {
    orderId: string;
    orderNo?: string;
    orderItemsForReview: OrderItemForReview[];
    onClose: () => void;
    onSuccess: () => void;
};

export default function WriteReviewModal({
    orderNo,
    orderItemsForReview,
    onClose,
    onSuccess,
}: WriteReviewModalProps) {
    const [selectedItem, setSelectedItem] = useState<OrderItemForReview>(orderItemsForReview[0]);
    const [rating, setRating] = useState<number | null>(null);
    const [headline, setHeadline] = useState("");
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const reviewType = selectedItem
        ? PRODUCT_TYPE_TO_REVIEW_TYPE[selectedItem.productType.toUpperCase()]
        : null;
    const entityId = selectedItem?.productId ?? "";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) {
            toast.error("Please select an item to review.");
            return;
        }
        if (!reviewType) {
            toast.error("Reviews are not available for this item type yet.");
            return;
        }
        if (!entityId) {
            toast.error("Invalid item. Cannot submit review.");
            return;
        }
        setLoading(true);
        try {
            await apiClient.post(
                `${apiClient.URLS.reviews}/${reviewType}/${entityId}`,
                { rating, headline: headline.trim() || undefined, comment: comment.trim() || undefined },
                true
            );
            toast.success("Thank you! Your review has been submitted.");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err?.body?.message || err?.message || "Failed to submit review.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 md:p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg text-yellow-500 font-semibold ">Write a review</h3>
                <p className="text-sm text-gray-600 mt-1">{orderNo ? `Order #${orderNo}` : ""}</p>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {orderItemsForReview.length > 1 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select item</label>
                            <select
                                value={orderItemsForReview.findIndex((i) => i.productId === selectedItem?.productId)}
                                onChange={(e) => setSelectedItem(orderItemsForReview[Number(e.target.value)] ?? orderItemsForReview[0])}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3586FF]"
                            >
                                {orderItemsForReview.map((item, idx) => (
                                    <option key={item.productId} value={idx}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRating(r)}
                                    className={`w-10 h-10 rounded-lg border-2 text-lg font-medium transition-colors ${rating !== null && rating >= r
                                        ? "border-[#e5ed3c] bg-[#f4ed24] text-white"
                                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                                        }`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <CustomInput
                            label="Headline"
                            labelCls="text-sm font-medium text-gray-700 mb-1"
                            type="text"
                            value={headline}
                            onChange={(e) => setHeadline(e.target.value)}
                            placeholder="e.g. Great quality!"
                            className="w-full"
                        />
                    </div>
                    <div>
                        <CustomInput
                            label="Your review"
                            labelCls="label-text font-medium text-gray-700 mb-1"
                            type="textarea"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            placeholder="Share your experience..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3586FF]"
                        />
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                        <Button type="button" onClick={onClose} className="px-4 py-1 btn-text border border-gray-300 rounded-lg text-gray-700">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="px-4 py-1 btn-text bg-[#3586FF] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
                            {loading ? "Submitting…" : "Submit review"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
