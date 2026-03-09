import React, { useEffect, useMemo, useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import BackRoute from "@/common/BackRoute";
import Button from "@/common/Button";
import { OrderItemType, useCartStore } from "@/store/cart";
import { fetchLegalServices, BranchLegalService } from "@/utils/legalServices";

/** Normalized item for UI (id can be string from API); branchId for order fulfillment */
interface Package {
  id: string;
  branchId: string;
  title: string;
  features: string[];
  price: number;
  originalPrice: number;
  gstPercent: number;
  gstInclusive: boolean;
  buttonText: string;
}

interface CardItems {
  packages: Package[];
  services: Package[];
}

function toPackage(ls: BranchLegalService): Package {
  const price = Number(ls.price) || 0;
  const originalPrice = Number(ls.originalPrice) || price;
  const gstPercent = Number(ls.gstPercent) || 18;
  const gstInclusive = ls.gstInclusive !== false;
  return {
    id: ls.id,
    branchId: ls.branchId,
    title: ls.title,
    features: ls.features || [],
    price,
    originalPrice,
    gstPercent,
    gstInclusive,
    buttonText: ls.buttonText || "Book Now",
  };
}

interface PackageCardProps {
  title: string;
  price: number;
  oldPrice: number;
  services: string[];
  isSelected: boolean;
  onSelect: () => void;
  badge?: string;
}

const formatPrice = (value: number) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const pctOff = (mrp: number, selling: number) => {
  if (!mrp || mrp <= 0) return 0;
  return Math.max(Math.round(((mrp - selling) / mrp) * 100), 0);
};

const PackagesComp: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedPackageId, setSelectedPackageId] = useState<string  | null>(null);
  const [cardItems, setCardItems] = useState<CardItems>({ packages: [], services: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addToCart = useCartStore((s) => s.addToCart);
  const router = useRouter();
  const session = useSession();
  const [user, setUser] = useState<any>();

  useEffect(() => {
    if (session.status === "authenticated") setUser(session.data?.user);
  }, [session?.status, session.data]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchLegalServices()
      .then((list) => {
        if (cancelled) return;
        const packages = list.filter((l) => l.kind === "package").map(toPackage);
        const services = list.filter((l) => l.kind === "service").map(toPackage);
        setCardItems({ packages, services });
      })
      .catch((e) => {
        if (!cancelled) setError("Failed to load legal services. Please try again.");
        console.error(e);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const listForTab = selectedTab === 0 ? cardItems.packages : cardItems.services;
  const selected = useMemo(
    () => listForTab.find((p) => p.id === selectedPackageId || String(p.id) === String(selectedPackageId)) || null,
    [listForTab, selectedPackageId]
  );

  const handleTabChange = (_event: any, newValue: number) => {
    setSelectedTab(newValue);
    setSelectedPackageId(null);
  };

  const handleContinue = async () => {
    if (!selected) return;
    try {
      const success = await addToCart(
        {
          productType: OrderItemType.LEGAL_PACKAGE,
          productId: String(selected.id),
          name: selected.title,
          quantity: 1,
          mrp: selected.originalPrice || 0,
          sellingPrice: selected.price || 0,
          unitDiscount: 0,
          taxPercent: selected.gstPercent ?? 18,
          snapshot: {
            source: "legal-services",
            image: "/icons/custom-builder/subservices/explorefurnitures/image.png",
            attributes: {
              kind: selectedTab === 0 ? "package" : "service",
              features: selected.features,
              gstInclusive: selected.gstInclusive,
            },
          },
          meta: { branchId: selected.branchId },
        },
        user?.id
      );
      if (success) router.push("/cart");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while adding to cart. Please try again.");
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 -z-10 h-[260px] bg-gradient-to-b from-[#EAF2FF] via-[#F5F7FB] to-transparent" />
      <div className="max-w-[1200px] mx-auto px-4 md:px-5 lg:px-7 py-6 md:py-10">
        <div className="mb-3">
          <BackRoute />
        </div>
        <div className="rounded-md border border-[#E6EEFF] bg-white/70 backdrop-blur-md shadow-[0_10px_30px_rgba(2,6,23,0.06)] p-2 md:p-4">
          <div className="flex flex-col gap-1">
            <h1 className="md:text-[20px] text-[16px] font-medium text-[#0F172A]">
              Select a Legal Service
            </h1>
            <p className="text-[10px] md:text-[12px] text-[#475569]">
              Choose a package or an individual service. Checkout happens in the next steps.
            </p>
          </div>
          <Box sx={{ width: "100%", marginTop: 1 }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              sx={{
                "& .MuiTab-root": {
                  color: "#475569",
                  fontSize: 14,
                  textTransform: "none",
                  fontWeight: 500,
                  fontFamily: "inherit",
                },
                "& .Mui-selected": {
                  color: "#3586FF",
                  fontWeight: 700,
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#3586FF",
                  height: 3,
                  borderRadius: 10,
                },
              }}
            >
              <Tab label="Packages" />
              <Tab label="Individual Services" />
            </Tabs>
          </Box>
        </div>
        {loading ? (
          <div className="mt-6 flex justify-center py-12 text-[#64748B] text-sm">
            Loading legal services…
          </div>
        ) : error ? (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
            {error} Set NEXT_PUBLIC_LEGAL_BRANCH_ID in env to show branch offerings.
          </div>
        ) : (
        <div className="mt-6 grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {listForTab.map((item) => (
            <PackageCard
              key={item.id}
              title={item.title}
              price={item.price}
              oldPrice={item.originalPrice}
              services={item.features}
              isSelected={selectedPackageId === item.id || String(selectedPackageId) === String(item.id)}
              onSelect={() => setSelectedPackageId(item.id)}
              badge={pctOff(item.originalPrice, item.price) > 0 ? `${pctOff(item.originalPrice, item.price)}% OFF` : undefined}
            />
          ))}
        </div>
        )}
        {!loading && !error && (
        <div className="mt-8">
          <div className="sticky bottom-4 z-20">
            <div className="rounded-xl border border-[#E6EEFF] bg-white/80 backdrop-blur-md shadow-[0_12px_40px_rgba(2,6,23,0.10)] px-4 py-4 md:px-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col gap-1">
                  {selected ? (
                    <>
                      <p className="text-[12px] text-[#64748B]">
                        Selected{" "}
                        <span className="font-medium text-[#0F172A]">
                          {selected.title}
                        </span>
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[18px] font-medium text-[#3586FF]">
                          {formatPrice(selected.price)}
                        </span>
                        {selected.originalPrice > selected.price && (
                          <>
                            <span className="text-[12px] text-[#94A3B8] line-through">
                              {formatPrice(selected.originalPrice)}
                            </span>
                            <span className="rounded-full bg-[#E8F1FF] px-2 py-[2px] text-[11px] font-medium text-[#2563EB]">
                              Save {formatPrice(selected.originalPrice - selected.price)}
                            </span>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-[12px] text-[#94A3B8]">
                      Select a package or service to continue.
                    </p>
                  )}
                </div>
                <Button
                  className="bg-[#3586FF] hover:bg-blue-500 text-white md:py-2 py-1 px-8 rounded-md text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed w-full md:w-auto"
                  onClick={handleContinue}
                  disabled={!selected}
                >
                  Continue to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default PackagesComp;

const PackageCard: React.FC<PackageCardProps> = ({
  title,
  price,
  oldPrice,
  services,
  isSelected,
  onSelect,
  badge,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={[
        "text-left border rounded-xl p-5 h-full flex flex-col justify-between transition-all duration-200 cursor-pointer",
        "shadow-[0_8px_30px_rgba(2,6,23,0.06)]",
        isSelected
          ? "border-[#3586FF] bg-gradient-to-b from-[#EFF6FF] to-white ring-2 ring-[#CFE2FF]"
          : "border-[#E5E7EB] bg-white hover:border-[#A5C8FF] hover:shadow-[0_10px_40px_rgba(2,6,23,0.10)]",
      ].join(" ")}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[15px] md:text-[16px] font-medium text-[#0F172A]">
            {title}
          </h2>
          {badge && (
            <span className="shrink-0 rounded-full bg-[#0B5FFF]/10 text-[#0B5FFF] px-2.5 py-1 text-[11px] font-medium">
              {badge}
            </span>
          )}
        </div>
        <ul className="mt-3 text-[12px] text-[#475569] space-y-1.5 min-h-[92px]">
          {services.slice(0, 4).map((service, index) => (
            <li key={index} className="flex gap-2">
              <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#3586FF]" />
              <span className="leading-relaxed">{service}</span>
            </li>
          ))}
          {services.length > 4 && (
            <li className="text-[11px] text-[#64748B]">+ {services.length - 4} more</li>
          )}
        </ul>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[#3586FF] text-[18px] font-medium">
            {formatPrice(price)}
          </span>
          {oldPrice > price && (
            <span className="text-[#94A3B8] text-[12px] line-through">
              {formatPrice(oldPrice)}
            </span>
          )}
        </div>
        <span
          className={[
            "px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all",
            isSelected
              ? "bg-[#3586FF] text-white"
              : "bg-white text-[#0F172A] border border-[#CFE2FF]",
          ].join(" ")}
        >
          {isSelected ? "Selected" : "Select"}
        </span>
      </div>
    </div>
  );
};
