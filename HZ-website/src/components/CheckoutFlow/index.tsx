import React, { useEffect, useMemo, useState } from "react";
import { CartComponent } from "./CartComponent";
import AddressCart from "./AddressCart";
import PaymentPage from "./PaymentComponent";
import Loader from "../Loader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FaAddressCard, FaCreditCard, FaShoppingCart, FaLock } from "react-icons/fa";
import Stepper from "@/common/Stepper";
import BackRoute from "../BackRoute";
import { useCartStore } from "@/store/cart";
import EmptyCart from "./EmptyCard";

export const CheckoutFlow = () => {
    const iconMap = useMemo(
        () => ({
            "Your Cart": <FaShoppingCart />,
            "Address Details": <FaAddressCard />,
            Payment: <FaCreditCard />,
        }),
        []
    );

    const steps = useMemo(() => ["Your Cart", "Address Details", "Payment"], []);
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { data: session, status } = useSession();

    const userId = (session?.user as any)?.id;

    const {
        items,
        hydrateFromGuest,
        fetchCart,
        syncCartWithBackend,
    } = useCartStore();

    const activeStepLabel = steps[currentStep] || "Your Cart";

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep((prev) => prev - 1);
        else router.back();
    };

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            if (typeof window === "undefined") return;

            if (status !== "authenticated" || !userId) {
                hydrateFromGuest();
                return;
            }
            try {
                setLoading(true);
                await syncCartWithBackend(userId);
                await fetchCart(userId);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        init();
        return () => {
            mounted = false;
        };
    }, [status, userId, hydrateFromGuest, syncCartWithBackend, fetchCart]);

    const renderContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <CartComponent handleNext={() => setCurrentStep((prev) => prev + 1)} />
                );
            case 1:
                return (
                    <AddressCart handleNext={() => setCurrentStep((prev) => prev + 1)} />
                );
            case 2:
                return <PaymentPage />;
            default:
                return <PaymentPage />;
        }
    };

    if (!loading && (!items || items.length === 0)) return <EmptyCart title="Your cart is empty" />

    if (loading) {
        return (
            <div className="w-full min-h-[60vh] flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="mb-6 bg-[#F5F7FB] min-h-[calc(100vh-80px)]">
            <div className="max-w-7xl mx-auto pt-6 px-4 md:px-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                    <div className="flex flex-col gap-1">
                        <div>
                            <BackRoute />
                        </div>

                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                            Checkout
                        </h1>

                        <p className="label-text text-blue-500">
                            Step {currentStep + 1} of {steps.length} •{" "}
                            <span className="font-medium text-gray-700">
                                {activeStepLabel}
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 bg-white px-3 py-2 rounded-[4px] shadow-sm border border-gray-100">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#E7F1FF] text-[#3586FF]">
                            <FaLock className="text-sm" />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-xs md:text-sm font-medium text-gray-800">
                                100% Secure Payment
                            </span>
                            <span className="text-[10px] md:text-xs text-gray-500">
                                Your card & UPI details are encrypted
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mb-5">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-3 md:px-6 py-1">
                        <div className="w-full overflow-x-auto mx-auto no-scrollbar">
                            <div className="min-w-[280px] w-full mx-auto">
                                <Stepper
                                    currentStep={currentStep}
                                    steps={steps}
                                    handleClick={(index: number) => () => setCurrentStep(index)}
                                    iconMap={iconMap}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 pb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-5">
                    {renderContent(currentStep)}
                </div>
            </div>
        </div>
    );
};

export default CheckoutFlow;
