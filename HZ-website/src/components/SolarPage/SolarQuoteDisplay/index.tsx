import React from 'react';
import { useRouter } from 'next/router';
import Button from '@/common/Button';
import { SolarQuote, formatIndianCurrency } from '@/utils/solar/solarCalculations';
import { BsLightning, BsSun, BsCurrencyRupee, BsPiggyBank, BsHouseDoor, BsGeoAlt, BsBuilding } from 'react-icons/bs';

interface SolarQuoteDisplayProps {
    quote: SolarQuote;
    onBookSiteVisit?: () => void;
}

const SolarQuoteDisplay: React.FC<SolarQuoteDisplayProps> = ({ quote, onBookSiteVisit }) => {
    const router = useRouter();

    const handleProceedToBooking = () => {
        router.push('/solar/booking');
    };

    return (
        <div className="w-full bg-[#f8fbff] pt-8 md:pt-12 pb-2 md:pb-4 border-t border-slate-100 font-sans">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Refined Header - More Compact */}
                <div className="mb-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 tracking-tight">
                        Your Custom Solar Quote
                    </h2>
                    <p className="text-slate-500 text-[11px] md:text-xs max-w-2xl mx-auto leading-relaxed">
                        Based on your energy consumption, we've designed a system that maximizes your savings and efficiency.
                    </p>
                </div>

                {/* Strategic Layout - Unified Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-5 mb-5 md:mb-6">
                    {/* Left Column: Primary Impact - Unified Grid */}
                    <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4 content-start">
                        {/* Primary Stat: Savings - Spans 1/2 on mobile, 3/6 on md+ */}
                        <div className="col-span-1 md:col-span-3 bg-white border border-slate-200/60 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all h-full">
                            <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                                <div className="bg-emerald-50 p-1.5 md:p-2 rounded-lg md:rounded-xl">
                                    <BsPiggyBank className="text-emerald-600 w-4 h-4 md:w-5 md:h-5" />
                                </div>
                                <h3 className="text-slate-500 font-medium text-[10px] md:text-[10px] uppercase tracking-wider md:tracking-widest">Est. Annual Savings</h3>
                            </div>
                            <p className="text-slate-900 text-lg md:text-3xl font-bold">
                                {formatIndianCurrency(quote.estimatedAnnualSavings)}
                            </p>
                        </div>

                        {/* Primary Stat: System Size - Spans 1/2 on mobile, 3/6 on md+ */}
                        <div className="col-span-1 md:col-span-3 bg-white border border-slate-200/60 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all h-full">
                            <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                                <div className="bg-blue-50 p-1.5 md:p-2 rounded-lg md:rounded-xl">
                                    <BsLightning className="text-blue-600 w-4 h-4 md:w-5 md:h-5" />
                                </div>
                                <h3 className="text-slate-500 font-medium text-[10px] md:text-[10px] uppercase tracking-wider md:tracking-widest">Recommended Size</h3>
                            </div>
                            <p className="text-slate-900 text-lg md:text-3xl font-bold">
                                {quote.recommendedSystemSize} <span className="text-xs md:text-lg text-slate-400 font-medium tracking-normal">kW</span>
                            </p>
                        </div>

                        {/* Secondary Stats: Spans 1/2 on mobile, 2/6 on md+ */}
                        <div className="col-span-1 md:col-span-2">
                            <MetricCard
                                icon={<BsSun className="text-yellow-500 w-[14px] h-[14px] md:w-[18px] md:h-[18px]" />}
                                label="Annual Gen."
                                value={`${quote.annualGeneration.toLocaleString('en-IN')} kWh`}
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <MetricCard
                                icon={<BsGeoAlt className="text-cyan-500 w-[14px] h-[14px] md:w-[18px] md:h-[18px]" />}
                                label="Space Needed"
                                value={`${quote.spaceRequired} Sq.ft`}
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <MetricCard
                                icon={<BsCurrencyRupee className="text-orange-500 w-[14px] h-[14px] md:w-[18px] md:h-[18px]" />}
                                label="System Cost"
                                value={formatIndianCurrency(quote.systemCost)}
                            />
                        </div>

                        {/* Financial Summary: Full width on both */}
                        <div className="col-span-2 md:col-span-6 bg-white border border-slate-200/60 rounded-xl md:rounded-2xl p-3 md:p-6 shadow-sm">
                            <div className="flex flex-row md:flex-row justify-between items-center md:items-center gap-2 md:gap-4">
                                <div>
                                    <h3 className="text-slate-900 text-sm md:text-lg font-bold">Effective Ownership Cost</h3>
                                    <p className="text-slate-500 text-[9px] md:text-xs">Net investment after incentives and savings</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <p className="text-[#3586FF] text-xl md:text-3xl font-bold leading-tight md:leading-normal">
                                        {formatIndianCurrency(quote.effectiveCost)}
                                    </p>
                                    {quote.subsidy > 0 && (
                                        <p className="text-emerald-600 text-[8px] md:text-[10px] font-medium bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5">
                                            (Inc. {formatIndianCurrency(quote.subsidy)} Subsidy)
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Financing & CTA */}
                    <div className="space-y-3 md:space-y-4">
                        <div className="bg-white border border-slate-200/60 rounded-xl md:rounded-2xl p-3 md:p-6 shadow-sm">
                            <h3 className="text-slate-900 text-xs md:text-sm font-bold mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2">
                                <span className="bg-blue-50 p-1 md:p-1.5 rounded-lg">
                                    <BsCurrencyRupee className="text-[#3586FF] w-[14px] h-[14px] md:w-4 md:h-4" />
                                </span>
                                Flexible EMI @ 6%
                            </h3>
                            <div className="grid grid-cols-2 gap-2 md:block md:space-y-2">
                                {quote.emiOptions.map((option) => (
                                    <div key={option.tenure} className="flex justify-between items-center py-1 md:py-1.5 border-b border-slate-50 md:border-slate-100 last:border-0 hover:bg-slate-50 transition-colors rounded-xl md:px-2">
                                        <span className="text-slate-500 text-[10px] md:text-xs font-medium">{option.tenure}M</span>
                                        <span className="text-slate-900 text-[11px] md:text-sm font-bold">{formatIndianCurrency(option.monthlyEmi)}<span className="text-[9px] md:text-[10px] text-slate-400 font-normal ml-0.5">/mo</span></span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#3586FF] to-[#1E40AF] rounded-xl md:rounded-2xl p-4 md:p-6 text-center shadow-md md:shadow-lg md:shadow-blue-200">
                            <h4 className="text-white font-bold text-sm md:text-lg mb-0.5 md:mb-1">Book Site Visit</h4>
                            <p className="text-blue-50 text-[10px] md:text-[11px] mb-3 md:mb-4 opacity-90 leading-relaxed">Schedule an inspection for a detailed engineering report.</p>
                            <Button
                                onClick={handleProceedToBooking}
                                className="w-full bg-white text-[#3586FF] font-bold py-2 md:py-3 rounded-lg md:rounded-xl shadow-sm md:shadow-md hover:shadow-md md:hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-xs md:text-sm"
                            >
                                {quote.solarType === "residential" ? <BsHouseDoor className="w-[14px] h-[14px] md:w-[18px] md:h-[18px]" /> : <BsBuilding className="w-[14px] h-[14px] md:w-[18px] md:h-[18px]" />}
                                Proceed @ ₹199/-
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Even more dense MetricCard for mobile, restoring desktop
interface MetricCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value }) => {
    return (
        <div className="bg-white border border-slate-200/60 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col gap-2 md:gap-3 shadow-sm hover:shadow-md transition-all h-full">
            <div className="flex items-center gap-1.5 md:gap-2.5 text-slate-500 text-[10px] md:text-[11px] font-medium uppercase tracking-wider md:tracking-widest whitespace-nowrap">
                <span className="bg-slate-50 p-1 md:p-1.5 rounded-md md:rounded-lg">
                    {icon}
                </span>
                {label}
            </div>
            <p className="text-slate-900 text-sm md:text-xl font-bold tracking-tight">
                {value}
            </p>
        </div>
    );
};

export default SolarQuoteDisplay;
