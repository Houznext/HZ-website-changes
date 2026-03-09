"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";
import Button from "@/common/Button";
import toast from "react-hot-toast";
import CustomInput from "@/common/FormElements/CustomInput";

type ShippingDetails = {
    deliveryAddress?: { line1?: string; line2?: string; city?: string; state?: string; pincode?: string };
    recipientName?: string;
    recipientPhone?: string;
    instructions?: string;
};

type EditOrderModalProps = {
    orderId: string;
    orderNo?: string;
    onClose: () => void;
    onSuccess: () => void;
};

export default function EditOrderModal({
    orderId,
    orderNo,
    onClose,
    onSuccess,
}: EditOrderModalProps) {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [shipping, setShipping] = useState<ShippingDetails>({});

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await apiClient.get(`${apiClient.URLS.orders}/${orderId}`, {}, true);
                const order = res?.body as any;
                const sd = order?.shippingDetails ?? {};
                if (!cancelled) setShipping({
                    deliveryAddress: sd.deliveryAddress ?? {},
                    recipientName: sd.recipientName ?? "",
                    recipientPhone: sd.recipientPhone ?? "",
                    instructions: sd.instructions ?? "",
                });
            } catch {
                if (!cancelled) toast.error("Could not load order details.");
            } finally {
                if (!cancelled) setFetching(false);
            }
        })();
        return () => { cancelled = true; };
    }, [orderId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient.patch(
                `${apiClient.URLS.orders}/${orderId}`,
                { shippingDetails: shipping },
                true
            );
            toast.success("Order updated.");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err?.body?.message || err?.message || "Failed to update order.");
        } finally {
            setLoading(false);
        }
    };

    const addr = shipping.deliveryAddress ?? {};

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 md:p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold text-gray-900">Edit delivery address</h3>
                <p className="text-sm text-gray-600 mt-1">{orderNo ? `Order #${orderNo}` : orderId}</p>
                <p className="text-xs text-gray-500 mt-1">
                    Update where your order will be delivered. This does not change any property listing location.
                </p>
                {fetching ? (
                    <div className="mt-6 py-8 flex justify-center">
                        <div className="w-8 h-8 border-2 border-[#3586FF] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                        <div>
                            <CustomInput
                                label="Recipient name"
                                labelCls="text-sm text-slate-700 font-medium"
                                type="text"
                                value={shipping.recipientName ?? ""}
                                onChange={(e) => setShipping((s) => ({ ...s, recipientName: e.target.value }))}
                                className="w-full md:px-3  rounded-lg"
                            />
                        </div>
                        <div>
                            <CustomInput
                                label="Phone"
                                labelCls="text-sm text-slate-700 font-medium"
                                type="text"
                                value={shipping.recipientPhone ?? ""}
                                onChange={(e) => setShipping((s) => ({ ...s, recipientPhone: e.target.value }))}
                                className="w-full md:px-3 px-2  rounded-lg"
                            />
                        </div>
                        <div>
                            <CustomInput
                                type="text"
                                label="Address line 1"
                                labelCls="label-text text-slate-700 font-medium"
                                required
                                value={addr.line1 ?? ""}
                                onChange={(e) =>
                                    setShipping((s) => ({
                                        ...s,
                                        deliveryAddress: { ...(s.deliveryAddress ?? {}), line1: e.target.value },
                                    }))
                                }
                                className="w-full md:px-3 px-2  rounded-lg"
                            />
                        </div>
                        <div>
                            <div className="grid grid-cols-3 gap-2">
                                <CustomInput
                                    type="text"
                                    placeholder="City"
                                    label="City"
                                    labelCls="label-text text-slate-700 font-medium"
                                    value={addr.city ?? ""}
                                    onChange={(e) =>
                                        setShipping((s) => ({
                                            ...s,
                                            deliveryAddress: { ...(s.deliveryAddress ?? {}), city: e.target.value },
                                        }))
                                    }
                                    className="md:px-3 px-2  rounded-lg"
                                />
                                <CustomInput
                                    type="text"
                                    placeholder="State"
                                    label="State"
                                    required
                                    labelCls="label-text text-slate-700 font-medium"
                                    value={addr.state ?? ""}
                                    onChange={(e) =>
                                        setShipping((s) => ({
                                            ...s,
                                            deliveryAddress: { ...(s.deliveryAddress ?? {}), state: e.target.value },
                                        }))
                                    }
                                    className="md:px-3 px-2  rounded-lg"
                                />
                                <CustomInput
                                    type="text"
                                    placeholder="Pincode"
                                    label="Pincode "
                                    labelCls="label-text text-slate-700 font-medium"
                                    value={addr.pincode ?? ""}
                                    onChange={(e) =>
                                        setShipping((s) => ({
                                            ...s,
                                            deliveryAddress: { ...(s.deliveryAddress ?? {}), pincode: e.target.value },
                                        }))
                                    }
                                    className="md:px-3 px-2  rounded-lg"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions (optional)</label>
                            <textarea
                                value={shipping.instructions ?? ""}
                                onChange={(e) => setShipping((s) => ({ ...s, instructions: e.target.value }))}
                                rows={2}
                                className="w-full md:px-3 px-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div className="flex gap-3 justify-end pt-2">
                            <Button type="button" onClick={onClose} className="md:px-4 py-2 border border-gray-300 label-text rounded-lg text-gray-700">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="md:px-4 py-2 bg-[#3586FF] label-text text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
                                {loading ? "Saving…" : "Save changes"}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
