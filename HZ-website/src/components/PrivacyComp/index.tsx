import React, { useState } from "react";
import {
    MdSecurity,
    MdInfo,
    MdStorage,
    MdShare,
    MdLock,
    MdSchedule,
    MdVerifiedUser,
    MdCookie,
    MdPublic,
    MdChildCare,
    MdUpdate,
    MdContactSupport,
    MdExpandMore,
    MdExpandLess,
    MdEmail,
    MdPhone,
    MdBusiness,
} from "react-icons/md";
import { FaHome, FaPaintBrush, FaHardHat } from "react-icons/fa";
import Button from "@/common/Button";
import Link from "next/link";

const PrivacyComp = () => {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
        {
            introduction: true,
        }
    );
    const [activeTab, setActiveTab] = useState<"all" | "realestate" | "interiors" | "construction">(
        "all"
    );

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }));
    };

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const tableOfContents = [
        { id: "introduction", title: "Introduction", icon: <MdInfo /> },
        { id: "collection", title: "Information We Collect", icon: <MdStorage /> },
        { id: "usage", title: "How We Use Your Information", icon: <MdVerifiedUser /> },
        { id: "sharing", title: "Sharing Your Information", icon: <MdShare /> },
        { id: "security", title: "Data Security", icon: <MdLock /> },
        { id: "retention", title: "Data Retention", icon: <MdSchedule /> },
        { id: "rights", title: "Your Rights", icon: <MdSecurity /> },
        { id: "cookies", title: "Cookies & Tracking", icon: <MdCookie /> },
        { id: "thirdparty", title: "Third-Party Services", icon: <MdPublic /> },
        { id: "international", title: "International Transfers", icon: <MdPublic /> },
        { id: "children", title: "Children's Privacy", icon: <MdChildCare /> },
        { id: "changes", title: "Policy Changes", icon: <MdUpdate /> },
        { id: "contact", title: "Contact Us", icon: <MdContactSupport /> },
    ];

    const CollapsibleSection: React.FC<{
        id: string;
        title: string;
        icon: React.ReactNode;
        children: React.ReactNode;
    }> = ({ id, title, icon, children, }) => (
        <div id={id} className="mb-6 scroll-mt-24">
            <Button
                onClick={() => toggleSection(id)}
                className={`w-full  rounded-xl p-2 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-between group`}
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/15 backdrop-blur-sm rounded-lg text-black text-2xl">
                        {icon}
                    </div>
                    <h2 className="md:text-[18px]  font-bold text-black text-left">
                        {title}
                    </h2>
                </div>
                <div className="text-white text-2xl group-hover:scale-110 transition-transform duration-300">
                    {expandedSections[id] ? <MdExpandLess /> : <MdExpandMore />}
                </div>
            </Button>

            {expandedSections[id] && (
                <div className="mt-4 bg-white rounded-xl shadow-md p-6 border border-slate-100 animate-slideDown">
                    {children}
                </div>
            )}
        </div>
    );

    const InfoCard: React.FC<{
        title: string;
        items: string[];
        variant?: "white";
    }> = ({ title, items, variant = "blue" }) => {
        const map = {
            blue: {
                wrapper: "from-blue-50 to-blue-100 border-blue-100",
                dot: "bg-white-500",
                bullet: "text-blue-500",
            },
            green: {
                wrapper: "from-green-50 to-green-100 border-green-100",
                dot: "bg-white-500",
                bullet: "text-green-500",
            },
            yellow: {
                wrapper: "from-yellow-50 to-yellow-100 border-yellow-100",
                dot: "bg-white-500",
                bullet: "text-yellow-500",
            },
            gray: {
                wrapper: "from-slate-50 to-slate-100 border-slate-200",
                dot: "bg-white-500",
                bullet: "text-slate-500",
            },
        }[variant];

        return (
            <div
                className={`bg-gradient-to-br  rounded-lg p-5 border hover:shadow-md transition-all duration-300`}
            >
                <h3 className="font-bold text-slate-800 text-lg mb-3 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full`}></span>
                    {title}
                </h3>
                <ul className="space-y-2">
                    {items.map((item, idx) => (
                        <li
                            key={idx}
                            className="text-slate-700 font-medium text-sm flex items-start gap-2"
                        >
                            <span className={` mt-1 font-bold`}>•</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
            <div className="bg-gradient-to-r from-gray-300 via-gray-500 to-gray-700 text-white">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <MdSecurity className="text-4xl md:text-5xl" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-6xl font-bold mb-2">
                                Privacy Policy
                            </h1>
                            <p className="text-blue-100 font-medium text-lg">
                                Transparent, secure, and customer-first privacy for all OneCasa
                                services.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-6">
                        <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                            Last Updated: November 23, 2025
                        </div>
                        <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                            Effective Immediately
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex gap-2 overflow-x-auto py-4 no-scrollbar">
                        <Button
                            onClick={() => setActiveTab("all")}
                            className={`px-6 py-3 rounded-lg font-bold text-sm whitespace-nowrap transition-all duration-300 ${activeTab === "all"
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            All Services
                        </Button>
                        <Button
                            onClick={() => setActiveTab("realestate")}
                            className={`px-6 py-3 rounded-lg font-bold text-sm whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${activeTab === "realestate"
                                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            <FaHome /> Real Estate
                        </Button>
                        <Button
                            onClick={() => setActiveTab("interiors")}
                            className={`px-6 py-3 rounded-lg font-bold text-sm whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${activeTab === "interiors"
                                ? "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            <FaPaintBrush /> Interiors
                        </Button>
                        <Button
                            onClick={() => setActiveTab("construction")}
                            className={`px-6 py-3 rounded-lg font-bold text-sm whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${activeTab === "construction"
                                ? "bg-gradient-to-r from-yellow-500 to-yellow-400 text-slate-900 shadow-md"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            <FaHardHat /> Construction
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white rounded-2xl shadow-md p-6 border border-slate-100">
                            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                                <MdInfo className="text-blue-600" />
                                Quick Navigation
                            </h3>
                            <nav className="space-y-2">
                                {tableOfContents.map((item) => (
                                    <Button
                                        key={item.id}
                                        onClick={() => scrollToSection(item.id)}
                                        className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-500 transition-all duration-300 flex items-center gap-3 group"
                                    >
                                        <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                                            {item.icon}
                                        </span>
                                        <span>{item.title}</span>
                                    </Button>
                                ))}
                            </nav>

                            <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border border-blue-100">
                                <p className="text-xs text-slate-600 font-medium mb-2">
                                    Have questions?
                                </p>
                                <Button
                                    onClick={() => scrollToSection("contact")}
                                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg text-sm font-bold hover:shadow-md transition-all duration-300 hover:scale-105"
                                >
                                    Contact Us
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <CollapsibleSection
                            id="introduction"
                            title="Introduction"
                            icon={<MdInfo />}
                        >
                            <div className="prose max-w-none">
                                <p className="text-slate-700 leading-relaxed font-medium text-lg mb-4">
                                    Welcome to{" "}
                                    <span className="font-bold text-blue-500">OneCasa</span>, your
                                    comprehensive platform for{" "}
                                    <span className="font-bold">
                                        real estate listings, interior design, and construction services
                                    </span>
                                    .
                                </p>
                                <div className="grid md:grid-cols-3 gap-4 mt-6">
                                    <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <FaHome className="text-4xl text-blue-600 mx-auto mb-2" />
                                        <h4 className="font-bold text-slate-800">Real Estate</h4>
                                        <p className="text-sm text-slate-600 font-medium mt-1">
                                            Buy, Sell &amp; Rent
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <FaPaintBrush className="text-4xl text-green-600 mx-auto mb-2" />
                                        <h4 className="font-bold text-slate-800">Interiors</h4>
                                        <p className="text-sm text-slate-600 font-medium mt-1">
                                            Design &amp; Furnishing
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <FaHardHat className="text-4xl text-yellow-500 mx-auto mb-2" />
                                        <h4 className="font-bold text-slate-800">Construction</h4>
                                        <p className="text-sm text-slate-600 font-medium mt-1">
                                            Build &amp; Renovate
                                        </p>
                                    </div>
                                </div>
                                <p className="text-slate-700 leading-relaxed font-medium mt-6">
                                    We value your privacy and are committed to protecting your personal
                                    information. This Privacy Policy explains how we collect, use, disclose,
                                    and safeguard your information when you use our services.
                                </p>
                            </div>
                        </CollapsibleSection>

                        {/* Information Collection */}
                        <CollapsibleSection
                            id="collection"
                            title="Information We Collect"
                            icon={<MdStorage />}
                        >
                            <div className="space-y-6">
                                <p className="text-slate-700 leading-relaxed font-medium">
                                    We collect different types of information to provide and improve our
                                    services:
                                </p>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <InfoCard
                                        title="Personal Information"
                                        variant="white"
                                        items={[
                                            "Full name, email, and phone number",
                                            "Optional identity or KYC documents",
                                            "Communication preferences",
                                            "Account and login-related details",
                                        ]}
                                    />
                                    <InfoCard
                                        title="Property Information"
                                        variant="white"
                                        items={[
                                            "Property search preferences",
                                            "Listing details and media",
                                            "Ownership-related documents (if shared)",
                                            "Site, location, and configuration details",
                                        ]}
                                    />
                                    <InfoCard
                                        title="Interior & Design Data"
                                        variant="white"
                                        items={[
                                            "Design preferences and style",
                                            "Room measurements and floor plans",
                                            "Budget preferences",
                                            "Material and product selections",
                                        ]}
                                    />
                                    <InfoCard
                                        title="Construction & Project Data"
                                        variant="white"
                                        items={[
                                            "Project specifications and phases",
                                            "Architectural / structural plans (if shared)",
                                            "Progress photos and daily logs",
                                            "Milestones and stage-wise updates",
                                        ]}
                                    />
                                    <InfoCard
                                        title="Transaction Records"
                                        variant="white"
                                        items={[
                                            "Payment confirmations and invoices",
                                            "Service orders and contracts",
                                            "Cost estimations and budgets",
                                            "Agreements related to services",
                                        ]}
                                    />
                                    <InfoCard
                                        title="Usage & Technical Data"
                                        variant="white"
                                        items={[
                                            "IP address, browser, and device info",
                                            "Pages visited and navigation patterns",
                                            "Approximate location (if permitted)",
                                            "Cookies and analytics data",
                                        ]}
                                    />
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* How We Use Information */}
                        <CollapsibleSection
                            id="usage"
                            title="How We Use Your Information"
                            icon={<MdVerifiedUser />}
                        >
                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border-l-4 border-blue-400">
                                    <h3 className="font-bold text-slate-800 text-lg mb-3 flex items-center gap-2">
                                        <FaHome className="text-blue-600" />
                                        Real Estate Services
                                    </h3>
                                    <ul className="space-y-2">
                                        {[
                                            "Facilitate property searches and listings",
                                            "Connect buyers, sellers, tenants, and owners",
                                            "Support documentation and transaction workflows",
                                            "Enable viewings, follow-ups, and negotiations",
                                        ].map((item, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-start gap-2 text-slate-700 font-medium"
                                            >
                                                <span className="text-blue-500 mt-1">✓</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-l-4 border-green-500">
                                    <h3 className="font-bold text-slate-800 text-lg mb-3 flex items-center gap-2">
                                        <FaPaintBrush className="text-green-600" />
                                        Interior Design Services
                                    </h3>
                                    <ul className="space-y-2">
                                        {[
                                            "Connect you with designers and experts",
                                            "Create proposals, layouts, and visual concepts",
                                            "Coordinate materials, furniture, and finishes",
                                            "Track project milestones and progress",
                                        ].map((item, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-start gap-2 text-slate-700 font-medium"
                                            >
                                                <span className="text-green-500 mt-1">✓</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-gradient-to-r from-yellow-50 to-slate-50 rounded-xl p-6 border-l-4 border-yellow-400">
                                    <h3 className="font-bold text-slate-800 text-lg mb-3 flex items-center gap-2">
                                        <FaHardHat className="text-yellow-500" />
                                        Construction Services
                                    </h3>
                                    <ul className="space-y-2">
                                        {[
                                            "Match you with verified contractors and teams",
                                            "Plan and track project timelines and budgets",
                                            "Coordinate approvals, documentation, and inspections",
                                            "Monitor project quality, safety, and deliverables",
                                        ].map((item, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-start gap-2 text-slate-700 font-medium"
                                            >
                                                <span className="text-yellow-500 mt-1">✓</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Sharing Information */}
                        <CollapsibleSection
                            id="sharing"
                            title="Sharing Your Information"
                            icon={<MdShare />}
                        >
                            <div className="space-y-4">
                                <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
                                    <p className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
                                        <MdLock />
                                        We Do Not Sell Your Personal Data
                                    </p>
                                    <p className="text-slate-700 font-medium text-sm">
                                        Your personal information is never sold or rented to third parties. We
                                        share it only where necessary and appropriate for service delivery or
                                        legal reasons.
                                    </p>
                                </div>

                                <p className="text-slate-700 font-medium">
                                    We may share your information in the following situations:
                                </p>

                                <div className="space-y-3">
                                    {[
                                        {
                                            title: "Service Providers",
                                            desc: "Real estate partners, interior designers, contractors, payment processors, and IT service providers working with us to deliver services.",
                                            icon: "🤝",
                                        },
                                        {
                                            title: "Transaction Parties",
                                            desc: "Other parties involved in your transaction (buyers, sellers, landlords, tenants, or their authorized representatives).",
                                            icon: "📋",
                                        },
                                        {
                                            title: "Public Listings",
                                            desc: "Property details that you explicitly choose to publish as part of public listings.",
                                            icon: "🏠",
                                        },
                                        {
                                            title: "Legal & Compliance",
                                            desc: "When required by law, regulators, or courts, or to protect our rights, safety, and that of our users.",
                                            icon: "⚖️",
                                        },
                                        {
                                            title: "Business Transfers",
                                            desc: "In connection with mergers, acquisitions, or restructuring of our business.",
                                            icon: "💼",
                                        },
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex gap-4 p-4 bg-slate-50 rounded-lg hover:shadow-md transition-all duration-300"
                                        >
                                            <span className="text-3xl">{item.icon}</span>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{item.title}</h4>
                                                <p className="text-sm text-slate-600 font-medium mt-1">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Data Security */}
                        <CollapsibleSection
                            id="security"
                            title="Data Security"
                            icon={<MdLock />}
                        >
                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-6 border-2 border-blue-100">
                                    <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                                        <MdLock className="text-blue-600" />
                                        Our Security Measures
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {[
                                            {
                                                icon: "🔐",
                                                title: "Encrypted Connections",
                                                desc: "SSL/TLS for data in transit between you and our servers.",
                                            },
                                            {
                                                icon: "🛡️",
                                                title: "Authentication Controls",
                                                desc: "Role-based access and secure authentication methods.",
                                            },
                                            {
                                                icon: "🔍",
                                                title: "Monitoring & Logs",
                                                desc: "Activity logging and monitoring of security events.",
                                            },
                                            {
                                                icon: "👥",
                                                title: "Access Governance",
                                                desc: "Restricted access to data on a need-to-know basis.",
                                            },
                                            {
                                                icon: "💾",
                                                title: "Backups & Recovery",
                                                desc: "Regular backups and disaster recovery planning.",
                                            },
                                            {
                                                icon: "📚",
                                                title: "Process & Policy",
                                                desc: "Internal guidelines around data handling and privacy.",
                                            },
                                        ].map((item, idx) => (
                                            <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                                                <div className="text-2xl mb-2">{item.icon}</div>
                                                <h4 className="font-bold text-slate-800 text-sm">
                                                    {item.title}
                                                </h4>
                                                <p className="text-xs text-slate-600 font-medium mt-1">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
                                    <p className="text-sm text-slate-700 font-medium">
                                        <strong>Note:</strong> While we implement industry-standard measures,
                                        no system is completely immune to risks. We continuously improve our
                                        security posture to protect your data.
                                    </p>
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Data Retention */}
                        <CollapsibleSection
                            id="retention"
                            title="Data Retention"
                            icon={<MdSchedule />}
                        >
                            <div className="space-y-4">
                                <p className="text-slate-700 font-medium">
                                    We keep your information only as long as necessary for legitimate
                                    business or legal purposes:
                                </p>
                                <div className="grid gap-3">
                                    {[
                                        {
                                            period: "While Account is Active",
                                            desc: "Core profile and account data.",
                                            variant: "blue" as const,
                                        },
                                        {
                                            period: "7–10 Years",
                                            desc: "Transaction and billing records (tax and compliance).",
                                            variant: "yellow" as const,
                                        },
                                        {
                                            period: "Project Lifecycle + Warranty",
                                            desc: "Construction and interior project details.",
                                            variant: "green" as const,
                                        },
                                        {
                                            period: "Case-by-Case",
                                            desc: "Support conversations and communication history.",
                                            variant: "gray" as const,
                                        },
                                    ].map((item, idx) => {
                                        const map = {
                                            blue: {
                                                badge: "bg-blue-100 text-blue-500",
                                                border: "border-blue-100",
                                            },
                                            green: {
                                                badge: "bg-green-100 text-green-700",
                                                border: "border-green-100",
                                            },
                                            yellow: {
                                                badge: "bg-yellow-100 text-yellow-800",
                                                border: "border-yellow-100",
                                            },
                                            gray: {
                                                badge: "bg-slate-100 text-slate-700",
                                                border: "border-slate-200",
                                            },
                                        }[item.variant];

                                        return (
                                            <div
                                                key={idx}
                                                className={`flex items-center justify-between p-4 bg-white rounded-lg border ${map.border}`}
                                            >
                                                <div>
                                                    <h4 className="font-bold text-slate-800">
                                                        {item.desc}
                                                    </h4>
                                                </div>
                                                <div className={`px-4 py-2 rounded-full text-xs font-bold ${map.badge}`}>
                                                    {item.period}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Your Rights */}
                        <CollapsibleSection
                            id="rights"
                            title="Your Rights & Choices"
                            icon={<MdSecurity />}
                        >
                            <div className="space-y-6">
                                <p className="text-slate-700 font-medium">
                                    Depending on your jurisdiction, you may have the following rights:
                                </p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {[
                                        {
                                            icon: "👁️",
                                            title: "Access & Portability",
                                            desc: "Request a copy of the data we hold about you.",
                                        },
                                        {
                                            icon: "✏️",
                                            title: "Correction",
                                            desc: "Ask us to correct inaccurate or incomplete information.",
                                        },
                                        {
                                            icon: "🗑️",
                                            title: "Deletion",
                                            desc: "Request deletion of your data, subject to legal obligations.",
                                        },
                                        {
                                            icon: "📧",
                                            title: "Marketing Preferences",
                                            desc: "Opt out of marketing emails or messages at any time.",
                                        },
                                        {
                                            icon: "⏸️",
                                            title: "Restrict Processing",
                                            desc: "Request that we limit certain uses of your data.",
                                        },
                                        {
                                            icon: "🚫",
                                            title: "Object",
                                            desc: "Object to specific types of processing where permitted by law.",
                                        },
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-5 border border-green-100 hover:shadow-md transition-all duration-300"
                                        >
                                            <div className="text-3xl mb-3">{item.icon}</div>
                                            <h4 className="font-bold text-slate-800 mb-2">
                                                {item.title}
                                            </h4>
                                            <p className="text-sm text-slate-600 font-medium">
                                                {item.desc}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-blue-50 rounded-lg p-5 border-l-4 border-blue-500">
                                    <p className="text-slate-700 font-medium">
                                        <strong>Response Time:</strong> We aim to respond to verified requests
                                        within 30 days. You can reach us using the details in the{" "}
                                        <Link
                                            href="#contact"
                                            className="text-blue-500 underline decoration-blue-300"
                                        >
                                            Contact Us
                                        </Link>{" "}
                                        section.
                                    </p>
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Cookies */}
                        <CollapsibleSection
                            id="cookies"
                            title="Cookies & Tracking Technologies"
                            icon={<MdCookie />}
                        >
                            <div className="space-y-4">
                                <p className="text-slate-700 font-medium">
                                    We use cookies and similar technologies for the following purposes:
                                </p>
                                <div className="space-y-3">
                                    {[
                                        {
                                            type: "Essential Cookies",
                                            desc: "Required for core website functionality, security, and basic features.",
                                            required: true,
                                            color: "yellow",
                                        },
                                        {
                                            type: "Performance Cookies",
                                            desc: "Help us understand how users interact with the site to improve performance.",
                                            required: false,
                                            color: "blue",
                                        },
                                        {
                                            type: "Functional Cookies",
                                            desc: "Remember preferences like language and saved filters.",
                                            required: false,
                                            color: "gray",
                                        },
                                        {
                                            type: "Advertising Cookies",
                                            desc: "Used for measuring and improving the effectiveness of our marketing.",
                                            required: false,
                                            color: "green",
                                        },
                                    ].map((item, idx) => {
                                        const map = {
                                            blue: {
                                                bg: "bg-blue-100",
                                                icon: "text-blue-600",
                                            },
                                            green: {
                                                bg: "bg-green-100",
                                                icon: "text-green-600",
                                            },
                                            yellow: {
                                                bg: "bg-yellow-100",
                                                icon: "text-yellow-700",
                                            },
                                            gray: {
                                                bg: "bg-slate-100",
                                                icon: "text-slate-600",
                                            },
                                        }[item.color as "blue" | "green" | "yellow" | "gray"];

                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg"
                                            >
                                                <div className={`p-2 ${map.bg} rounded-lg flex-shrink-0`}>
                                                    <MdCookie className={`${map.icon} text-xl`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-slate-800">
                                                            {item.type}
                                                        </h4>
                                                        {item.required && (
                                                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                                                                Required
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-600 font-medium">
                                                        {item.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                    <p className="text-sm text-slate-700 font-medium">
                                        You can manage cookies through your browser settings. Some features of
                                        the website may not function properly if certain cookies are disabled.
                                    </p>
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Third-Party Services */}
                        <CollapsibleSection
                            id="thirdparty"
                            title="Third-Party Services & Links"
                            icon={<MdPublic />}
                        >
                            <div className="space-y-4">
                                <div className="bg-slate-50 rounded-lg p-5 border-l-4 border-slate-400">
                                    <p className="text-slate-700 font-medium mb-3">
                                        Our platform integrates with third-party services, including:
                                    </p>
                                    <ul className="space-y-2">
                                        {[
                                            "Payment gateways for secure transactions",
                                            "Map and location services for property display",
                                            "Virtual tour or media hosting providers",
                                            "Analytics and performance monitoring tools",
                                            "Marketing and communication platforms",
                                        ].map((item, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-start gap-2 text-slate-700 font-medium"
                                            >
                                                <span className="text-slate-500 mt-1">•</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
                                    <p className="text-sm text-slate-700 font-medium">
                                        <strong>Note:</strong> We do not control the privacy practices of these
                                        third parties. Please review their respective privacy policies before
                                        sharing information with them.
                                    </p>
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* International Transfers */}
                        <CollapsibleSection
                            id="international"
                            title="International Data Transfers"
                            icon={<MdPublic />}
                        >
                            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                                <p className="text-slate-700 font-medium leading-relaxed">
                                    Your information may be transferred to and processed in countries other
                                    than your own. These locations may have different data protection laws.
                                    We take appropriate steps to ensure that your information remains
                                    protected in line with this Privacy Policy and applicable legal
                                    requirements.
                                </p>
                            </div>
                        </CollapsibleSection>

                        {/* Children's Privacy */}
                        <CollapsibleSection
                            id="children"
                            title="Children's Privacy"
                            icon={<MdChildCare />}
                        >
                            <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-500">
                                <div className="flex items-start gap-4">
                                    <MdChildCare className="text-4xl text-yellow-600 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg mb-3">
                                            Age Requirement: 18+
                                        </h3>
                                        <p className="text-slate-700 font-medium mb-3">
                                            OneCasa is intended for individuals aged 18 years and above. We do
                                            not knowingly collect personal information from children.
                                        </p>
                                        <p className="text-slate-700 font-medium">
                                            If you believe that a child has provided us with personal
                                            information, please contact us immediately so that we can delete
                                            such data from our systems.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Policy Changes */}
                        <CollapsibleSection
                            id="changes"
                            title="Changes to This Privacy Policy"
                            icon={<MdUpdate />}
                        >
                            <div className="space-y-4">
                                <p className="text-slate-700 font-medium">
                                    We may update this Privacy Policy periodically to reflect changes in our
                                    practices, services, or legal obligations. When we make significant
                                    changes:
                                </p>
                                <div className="grid md:grid-cols-3 gap-4">
                                    {[
                                        {
                                            icon: "📝",
                                            title: "Policy Update",
                                            desc: "We publish the revised Privacy Policy with a new 'Last Updated' date.",
                                        },
                                        {
                                            icon: "📧",
                                            title: "User Notification",
                                            desc: "We may notify you via email or in-app messages about important changes.",
                                        },
                                        {
                                            icon: "✅",
                                            title: "Consent (If Needed)",
                                            desc: "If required by law, we will seek your renewed consent.",
                                        },
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="text-center p-5 bg-slate-50 rounded-xl border border-slate-200"
                                        >
                                            <div className="text-3xl mb-3">{item.icon}</div>
                                            <h4 className="font-bold text-slate-800 mb-2">
                                                {item.title}
                                            </h4>
                                            <p className="text-sm text-slate-600 font-medium">
                                                {item.desc}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                    <p className="text-sm text-slate-700 font-medium">
                                        Your continued use of our services after changes to this Privacy Policy
                                        will be deemed as acceptance of the updated terms.
                                    </p>
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Contact Information */}
                        <CollapsibleSection
                            id="contact"
                            title="Contact Us"
                            icon={<MdContactSupport />}
                        >
                            <div className="space-y-6">
                                <p className="text-slate-700 font-medium text-lg">
                                    Have questions about this Privacy Policy or how we handle your data?
                                </p>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <Link
                                        href="mailto:admin@onecasa.in"
                                        className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl p-6 border-2 border-blue-100 hover:border-blue-400 transition-all duration-300 hover:shadow-md"
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <div className="p-4 bg-blue-600 rounded-full text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <MdEmail className="text-3xl" />
                                            </div>
                                            <h4 className="font-bold text-slate-800 mb-2">Email Us</h4>
                                            <p className="text-sm text-blue-500 font-bold break-all">
                                                admin@onecasa.in
                                            </p>
                                        </div>
                                    </Link>

                                    <Link
                                        href="tel:+918639820425"
                                        className="group bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl p-6 border-2 border-green-100 hover:border-green-400 transition-all duration-300 hover:shadow-md"
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <div className="p-4 bg-green-600 rounded-full text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <MdPhone className="text-3xl" />
                                            </div>
                                            <h4 className="font-bold text-slate-800 mb-2">Call Us</h4>
                                            <p className="text-sm text-green-700 font-bold">
                                                +91 86398 20425
                                            </p>
                                        </div>
                                    </Link>

                                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-slate-200">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="p-4 bg-slate-700 rounded-full text-white mb-4">
                                                <MdBusiness className="text-3xl" />
                                            </div>
                                            <h4 className="font-bold text-slate-800 mb-2">OneCasa</h4>
                                            <p className="text-sm text-slate-600 font-bold">
                                                Real Estate, Interiors &amp; Construction Platform
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-green-50 rounded-xl p-6 border border-slate-200">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                                <MdSchedule className="text-blue-600" />
                                                Business Hours
                                            </h4>
                                            <p className="text-sm text-slate-700 font-medium">
                                                Monday - Friday
                                                <br />
                                                9:00 AM - 6:00 PM IST
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                                <MdUpdate className="text-green-600" />
                                                Response Time
                                            </h4>
                                            <p className="text-sm text-slate-700 font-medium">
                                                We aim to respond to queries
                                                <br />
                                                within 48 hours.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Acknowledgment Footer */}
                        <div className="bg-gradient-to-r from-blue-400 via-blue-500  rounded-2xl p-8 text-white shadow-xl mt-8">
                            <div className="flex items-start gap-4">
                                <MdSecurity className="text-5xl flex-shrink-0" />
                                <div>
                                    <h3 className="text-2xl font-bold mb-3">Your Trust Matters</h3>
                                    <p className="font-medium label-text leading-relaxed mb-4">
                                        By using OneCasa s services, you acknowledge that you have read,
                                        understood, and agree to this Privacy Policy. We are committed to
                                        constantly improving our platform with your privacy and trust at the
                                        center.
                                    </p>
                                    <p className="text-sm label-text font-medium">
                                        If you do not agree with any part of this policy, please discontinue
                                        use of our services or contact us for clarifications.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    );
};

export default PrivacyComp;
