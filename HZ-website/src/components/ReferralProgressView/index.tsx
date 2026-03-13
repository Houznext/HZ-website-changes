"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { LuCopy, LuChevronLeft, LuChevronRight } from "react-icons/lu";

import Button from "@/common/Button";
import CustomInput from "@/common/FormElements/CustomInput";
import apiClient from "@/utils/apiClient";
import Loader from "../Loader";
import ReusableSearchFilter from "@/common/SearchFilter";
import { generateSlug } from "@/utils/helpers";
import { getLookingTypePath } from "@/components/Property/PropertyDetails/PropertyHelpers";
import { MdWhatsapp } from "react-icons/md";
import {
  Phone,
  LayoutGrid,
  List,
  TrendingUp,
  DollarSign,
  Eye,
  Share2,
  Trash2,
  MapPin,
  Home,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  Award,
  Users,
  Building2,
  Star,
} from "lucide-react";

/* ─────────────────────────── TYPES ─────────────────────────── */

type ReferralCaseStatus = "OPEN" | "WON" | "LOST" | "CANCELLED";
type ViewMode = "list" | "grid";

enum BrokerageModel {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
  PER_SQFT = "PER_SQFT",
  PER_SQYD = "PER_SQYD",
  PER_ACRE = "PER_ACRE",
}

type ReferralCase = {
  id: number | string;
  currentStep: number;
  status: ReferralCaseStatus;
  referralCode: any;
  step1Date?: string | null;
  step2Date?: string | null;
  step3Date?: string | null;
  step4Date?: string | null;
  step5Date?: string | null;
  amountText?: string;
  brokerageModel?: string;
  brokerageValue?: number;
  referrerSharePercent?: number;
  expectedEarningText?: string;
  property?: {
    propertyId: number;
    basicDetails?: { title?: string; lookingType?: string };
    locationDetails?: { city?: string; locality?: string; subLocality: string };
    propertyDetails?: any;
    mediaDetails?: {
      propertyImages?: Array<{ url: string; isPrimary?: boolean } | string>;
    };
    referralAgreements?: any;
  };
};

/* ─────────────────────────── CONFIG ─────────────────────────── */

const HELPLINE_NUMBER = "+91 90000 00000";
const HELPLINE_TEL = "tel:+919000000000";
const HELPLINE_WHATSAPP =
  "https://wa.me/919000000000?text=Hi%20Houznext%2C%20I%20need%20help%20with%20my%20referral.";

const STEPS = [
  "Calling & Informing",
  "Site Visit & Confirmation",
  "Finances",
  "Advance Payment",
  "Registration",
];

const stepLabelFromNumber = (step: number) =>
  STEPS[Math.max(step - 1, 0)] ?? "-";

const formatDate = (d?: string | null) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

/** Format price for display (e.g. ₹72 Lakhs, ₹1.85 Cr) */
const formatAmountDisplay = (amount?: number | null): string => {
  if (amount == null || Number.isNaN(Number(amount))) return "-";
  const n = Number(amount);
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(0)} Lakhs`;
  return formatCurrency(n);
};

/** Normalize API referral case: ensure id, step dates as string, amountText from property, first image URL */
function normalizeReferralCase(raw: any): ReferralCase {
  const prop = raw?.property;
  const pricing = prop?.propertyDetails?.pricingDetails;
  const expectedPrice =
    pricing?.expectedPrice ?? pricing?.maxPriceOffer ?? pricing?.minPriceOffer;
  const firstImg = prop?.mediaDetails?.propertyImages?.[0];
  const imgUrl = typeof firstImg === "string" ? firstImg : firstImg?.url;

  return {
    ...raw,
    id: raw?.id ?? raw?.referralCaseId,
    step1Date:
      raw?.step1Date != null
        ? typeof raw.step1Date === "string"
          ? raw.step1Date
          : new Date(raw.step1Date).toISOString()
        : null,
    step2Date:
      raw?.step2Date != null
        ? typeof raw.step2Date === "string"
          ? raw.step2Date
          : new Date(raw.step2Date).toISOString()
        : null,
    step3Date:
      raw?.step3Date != null
        ? typeof raw.step3Date === "string"
          ? raw.step3Date
          : new Date(raw.step3Date).toISOString()
        : null,
    step4Date:
      raw?.step4Date != null
        ? typeof raw.step4Date === "string"
          ? raw.step4Date
          : new Date(raw.step4Date).toISOString()
        : null,
    step5Date:
      raw?.step5Date != null
        ? typeof raw.step5Date === "string"
          ? raw.step5Date
          : new Date(raw.step5Date).toISOString()
        : null,
    amountText: raw?.amountText ?? formatAmountDisplay(expectedPrice),
    property: prop
      ? {
          ...prop,
          propertyId: prop?.propertyId || prop?.id,
          mediaDetails: prop.mediaDetails
            ? {
                ...prop.mediaDetails,
                propertyImages: imgUrl
                  ? [imgUrl]
                  : prop.mediaDetails.propertyImages,
              }
            : undefined,
        }
      : undefined,
  };
}

/* ─────────────────────────── STATUS CONFIG ─────────────────────────── */

const statusConfig: Record<
  string,
  { bg: string; text: string; icon: any; label: string }
> = {
  OPEN: {
    bg: "bg-amber-50 border-amber-300",
    text: "text-amber-700",
    icon: Clock,
    label: "In Progress",
  },
  WON: {
    bg: "bg-green-50 border-green-200",
    text: "text-green-700",
    icon: CheckCircle2,
    label: "Won",
  },
  LOST: {
    bg: "bg-red-50 border-red-200",
    text: "text-red-600",
    icon: XCircle,
    label: "Lost",
  },
  CANCELLED: {
    bg: "bg-gray-50 border-gray-200",
    text: "text-gray-500",
    icon: XCircle,
    label: "Cancelled",
  },
};

/* ─────────────────────────── STEPPER ─────────────────────────── */

function StepperPro({
  currentStep,
  stepDates,
}: {
  currentStep: number;
  stepDates: Array<string | null | undefined>;
}) {
  const safeStep = Math.min(Math.max(currentStep || 1, 1), 5);

  return (
    <div className="w-full mt-6 mb-2">
      {/* Desktop stepper */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Track */}
          <div className="absolute top-[20px] left-[10%] right-[10%] h-[3px] bg-gray-200 rounded-full" />
          <div
            className="absolute top-[20px] left-[10%] h-[3px] bg-gradient-to-r from-[#3586FF] to-[#60a5fa] rounded-full transition-all duration-700"
            style={{ width: `${((safeStep - 1) / 4) * 80}%` }}
          />

          <div className="flex justify-between items-start relative">
            {STEPS.map((label, idx) => {
              const stepNo = idx + 1;
              const isDone = stepNo < safeStep;
              const isActive = stepNo === safeStep;

              return (
                <div key={label} className="flex flex-col items-center w-[20%]">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold z-10 transition-all duration-300 ${
                      isDone
                        ? "bg-gradient-to-br from-[#3586FF] to-[#2563eb] text-white shadow-md shadow-blue-200"
                        : isActive
                          ? "bg-white border-[3px] border-[#3586FF] text-[#3586FF] shadow-lg shadow-blue-100"
                          : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : stepNo}
                  </div>

                  <div
                    className={`mt-2.5 text-[13px] text-center leading-tight font-medium ${
                      isActive
                        ? "text-[#3586FF]"
                        : isDone
                          ? "text-gray-700"
                          : "text-gray-400"
                    }`}
                  >
                    {label}
                  </div>

                  <div className="text-[11px] text-gray-400 mt-1 text-center">
                    {formatDate(stepDates[idx])}
                  </div>

                  {isActive && (
                    <div className="mt-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200">
                      <span className="text-[10px] font-semibold text-[#3586FF]">
                        Current
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile stepper - vertical */}
      <div className="md:hidden space-y-0">
        {STEPS.map((label, idx) => {
          const stepNo = idx + 1;
          const isDone = stepNo < safeStep;
          const isActive = stepNo === safeStep;
          const isLast = idx === STEPS.length - 1;

          return (
            <div key={label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${
                    isDone
                      ? "bg-[#3586FF] text-white"
                      : isActive
                        ? "bg-white border-[2px] border-[#3586FF] text-[#3586FF]"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {isDone ? "✓" : stepNo}
                </div>
                {!isLast && (
                  <div
                    className={`w-[2px] h-8 my-1 ${
                      isDone ? "bg-[#3586FF]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
              <div className="pb-4">
                <p
                  className={`text-[13px] font-medium ${
                    isActive
                      ? "text-[#3586FF]"
                      : isDone
                        ? "text-gray-800"
                        : "text-gray-400"
                  }`}
                >
                  {label}
                </p>
                <p className="text-[11px] text-gray-400">
                  {formatDate(stepDates[idx])}
                  {isActive && (
                    <span className="ml-2 text-[#3586FF] font-medium">
                      In progress
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────── CARD ─────────────────────────── */

function ReferralCard({
  item,
  view,
  onOpenDetails,
}: {
  item: ReferralCase;
  view: ViewMode;
  onOpenDetails: () => void;
}) {
  const img: string =
    typeof item?.property?.mediaDetails?.propertyImages?.[0] === "string"
      ? (item.property.mediaDetails.propertyImages[0] as string)
      : "/images/referralprogress/referral1.png";

  const title = item.property?.propertyDetails?.propertyName || "-";
  const city = item.property?.locationDetails?.city || "-";
  const locality =
    item.property?.locationDetails?.locality ||
    item.property?.locationDetails?.subLocality ||
    "-";

  const cfg = statusConfig[item.status] || statusConfig.OPEN;
  const StatusIcon = cfg.icon;
  const progressPct = ((item.currentStep - 1) / 4) * 100;

  const isOpen = item.status === "OPEN";

  return (
    <div
      onClick={onOpenDetails}
      className={`group rounded-2xl border cursor-pointer transition-all duration-300 hover:shadow-xl overflow-hidden ${
        isOpen
          ? "border-amber-300 bg-amber-50/40 hover:shadow-amber-200/40 hover:border-amber-400"
          : "border-gray-200/80 bg-white hover:shadow-gray-200/50 hover:border-gray-300/80"
      }`}
    >
      {/* Progress bar accent */}
      <div className="h-1 bg-gray-100">
        <div
          className={`h-full transition-all duration-500 ${
            isOpen
              ? "bg-gradient-to-r from-amber-400 to-amber-500"
              : "bg-gradient-to-r from-[#3586FF] to-[#60a5fa]"
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className={`p-4 md:p-5 ${view === "grid" ? "" : ""}`}>
        <div
          className={
            view === "grid"
              ? "flex flex-col gap-4"
              : "flex flex-col md:flex-row md:items-center justify-between gap-4"
          }
        >
          {/* Left: Image + Info */}
          <div className="flex items-center gap-4">
            <div className="relative w-[110px] md:w-[130px] h-[75px] md:h-[85px] rounded-xl overflow-hidden shrink-0 ring-1 ring-gray-200/80">
              <Image
                src={img}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <h3 className="text-[15px] md:text-[16px] font-semibold text-gray-900 truncate">
                {title}
              </h3>
              <div className="flex items-center gap-1 text-[12px] md:text-[13px] text-gray-500">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">
                  {locality}, {city}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[12px] text-gray-400">
                <Home className="w-3 h-3 shrink-0" />
                {item?.property?.propertyDetails?.propertyType}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] md:text-[11px] font-semibold border ${cfg.bg} ${cfg.text}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {cfg.label}
                </span>
                <span className="text-[10px] md:text-[11px] text-gray-400 font-medium">
                  Step {item.currentStep}/5
                </span>
              </div>
            </div>
          </div>

          {/* Right: Amount + Step + Action */}
          <div className="flex items-center gap-6 md:gap-8">
            <div className="min-w-[100px]">
              <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                Amount
              </div>
              <div className="text-[15px] font-bold text-gray-900">
                {item.amountText ?? "-"}
              </div>
            </div>

            <div className="hidden md:block min-w-[160px]">
              <div className="text-[13px] font-semibold text-[#3586FF]">
                {stepLabelFromNumber(item.currentStep)}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                Step {item.currentStep} of 5
              </div>
            </div>

            <button
              className="shrink-0 w-9 h-9 rounded-full bg-gray-100 hover:bg-[#3586FF] hover:text-white text-gray-500 flex items-center justify-center transition-all duration-200"
              aria-label="View details"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── SUMMARY CARD ─────────────────────────── */

const SummaryCard = ({
  icon,
  label,
  value,
  color,
  bgGrad,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  bgGrad: string;
}) => (
  <div
    className={`relative overflow-hidden rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm ${bgGrad}`}
  >
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-gray-500 text-[11px] md:text-[12px] font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className={`md:text-2xl text-xl font-bold mt-1 ${color}`}>{value}</p>
      </div>
      <div
        className={`p-2.5 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm`}
      >
        {icon}
      </div>
    </div>
  </div>
);

/* ═══════════════════════════ MAIN ═══════════════════════════ */

export default function ReferralProgressView() {
  const router = useRouter();
  const session = useSession();
  const userId = session?.data?.user?.id;

  const [loading, setLoading] = useState(false);
  const [referrals, setReferrals] = useState<ReferralCase[]>([]);
  const [cancellingId, setCancellingId] = useState<string | number | null>(
    null,
  );

  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<any>({
    status: {},
    step: {},
  });

  const filtersConfig = useMemo(
    () => [
      {
        groupLabel: "Status",
        key: "status",
        options: [
          { id: "OPEN", label: "In Progress" },
          { id: "WON", label: "Won" },
          { id: "LOST", label: "Lost" },
          { id: "CANCELLED", label: "Cancelled" },
        ],
      },
      {
        groupLabel: "Step",
        key: "step",
        options: STEPS.map((s, i) => ({
          id: String(i + 1),
          label: `Step ${i + 1} – ${s}`,
        })),
      },
    ],
    [],
  );

  /* ─── Fetch ─── */
  const fetchReferrals = async () => {
    if (!userId) {
      setReferrals([]);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.referandearn}/referrals/my/${userId}`,
        {},
        true,
      );
      if (res?.status === 200 && Array.isArray(res.body)) {
        const list = (res.body as any[]).map(normalizeReferralCase);
        setReferrals(list);
      } else {
        setReferrals([]);
      }
    } catch (err) {
      console.error("Failed to fetch referrals:", err);
      toast.error("Failed to load your referrals");
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [userId]); // eslint-disable-line

  /* ─── Filtered ─── */
  const filteredReferrals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const selectedStatus = Object.keys(selectedFilters.status || {}).filter(
      (k) => selectedFilters.status[k],
    );
    const selectedSteps = Object.keys(selectedFilters.step || {}).filter(
      (k) => selectedFilters.step[k],
    );

    return referrals.filter((r) => {
      const title = (
        r.property?.propertyDetails?.propertyName ||
        r.property?.basicDetails?.title ||
        ""
      ).toLowerCase();
      const city = (r.property?.locationDetails?.city || "").toLowerCase();
      const locality = (
        r.property?.locationDetails?.locality ||
        r.property?.locationDetails?.subLocality ||
        ""
      ).toLowerCase();

      const matchesSearch =
        !q || title.includes(q) || city.includes(q) || locality.includes(q);
      const matchesStatus =
        selectedStatus.length === 0 || selectedStatus.includes(r.status);
      const matchesStep =
        selectedSteps.length === 0 ||
        selectedSteps.includes(String(r.currentStep));

      return matchesSearch && matchesStatus && matchesStep;
    });
  }, [referrals, searchQuery, selectedFilters]);

  /* ─── Stats ─── */
  const stats = useMemo(() => {
    const total = referrals.length;
    const won = referrals.filter((r) => r.status === "WON").length;
    const inProgress = referrals.filter((r) => r.status === "OPEN").length;
    const avgStep = total
      ? (referrals.reduce((s, r) => s + r.currentStep, 0) / total).toFixed(1)
      : "0";
    return { total, won, inProgress, avgStep };
  }, [referrals]);

  const selected = useMemo(
    () => referrals.find((r) => r.id === selectedId) ?? null,
    [referrals, selectedId],
  );

  const selectedIndex = useMemo(() => {
    if (!selected) return -1;
    return filteredReferrals.findIndex((x) => x.id === selected.id);
  }, [filteredReferrals, selected]);

  /* ─── Details helpers ─── */
  const referralCode = useMemo(() => {
    if (!selected?.referralCode) return "";
    try {
      const parsed = JSON.parse(selected.referralCode);
      return parsed?.referralCode?.toString() ?? "";
    } catch {
      return "";
    }
  }, [selected]);

  const stepDates = selected
    ? [
        selected.step1Date,
        selected.step2Date,
        selected.step3Date,
        selected.step4Date,
        selected.step5Date,
      ]
    : [];

  const activeAgreement = useMemo(
    () =>
      selected?.property?.referralAgreements?.find(
        (a: any) => a.status === "ACTIVE",
      ),
    [selected],
  );

  const brokerageText = useMemo(() => {
    if (!activeAgreement?.brokerageModel) return "-";
    const v = activeAgreement.brokerageValue;
    switch (activeAgreement.brokerageModel) {
      case BrokerageModel.FIXED_AMOUNT:
        return formatCurrency(v);
      case BrokerageModel.PERCENTAGE:
        return `${Number(v)}%`;
      case BrokerageModel.PER_SQFT:
        return `${formatCurrency(v)}/sqft`;
      case BrokerageModel.PER_SQYD:
        return `${formatCurrency(v)}/sqyd`;
      case BrokerageModel.PER_ACRE:
        return `${formatCurrency(v)}/acre`;
      default:
        return "-";
    }
  }, [activeAgreement]);

  const referrerShareText = useMemo(
    () =>
      activeAgreement?.referrerSharePercent
        ? `${activeAgreement.referrerSharePercent}%`
        : "-",
    [activeAgreement],
  );

  const isMinApplicable = (m?: string) =>
    m === BrokerageModel.PERCENTAGE ||
    m === BrokerageModel.PER_SQFT ||
    m === BrokerageModel.PER_SQYD ||
    m === BrokerageModel.PER_ACRE;

  const expectedEarningText = useMemo(() => {
    if (!activeAgreement) return "-";
    const {
      brokerageModel,
      brokerageValue,
      minBrokerageAmount,
      referrerSharePercent,
      referrerMaxCredits,
    } = activeAgreement;
    if (!brokerageValue || !referrerSharePercent) return "-";
    let amount = Number(brokerageValue);
    if (
      isMinApplicable(brokerageModel) &&
      minBrokerageAmount &&
      amount < Number(minBrokerageAmount)
    ) {
      amount = Number(minBrokerageAmount);
    }
    let earning = (amount * Number(referrerSharePercent)) / 100;
    if (referrerMaxCredits && earning > Number(referrerMaxCredits)) {
      earning = Number(referrerMaxCredits);
    }
    return formatCurrency(earning);
  }, [activeAgreement]);

  const copyCode = async () => {
    if (!referralCode) return;
    await navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied!");
  };

  const closeDetails = () => setSelectedId(null);
  const gotoPrev = () => {
    if (selectedIndex > 0)
      setSelectedId(filteredReferrals[selectedIndex - 1].id);
  };
  const gotoNext = () => {
    if (selectedIndex < filteredReferrals.length - 1)
      setSelectedId(filteredReferrals[selectedIndex + 1].id);
  };

  /** Build property details URL for the selected referral's property */
  const propertyDetailsPath = useMemo(() => {
    if (!selected?.property) return null;
    const prop = selected.property;
    const propertyId = prop?.propertyId ;
    
    if (!propertyId) return null;
    
    const lookingType =
      getLookingTypePath(prop?.basicDetails?.lookingType) || "buy";
    const city = prop?.locationDetails?.city || "hyderabad";
    const slug = generateSlug(
      prop?.propertyDetails?.propertyName ||
        prop?.basicDetails?.title ||
        "property",
    );
    return `/properties/${lookingType}/${city}/details/${slug}?id=${propertyId}&type=property`;
  }, [selected?.property]);

  const handleViewProperty = () => {
    if (propertyDetailsPath) {
      try {
        router.push(propertyDetailsPath);
      } catch (err) {
        console.error("Error navigating to property:", err);
        toast.error("Failed to navigate to property");
      }
    } else {
      console.warn("Property link not available:", { selected, propertyDetailsPath });
      toast.error("Property link not available");
    }
  };

  const handleShare = async () => {
    if (!propertyDetailsPath) {
      toast.error("Share link not available");
      return;
    }
    const fullUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${propertyDetailsPath}`
        : propertyDetailsPath;
    const shareTitle =
      selected?.property?.propertyDetails?.propertyName ||
      selected?.property?.basicDetails?.title ||
      "Property";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: shareTitle,
          url: fullUrl,
          text: `Check out this property: ${shareTitle}`,
        });
        toast.success("Shared successfully");
      } else {
        await navigator.clipboard.writeText(fullUrl);
        toast.success("Link copied to clipboard");
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        await navigator.clipboard.writeText(fullUrl).catch(() => {});
        toast.success("Link copied to clipboard");
      }
    }
  };

  const handleCancelReferral = async () => {
    if (!selected) return;
    if (selected.status !== "OPEN") {
      toast.error("Only in-progress referrals can be cancelled");
      return;
    }
    setCancellingId(selected.id);
    try {
      await apiClient.delete(
        `${apiClient.URLS.referandearn}/referrals/${selected.id}`,
        {},
        true,
      );
      toast.success("Referral cancelled");
      closeDetails();
      fetchReferrals();
    } catch (err: any) {
      const msg =
        err?.body?.message || err?.message || "Failed to cancel referral";
      toast.error(msg);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (userId == null) {
    return (
      <div className="flex flex-col gap-5 md:px-6 px-4 py-5 w-full max-w-[1700px] mx-auto">
        <h1 className="text-[22px] md:text-[26px] font-bold text-gray-900 tracking-tight">
          Referral Progress
        </h1>
        <div className="text-center py-16">
          <Building2 className="mx-auto w-14 h-14 text-gray-300 mb-3" />
          <h3 className="text-gray-700 font-semibold text-lg">Please log in</h3>
          <p className="text-gray-400 text-sm mt-1">
            Log in to view your referral progress and track your referrals.
          </p>
        </div>
      </div>
    );
  }

  /* ═══════════════════ SCREEN 1: LIST ═══════════════════ */
  if (!selected) {
    return (
      <div className="flex flex-col gap-5 md:px-6 px-4 py-5 w-full max-w-8xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <h1 className="text-[22px] md:text-[26px] font-bold text-gray-900 tracking-tight">
              Referral Progress
            </h1>
            <p className="text-gray-500 text-[13px] md:text-[14px] mt-0.5">
              Track your referral journey across {stats.total} propert
              {stats.total !== 1 ? "ies" : "y"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-[#3586FF] text-white shadow-md shadow-blue-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-[#3586FF] text-white shadow-md shadow-blue-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <SummaryCard
            icon={<Users className="w-5 h-5 text-[#3586FF]" />}
            label="Total Referrals"
            value={stats.total}
            color="text-[#3586FF]"
            bgGrad="bg-gradient-to-br from-white to-blue-50/50"
          />
          <SummaryCard
            icon={<TrendingUp className="w-5 h-5 text-amber-500" />}
            label="In Progress"
            value={stats.inProgress}
            color="text-amber-600"
            bgGrad="bg-gradient-to-br from-white to-amber-50/50"
          />
          <SummaryCard
            icon={<Award className="w-5 h-5 text-green-500" />}
            label="Won"
            value={stats.won}
            color="text-green-600"
            bgGrad="bg-gradient-to-br from-white to-green-50/50"
          />
          <SummaryCard
            icon={<Star className="w-5 h-5 text-purple-500" />}
            label="Avg. Step"
            value={stats.avgStep}
            color="text-purple-600"
            bgGrad="bg-gradient-to-br from-white to-purple-50/50"
          />
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-sm">
          <ReusableSearchFilter
            searchText={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Search by project, city, locality..."
            filters={filtersConfig as any}
            selectedFilters={selectedFilters}
            onFilterChange={setSelectedFilters}
            rootCls="justify-between"
            className="py-1 md:py-[2px]"
          />
        </div>

        {/* Referral List */}
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 gap-4"
              : "flex flex-col gap-3"
          }
        >
          {filteredReferrals.map((item) => (
            <ReferralCard
              key={item.id}
              item={item}
              view={viewMode}
              onOpenDetails={() => setSelectedId(item.id)}
            />
          ))}
        </div>

        {filteredReferrals.length === 0 && (
          <div className="text-center py-16 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              <Building2 className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-gray-800 font-bold text-lg md:text-xl">
              {referrals.length === 0 && !loading
                ? "No referrals yet"
                : "No referrals found"}
            </h3>
            <p className="text-gray-400 text-sm mt-1.5 max-w-md">
              {referrals.length === 0 && !loading
                ? "Refer a property to your friends and track your earnings here. Start earning 0.5% of project value!"
                : "Try adjusting your search or filters"}
            </p>
            {referrals.length === 0 && !loading && (
              <Button
                onClick={() => router.push("/referandearn")}
                className="mt-5 inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-semibold px-6 py-3 rounded-xl text-[14px] shadow-md shadow-amber-200/50 transition-all duration-200"
              >
                <Share2 className="w-4 h-4" />
                Start Referring Now
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ═══════════════════ SCREEN 2: DETAILS ═══════════════════ */

  const img: string =
    typeof selected?.property?.mediaDetails?.propertyImages?.[0] === "string"
      ? (selected.property.mediaDetails.propertyImages[0] as string)
      : "/images/referralprogress/referral1.png";

  const title = selected.property?.propertyDetails?.propertyName || "-";
  const city = selected.property?.locationDetails?.city || "-";
  const locality =
    selected.property?.locationDetails?.locality ||
    selected.property?.locationDetails?.subLocality ||
    "-";

  const cfg = statusConfig[selected.status] || statusConfig.OPEN;
  const StatusIcon = cfg.icon;

  return (
    <div className="flex flex-col gap-5 md:px-6 px-4 py-5 w-full max-w-8xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Button
          onClick={closeDetails}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-medium transition-colors"
        >
          <LuChevronLeft className="w-4 h-4" /> Back
        </Button>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => window.open(HELPLINE_TEL, "_self")}
            className="inline-flex items-center gap-1.5 bg-[#3586FF] text-white px-4 py-2 rounded-xl text-[13px] font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            <Phone className="w-3.5 h-3.5" /> Helpline
          </Button>
          <Button
            onClick={() => window.open(HELPLINE_WHATSAPP, "_blank")}
            className="inline-flex items-center gap-1.5 border border-green-400 text-gray-800 px-4 py-2 rounded-xl text-[13px] font-medium hover:bg-green-50 transition-colors"
          >
            <MdWhatsapp className="text-green-500" /> WhatsApp
          </Button>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-3 md:p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="text-[14px] font-medium text-gray-600">
          Viewing: <span className="text-[#3586FF] font-semibold">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={gotoPrev}
            disabled={selectedIndex <= 0}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
              selectedIndex <= 0
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span className="flex items-center gap-1">
              <LuChevronLeft /> Prev
            </span>
          </Button>

          <select
            value={selected.id}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] bg-white font-medium focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF]/20 outline-none"
          >
            {filteredReferrals.map((r) => (
              <option key={r.id} value={r.id}>
                {r.property?.propertyDetails?.propertyName ??
                  `Referral #${r.id}`}
              </option>
            ))}
          </select>

          <Button
            onClick={gotoNext}
            disabled={selectedIndex >= filteredReferrals.length - 1}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
              selectedIndex >= filteredReferrals.length - 1
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span className="flex items-center gap-1">
              Next <LuChevronRight />
            </span>
          </Button>
        </div>
      </div>

      {/* Referral Code */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/60 p-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#3586FF] flex items-center justify-center">
            <Award className="w-4 h-4 text-white" />
          </div>
          <span className="text-[14px] font-semibold text-gray-800">
            Your Referral Code
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-white rounded-lg border border-blue-200 font-mono text-[14px] font-bold text-[#3586FF] tracking-wider">
            {referralCode || "------"}
          </div>
          <Button
            onClick={copyCode}
            className="inline-flex items-center gap-1.5 bg-[#3586FF] text-white px-3 py-2 rounded-lg text-[12px] font-medium hover:bg-blue-700 transition-colors"
          >
            <LuCopy className="w-3.5 h-3.5" /> Copy
          </Button>
        </div>

        <div className="md:ml-auto text-[12px] text-gray-500">
          Need help? Call{" "}
          <span className="text-[#3586FF] font-semibold">
            {HELPLINE_NUMBER}
          </span>
        </div>
      </div>

      {/* Main Detail Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="p-5 md:p-6">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            {/* Left: Property info */}
            <div className="flex gap-4 items-start">
              <div className="relative w-[140px] md:w-[160px] h-[100px] md:h-[110px] rounded-xl overflow-hidden ring-1 ring-gray-200/80 shrink-0">
                <Image src={img} alt="property" fill className="object-cover" />
              </div>

              <div className="flex flex-col gap-1.5">
                <h2 className="text-[18px] md:text-[20px] font-bold text-gray-900">
                  {title}
                </h2>
                <p className="flex items-center gap-1 text-[13px] text-gray-500">
                  <MapPin className="w-3.5 h-3.5" />
                  {locality}, {city}
                </p>
                <p className="flex items-center gap-1 text-[13px] text-gray-400">
                  <Home className="w-3.5 h-3.5" />
                  {selected?.property?.propertyDetails?.propertyType}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.text}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                  <span className="text-[12px] text-[#3586FF] font-medium">
                    Step {selected.currentStep} –{" "}
                    {stepLabelFromNumber(selected.currentStep)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Financials */}
            <div className="flex flex-col gap-3 min-w-[260px]">
              <div>
                <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                  Property Amount
                </div>
                <div className="text-[18px] font-bold text-gray-900">
                  {selected?.amountText ?? "-"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="text-[10px] text-gray-400 font-medium uppercase">
                    Brokerage
                  </div>
                  <div className="text-[14px] font-bold text-gray-800 mt-0.5">
                    {brokerageText}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="text-[10px] text-gray-400 font-medium uppercase">
                    Your Share
                  </div>
                  <div className="text-[14px] font-bold text-gray-800 mt-0.5">
                    {referrerShareText}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3.5 border border-blue-200/60">
                <div className="text-[10px] text-[#3586FF] font-medium uppercase">
                  Expected Earning
                </div>
                <div className="text-[18px] font-bold text-[#3586FF] mt-0.5 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  {expectedEarningText}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-gray-100">
            <Button
              className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-[12px] font-medium text-gray-700 transition-colors"
              onClick={handleShare}
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </Button>
            <Button
              className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-[12px] font-medium text-gray-700 transition-colors"
              type="button"
              onClick={handleViewProperty}
            >
              <Eye className="w-3.5 h-3.5" /> View Property
            </Button>
            <Button
              className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl text-[12px] font-medium text-red-500 transition-colors"
              onClick={() =>
                toast.error("Cancel referral is not available yet")
              }
            >
              <Trash2 className="w-3.5 h-3.5" /> Cancel
            </Button>
          </div>
        </div>

        {/* Stepper */}
        <div className="bg-gray-50/50 border-t border-gray-100 px-5 md:px-6 py-4 md:py-5">
          <h3 className="text-[14px] font-semibold text-gray-800 mb-1">
            Progress Timeline
          </h3>
          <StepperPro
            currentStep={selected.currentStep}
            stepDates={stepDates}
          />
        </div>
      </div>
    </div>
  );
}
