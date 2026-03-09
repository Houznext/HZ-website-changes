import React from "react";
import { CartItem } from "@/store/cart";
import { IoTrashOutline } from "react-icons/io5";
import { BsLightning, BsCalendar3, BsPerson, BsShieldCheck } from "react-icons/bs";
import { HiOutlineInformationCircle } from "react-icons/hi";
import Button from "@/common/Button";
import Image from "next/image";
import { DropDown } from "@/common/PopOver";

type SolarCartItemProps = {
    item: CartItem;
    onRemove: () => void;
};

const INR = (v: any) => `₹${Number(v ?? 0).toLocaleString("en-IN")}`;

const DetailRow = ({ label, value, colorClass = "text-[#0F172A]" }: { label: string; value: string; colorClass?: string }) => (
    <div className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
        <span className="text-[11px] text-[#64748B] font-medium uppercase tracking-wider">{label}</span>
        <span className={`text-[12px] font-bold ${colorClass}`}>{value}</span>
    </div>
);

export const SolarCartItem = ({ item, onRemove }: SolarCartItemProps) => {
    const meta = item.meta ?? {};
    const imgSrc = item.snapshot?.image || "/images/workflow/sitevisit.png";

    const preferredDate = meta.preferredDate
        ? new Date(meta.preferredDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
        : "Not set";

    return (
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:shadow-md">
            <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:gap-5 md:p-5">
                {/* Image Section */}
                <div className="relative h-[120px] w-full shrink-0 overflow-hidden rounded-lg bg-[#F8FAFC] md:h-[120px] md:w-[180px]">
                    <Image src={imgSrc} alt={item.name} fill className="object-cover" />
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md shadow-sm">
                        <span className="text-[10px] font-bold text-[#3586FF] uppercase tracking-tighter">Site Visit</span>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-1 flex-col gap-2.5">
                    {/* Header: Title & Status */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h3 className="text-[15px] md:text-[16px] font-semibold text-[#0F172A] leading-tight">
                                {item.name}
                            </h3>
                            <div className="mt-1.5 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#E0F2FE] px-2.5 py-1 text-[11px] font-medium text-[#0369A1]">
                                    <BsLightning className="text-[10px]" />
                                    Solar
                                </span>
                                {meta.systemSize && (
                                    <span className="text-[11px] font-medium text-[#64748B]">
                                        {meta.systemSize} kW System
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className="text-[11px] font-medium text-[#059669] sm:text-[12px] bg-[#ECFDF5] px-2 py-0.5 rounded-full md:bg-transparent md:p-0">
                            Service • Confirmed after payment
                        </span>
                    </div>

                    {/* Description */}
                    {item.description && (
                        <p className="text-[12px] text-[#64748B] leading-relaxed">
                            {item.description}
                        </p>
                    )}

                    {/* Quick Metadata Row */}
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-1 bg-slate-50/50 rounded-lg p-2.5 border border-slate-100/50">
                        <div className="flex items-center gap-1.5">
                            <BsCalendar3 className="text-[11px] text-[#3586FF]" />
                            <span className="text-[11px] text-[#475569] font-medium">Visit: <span className="text-[#0F172A] font-bold">{preferredDate}</span></span>
                        </div>
                        {meta.contactName && (
                            <div className="flex items-center gap-1.5">
                                <BsPerson className="text-[12px] text-[#3586FF]" />
                                <span className="text-[11px] text-[#475569] font-medium">Contact: <span className="text-[#0F172A] text-sm font-bold">{meta.contactName}</span></span>
                            </div>
                        )}
                    </div>

                    {/* Price & Breakdown Divider */}
                    <div className="mt-2 flex flex-col gap-4 border-t border-[#F1F5F9] pt-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-[12px] font-medium text-[#64748B]">Qty 1</span>

                            {/* Detailed Breakdown Popover */}
                            <DropDown
                                placement="top-start"
                                gapY={12}
                                buttonElement={
                                    <button className="flex items-center gap-1 text-[11px] font-bold text-[#3586FF] hover:bg-blue-50 px-2 py-1 rounded-md transition-all">
                                        <HiOutlineInformationCircle className="text-[14px]" />
                                        VIEW QUOTE DETAILS
                                    </button>
                                }
                            >
                                <div className="w-[280px] bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden">
                                    <div className="bg-[#F8FAFC] px-4 py-3 border-b border-slate-100">
                                        <h4 className="text-[13px] font-bold text-[#0F172A] flex items-center gap-2">
                                            <BsShieldCheck className="text-[#10B981]" />
                                            Solar Quote Breakdown
                                        </h4>
                                    </div>
                                    <div className="p-4">
                                        <DetailRow label="System Size" value={`${meta.systemSize} kW`} />
                                        <DetailRow label="Annual Generation" value={`${meta.annualGeneration} Units`} />
                                        <DetailRow label="Space Required" value={`${meta.spaceRequired} sq.ft`} />
                                        <DetailRow label="Estimated Cost" value={INR(meta.estimatedCost)} />
                                        {meta.subsidy > 0 && (
                                            <DetailRow label="Govt. Subsidy" value={`-${INR(meta.subsidy)}`} colorClass="text-[#059669]" />
                                        )}
                                        <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center font-bold">
                                            <span className="text-[11px] uppercase text-[#0F172A]">Net System Cost</span>
                                            <span className="text-[#3586FF] text-[14px]">{INR(meta.effectiveCost)}</span>
                                        </div>
                                    </div>
                                </div>
                            </DropDown>
                        </div>

                        <div className="flex flex-col items-start gap-1 md:items-end">
                            <div className="flex items-baseline gap-2">
                                <span className="text-[18px] font-bold text-[#3586FF] md:text-[20px]">
                                    {INR(item.sellingPrice)}
                                </span>
                            </div>
                            <p className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">Site visit fee only</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom action bar */}
            <div className="flex items-center gap-3 border-t border-[#F1F5F9] bg-[#FAFBFC] px-4 py-3">
                <Button
                    className="flex items-center gap-2 rounded-lg border border-[#FCA5A5] bg-white px-3 py-2 text-[12px] font-medium text-[#DC2626] hover:bg-[#FEF2F2] md:text-[13px] transition-colors"
                    onClick={onRemove}
                >
                    <IoTrashOutline className="text-sm" />
                    Remove
                </Button>
            </div>
        </div>
    );
};

export default SolarCartItem;
