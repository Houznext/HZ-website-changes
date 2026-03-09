"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { MdArrowBack, MdConstruction } from "react-icons/md";
import { useRouter } from "next/router";
import Loader from "@/components/Loader";
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Info,
  ClipboardCheck,
  HelpCircle,
  Milestone,
  CalendarDays,
  Clock4,
  CalendarRange,
  MessageCircle,
  CreditCard,
  Package,
} from "lucide-react";
import Button from "@/common/Button";
import { Cell, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  CurrentDayInfo,
  findCurentDayInfo,
  getDatesBetween,
  getTheLastDate,
  MonthData,
} from "@/utils/customBuilder/date-functions";
import { FaUserAlt } from "react-icons/fa";
import { useCustomBuilderStore } from "@/store/useCustomBuilderStore ";
import { TourStep, useTour } from "@/common/FeatureTour";
import BackRoute from "@/components/BackRoute";

const pieChartConfig = {
  progress: { label: "Progress" },
  completed: { label: "Completed", color: "#F59E0B" },
  remain: { label: "Remaining", color: "#E5E7EB" },
} satisfies ChartConfig;

const getRouteId = (query: { id?: string | string[] }): string | undefined =>
  typeof query?.id === "string" ? query.id : Array.isArray(query?.id) ? query.id[0] : undefined;

const CustomBuilderDetailsView = () => {
  const router = useRouter();
  const custom_builder_id = getRouteId(router?.query ?? {});

  const { data: customBuilder, fetchData, isLoading } = useCustomBuilderStore();
  const { open } = useTour();


  // ---- Tour ----
  const buildSteps = (): TourStep[] => [
    {
      id: "hero",
      selector: "#cb-hero",
      title: "Welcome Panel",
      content: <>See project name, latest stage and quick photo collage.</>,
      placement: "bottom",
    },
    {
      id: "progress",
      selector: "#cb-progress",
      title: "Progress Overview",
      content: <>All progress metrics are consolidated here (no duplicates).</>,
      placement: "left",
    },
    {
      id: "quicklinks",
      selector: "#cb-quicklinks",
      title: "Quick Links",
      content: (
        <>Jump to Overview, Documents, Gallery, Property Info, Services, Queries, and Phases.</>
      ),
      placement: "top",
    },
    {
      id: "overview",
      selector: "#cb-overview",
      title: "Day / Week / Month",
      content: <>Track time progress with clean indicators and bars.</>,
      placement: "top",
    },
  ];

  const startTour = () => open(buildSteps());

  // ---- Derived totals ----
  const totalEstimatedDays =
    customBuilder?.phases?.reduce(
      (sum: number, phase: any) => sum + (phase?.plannedDays || 0),
      0
    ) || 0;

  const estimated = Number(customBuilder?.estimatedDays || 0);
  const current = Number(customBuilder?.currentDay || 0);
  const doneDays = Number(customBuilder?.logs?.length || 0);

  const pct =
    totalEstimatedDays > 0 ? Math.min(100, Math.max(0, (current / totalEstimatedDays) * 100)) : 0;

  const pctLabel = `${pct.toFixed(1)}%`;
  const remainingDays = estimated > 0 ? Math.max(0, estimated - current) : 0;

  // ---- Timeframe ----
  const [timeframe, setTimeframe] = useState<MonthData>({});
  const [currentDayInfo, setCurrentDayInfo] = useState<CurrentDayInfo>();

  const weekPercentage = useMemo(() => {
    if (!currentDayInfo?.totalWeeks) return 0;
    return Math.min(
      100,
      Math.max(0, (currentDayInfo.currentWeek / currentDayInfo.totalWeeks) * 100)
    );
  }, [currentDayInfo]);

  const dayPercentage = useMemo(() => {
    if (!currentDayInfo?.today) return 0;
    return Math.min(100, Math.max(0, (Number(currentDayInfo.today) / 7) * 100));
  }, [currentDayInfo]);

  const monthPercentage = useMemo(() => {
    if (!currentDayInfo?.totalMonths) return 0;
    return Math.min(
      100,
      Math.max(0, (currentDayInfo.currentMonth / currentDayInfo.totalMonths) * 100)
    );
  }, [currentDayInfo]);

  // ---- Fetch ----
  useEffect(() => {
    if (custom_builder_id) {
      fetchData(custom_builder_id);
    }
  }, [custom_builder_id]); // eslint-disable-line

  // ---- Auto tour once ----
  useEffect(() => {
    if (!custom_builder_id || !customBuilder) return;
    const key = `cb_tour_shown_${custom_builder_id}`;
    if (typeof window !== "undefined" && !localStorage.getItem(key)) {
      setTimeout(() => {
        startTour();
        localStorage.setItem(key, "1");
      }, 400);
    }
  }, [custom_builder_id, customBuilder]); // eslint-disable-line

  // ---- Build timeframe based on first log day ----
  useEffect(() => {
    if (customBuilder?.estimatedDays) {
      const dayOne = customBuilder?.logs?.find((i: any) => i?.day === 1);
      if (dayOne) {
        const startDate = dayOne?.date;
        const endDate = getTheLastDate(startDate, String(customBuilder?.estimatedDays ?? 0));
        const dateRange = getDatesBetween(startDate, endDate);
        setTimeframe(dateRange);
      }
    }
  }, [customBuilder]);

  useEffect(() => {
    const data = findCurentDayInfo(timeframe);
    setCurrentDayInfo(data);
  }, [timeframe]);

  // ---- Images ----
  const propertyInfo = customBuilder?.propertyInformation;
  const resolvedImages =
    propertyInfo?.house_construction_info?.propertyImages ??
    propertyInfo?.commercial_construction_info?.propertyImages ??
    propertyInfo?.interior_info?.reference_images ??
    [];
  const images =
    resolvedImages.length > 0
      ? resolvedImages
      : [
        "/custom-builder/property-image-5.jpg",
        "/custom-builder/property-image-6.jpg",
        "/custom-builder/propimage.png",
      ];
  const extraCount = images.length > 3 ? images.length - 3 : 0;

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  const ProjectData = [
    {
      label: "Project Overview",
      icon: LayoutDashboard,
      url: `/user/custom-builder/${custom_builder_id}/projectoverview`,
    },
    {
      label: "Property Documents",
      icon: FileText,
      url: `/user/custom-builder/${custom_builder_id}/propertydocuments`,
    },
    {
      label: "Gallery",
      icon: ImageIcon,
      url: `/user/custom-builder/${custom_builder_id}/progressimages`,
    },
    {
      label: "Property Information",
      icon: Info,
      url: `/user/custom-builder/${custom_builder_id}/propertyinformation`,
    },
    {
      label: "Services Selected",
      icon: ClipboardCheck,
      url: `/user/custom-builder/${custom_builder_id}/servicesselected`,
    },
    {
      label: "Queries",
      icon: HelpCircle,
      url: `/user/custom-builder/${custom_builder_id}/queries`,
    },
    {
      label: "Phases",
      icon: Milestone,
      url: `/user/custom-builder/${custom_builder_id}/phases`,
    },
    {
      label: "Payments",
      icon: CreditCard,
      url: `/user/custom-builder/${custom_builder_id}/payments`,
    },
    {
      label: "Materials",
      icon: Package,
      url: `/user/custom-builder/${custom_builder_id}/materials`,
    },
    {
      label: "Chat",
      icon: MessageCircle,
      url: `/user/custom-builder/${custom_builder_id}/chat`,
    },
  ];

  return (
    <div className="w-full md:px-6 px-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <BackRoute />
        </div>
        <div className="flex flex-row gap-2">
          <Button
            onClick={() =>
              router.push(`/user/custom-builder/user/${customBuilder?.id}`)
            }
            className="bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-lg p-2"
            aria-label="Open profile"
          >
            <FaUserAlt className="md:text-[20px] text-[16px]" />
          </Button>

          <Button
            onClick={startTour}
            className="inline-flex items-center text-[12px] bg-[#3586FF] text-white rounded-lg px-2 md:py-1 hover:bg-blue-700"
            aria-label="Take a tour of this page"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <SectionCard id="cb-hero" className="px-4 py-3 mb-5">
        <div className="mb-3">
          <h2 className="text-[16px] md:text-[20px] uppercase font-bold text-gray-900">
            👋 Welcome back,{" "}
            <span className="text-yellow-300">
              {customBuilder?.propertyInformation?.propertyName || "Home"}
            </span>
            !
          </h2>
          <p className="text-[10px] md:text-[12px] text-gray-500">
            Here’s the latest update on your dream home journey.
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr_440px] max-w-[1100px] gap-4">
          {/* Collage + stage */}
          <div className="max-w-[640px]">
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <div className="grid grid-cols-2 grid-rows-2 gap-[2px] h-[160px] md:h-[230px] bg-gray-100">
                <div className="col-span-2 relative">
                  <Image src={images[0]} alt="Primary" fill className="object-cover" />
                </div>
                <div className="relative">
                  <Image
                    src={images[1] || images[0]}
                    alt="Second"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative">
                  <Image
                    src={images[2] || images[0]}
                    alt="Third"
                    fill
                    className={`object-cover ${extraCount > 0 ? "brightness-75" : ""}`}
                  />
                  {extraCount > 0 && (
                    <div className="absolute inset-0 bg-black/40 grid place-items-center text-white text-sm md:text-base font-medium">
                      +{extraCount} photos
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* stage strip */}
            <div className="mt-3 flex items-start gap-2 bg-blue-50 rounded-xl p-3 border border-blue-100">
              <span className="text-yellow-600 font-semibold text-sm">
                Current Stage:
              </span>
              <span className="text-gray-700 text-sm md:text-[14px] font-medium">
                {customBuilder?.currentStage ||
                  "Flooring, Final Miscellaneous works and cleaning"}
              </span>
            </div>
          </div>

          {/* SINGLE progress card (no duplicates) */}
          <div id="cb-progress" className="w-full">
            <SectionTitle
              icon={<MdConstruction className="text-[#ebb042]" />}
              title="Progress Overview"
            />

            <SectionCard className="p-4 md:px-5 px-3 ">
              <div className="flex items-start   w-full justify-between gap-3">
                <div className="">
                  <div className="text-xl font-bold text-gray-900 leading-none">
                    {pctLabel}
                  </div>
                  <div className="sublabel-text text-nowrap text-gray-500 mt-1">
                    Completed based on current day vs estimated days
                  </div>
                </div>

                <div className="text-nowrap w-full ">
                  <div className="text-sm font-bold text-gray-900">
                    {current} / {totalEstimatedDays || 0} days
                  </div>
                  <div className="sublabel-text text-gray-500 mt-1">
                    {estimated > 0 ? `${remainingDays} days remaining` : "Set estimated days"}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <ProgressBar pct={pct} />
              </div>

              {/* Mini stats */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <MiniStat
                  icon={<Clock4 className="w-4 h-4 text-gray-500" />}
                  label="Logs"
                  value={`${doneDays}`}
                />
                <MiniStat
                  icon={<CalendarDays className="w-4 h-4 text-gray-500" />}
                  label="Planned"
                  value={`${totalEstimatedDays || 0}d`}
                />
                <MiniStat
                  icon={<CalendarRange className="w-4 h-4 text-gray-500" />}
                  label="Estimated"
                  value={`${estimated || 0}d`}
                />
              </div>

              {/* Donut (small) */}
              <div className="mt-5 flex items-center gap-4">
                <div className="relative w-[84px] h-[84px] shrink-0">
                  <ChartContainer config={pieChartConfig} className="w-full h-full">
                    <PieChart width={54} height={54}>
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Pie
                        data={[
                          { name: "Completed", value: pct },
                          { name: "Remaining", value: 100 - pct },
                        ]}
                        dataKey="value"
                        innerRadius={30}
                        outerRadius={40}
                        startAngle={90}
                        endAngle={-270}
                        stroke="transparent"
                      >
                        <Cell fill="#F59E0B" />
                        <Cell fill="#E5E7EB" />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="text-[12px] font-bold text-gray-900">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-900">
                    {estimated > 0 ? "Keep going!" : "Add estimated days"}
                  </div>
                  <div className="sublabel-text text-gray-500 mt-1">
                    You’ve completed <span className="font-semibold">{current}</span> days so far.
                    {estimated > 0 ? (
                      <>
                        {" "}
                        Target is <span className="font-semibold">{estimated}</span> days.
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </SectionCard>

      {/* QUICK LINKS */}
      <div id="cb-quicklinks">
        <SectionTitle title="Quick Links" />
      </div>

      <div className="flex flex-wrap gap-3 md:gap-4 mb-6">
        {ProjectData.map((it, i) => {
          const Icon = it.icon;
          return (
            <Button
              key={i}
              onClick={() => router.push(it.url)}
              className="w-[130px] max-md:w-[104px] bg-white border border-gray-200 md:rounded-2xl rounded-xl shadow-custom hover:shadow-md transition-all p-3 text-center group"
            >
              <div className="mx-auto mb-2 grid place-items-center w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-50">
                <Icon className="w-4 h-4 text-gray-700 group-hover:text-[#3586FF]" />
              </div>
              <span className="text-[12px] md:text-[13px] leading-[10px] font-medium text-gray-800">
                {it.label}
              </span>
            </Button>
          );
        })}
      </div>

      {/* DAY/WEEK/MONTH OVERVIEW (kept, but cleaner + no “done out of 0 days”) */}
      <div id="cb-overview" className="flex md:flex-row max-w-[1030px] flex-col items-start md:items-stretch gap-6 md:mb-8">
        <SectionCard className="w-full md:p-6 p-4">
          <SectionTitle title="Project Days Overview" />

          <div className="space-y-4">
            <StatRow
              icon={<CalendarDays className="w-4 h-4 text-gray-500" />}
              label="Day"
              left={currentDayInfo?.today ?? 0}
              right={7}
              barPct={dayPercentage}
            />
            <StatRow
              icon={<Clock4 className="w-4 h-4 text-gray-500" />}
              label="Week"
              left={currentDayInfo?.currentWeek ?? 0}
              right={currentDayInfo?.totalWeeks ?? 0}
              barPct={weekPercentage}
            />
            <StatRow
              icon={<CalendarRange className="w-4 h-4 text-gray-500" />}
              label="Month"
              left={currentDayInfo?.currentMonth ?? 0}
              right={currentDayInfo?.totalMonths ?? 0}
              barPct={monthPercentage}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-gray-700">
            <span className="inline-block w-3 h-3 bg-[#3586FF] rounded-full" />
            <span className="font-medium">
              <span className="text-[#ebb042] font-bold">{doneDays}</span>{" "}
              days logged
            </span>
            <span className="text-gray-300">•</span>
            <span className="font-medium">
              Planned total:{" "}
              <span className="font-bold text-gray-900">
                {totalEstimatedDays || 0}
              </span>{" "}
              days
            </span>
          </div>
        </SectionCard>
      </div>

      {/* Floating Chat button - opens chat with builder for this project */}
      {custom_builder_id && (
        <button
          type="button"
          onClick={() => router.push(`/user/custom-builder/${custom_builder_id}/chat`)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#3586FF] text-white shadow-lg hover:bg-[#2b6ed6] hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#3586FF] focus:ring-offset-2"
          aria-label="Chat with builder"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default CustomBuilderDetailsView;

/* ---------------- UI Helpers ---------------- */

const SectionCard = ({
  children,
  className = "",
  id,
}: any) => (
  <div
    id={id}
    className={`bg-white/95 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 md:rounded-2xl rounded-xl shadow-custom ${className}`}
  >
    {children}
  </div>
);

const SectionTitle = ({
  icon,
  title,
}: {
  icon?: React.ReactNode;
  title: string;
}) => (
  <div className="flex items-center gap-2 mb-3">
    <div>
      {icon}
    </div>
    <h2 className="text-[#3586FF] dark:text-blue-400  font-bold text-[16px] md:text-[18px]">
      {title}
    </h2>
  </div>
);

const MiniStat = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
    <div className="flex items-center gap-2">
      {icon}
      <div className="sublabel-text text-gray-500">{label}</div>
      <div className="mt-1 text-sm font-bold text-gray-900">{value}</div>
    </div>
  </div>
);

const StatRow = ({
  icon,
  label,
  left,
  right,
  barPct,
}: {
  icon: React.ReactNode;
  label: string;
  left: number | string;
  right: number | string;
  barPct: number;
}) => (
  <div className="grid grid-cols-[120px_1fr] max-sm:grid-cols-1 gap-2 items-center">
    <div className="flex items-center gap-2">
      {icon}
      <span className="font-medium text-[13px] text-gray-800">
        {label}
      </span>
      <span className="text-[13px] font-bold text-[#ebb042] ml-auto max-sm:ml-0">
        {left} / {right}
      </span>
    </div>

    <div className="w-full h-[8px] bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-[#3586FF] rounded-full transition-all"
        style={{ width: `${barPct || 0}%` }}
      />
    </div>
  </div>
);

const ProgressBar = ({ pct }: { pct: number }) => (
  <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-sm">
    <div
      className="absolute h-3 bg-[#3586FF] rounded-full transition-all duration-700 min-w-[10px]"
      style={{ width: `${pct || 0}%` }}
    />
    <span className="absolute inset-0 grid place-items-center text-[10px] font-medium text-gray-700">
      {Math.round(pct)}%
    </span>
  </div>
);
