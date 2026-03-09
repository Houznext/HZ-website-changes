import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Button from "@/common/Button";
import CustomInput from "@/common/FormElements/CustomInput";
import toast from "react-hot-toast";
import { formatIndianCurrency } from "@/utils/solar/solarCalculations";
import {
    BsCalendar3,
    BsCart3,
    BsPiggyBank,
    BsPerson,
    BsShieldCheck
} from "react-icons/bs";
import { useAuthUser } from "@/utils/useAuthUser";
import { useSolarStore } from "@/store/useSolarStore";
import { useCartStore, AddToCartPayload } from "@/store/cart";
import BackRoute from "@/common/BackRoute";

const SolarBookingView = () => {
    const router = useRouter();
    const { user, userId, isAuthenticated } = useAuthUser();

    const quote = useSolarStore((state) => state.quote);
    const clearQuote = useSolarStore((state) => state.clearQuote);
    const addToCart = useCartStore((state) => state.addToCart);
    const [isHydrated, setIsHydrated] = useState(false);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        preferredDate: "",
    });

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated && !quote) {
            router.push("/solar");
        }
    }, [isHydrated, quote, router]);

    useEffect(() => {
        if (isAuthenticated && userId) {
            setFormData(prev => ({
                ...prev,
                name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : prev.name,
                phone: user?.phone?.toString() || prev.phone
            }));
        }
    }, [isAuthenticated, userId, user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === "phone" && !/^\d{0,10}$/.test(value)) return;
        setFormData({ ...formData, [name]: value });
    };

    const today = new Date().toISOString().split("T")[0];
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const maxDateStr = maxDate.toISOString().split("T")[0];

    const handleAddToCart = async () => {
        if (!formData.preferredDate) return toast.error("Please select a date.");
        if (!formData.name || !formData.phone) return toast.error("Please provide contact details.");

        setLoading(true);

        try {
            const payload: AddToCartPayload = {
                productType: "SOLAR_PACKAGE",
                productId: "solar-site-visit",
                name: "Solar Site Visit",
                description: `Site visit for ${quote?.recommendedSystemSize || 0} kW solar system`,
                mrp: 199,
                sellingPrice: 199,
                quantity: 1,
                snapshot: {
                    image: "/images/workflow/sitevisit.png",
                },
                meta: {
                    solarType: quote?.solarType,
                    category: quote?.category,
                    systemSize: quote?.recommendedSystemSize,
                    estimatedCost: quote?.systemCost,
                    subsidy: quote?.subsidy,
                    effectiveCost: quote?.effectiveCost,
                    monthlyBill: quote?.monthlyBill,
                    spaceRequired: quote?.spaceRequired,
                    annualGeneration: quote?.annualGeneration,
                    estimatedAnnualSavings: quote?.estimatedAnnualSavings,
                    emiOptions: quote?.emiOptions,
                    preferredDate: formData.preferredDate,
                    contactName: formData.name,
                    contactPhone: formData.phone,
                },
            };

            const success = await addToCart(payload, userId);

            if (success) {
                router.push("/cart");
            }
        } catch (error: any) {
            console.error("Error adding solar to cart:", error);
            toast.error("Failed to add to cart. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isHydrated || !quote) {
        return (
            <div className="min-h-screen bg-[#f8fbff] flex items-center justify-center">
                <div className="text-slate-400 font-Gordita-Medium animate-pulse tracking-widest text-[10px] uppercase">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fbff] pt-4 md:pt-6 pb-8 border-t border-slate-100 font-sans">

            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div>
                    <BackRoute
                    />
                </div>

                {/* Refined Header - Even more compact */}
                <div className="mb-6 relative">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-0.5 tracking-tight leading-tight">
                        Confirm Site Visit
                    </h2>
                    <p className="text-slate-500 text-[10px] md:text-[11px] max-w-2xl opacity-80">
                        Verify your details to schedule a professional engineer site visit.
                    </p>
                </div>

                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">

                        {/* LEFT COLUMN: Data Collection (Spans 2 columns) */}
                        <div className="lg:col-span-2 space-y-3 md:space-y-4">

                            {/* 1. Schedule Card - More Dense */}
                            <div className="bg-white border border-slate-200/60 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-1.5 md:gap-2 mb-3">
                                    <div className="bg-blue-50 p-1.5 rounded-lg md:rounded-xl">
                                        <BsCalendar3 className="text-blue-600 w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </div>
                                    <h3 className="text-slate-500 font-medium text-[9px] md:text-[10px] uppercase tracking-wider md:tracking-widest">Select Preferred Date</h3>
                                </div>
                                <div className="max-w-xs">
                                    <div className="flex flex-col">
                                        <label className="font-bold text-[8px] md:text-[9px] text-slate-400 mb-1 tracking-widest uppercase ml-1">
                                            SELECT VISIT DATE
                                        </label>
                                        <input
                                            type="date"
                                            name="preferredDate"
                                            value={formData.preferredDate}
                                            onChange={handleInputChange}
                                            min={today}
                                            max={maxDateStr}
                                            required
                                            className="bg-slate-50 border border-slate-200 h-10 md:h-11 rounded-lg text-xs md:text-sm font-bold text-slate-900 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner w-full"
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 font-medium px-1 flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse"></span>
                                    Visits available for the next 30 days
                                </p>
                            </div>

                            {/* 2. Contact Grid - More Dense */}
                            <div className="bg-white border border-slate-200/60 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-1.5 md:gap-2 mb-3 md:mb-4">
                                    <div className="bg-purple-50 p-1.5 rounded-lg md:rounded-xl">
                                        <BsPerson className="text-purple-600 w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </div>
                                    <h3 className="text-slate-500 font-medium text-[9px] md:text-[10px] uppercase tracking-wider md:tracking-widest">Contact Information</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <CustomInput
                                        name="name"
                                        label="FULL NAME"
                                        labelCls="font-medium text-[8px] md:text-[9px] text-slate-500 mb-1 tracking-widest uppercase"
                                        outerInptCls="bg-slate-50 border-slate-200 h-10 md:h-11 rounded-lg text-xs md:text-sm font-bold text-slate-900 px-3"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <CustomInput
                                        name="phone"
                                        label="PHONE NUMBER"
                                        labelCls="font-medium text-[8px] md:text-[9px] text-slate-500 mb-1 tracking-widest uppercase"
                                        outerInptCls="bg-slate-50 border-slate-200 h-10 md:h-11 rounded-lg text-xs md:text-sm font-bold text-slate-900 px-3"
                                        type="text"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* 3. Quote Summary Section - Compactized */}
                            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100">
                                <h2 className="text-slate-900 font-bold text-sm mb-3 md:mb-4">
                                    Quote Summary
                                </h2>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                        <span className="text-slate-500 text-xs font-medium">System Size</span>
                                        <span className="text-slate-900 text-xs font-bold">{quote.recommendedSystemSize} kW</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                        <span className="text-slate-500 text-xs font-medium">Estimated Cost</span>
                                        <span className="text-slate-900 text-xs font-bold">{formatIndianCurrency(quote.systemCost)}</span>
                                    </div>
                                </div>

                                {/* Cost Breakdown - More compact */}
                                <div className="mt-4 bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-3 md:p-4">
                                    <h3 className="text-emerald-700 font-bold text-xs mb-2 md:mb-3 flex items-center gap-2">
                                        <BsPiggyBank size={14} />
                                        Cost Breakdown
                                    </h3>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 text-[10px] md:text-xs">Site Visit Fee</span>
                                            <span className="text-slate-900 text-[11px] md:text-xs font-bold">₹199</span>
                                        </div>
                                        {quote.subsidy > 0 && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500 text-[10px] md:text-xs">Govt. Subsidy</span>
                                                <span className="text-emerald-600 text-[11px] md:text-xs font-bold">-{formatIndianCurrency(quote.subsidy)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-emerald-200/30">
                                            <span className="text-slate-900 text-[11px] md:text-xs font-medium">Effective Net Cost</span>
                                            <span className="text-[#3586FF] text-base md:text-lg font-bold tracking-tight">{formatIndianCurrency(quote.effectiveCost)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: EMI & Summary Case */}
                        <div className="lg:col-span-1 space-y-4">

                            {/* EMI Structure Card - Blended & Descriptive */}
                            <div className="bg-white border border-slate-200/60 rounded-xl md:rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-1.5 md:gap-2 mb-3">
                                    <div className="bg-emerald-50 p-1.5 rounded-lg md:rounded-xl">
                                        <BsPiggyBank className="text-emerald-600 w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </div>
                                    <h3 className="text-slate-500 font-medium text-[9px] md:text-[10px] uppercase tracking-wider md:tracking-widest">Financing Options</h3>
                                </div>

                                <div className="space-y-1">
                                    {/* Small Header labels for clarity */}
                                    <div className="flex justify-between items-center px-1 mb-1">
                                        <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">TENURE</span>
                                        <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest text-right">MONTHLY EMI</span>
                                    </div>

                                    {quote.emiOptions.map((option) => (
                                        <div
                                            key={option.tenure}
                                            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-50 bg-slate-50/30 hover:bg-white hover:border-slate-100 transition-all group"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-[11px] md:text-xs font-bold text-slate-900">{option.tenure} Months</span>
                                                <span className="text-[9px] text-slate-400 font-medium group-hover:text-[#3586FF] transition-colors">6% Annual Interest</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-baseline justify-end gap-1">
                                                    <span className="text-[#3586FF] text-sm md:text-base font-bold tracking-tight">{formatIndianCurrency(option.monthlyEmi)}</span>
                                                    <span className="text-slate-400 text-[9px] font-medium">/mo</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className=" border-t border-slate-50">
                                    <p className="text-[9px] text-slate-400 font-medium leading-relaxed italic opacity-80">
                                        * Subject to bank approval. EMI calculated on net cost of {formatIndianCurrency(quote.effectiveCost)}.
                                    </p>
                                </div>
                            </div>

                            {/* Sticky Checkout Box - Compact Finish */}
                            <div className="bg-gradient-to-br from-[#3586FF] to-[#1E40AF] rounded-xl md:rounded-2xl p-4 md:p-5 text-center shadow-lg shadow-blue-200/50 lg:sticky lg:top-24">
                                <h4 className="text-white font-bold text-sm md:text-lg mb-0.5 tracking-tight">Checkout Booking</h4>
                                <p className="text-blue-100 text-[9px] md:text-[10px] mb-4 opacity-80 leading-relaxed">
                                    Professional engineering report for your site analysis.
                                </p>

                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 mb-4 border border-white/10 text-left space-y-2">
                                    <div className="flex justify-between items-center text-[10px] text-blue-100 uppercase tracking-widest font-bold">
                                        <span>Visit Slot</span>
                                        <span className="text-white bg-white/20 px-1.5 py-0.5 rounded text-[9px]">
                                            {formData.preferredDate ? new Date(formData.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '--'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] text-blue-100 uppercase tracking-widest font-bold">
                                        <span>Visit Fee</span>
                                        <span className="text-white text-sm md:text-base">₹199</span>
                                    </div>
                                    <div className="h-px bg-white/10"></div>
                                    <div className="flex items-center gap-2 text-blue-100 text-[8px] font-medium leading-tight">
                                        <BsShieldCheck size={12} className="text-emerald-400" />
                                        Full engineering inspection included.
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    disabled={loading}
                                    onClick={handleAddToCart}
                                    className="w-full bg-white text-[#3586FF] font-bold py-3 rounded-lg md:rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-xs md:text-sm active:scale-95"
                                >
                                    {loading ? "Adding to Cart..." : <>Add to Cart <BsCart3 size={18} /></>}
                                </Button>

                                <p className="text-blue-200/30 text-[8px] mt-3 uppercase tracking-widest font-bold">
                                    Final Confirmation
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SolarBookingView;
