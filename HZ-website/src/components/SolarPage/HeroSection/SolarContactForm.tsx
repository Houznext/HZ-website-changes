import Button from "@/common/Button";
import CustomInput from "@/common/FormElements/CustomInput";
import SingleSelect from "@/common/FormElements/SingleSelect";
import React, { useState } from "react";
import apiClient from "@/utils/apiClient";
import { MdSupportAgent } from "react-icons/md";
import toast from "react-hot-toast";
import { serviceOptions } from "@/utils/solar/solar-data";
import { SolarQuote, generateSolarQuote, formatIndianCurrency } from "@/utils/solar/solarCalculations";
import { useAuthUser } from "@/utils/useAuthUser";
import { useAuthModal } from "@/common/auth/AuthProvider";
import { useSolarStore } from "@/store/useSolarStore";

const solarTypeOptions = [
    { id: 1, name: "Residential", value: "residential" },
    { id: 2, name: "Commercial", value: "commercial" },
];

const residentialCategories = [
    { id: 1, name: "Rooftop Solar", value: "rooftop" },
    { id: 2, name: "Apartment/Community", value: "apartment" },
    { id: 3, name: "Solar CC Camera", value: "cc_camera" },
    { id: 4, name: "Digital Solar", value: "digital" },
];

const commercialCategories = [
    { id: 1, name: "Industrial Rooftop", value: "industrial" },
    { id: 2, name: "Warehouse / Storage", value: "warehouse" },
    { id: 3, name: "Educational Institute", value: "educational" },
    { id: 4, name: "Solar Parking", value: "parking" },
    { id: 5, name: "Solar Street Lights", value: "street_lights" },
];

const SolarContactForm = ({
    selectedId,
    onQuoteGenerated,
}: {
    selectedId: { id: number; service: string };
    onQuoteGenerated?: (quote: SolarQuote) => void;
}) => {
    const { openAuth } = useAuthModal();
    const { isAuthenticated } = useAuthUser();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phonenumber: "",
        electricityBill: "",
        solarType: "residential" as "residential" | "commercial",
        category: "rooftop",
        services: selectedId?.service || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated) {
            openAuth();
            return;
        }

        setLoading(true);

        const billAmount = parseFloat(formData.electricityBill);
        if (isNaN(billAmount) || billAmount <= 0) {
            toast.error("Please enter a valid electricity bill amount");
            setLoading(false);
            return;
        }

        const quote = generateSolarQuote(billAmount, formData.solarType, formData.category);

        try {
            const description = `Solar quote – ${quote.recommendedSystemSize} kW, ${quote.solarType} (${quote.category}), Effective cost ${formatIndianCurrency(quote.effectiveCost)}`;

            const payload = {
                name: formData.name.trim(),
                phonenumber: formData.phonenumber.trim(),
                serviceType: formData.services,
                description,
                solarType: formData.solarType,
                category: formData.category,
                monthlyBill: billAmount,
                solarQuote: {
                    solarType: quote.solarType,
                    category: quote.category,
                    monthlyBill: quote.monthlyBill,
                    recommendedSystemSize: quote.recommendedSystemSize,
                    annualGeneration: quote.annualGeneration,
                    spaceRequired: quote.spaceRequired,
                    systemCost: quote.systemCost,
                    subsidy: quote.subsidy,
                    effectiveCost: quote.effectiveCost,
                    estimatedAnnualSavings: quote.estimatedAnnualSavings,
                    emiOptions: quote.emiOptions,
                },
            };
            const res = await apiClient.post(apiClient.URLS.servicecustomlead, payload, true);

            if (res.status === 201) {
                useSolarStore.getState().setQuote(quote);
                toast.success("Quote generated successfully!");

                if (onQuoteGenerated) {
                    onQuoteGenerated(quote);
                }

                setFormData({
                    name: "",
                    phonenumber: "",
                    services: selectedId?.service || "",
                    electricityBill: "",
                    solarType: "residential",
                    category: "rooftop",
                });
            } else {
                toast.error("Failed to generate quote.");
            }
        } catch (error: any) {
            const status = error?.status ?? error?.response?.status;
            const body = error?.body ?? {};
            if (status === 409 && body?.existingLead) {
                const existing = body.existingLead;
                useSolarStore.getState().clearQuote();
                const snapshot = existing.solarQuoteSnapshot;
                const hasValidSnapshot =
                    snapshot &&
                    typeof snapshot.recommendedSystemSize === "number" &&
                    Array.isArray(snapshot.emiOptions);
                if (hasValidSnapshot) {
                    const existingQuote = snapshot as SolarQuote;
                    useSolarStore.getState().setQuote(existingQuote);
                    if (onQuoteGenerated) onQuoteGenerated(existingQuote);
                } else {
                    let monthlyBillVal = existing.monthlyBill != null ? Number(existing.monthlyBill) : NaN;
                    if (isNaN(monthlyBillVal) && typeof existing.description === "string") {
                        const match = existing.description.match(/Monthly Bill:.*?₹?([\d,]+)/);
                        if (match) monthlyBillVal = parseFloat(match[1].replace(/,/g, ""));
                    }
                    const solarTypeVal = (existing.solarType || "residential") as "residential" | "commercial";
                    const categoryVal = existing.category || "rooftop";
                    if (!isNaN(monthlyBillVal) && monthlyBillVal > 0) {
                        const existingQuote = generateSolarQuote(monthlyBillVal, solarTypeVal, categoryVal);
                        useSolarStore.getState().setQuote(existingQuote);
                        if (onQuoteGenerated) onQuoteGenerated(existingQuote);
                    }
                }
                setFormData({
                    name: "",
                    phonenumber: "",
                    services: selectedId?.service || "",
                    electricityBill: "",
                    solarType: "residential",
                    category: "rooftop",
                });
                toast("You already have a quote for these details. Showing your saved quote.", { icon: "📋" });
            } else {
                console.error("Error submitting lead:", error);
                toast.error("Something went wrong!");
            }
        } finally {
            setLoading(false);
        }
    };

    const validateInput = (name: string, value: string) => {
        switch (name) {
            case "name":
                return /^[A-Za-z\s]*$/.test(value);
            case "phonenumber":
                return /^[0-9]{0,10}$/.test(value);
            case "electricityBill":
                return /^[0-9]*$/.test(value);
            default:
                return true;
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        if (!validateInput(name, value)) return;
        setFormData({ ...formData, [name]: value });
    };

    const handleSelectChange = (selectedOption: { id: number; service: string }) => {
        setFormData({
            ...formData,
            services: selectedOption.service,
        });
    };

    const handleSolarTypeChange = (selectedOption: { id: number; name: string; value: string }) => {
        const newSolarType = selectedOption.value as "residential" | "commercial";
        setFormData({
            ...formData,
            solarType: newSolarType,
            category: newSolarType === "residential" ? "rooftop" : "industrial",
        });
    };

    const handleCategoryChange = (selectedOption: { id: number; name: string; value: string }) => {
        setFormData({
            ...formData,
            category: selectedOption.value,
        });
    };

    const isServiceFixed = selectedId?.service === "Interiors";

    return (
        <div className="rounded-[10px] shadow-custom-card bg-white p-6 font-sans">
            <p className="font-medium text-[#3586FF] flex items-center gap-2 text-xl mb-4">
                Get a free quote
            </p>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2">
                    <CustomInput
                        name="name"
                        label="Enter  Name"
                        labelCls="font-medium md:text-[14px] text-[12px] text-black"
                        type="text"
                        value={formData.name}
                        placeholder="John Doe"
                        onChange={handleInputChange}
                        required
                    />
                    <CustomInput
                        name="phonenumber"
                        label="Enter Phone Number"
                        labelCls="font-medium md:text-[14px] text-[12px] text-black"
                        type="number"
                        value={formData.phonenumber}
                        placeholder="88888XXXXX"
                        onChange={handleInputChange}
                        required
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="font-medium md:text-[14px] text-[12px] text-black mb-1 block">
                                Solar Type
                            </label>
                            <SingleSelect
                                type="single-select"
                                name="solarType"
                                optionCls="text-[12px] font-medium"
                                options={solarTypeOptions}
                                selectedOption={solarTypeOptions.find(opt => opt.value === formData.solarType) || solarTypeOptions[0]}
                                optionsInterface={{ isObj: true, displayKey: "name" }}
                                handleChange={(name, value) => handleSolarTypeChange(value)}
                            />
                        </div>

                        <div>
                            <label className="font-medium md:text-[14px] text-[12px] text-black mb-1 block">
                                Category
                            </label>
                            <SingleSelect
                                type="single-select"
                                name="category"
                                optionCls="text-[12px] font-medium"
                                options={formData.solarType === "residential" ? residentialCategories : commercialCategories}
                                selectedOption={(formData.solarType === "residential" ? residentialCategories : commercialCategories).find(opt => opt.value === formData.category) || (formData.solarType === "residential" ? residentialCategories[0] : commercialCategories[0])}
                                optionsInterface={{ isObj: true, displayKey: "name" }}
                                handleChange={(name, value) => handleCategoryChange(value)}
                            />
                        </div>
                    </div>

                    <CustomInput
                        name="electricityBill"
                        label="Monthly Electricity Bill"
                        labelCls="font-medium md:text-[14px] text-[12px] text-black"
                        type="number"
                        value={formData.electricityBill}
                        placeholder="e.g. 2500"
                        onChange={handleInputChange}
                        required
                    />

                    <div className="hidden">
                        <SingleSelect
                            type="single-select"
                            name="services"
                            optionCls="text-[12px] font-medium"
                            options={serviceOptions}
                            selectedOption={selectedId}
                            optionsInterface={{ isObj: true, displayKey: "service" }}
                            handleChange={(name, value) => {
                                if (!isServiceFixed) handleSelectChange(value);
                            }}
                            buttonCls={
                                isServiceFixed ? "opacity-60 pointer-events-none" : ""
                            }
                            openButtonCls={isServiceFixed ? "pointer-events-none" : ""}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className={`bg-[#3586FF] md:text-[16px] text-[14px] text-white font-medium py-2 rounded-[6px] mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Submitting...' : 'Get Free Quote'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
export default SolarContactForm;
