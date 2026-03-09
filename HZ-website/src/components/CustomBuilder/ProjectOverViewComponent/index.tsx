import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { MdOutlineBarChart, MdFileDownload } from "react-icons/md";
import {
  FaChevronLeft,
  FaChevronRight,
  FaChartLine,
  FaInfoCircle,
} from "react-icons/fa";
import { MapPin } from "lucide-react";

import Button from "@/common/Button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Loader from "@/components/Loader";
import RouterBack from "../RouterBack";
import apiClient from "@/utils/apiClient";
import { useCustomBuilderStore } from "@/store/useCustomBuilderStore ";
import { filtersdata } from "@/components/CustomBuilder/ServicesSelectedView/helper";
import CustomInput from "@/common/FormElements/CustomInput";
import {
  getDatesBetween,
  DateInfo,
  MonthData,
  WeekData,
  CurrentDayInfo,
} from "@/utils/customBuilder/date-functions";
import { ClipboardList } from "lucide-react";
import Modal from "@/common/Modal";

import TrendsClient from "@/components/CustomBuilder/TrendsClient";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CartesianGrid, AreaChart, Area, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import Link from "next/link";

const lineChartConfig = {
  progress: {
    label: "progress",
    color: "#3586FF",
  },
} satisfies ChartConfig;

export default function ProjectOverviewAdminStyle() {
  const router = useRouter();
  const custom_builder_id =router?.query?.id
  const { data: customBuilder, isLoading, fetchData } = useCustomBuilderStore();

  const [lineChartData, setLineChartData] = useState<any[]>([]);
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | null>(null);

  const [timeframe, setTimeframe] = useState<MonthData>({});
  const [weeksOfMonth, setWeeksOfMonth] = useState<WeekData>({});
  const [daysOfWeek, setDaysOfWeek] = useState<DateInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  type FilterType = (typeof filtersdata)[number]["id"];
  const [selectedDateFilter, setSelectedDateFilter] =
    useState<FilterType>("all");
  const [customRange, setCustomRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<any[]>([]);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [showAllLogs, setShowAllLogs] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const formatMonthYear = (dateStr: string) => {
    const d = new Date(dateStr);
    return format(d, "MMM ''yy");
  };

  useEffect(() => {
    if (!custom_builder_id) return;

    const fetchLogs = async () => {
      setLoadingLogs(true);
      try {
        const res = await apiClient.get(
          `${apiClient.URLS.customBuilder}/${custom_builder_id}/logs?page=${page}&limit=${limit}`,{},true
        );
        const { logs, total } = await res.body;
        setLogs(logs);
        setTotalLogs(total);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      } finally {
        setLoadingLogs(false);
      }
    };

    fetchLogs();
  }, [custom_builder_id, page, limit]);


  // const totalEstimatedDays = (
  //   Object.values(customBuilder?.servicesRequired?.serviceEstimates || {}) as {
  //     estimatedDays?: number;
  //   }[]
  // ).reduce((sum, est) => sum + (est.estimatedDays || 0), 0);
  function getDatesBetween(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const result: any = {};

    let current = new Date(startDate);

    while (current <= endDate) {
      const year = current.getFullYear();
      const month =
        current.toLocaleString("default", { month: "long" }) + " " + year;

      if (!result[month]) result[month] = {};

      // week number inside this month
      const weekNum = Math.ceil(current.getDate() / 7);
      if (!result[month][`Week ${weekNum}`])
        result[month][`Week ${weekNum}`] = [];

      result[month][`Week ${weekNum}`].push({
        date: current.toISOString().split("T")[0],
        day: current.getDate(),
      });

      current.setDate(current.getDate() + 1);
    }

    return result;
  }

  const [activeTab, setActiveTab] = useState<"OverView" | "Trends">("OverView");

  const onSelectMonth = (value: number) => {
    setSelectedMonth(value);
    setShowAllLogs(false);
    setPage(1);
    const newWeeks = Object.values(timeframe)[value] || {};
    setWeeksOfMonth(newWeeks);
    if (newWeeks && Object.keys(newWeeks).length > 0) {
      setSelectedWeek(0);
      setDaysOfWeek((Object.values(newWeeks)[0] as DateInfo[]) || []);
    } else {
      setDaysOfWeek([]);
    }
  };

  const onSelectWeek = (value: number) => {
    setSelectedWeek(value);
    setShowAllLogs(false);
    setPage(1);
    setDaysOfWeek((Object.values(weeksOfMonth)[value] as DateInfo[]) || []);
  };

  const selectedDateSet = useMemo(() => {
    if (showAllLogs || !daysOfWeek?.length) return null;
    return new Set(daysOfWeek.map((d) => d.date));
  }, [showAllLogs, daysOfWeek]);

  const visibleLogs = useMemo(() => {
    if (!selectedDateSet) return logs;
    return logs.filter((l) => selectedDateSet.has(l.date));
  }, [logs, selectedDateSet]);

  // **Updated rows filter to sync phase, month, week, search, and status**
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return visibleLogs
      .filter((l: any) => {
        const hay =
          `${l.workType} ${l.placeType} ${l.description} ${l.customerNotes}`.toLowerCase();
        const passQ =
          !q ||
          hay.includes(q) ||
          String(l.day).includes(q) ||
          (l.date || "").includes(q);
        const passS =
          !statusFilter || (l.status || "").toLowerCase() === statusFilter;
        const passPhase = !selectedPhaseId || l.phaseId === selectedPhaseId;
        return passQ && passS && passPhase;
      })
      .sort((a: any, b: any) => (a.day || 0) - (b.day || 0));
  }, [visibleLogs, search, statusFilter, selectedPhaseId]);

  useEffect(() => {
    if (custom_builder_id) fetchData(custom_builder_id.toString());
  }, [custom_builder_id, fetchData]);

  // useEffect(() => {
  //   if (!customBuilder?.estimatedDays) return;
  //   const dayOne = customBuilder?.logs?.find((i: any) => i?.day === 1);
  //   if (!dayOne) return;
  //   const startDate = dayOne.date;
  //   const lastLogDate = customBuilder.logs.reduce((latest: any, curr: any) =>
  //     new Date(curr.date) > new Date(latest.date) ? curr : latest
  //   ).date;
  //   const range = getDatesBetween(startDate, lastLogDate);
  //   setTimeframe(range);
  // }, [customBuilder]);
  const totalEstimatedDays =
    customBuilder?.estimatedDays ??
    customBuilder?.phases?.reduce(
      (sum: any, p: any) => sum + (p.plannedDays ?? 0),
      0
    );

  useEffect(() => {
    if (!customBuilder?.logs || !customBuilder?.phases?.length) return;

    const dayOne =
      customBuilder.logs.find((i: any) => i.day === 1) || customBuilder.logs[0];
    if (!dayOne) return;

    const startDate = dayOne.date;
    const lastLogDate = customBuilder.logs.reduce((latest: any, curr: any) =>
      new Date(curr.date) > new Date(latest.date) ? curr : latest
    ).date;

    const range = getDatesBetween(startDate, lastLogDate);
    setTimeframe(range);
  }, [customBuilder]);

  useEffect(() => {
    if (!customBuilder?.logs || !timeframe) return;

    const totalEstimatedDays =
      customBuilder?.estimatedDays ??
      customBuilder?.phases?.reduce(
        (sum: any, p: any) => sum + (p.plannedDays ?? 0),
        0
      );

    const completedDays = new Set<number>();
    const chart: { week: string; progress: number }[] = [];

    Object.entries(timeframe).forEach(([month, weeks]: any) => {
      Object.entries(weeks).forEach(([weekName, days]: any, index) => {
        days.forEach((d: any) => {
          const logs = customBuilder.logs.filter((l: any) => l.date === d.date);
          logs.forEach((l: any) => l.day && completedDays.add(l.day));
        });

        const progress = Math.ceil(
          (completedDays.size / (totalEstimatedDays || 1)) * 100
        );
        const firstDay = days[0];

        chart.push({
          week: `${formatMonthYear(firstDay?.date)} Week ${index + 1}`,
          progress: Math.min(progress, 100),
        });
      });
    });

    setLineChartData(chart);
  }, [timeframe, customBuilder?.logs]);

  // useEffect(() => {
  //   if (!customBuilder?.logs || !timeframe || !customBuilder.estimatedDays)
  //     return;
  //   const completedDays = new Set<number>();
  //   const weeks = Object.values(timeframe);
  //   const chart: { week: string; progress: number }[] = [
  //     { week: "Week 1", progress: 0 },
  //   ];
  //   weeks.forEach((weekObj: any, index) => {
  //     const weekDays = Object.values(weekObj) as any[][];
  //     weekDays.forEach((days) => {
  //       days.forEach((d) => {
  //         const logs = customBuilder.logs.filter((l: any) => l.date === d.date);
  //         logs.forEach((l: any) => l.day && completedDays.add(l.day));
  //       });
  //     });
  //     const progress = Math.ceil(
  //       (completedDays.size / (customBuilder.estimatedDays ?? 1)) * 100
  //     );
  //     chart.push({
  //       week: `Week ${index + 2}`,
  //       progress: Math.min(progress, 100),
  //     });
  //   });
  //   setLineChartData(chart);
  // }, [timeframe, customBuilder?.logs, customBuilder?.estimatedDays]);

  useEffect(() => {
    if (
      timeframe &&
      Object.keys(timeframe).length > 0 &&
      selectedMonth === null &&
      !showAllLogs
    ) {
      onSelectMonth(0);
    }
  }, [timeframe, showAllLogs]);

  useEffect(() => {
    if (
      weeksOfMonth &&
      Object.keys(weeksOfMonth).length > 0 &&
      selectedWeek === null &&
      !showAllLogs
    ) {
      onSelectWeek(0);
    }
  }, [weeksOfMonth, showAllLogs]);
  //   useEffect(() => {
  //   if (!showAllLogs && timeframe && Object.keys(timeframe).length > 0 && selectedMonth === null) {
  //     onSelectMonth(0);
  //   }
  // }, [timeframe, showAllLogs, selectedMonth]);

  // useEffect(() => {
  //   if (!showAllLogs && weeksOfMonth && Object.keys(weeksOfMonth).length > 0 && selectedWeek === null) {
  //     onSelectWeek(0);
  //   }
  // }, [weeksOfMonth, showAllLogs, selectedWeek]);

  const statusCounts = useMemo(() => {
    const c = { completed: 0, "in progress": 0, pending: 0, delayed: 0 };
    rows.forEach((r: any) => {
      const s = (r.status || "").toLowerCase();
      if (s in c) (c as any)[s] += 1;
    });
    return c;
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (!statusFilter) return rows;
    return rows.filter((r: any) => r.status.toLowerCase() === statusFilter);
  }, [rows, statusFilter]);
 

  const exportCSV = () => {
    const header = [
      "Day",
      "Date",
      "Work Type",
      "Place",
      "Status",
      "Description",
      "Workers",
      "Issues",
      "Customer Notes",
      "Phase",
      "UploadedBy Name",
      "Media Count",
    ];

    const esc = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;

    const lines = filteredRows.map((r: any) => {
      const phaseName =
        customBuilder?.phases?.find((p: any) => p.id === r.phaseId)?.name ??
        "-";

      return [
        r.day,
        r.date,
        Array.isArray(r.workType) ? r.workType.join(", ") : r.workType,
        Array.isArray(r.placeType) ? r.placeType.join(", ") : r.placeType,
        r.status,
        r.description,
        r.laborCount,
        r.issues,
        r.customerNotes,
        phaseName,
        r.uploadedByName,
        Array.isArray(r.imageOrVideo) ? r.imageOrVideo.length : 0,
      ]
        .map(esc)
        .join(",");
    });

    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "week-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  const CustomXAxisTick = ({ x, y, payload }: any) => (
    <text
      x={x}
      y={y}
      dy={16}
      textAnchor="middle"
      className="fill-[#3586FF] md:text-[12px] text-[10px] font-medium"
    >
      {payload.value}
    </text>
  );
  const CustomYAxisTick = ({ x, y, payload }: any) => (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      className="fill-yellow-500 md:text-[12px] text-[10px] font-medium"
    >
      {payload.value}%
    </text>
  );
  const tabLabels = [
    {
      key: "OverView",
      label: "OverView",
      icon: <FaInfoCircle className="text-[12px]" />,
    },
    {
      key: "Trends",
      label: "Trends",
      icon: <FaChartLine className="text-[12px]" />,
    },
  ];
  return (
    <>
      <div className="flex flex-col items-start md:gap-4 gap-3 w-full md:p-5 p-0">
        <RouterBack />
        <div className="flex items-center md:gap-4 gap-2 mt-2 ">
          {tabLabels.map((item) => (
            <Button
              key={item.key}
              onClick={() => setActiveTab(item.key as any)}
              className={`md:px-4  px-2 py-1 max-md:text-nowrap rounded-md text-[12px] md:text-[14px] font-bold flex items-center gap-2 ${activeTab === item.key
                ? "bg-[#3586FF] text-white"
                : "bg-gray-200 text-gray-600"
                }`}
            >
              {item.icon}
              {item.label}
            </Button>
          ))}
        </div>
        {activeTab === "OverView" ? (
          <>
            <div className="w-full md:max-w-[1200px] max-w-[360px]  mt-3  px-2">
              <div className="flex items-center gap-2  mb-3">
                <MdOutlineBarChart className="text-[#3586FF] md:w-4 w-3 md:h-4 h-3" />
                <h2 className="step-heading font-bold text-gray-900">
                  Project Overview
                </h2>
              </div>

              <div className="bg-white md:rounded-[10px] rounded-[4px] shadow-custom border border-gray-100 md:p-4 p-2">
                <div className="overflow-x-auto">
                  <div className="min-w-[330px] md:min-w-0 w-full">
                    <ChartContainer
                      config={lineChartConfig}
                      className="w-full min-h-[200px] max-h-[220px]"
                    >
                      <AreaChart
                        data={lineChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        className=""
                      >
                        <defs>
                          <linearGradient
                            id="colorProgress"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#3586FF"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#3586FF"
                              stopOpacity={0.2}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                          dataKey="week"
                          tickLine={false}
                          axisLine={{ stroke: "#6B7280" }}
                          tickMargin={8}
                          tick={<CustomXAxisTick />}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tickFormatter={(val) => `${val}%`}
                          tickLine={false}
                          axisLine={{ stroke: "#6B7280" }}
                          tickMargin={8}
                          tick={<CustomYAxisTick />}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Area
                          type="monotone"
                          dataKey="progress"
                          stroke="#3586FF"
                          fillOpacity={1}
                          fill="url(#colorProgress)"
                          dot={{
                            r: 5,
                            fill: "#3586FF",
                            stroke: "#fff",
                            strokeWidth: 2,
                          }}
                          activeDot={false}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:max-w-[1200px] max-w-[360px]  mt-3 md:px-4 px-2">
              <div className="flex items-center gap-2 md:mb-6 mb-3">
                <ClipboardList className="text-[#3586FF] md:w-4 w-3 md:h-4 h-3" />
                <h3 className="step-heading font-bold text-gray-900">
                  Week Report
                </h3>
              </div>

              <div className="bg-white md:rounded-[10px] rounded-[4px] shadow-custom border border-gray-100 md:p-4 p-2">
                <Card className="shadow-custom border-none">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 md:gap-4 p-2">
                    <div className="flex md:flex-wrap flex-nowrap items-center gap-2">
                      <Select
                        value={
                          selectedMonth !== null ? String(selectedMonth) : ""
                        }
                        onValueChange={(v) => {
                          setShowAllLogs(false);
                          onSelectMonth(Number(v));
                        }}
                      >
                        <SelectTrigger className="md:w-[200px] w-[120px] border-gray-200 h-[34px] text-[12px] md:text-[14px] font-medium md:rounded-[10px] rounded-[4px]">
                          <SelectValue placeholder="Select Month" />
                        </SelectTrigger>
                        <SelectContent
                          align="start"
                          className="bg-white border border-gray-100 py-1 font-medium md:text-[12px] text-[10px] rounded-md shadow-md"
                        >
                          {Object.keys(timeframe || {}).map((_, idx) => (
                            <SelectItem key={idx} value={String(idx)}>
                              {`Month ${idx + 1}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={
                          selectedWeek !== null ? String(selectedWeek) : ""
                        }
                        onValueChange={(v) => {
                          setShowAllLogs(false);
                          onSelectWeek(Number(v));
                        }}
                      >
                        <SelectTrigger className="w-[120px] md:w-[140px] border-gray-200 h-[34px] text-[12px] md:text-[14px] font-medium md:rounded-[10px] rounded-[4px]">
                          <SelectValue placeholder="Select Week" />
                        </SelectTrigger>
                        <SelectContent
                          align="start"
                          className="bg-white border border-gray-100 font-medium md:text-[12px] text-[10px] rounded-md shadow-md"
                        >
                          {Object.keys(weeksOfMonth || {}).map((_, idx) => (
                            <SelectItem key={idx} value={String(idx)}>
                              {`Week ${idx + 1}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        onClick={() => {
                          setSelectedMonth(null);
                          setSelectedWeek(null);
                          setDaysOfWeek([]);
                          setShowAllLogs(true);
                        }}
                        className={`md:px-3 px-1 py-1 text-[12px] text-nowrap md:text-[14px] font-medium md:rounded-[10px] rounded-[4px] border transition-all duration-200 ${showAllLogs
                          ? "bg-[#3586FF] text-white border-[#3586FF] shadow-md"
                          : "bg-white text-[#3586FF] border-[#3586FF] hover:bg-blue-50"
                          }`}
                      >
                        Show All
                      </Button>
                    </div>

                    <div className="flex flex-wrap  items-center gap-2">
                      <div className="flex items-center md:min-w-[220px] min-w-[140px]">
                        <CustomInput
                          type="text"
                          className="w-full md:rounded-[10px] rounded-[4px] border px-3 py-1 md:text-[12px] text-[10px] outline-none"
                          rootCls="border-gray-200"
                          placeholder="Search work, day, or date..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </div>

                      <Select
                        onValueChange={(v) =>
                          setStatusFilter(v === "all" ? null : v)
                        }
                      >
                        <SelectTrigger className="w-[120px] md:w-[140px] border-gray-200 h-[34px] text-[12px] md:text-[14px] font-medium md:rounded-[10px] rounded-[4px]">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent
                          align="start"
                          className="bg-white border border-gray-200 font-medium md:text-[12px] text-[10px] rounded-md shadow-md"
                        >
                          {[
                            "all",
                            "completed",
                            "in progress",
                            "pending",
                            "delayed",
                          ].map((s) => (
                            <SelectItem key={s} value={s}>
                              {s[0].toUpperCase() + s.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        onClick={exportCSV}
                        className="md:px-3 px-2 md:py-2 flex items-center gap-1 py-1 md:rounded-[10px] rounded-[4px] border border-[#3586FF] font-medium text-[#3586FF] hover:bg-blue-50 text-[12px] text-nowrap"
                      >
                        <MdFileDownload className="text-[14px]" /> Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-wrap justify-between items-center mt-3 mb-4 gap-3">
                  <div className="flex md:flex-wrap flex-nowrap items-center md:gap-2 gap-1 font-medium">
                    {(
                      [
                        "completed",
                        "in progress",
                        "pending",
                        "delayed",
                      ] as const
                    ).map((s) => (
                      <Button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`md:px-3 px-1 text-nowrap py-1 md:rounded-[10px] rounded-[4px] md:text-[12px] text-[10px] border transition ${statusFilter === s
                          ? "bg-[#3586FF]text-white border-blue-600 shadow-md"
                          : "bg-white hover:bg-slate-50"
                          }`}
                        title={`Filter: ${s}`}
                      >
                        {s[0].toUpperCase() + s.slice(1)} • {statusCounts[s]}
                      </Button>
                    ))}
                    {statusFilter && (
                      <Button
                        onClick={() => setStatusFilter(null)}
                        className="md:px-3 px-2 py-1 md:rounded-[10px] rounded-[4px] md:text-[12px] text-[10px] border bg-white hover:bg-slate-50"
                      >
                        Clear
                      </Button>
                    )}
                    <span className="md:block hidden md:text-[11px] text-[9px] text-slate-500">
                      Showing {filteredRows?.length} row
                      {filteredRows?.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      className={`md:px-3 px-2 py-1 md:rounded-[10px] rounded-[4px] md:text-[12px] text-[10px] font-medium ${selectedPhaseId === null
                        ? "bg-[#3586FF] text-white shadow-md"
                        : "bg-gray-200 text-black"
                        }`}
                      onClick={() => setSelectedPhaseId(null)}
                    >
                      All Phases
                    </Button>
                    {customBuilder?.phases?.map((phase: any) => (
                      <Button
                        key={phase.id}
                        className={`md:px-3 px-2 py-1 md:rounded-[10px] border rounded-[4px] md:text-[12px] text-[10px] font-medium text-nowrap ${selectedPhaseId === phase.id
                          ? "bg-[#3586FF] text-white shadow-md"
                          : "bg-gray-200 text-black border-gray-200"
                          }`}
                        onClick={() => {
                          setSelectedPhaseId(phase.id);
                          setPage(1);
                        }}
                      >
                        {phase.name}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto rounded-md shadow-custom mt-4">
                  <table className="w-full text-[12px] border border-collapse border-gray-300 rounded-[4px] md:rounded-[10px] bg-white">
                    <thead>
                      <tr className="bg-gray-200 text-black text-left text-nowrap font-bold">
                        <th className="border border-gray-300 p-2 text-center">
                          Day
                        </th>
                        <th className="border border-gray-300 p-2 text-center">
                          Date
                        </th>
                        <th className="border border-gray-300 p-2 text-center">
                          Work Type
                        </th>
                        <th className="border border-gray-300 p-2 text-center">
                          Place
                        </th>
                        <th className="border border-gray-300 p-2 text-center">
                          Status
                        </th>
                        <th className="border border-gray-300 p-2 text-center">
                          Description
                        </th>
                        <th className="border border-gray-300 p-2 text-center">
                          Workers
                        </th>
                        <th className="border border-gray-300 p-2 text-center">
                          Issues
                        </th>
                        <th className="border border-gray-300 p-2 text-center">
                          Customer Notes
                        </th>
                        {selectedPhaseId === null && (
                          <th className="border border-gray-300 p-2 text-center">
                            Phase
                          </th>
                        )}
                        <th className="border border-gray-300 p-2 text-center">
                          UploadedBy Name
                        </th>
                        <th className="border border-gray-300 p-2 text-center">
                          Uploader Location
                        </th>
                        <th className="border border-gray-300 p-2 text-center">
                          UploadedBy
                        </th>
                        <th className="border border-gray-300 p-2 text-center">
                          Media
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows?.length > 0 ? (
                        filteredRows?.map((log: any, index: number) => (
                          <tr
                            key={log.id}
                            className="hover:bg-gray-100 transition-colors  text-gray-800 font-medium"
                          >
                            <td className="border p-2 text-center">
                              {log?.day ?? index + 1}
                            </td>
                            <td className="border p-2 text-center text-nowrap">
                              {log?.date}
                            </td>
                            <td className="border p-2 text-center">
                              {Array.isArray(log?.workType)
                                ? log?.workType.join(", ")
                                : log?.workType}
                            </td>
                            <td className="border p-2 text-center">
                              {Array.isArray(log?.placeType)
                                ? log?.placeType.join(", ")
                                : log?.placeType}
                            </td>
                            <td className="border p-2 text-center text-nowrap">
                              <span
                                className={`px-2 py-1 rounded-md ${log?.status === "Completed"
                                  ? "text-green-700 bg-green-100"
                                  : log?.status === "In Progress"
                                    ? "bg-blue-100 text-[#3586FF]"
                                    : log?.status === "Pending"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : log?.status === "Delayed"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100 text-gray-700"
                                  }`}
                              >
                                {log?.status}
                              </span>
                            </td>
                            <td
                              className="border p-2 text-center max-w-[200px] truncate"
                              title={log?.description}
                            >
                              {log?.description || "—"}
                            </td>
                            <td className="border p-2 text-center">
                              {log?.laborCount ?? 0}
                            </td>
                            <td className="border p-2 text-center">
                              {log?.issues || "—"}
                            </td>
                            <td
                              className="border p-2 text-center max-w-[200px] truncate"
                              title={log?.customerNotes}
                            >
                              {log?.customerNotes || "—"}
                            </td>
                            {selectedPhaseId === null && (
                              <td className="md:py-2 py-2 md:px-2 px-2 text-center font-medium border border-gray-300">
                                {customBuilder?.phases?.find(
                                  (p: any) => p?.id === log?.phaseId
                                )?.name ?? "-"}
                              </td>
                            )}
                            <td className="border p-2 text-center">
                              {log?.uploadedByName ?? "-"}
                            </td>
                            <td className="md:py-2 py-2 md:px-2 px-2 text-center font-medium border border-gray-300">
                              {log?.uploadLocation ? (
                                <Link
                                  href={`https://www.google.com/maps/search/?api=1&query=${log.uploadLocation.latitude},${log.uploadLocation.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#3586FF] flex items-center justify-center gap-1 cursor-pointer"
                                  title={`City: ${log.uploadLocation.city}
State: ${log.uploadLocation.state}
Country: ${log.uploadLocation.country}
Locality: ${log.uploadLocation.locality}
Lat: ${log.uploadLocation.latitude}
Lng: ${log.uploadLocation.longitude}`}
                                >
                                  <MapPin className="md:w-4 md:h-4 w-3 h-3" />
                                  {log.uploadLocation.city}
                                </Link>
                              ) : (
                                "-"
                              )}
                            </td>

                            <td className="border p-2 text-center">
                              {log?.uploadedByProfile?.length > 0 ? (
                                <Button
                                  className="text-[#3586FF] text-nowrap font-medium"
                                  onClick={() => {
                                    setSelectedMedia(
                                      (Array.isArray(log?.uploadedByProfile)
                                        ? log?.uploadedByProfile
                                        : [log?.uploadedByProfile]
                                      )
                                        .filter(Boolean)
                                        .map((item: string) => ({
                                          url: item,
                                          createdAt: log.createdAt,
                                          source: "uploadedByProfile",
                                        }))
                                    );

                                    setMediaModalOpen(true);
                                  }}
                                >
                                  View Uploader
                                </Button>
                              ) : (
                                "No Media"
                              )}
                            </td>
                            <td className="border p-2 text-center">
                              {log?.imageOrVideo?.length > 0 ? (
                                <Button
                                  className="text-[#3586FF] text-nowrap font-medium"
                                  onClick={() => {
                                    setSelectedMedia(
                                      log.imageOrVideo.map((item: any) => ({
                                        url: item,
                                        createdAt: log.createdAt,
                                        source: "imageOrVideo",
                                      }))
                                    );
                                    setMediaModalOpen(true);
                                  }}
                                >
                                  View Media ({log?.imageOrVideo?.length})
                                </Button>
                              ) : (
                                "No Media"
                              )}
                            </td>
                            {mediaModalOpen && (
                              <Modal
                                isOpen={mediaModalOpen}
                                closeModal={() => setMediaModalOpen(false)}
                                title={
                                  selectedMedia?.[0]?.source ===
                                    "uploadedByProfile"
                                    ? "Uploaded by Profile"
                                    : "Media Gallery"
                                }
                                rootCls="z-[99999]"
                                titleCls="font-medium md:text-[18px] text-[12px] text-center text-[#3586FF]"
                                isCloseRequired={true}
                                className="md:max-w-[800px] max-w-[320px] w-full"
                              >
                                <div className="flex flex-wrap items-center justify-center gap-3 mt-[10px]">
                                  {selectedMedia.map((item, idx) => {
                                    const isVideo =
                                      item?.url.endsWith(".mp4") ||
                                      item?.url?.endsWith(".webm");
                                    return (
                                      <div
                                        key={idx}
                                        className="w-[160px] h-[150px] relative"
                                      >
                                        {isVideo ? (
                                          <video
                                            src={item?.url}
                                            controls
                                            className="w-full h-full object-cover md:rounded-[10px] rounded-[4px]"
                                          />
                                        ) : (
                                          <Image
                                            src={item?.url}
                                            alt={`Media ${idx + 1}`}
                                            fill
                                            className="md:rounded-[10px] rounded-[4px] object-cover"
                                          />
                                        )}
                                        {item.source ===
                                          "uploadedByProfile" && (
                                            <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-1 md:rounded-b-[10px] rounded-b-[4px]">
                                              {new Date(
                                                item?.createdAt
                                              ).toLocaleDateString()}
                                            </p>
                                          )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </Modal>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={10}
                            className="text-center p-6 text-gray-500"
                          >
                            No rows for the selected week.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="md:flex-row flex-col flex justify-between md:px-3 px-1  md:py-2 py-1 ">
                  <div className="flex flex-wrap items-center md:gap-4 gap-2 py-2 px-2 text-muted-foreground md:mt-4 mt-2">
                    <Legend
                      data={[
                        { colorclass: "bg-green-500", label: "Completed" },
                        { colorclass: "bg-[#3586FF]", label: "In Progress" },
                        { colorclass: "bg-yellow-500", label: "Pending" },
                        { colorclass: "bg-red-500", label: "Delayed" },
                      ]}
                    />
                  </div>
                  {filteredRows?.length > limit && (
                    <div className="mt-4 flex gap-2 items-center flex-wrap">
                      <p className="font-medium md:text-[12px] text-[10px] text-nowrap">
                        Rows Per Page :
                      </p>
                      <select
                        value={limit}
                        onChange={(e) => {
                          setLimit(Number(e.target.value));
                          setPage(1);
                        }}
                        className="md:w-[55px] w-[45px] p-1 border border-gray-300 rounded font-medium text-[10px] md:text-[12px]"
                      >
                        {[5, 10, 15, 20].map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>

                      <span className="text-nowrap font-medium text-[12px] md:text-[13px]">
                        {page} of {Math.ceil(totalLogs / limit)}
                      </span>

                      <Button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="bg-gray-400 flex items-center gap-1 text-white text-[12px] md:text-[14px] px-3 py-2 rounded-md font-medium"
                      >
                        <FaChevronLeft />
                      </Button>

                      <Button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page >= Math.ceil(totalLogs / limit)}
                        className="bg-[#3586FF] hover:bg-[#3586FF] flex items-center gap-1 text-[12px] md:text-[14px] text-white px-3 py-2 rounded-md font-medium"
                      >
                        <FaChevronRight />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full md:max-w-[1200px] max-w-[360px] mt-3 md:px-4 px-2">
            <TrendsClient
              workData={(customBuilder?.logs ) as any || []}
              phases={(customBuilder as any)?.phases || []}
              estimatedDays={totalEstimatedDays}
              activePhaseId={null}
            />
          </div>
        )}
      </div>

      {/* Client Trends (no cost or EVM) */}
    </>
  );
}
type LegendItem = {
  colorclass: string;
  label: string;
};

type LegendProps = {
  data: LegendItem[];
};

const Legend: React.FC<LegendProps> = ({ data }) => {
  return (
    <div className="flex items-center md:gap-3 gap-1 md:text-[12px] text-[10px] font-medium">
      {data.map(({ colorclass, label }) => (
        <div key={label} className="flex items-center gap-1">
          <span
            className={`md:w-3 w-2.5 md:h-3 h-2.5 rounded-[4px] ${colorclass}`}
          ></span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};
