import React from 'react';
import { Check, ChevronRight } from 'lucide-react';

const VerticalStepper = ({ steps, currentStep, scorePercentage, handleEdit }: any) => {
    const completionPercentage = Math.round((currentStep / steps.length) * 100);
    const circumference = 2 * Math.PI * 38;
    const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

    return (
        <div className="flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Steps Section - Now at Top */}
            <div className="bg-gradient-to-b from-white to-[#f8fafc] px-5 py-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                        Listing Steps
                    </h3>
                    <span className="text-xs font-semibold text-[#3586FF] bg-blue-50 px-2.5 py-1 rounded-full">
                        {currentStep}/{steps.length}
                    </span>
                </div>
                
                <ul className="space-y-0">
                    {steps.map((step: any, index: number) => {
                        const isCompleted = currentStep > index;
                        const isActive = currentStep === index;

                        return (
                            <li key={index} className="flex items-start group">
                                <div className="flex flex-col items-center">
                                    {/* Step Circle */}
                                    <div
                                        className={`
                                            relative w-9 h-9 flex items-center justify-center rounded-full 
                                            transition-all duration-400 
                                            ${isCompleted
                                                ? 'bg-gradient-to-br from-[#10B981] to-[#059669] text-white shadow-md shadow-green-200'
                                                : isActive
                                                    ? 'bg-[#3586FF] text-white shadow-lg shadow-blue-300 ring-4 ring-blue-100'
                                                    : 'bg-gray-100 border-2 border-gray-200 text-gray-400'
                                            }
                                        `}
                                    >
                                        {isCompleted ? (
                                            <Check size={16} strokeWidth={3} />
                                        ) : (
                                            <span className="font-bold text-xs">{index + 1}</span>
                                        )}
                                        {isActive && (
                                            <span className="absolute -right-1 -top-1 w-3 h-3 bg-[#ffdf00] rounded-full border-2 border-white animate-pulse" />
                                        )}
                                    </div>

                                    {/* Connector Line */}
                                    {index !== steps.length - 1 && (
                                        <div
                                            className={`
                                                w-0.5 h-10 my-1 transition-all duration-500 rounded-full
                                                ${isCompleted 
                                                    ? 'bg-gradient-to-b from-[#10B981] to-[#10B981]' 
                                                    : isActive 
                                                        ? 'bg-gradient-to-b from-[#3586FF] to-gray-200'
                                                        : 'bg-gray-200'
                                                }
                                            `}
                                        />
                                    )}
                                </div>

                                {/* Step Content */}
                                <div 
                                    className={`
                                        ml-3 flex-1 flex items-center justify-between min-h-[36px] py-1 px-3 rounded-lg
                                        transition-all duration-300 cursor-pointer
                                        ${isActive ? 'bg-blue-50/70' : 'hover:bg-gray-50'}
                                    `}
                                    onClick={() => isCompleted && handleEdit(index)}
                                >
                                    <div>
                                        <h4
                                            className={`
                                                font-semibold text-[13px] transition-colors duration-300
                                                ${isActive ? 'text-[#3586FF]' : isCompleted ? 'text-gray-700' : 'text-gray-400'}
                                            `}
                                        >
                                            {step.label}
                                        </h4>
                                        <p className={`text-[11px] mt-0.5 ${isActive ? 'text-[#3586FF]/70' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                                            {isCompleted ? '✓ Completed' : step.subtitle}
                                        </p>
                                    </div>
                                    {isCompleted && (
                                        <ChevronRight size={14} className="text-gray-400" />
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Progress Circle Section - Now at Bottom */}
            <div className="bg-gradient-to-br from-[#3586FF] via-[#2563eb] to-[#1d4ed8] px-5 py-6 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-8 -translate-y-8" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -translate-x-6 translate-y-6" />
                
                <div className="relative flex items-center gap-4">
                    {/* Circular Progress */}
                    <div className="relative flex-shrink-0">
                        <svg className="w-20 h-20 transform -rotate-90">
                            {/* Background circle */}
                            <circle
                                cx="40"
                                cy="40"
                                r="38"
                                stroke="rgba(255,255,255,0.15)"
                                strokeWidth="5"
                                fill="none"
                            />
                            {/* Progress circle */}
                            <circle
                                cx="40"
                                cy="40"
                                r="38"
                                stroke="url(#progressGradient)"
                                strokeWidth="5"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                fill="none"
                                className="transition-all duration-1000 ease-out"
                            />
                            <defs>
                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#4ADE80" />
                                    <stop offset="100%" stopColor="#22c55e" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <span className="text-xl font-bold text-white">{completionPercentage}%</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Score Info */}
                    <div className="text-white flex-1">
                        <p className="text-base font-bold leading-tight">Property Score</p>
                        <p className="text-xs text-white/70 leading-snug mt-1">
                            Better your property score, greater your visibility
                        </p>
                        {/* Mini progress bar */}
                        <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#4ADE80] to-[#22c55e] rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerticalStepper;
