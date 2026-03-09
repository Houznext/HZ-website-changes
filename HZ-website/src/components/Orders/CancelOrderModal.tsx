"use client";

import React, { useState } from "react";
import apiClient from "@/utils/apiClient";
import Button from "@/common/Button";
import toast from "react-hot-toast";

type CancelOrderModalProps = {
    orderId: string;
    orderNo?: string;
    /** When PROPERTY_PREMIUM we show no-refund, disabled-from-next-month copy (cancel is hidden for property ads in list) */
    orderType?: string;
    onClose: () => void;
    onSuccess: () => void;
};

export default function CancelOrderModal({
    orderId,
    orderNo,
    orderType,
    onClose,
    onSuccess,
}: CancelOrderModalProps) {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const isPropertyAd = (orderType || "").toUpperCase() === "PROPERTY_PREMIUM";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient.delete(
                `${apiClient.URLS.orders}/${orderId}/cancel`,
                { reason: reason.trim() || undefined },
                true
            );
            toast.success(isPropertyAd ? "Order cancelled. Feature will be disabled from next cycle." : "Order cancelled. Refund will be processed if applicable.");
            onSuccess();
            onClose();
        } catch (err: any) {
            const msg = err?.body?.message || err?.message || "Failed to cancel order.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 md:p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold text-gray-900">Cancel order</h3>
                <p className="text-sm text-gray-600 mt-1">
                    {orderNo ? `Order #${orderNo}` : `Order ${orderId}`} will be cancelled.
                    {isPropertyAd
                        ? " No refund will be processed. The ad/feature will be disabled from the next billing cycle."
                        : " For paid orders, refund will be processed to your original payment method where applicable."}
                </p>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-700 mb-1">
                            Reason (optional)
                        </label>
                        <textarea
                            id="cancel-reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3586FF] focus:border-[#3586FF]"
                            placeholder="e.g. Changed my mind, duplicate order..."
                        />
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Button type="button" onClick={onClose} className="px-4 py-2 border label-text border-gray-300 rounded-lg text-gray-700">
                            Keep order
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 text-white btn-text rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            {loading ? "Cancelling…" : "Cancel order"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
