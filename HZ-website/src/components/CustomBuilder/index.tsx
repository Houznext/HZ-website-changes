import { useRouter } from "next/router";
import React, { useState, useEffect, Fragment } from "react";
import { useSession } from "next-auth/react";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  CalendarDays,
  MapPin,
  House,
  Ruler,
  Phone,
  Mail,
  User2,
} from "lucide-react";
import Button from "@/common/Button";

const ProgressBar = ({ value }: { value: number }) => (
  <div className="w-full h-2 rounded-full bg-gray-200/70 dark:bg-white/10 overflow-hidden">
    <div
      className="h-full rounded-full bg-amber-500 transition-[width] duration-500"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

const Badge = ({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: "blue" | "gray";
}) => {
  const palette =
    tone === "blue"
      ? "bg-blue-50 text-[#3586FF] ring-1 ring-blue-100 dark:bg-[#3586FF]/10 dark:text-blue-300 dark:ring-[#3586FF]/20"
      : "bg-gray-50 text-gray-700 ring-1 ring-gray-200 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${palette}`}
    >
      {children}
    </span>
  );
};

const InfoRow = ({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | number | null;
  icon?: React.ReactNode;
}) => (
  <div className="flex gap-2">
    <span className="mt-[2px] shrink-0 text-gray-500 dark:text-gray-400">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="md:text-sm text-[12px] font-medium tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="md:text-sm text-[12px] font-medium text-gray-900 dark:text-gray-100 truncate">
        {value ? String(value) : "N/A"}
      </p>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="rounded-2xl border border-gray-200/70 bg-white/70 backdrop-blur-md shadow-sm p-4 md:p-6 dark:bg-white/5 dark:border-white/10 animate-pulse">
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="h-4 w-48 rounded bg-gray-200/80 dark:bg-white/10" />
      <div className="h-7 w-28 rounded bg-gray-200/80 dark:bg-white/10" />
    </div>
    <div className="h-2 w-full rounded bg-gray-200/80 dark:bg-white/10 mb-6" />
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-20 rounded bg-gray-200/80 dark:bg-white/10" />
          <div className="h-4 w-32 rounded bg-gray-200/80 dark:bg-white/10" />
        </div>
      ))}
    </div>
  </div>
);

const CustomBuilderView = () => {
  const router = useRouter();
  const session = useSession();
  const [user, setUser] = useState<any>(null);
  const [customBuilders, setCustomBuilders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (session?.status === "authenticated") {
      setUser(session?.data?.user);
      fetchCustomBuilders(session?.data?.user?.id);
    }
  }, [session?.status, session?.data?.user]);

  const fetchCustomBuilders = async (userObj: any) => {
    if (!userObj) return;
    try {
      setLoading(true);
      const res = await apiClient.get(
        `${apiClient.URLS.customBuilder}/user/${userObj}`, {}, true
      );
      if (res.status === 200) {
        setCustomBuilders(res.body);
      }
    } catch (error) {
      console.error("Error fetching custom builders:", error);
      toast.error("Error fetching interior projects");
    } finally {
      setLoading(false);
    }
  };

  const EmptyState = () => (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-6">
        <svg
          className="w-12 h-12 text-[#3586FF]"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
          />
        </svg>
      </div>
      <h2 className="md:text-2xl text-lg font-bold text-gray-900 dark:text-gray-100">
        You don&apos;t have any projects yet
      </h2>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md">
        Start building your dream home with Houznext. From design to construction,
        we&apos;ll help you every step of the way.
      </p>
      <Button
        onClick={() => router.push("/custom-builder")}
        className="mt-6 inline-flex items-center gap-2 bg-[#3586FF] text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-md hover:shadow-lg"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Start Constructing
      </Button>
    </div>
  );

  return (
    <div className="w-full max-w-7xl max-md:mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between md:mb-6 mb-3">
        <h1 className="text-[20px] md:text-2xl font-bold tracking-tight text-[#3586FF] dark:text-blue-400">
          Interior Projects
        </h1>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && (!customBuilders || customBuilders?.length === 0) && (
        <EmptyState />
      )}


      {/* List */}
      {!loading && customBuilders?.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {customBuilders.map((item) => {
            const constructionScope =
              item?.propertyInformation?.construction_scope;
            const scopePretty = constructionScope
              ? constructionScope.charAt(0).toUpperCase() +
              constructionScope.slice(1)
              : "N/A";

            const phaseDays = (item?.phases || []).reduce(
              (sum: number, phase: any) => sum + (phase.plannedDays || 0),
              0
            );
            const totalDays = phaseDays > 0 ? phaseDays : (item?.estimatedDays || 0);
            const currentDay = item?.currentDay ?? 0;
            const pct = totalDays > 0 ? Math.round((currentDay / totalDays) * 100) : 0;

            const rawEmail = item?.customer?.email || item?.user?.email;
            const email = rawEmail
              ? rawEmail.length > 20
                ? rawEmail.slice(0, 18) + "…"
                : rawEmail
              : "N/A";

            const isCommercial =
              item?.propertyInformation?.construction_type === "Commercial";

            const areaObj = isCommercial
              ? item.propertyInformation?.commercial_construction_info?.total_area
              : item.propertyInformation?.house_construction_info?.total_area ??
              item.propertyInformation?.interior_info?.total_area;

            const area =
              areaObj?.size && areaObj?.unit
                ? `${areaObj.size} ${areaObj.unit}`
                : "N/A";

            return (
              <div
                key={item?.id}
                className="group rounded-2xl border border-gray-200/70 bg-white/70 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow duration-300 p-4 md:p-6 dark:bg-white/5 dark:border-white/10"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 font-medium">
                    <Badge tone="blue">
                      <CalendarDays className="w-3.5 h-3.5" />
                      Day {currentDay}{totalDays > 0 ? `/${totalDays}` : ""}
                    </Badge>
                    <Badge tone="gray">
                      {totalDays > 0 ? `${pct}% complete` : "Not estimated"}
                    </Badge>
                  </div>
                  <Button
                    onClick={() =>
                      router.push(`/user/custom-builder/${item?.id}`)
                    }
                    className="inline-flex items-center justify-center font-medium rounded-md bg-[#3586FF] text-white px-3 md:py-1.5 py-[2px] md:text-sm text-[12px]  hover:bg-blue-700 active:bg-blue-800 transition-colors"
                  >
                    View Details
                  </Button>
                </div>

                {/* Progress */}
                <div className="mb-5">
                  <ProgressBar value={pct} />
                </div>


                <div className="flex w-full md:flex-row flex-col-reverse gap-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-4 gap-2 flex-1">
                    <InfoRow
                      label="First Name"
                      value={item?.customer?.firstName}
                      icon={<User2 className="w-4 h-4" />}
                    />
                    <InfoRow
                      label="Last Name"
                      value={item?.customer?.lastName}
                      icon={<User2 className="w-4 h-4" />}
                    />
                    <InfoRow
                      label="Email"
                      value={email}
                      icon={<Mail className="w-4 h-4" />}
                    />
                    <InfoRow
                      label="Phone"
                      value={item?.customer?.phone}
                      icon={<Phone className="w-4 h-4" />}
                    />

                    <InfoRow
                      label="Locality"
                      value={item?.location?.locality}
                      icon={<MapPin className="w-4 h-4" />}
                    />
                    <InfoRow
                      label="State"
                      value={item?.location?.state}
                      icon={<MapPin className="w-4 h-4" />}
                    />
                    <InfoRow
                      label="City"
                      value={item?.location?.city}
                      icon={<MapPin className="w-4 h-4" />}
                    />

                    <InfoRow
                      label="Property Type"
                      value={item?.propertyInformation?.property_type}
                      icon={<House className="w-4 h-4" />}
                    />
                    <InfoRow
                      label="Construction Type"
                      value={item?.propertyInformation?.construction_type}
                      icon={<House className="w-4 h-4" />}
                    />
                    <InfoRow
                      label="Construction Scope"
                      value={scopePretty}
                      icon={<House className="w-4 h-4" />}
                    />
                    <InfoRow
                      label="Facing"
                      value={(() => {
                        const facing = isCommercial
                          ? item?.propertyInformation?.commercial_construction_info?.land_facing
                          : item?.propertyInformation?.house_construction_info?.land_facing;
                        return facing
                          ? String(facing).charAt(0).toUpperCase() + String(facing).slice(1)
                          : "N/A";
                      })()}
                      icon={<Compass className="w-4 h-4" />}
                    />
                    {isCommercial && (
                      <InfoRow
                        label="Commercial Type"
                        value={
                          item?.propertyInformation?.commercial_property_type ||
                          item?.propertyInformation?.commercial_construction_info?.commercial_type ||
                          "N/A"
                        }
                        icon={<House className="w-4 h-4" />}
                      />
                    )}
                    <InfoRow
                      label="Total Area"
                      value={area}
                      icon={<Ruler className="w-4 h-4" />}
                    />
                  </div>

                  <div className="w-full md:max-w-[260px]">
                    <p className="text-sm font-medium text-[#3586FF] dark:text-gray-300 mb-2">
                      Property Image
                    </p>
                    <div className="relative md:h-[140px] h-[120px] w-full rounded-lg overflow-hidden ring-1 ring-gray-200/80 dark:ring-white/10">
                      <Image
                        src={
                          item?.propertyInformation?.house_construction_info?.propertyImages?.[0] ||
                          item?.propertyInformation?.interior_info?.reference_images?.[0] ||
                          item?.propertyInformation?.commercial_construction_info?.propertyImages?.[0] ||
                          "/custom-builder/propimage.png"
                        }
                        alt="Property"
                        fill
                        className="object-cover"
                        sizes="260px"
                        placeholder="empty"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomBuilderView;

// missing Compass icon from lucide-react:
function Compass(props: any) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      <path d="m8 16 2-6 6-2-2 6-6 2Z" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}
