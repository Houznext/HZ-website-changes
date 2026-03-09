import apiClient from "@/src/utils/apiClient";
import React, { useEffect, useMemo, useState } from "react";
import { FaList, FaPauseCircle, FaUndo, FaTimesCircle } from "react-icons/fa";
import { MdPending, MdOutlineAutorenew } from "react-icons/md";
import { BsCheck2Circle } from "react-icons/bs";
import { MdArrowBack } from "react-icons/md";
import { FaCalendarAlt } from "react-icons/fa";
import { FiSliders } from "react-icons/fi";
import { HelpCircle } from "lucide-react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Button from "@/src/common/Button";
import Drawer from "@/src/common/Drawer";
import CustomInput from "@/src/common/FormElements/CustomInput";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import CustomDate from "@/src/common/FormElements/CustomDate";
import CustomTooltip from "@/src/common/ToolTip";
import { usePermissionStore } from "@/src/stores/usePermissions";
import { filtersdata } from "@/src/components/CrmView/helper";

/* ------------------------------ Helpers ------------------------------ */

const STATUS_STYLES: Record<
  string,
  { dot: string; bg: string; text: string; ring: string }
> = {
  Active: {
    dot: "bg-[#5297ff]",
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-100",
  },
  Resolved: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-100",
  },
  "On Hold": {
    dot: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-100",
  },
  Reopened: {
    dot: "bg-violet-500",
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-violet-100",
  },
  Cancelled: {
    dot: "bg-rose-500",
    bg: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-100",
  },
  "In Progress": {
    dot: "bg-indigo-500",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    ring: "ring-indigo-100",
  },
};



const STATUS_UI: Record<string, { dot: string; bg: string; text: string; ring: string }> = {
  Active: { dot: "bg-[#5297ff]", bg: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-100" },
  Resolved: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-100" },
  "On Hold": { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-100" },
  Reopened: { dot: "bg-violet-500", bg: "bg-violet-50", text: "text-violet-700", ring: "ring-violet-100" },
  Cancelled: { dot: "bg-rose-500", bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-100" },
  "In Progress": { dot: "bg-indigo-500", bg: "bg-indigo-50", text: "text-indigo-700", ring: "ring-indigo-100" },
};

const StatusBadge: React.FC<{ status?: string }> = ({ status = "Active" }) => {
  const ui = STATUS_UI[status] || STATUS_UI["Active"];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${ui.bg} ${ui.text} ring-1 ${ui.ring} btn-text`}>
      <span className={`h-2 w-2 rounded-full ${ui.dot}`} />
      {status}
    </span>
  );
};

const InfoRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 py-2">
    <span className="sublabel-text text-gray-500">{label}</span>
    <span className="sublabel-text font-medium text-gray-800 text-right">{value || "—"}</span>
  </div>
);


const TabPill: React.FC<{
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  count: number;
  onClick: () => void;
}> = ({ active, icon, label, count, onClick }) => (
  <Button
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-full border px-3 md:px-4 md:py-1.5 py-[2px] transition-all
      ${active ? "bg-[#5297ff] text-white border-[#5297ff]" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}
  >
    <span className="shrink-0">{icon}</span>
    <span className="capitalize btn-text">{label}</span>
    <span
      className={`ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${active ? "bg-white text-[#3586FF] " : "bg-gray-100 text-gray-700"
        }`}
    >
      {count}
    </span>
  </Button>
);

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

type FilterType = (typeof filtersdata)[number]["id"];

function getDateRange(
  filter: FilterType,
  customRange?: { startDate: string; endDate: string }
) {
  if (filter === "all") return { startDate: "", endDate: "" };
  const now = new Date();
  let startDate: Date;
  let endDate = new Date(now.setHours(23, 59, 59, 999));
  switch (filter) {
    case "today": {
      const s = new Date();
      s.setHours(0, 0, 0, 0);
      const e = new Date();
      e.setHours(23, 59, 59, 999);
      startDate = s;
      endDate = e;
      break;
    }
    case "yesterday": {
      const s = new Date();
      s.setDate(s.getDate() - 1);
      s.setHours(0, 0, 0, 0);
      const e = new Date(s);
      e.setHours(23, 59, 59, 999);
      startDate = s;
      endDate = e;
      break;
    }
    case "last7Days": {
      const s = new Date();
      s.setDate(s.getDate() - 7);
      s.setHours(0, 0, 0, 0);
      startDate = s;
      break;
    }
    case "last14Days": {
      const s = new Date();
      s.setDate(s.getDate() - 14);
      s.setHours(0, 0, 0, 0);
      startDate = s;
      break;
    }
    case "lastMonth": {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0);
      e.setHours(23, 59, 59, 999);
      startDate = s;
      endDate = e;
      break;
    }
    case "custom": {
      if (!customRange) throw new Error("Custom range requires start/end");
      const s = new Date(customRange.startDate);
      const e = new Date(customRange.endDate);
      if (isNaN(s.getTime()) || isNaN(e.getTime()))
        throw new Error("Invalid custom range");
      startDate = s;
      endDate = e;
      break;
    }
    default:
      throw new Error("Invalid filter");
  }
  return { startDate: toLocalDateString(startDate), endDate: toLocalDateString(endDate) };
}

/* ------------------------------ Component ------------------------------ */

export default function QueriesView() {
  const [allQueries, setAllQueries] = useState<any[]>([]);
  const [activeQueries, setActiveQueries] = useState<any[]>([]);
  const [resolvedQueries, setResolvedQueries] = useState<any[]>([]);
  const [onholdQueries, setOnHoldQueries] = useState<any[]>([]);
  const [reopenedqueries, setReopenedQueries] = useState<any[]>([]);
  const [cancelledqueries, setCancelledQueries] = useState<any[]>([]);
  const [inprogressQueries, setInProgressQueries] = useState<any[]>([]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<any | null>(null);

  const [formData, setFormData] = useState({ adminReply: "", status: "" });

  const [isOpen, setIsOpen] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] =
    useState<FilterType>("all");
  const [customRange, setCustomRange] = useState({
    startDate: "",
    endDate: "",
  });

  const [customBuilderId, setCustomBuilderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { hasPermission } = usePermissionStore((s) => s);

  type TabKeyType = keyof typeof tabContent;
  const [selectedTab, setSelectedTab] = useState<TabKeyType>("all");

  
  const Statusdata = React.useMemo(
  () => [
    { id: 1, status: "Active" },
    { id: 2, status: "Resolved" },
    { id: 3, status: "On Hold" },
    { id: 4, status: "Reopened" },
    { id: 5, status: "Cancelled" },
    { id: 6, status: "In Progress" },
  ],
  []
);


  const tabContent = {
    all: {
      icon: <FaList className="mr-1 md:w-[16px] md:h-[16px] w-[12px] h-[12px]" />,
      count: allQueries.length,
      data: allQueries,
      label: "all",
    },
    active: {
      icon: <MdPending className="mr-1 md:w-[16px] md:h-[16px] w-[12px] h-[12px]" />,
      count: activeQueries.length,
      data: activeQueries,
      label: "active",
    },
    resolved: {
      icon: <BsCheck2Circle className="mr-1 md:w-[16px] md:h-[16px] w-[12px] h-[12px]" />,
      count: resolvedQueries.length,
      data: resolvedQueries,
      label: "resolved",
    },
    onHold: {
      icon: <FaPauseCircle className="mr-1 md:w-[16px] md:h-[16px] w-[12px] h-[12px]" />,
      count: onholdQueries.length,
      data: onholdQueries,
      label: "on hold",
    },
    reopened: {
      icon: <FaUndo className="mr-1 md:w-[16px] md:h-[16px] w-[12px] h-[12px]" />,
      count: reopenedqueries.length,
      data: reopenedqueries,
      label: "reopened",
    },
    cancelled: {
      icon: <FaTimesCircle className="mr-1 md:w-[16px] md:h-[16px] w-[12px] h-[12px]" />,
      count: cancelledqueries.length,
      data: cancelledqueries,
      label: "cancelled",
    },
    inProgress: {
      icon: (
        <MdOutlineAutorenew className="mr-1 md:w-[16px] md:h-[16px] w-[12px] h-[12px] animate-spin" />
      ),
      count: inprogressQueries.length,
      data: inprogressQueries,
      label: "in progress",
    },
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

 
  const selectedStatusOption = React.useMemo(() => {
  const current = formData.status || selectedQuery?.status || "Active";
  return Statusdata.find((s) => s.status === current) ?? Statusdata[0];
}, [Statusdata, formData.status, selectedQuery?.status]);


const handleSelectstatus = React.useCallback(
  (opt: { id: number; status: string }) => {
    if (!opt) return;
    if (opt.status !== formData.status) {
      setFormData((p) => ({ ...p, status: opt.status }));
    }
  },
  [formData.status]
);

  const FetchQueries = async (
    id: string,
    filter: FilterType,
    custom?: { startDate: string; endDate: string }
  ) => {
    if (!id) return;
    setIsLoading(true);
    try {
      let queryString = "";
      if (filter !== "all") {
        const { startDate, endDate } = getDateRange(filter, custom);
        if (!startDate || !endDate) throw new Error("Invalid date range");
        queryString = `?startDate=${encodeURIComponent(
          startDate
        )}&endDate=${encodeURIComponent(endDate)}`;
      }

      const res = await apiClient.get(
        `${apiClient.URLS.queries}/custom-builder/${id}${queryString}`
      );

      if (res.status === 200 && res.body) {
        const qs = res.body;
        setAllQueries(qs);
        setActiveQueries(qs.filter((q: any) => q.status === "Active"));
        setResolvedQueries(qs.filter((q: any) => q.status === "Resolved"));
        setOnHoldQueries(qs.filter((q: any) => q.status === "On Hold"));
        setReopenedQueries(qs.filter((q: any) => q.status === "Reopened"));
        setCancelledQueries(qs.filter((q: any) => q.status === "Cancelled"));
        setInProgressQueries(qs.filter((q: any) => q.status === "In Progress"));
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch queries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    const id = (router.query.id as string) || router.asPath.split("/")[2];
    if (id) {
      setCustomBuilderId(id);
      FetchQueries(id, "all");
    }
  }, [router.isReady, router.query, router.asPath]);

  function applyFilter() {
    try {
      let range;
      if (selectedDateFilter === "custom") {
        if (!customRange.startDate || !customRange.endDate) return;
        range = { startDate: customRange.startDate, endDate: customRange.endDate };
      }
      const { startDate, endDate } = getDateRange(selectedDateFilter, range);
      if (customBuilderId)
        FetchQueries(customBuilderId, selectedDateFilter, { startDate, endDate });
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  }

  const emptyState = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10">
        <HelpCircle className="h-8 w-8 text-gray-400" />
        <p className="mt-2 text-medium text-gray-700">No {tabContent[selectedTab].label} queries found</p>
        <p className="sublabel-text text-gray-500">Try changing the filter above.</p>
      </div>
    ),
    [selectedTab]
  );

  return (
    <>
      {/* Back */}
      <div onClick={() => router.back()} className="flex items-center gap-2 mb-3 cursor-pointer">
        <MdArrowBack className="w-[20px] h-[20px]" />
        <span className="text-[14px] md:text-[16px] font-medium">Back</span>
      </div>

      {/* Header */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-custom">
        <div className="flex items-start justify-between md:px-6 px-3 md:py-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100">
              <HelpCircle className="text-[#3586FF]  md:w-6 md:h-6 w-4 h-4" />
            </div>
            <div>
              <h1 className="heading-text">Queries</h1>
              <p className="sublabel-text text-gray-500">Track, filter and respond to customer queries.</p>
            </div>
          </div>

          <div className="relative">
            <Button
              onClick={() => setIsOpen((p) => !p)}
              className="flex items-center gap-2 bg-white border font-medium border-gray-300 btn-text text-nowrap md:py-[8px] py-[4px] md:px-4 px-2 rounded-lg"
            >
              <FiSliders className="text-gray-500" />
              Sort By
            </Button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-[220px] md:w-[260px] rounded-xl border border-gray-200 bg-white shadow-custom z-10">
                <ul className="py-2 max-h-[50vh] overflow-auto">
                  {filtersdata.map((f) => (
                    <li key={f.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50">
                      <input
                        type="radio"
                        id={f.id}
                        name="dateFilter"
                        className="accent-[#5297ff]"
                        checked={selectedDateFilter === f.id}
                        onChange={() => setSelectedDateFilter(f.id)}
                      />
                      <label htmlFor={f.id} className="key-text cursor-pointer">
                        {f.label}
                      </label>
                    </li>
                  ))}
                  {selectedDateFilter === "custom" && (
                    <li className="px-3 py-2 border-t border-gray-100 space-y-2">
                      <CustomDate
                        type="date"
                        label="Start Date"
                        labelCls="label-text"
                        value={customRange.startDate}
                        onChange={(e) =>
                          setCustomRange((p) => ({ ...p, startDate: e.target.value }))
                        }
                        placeholder="Date"
                        className="px-3 md:py-1 py-[2px]"
                        name="date"
                      />
                      <CustomDate
                        type="date"
                        label="End Date"
                        labelCls="label-text"
                        value={customRange.endDate}
                        onChange={(e) =>
                          setCustomRange((p) => ({ ...p, endDate: e.target.value }))
                        }
                        placeholder="Date"
                        className="px-3 md:py-1 py-[2px]"
                        name="date"
                      />
                    </li>
                  )}
                </ul>
                <div className="flex justify-end gap-2 px-3 py-2 border-t border-gray-100">
                  <Button
                    className="rounded-md border-2 border-[#3B82F6] btn-text"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="rounded-md border-2 bg-[#3B82F6] text-white btn-text"
                    onClick={applyFilter}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="md:px-6 px-3 md:pb-4 pb-3">
          <div className="flex gap-2 overflow-x-auto md:py-1 py-[2px]">
            {Object.entries(tabContent).map(([key, t]) => (
              <TabPill
                key={key}
                active={selectedTab === (key as TabKeyType)}
                icon={t.icon}
                label={key}
                count={t.count}
                onClick={() => setSelectedTab(key as TabKeyType)}
              />
            ))}
          </div>
        </div>

        <div className="md:px-6 px-3 md:pb-6 pb-4">
          {isLoading ? (
            <div className="grid gap-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-gray-200 bg-gray-50 h-24"
                />
              ))}
            </div>
          ) : tabContent[selectedTab].data.length === 0 ? (
            emptyState
          ) : (
            <div className="grid gap-4">
              {tabContent[selectedTab].data.map((q: any, idx: number) => {
                const palette = STATUS_STYLES[q.status] ?? STATUS_STYLES["Active"];
                return (
                  <div
                    key={idx}
                    className={`rounded-xl border border-gray-200 bg-white shadow-custom hover:shadow-md transition overflow-hidden`}
                  >
                    <div className={`h-1 w-full ${palette.dot}`} />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-medium">{q.title}</p>
                          <p className="sublabel-text text-gray-600">{q.message}</p>
                          {q?.adminReply && (
                            <p className="sublabel-text text-gray-500">
                              <span className="font-medium">Reply:</span> {q.adminReply}
                            </p>
                          )}
                        </div>
                        <StatusBadge status={q.status || "Active"} />
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-500">
                          <FaCalendarAlt className="text-[#3586FF]  md:w-[16px] md:h-[16px] h-[12px] w-[12px]" />
                          <p className="sublabel-text">
                            Created on <span className="font-medium">{formatDate(q.createdAt)}</span>
                          </p>
                        </div>

                        <CustomTooltip
                          label="Access Restricted • Contact Admin"
                          position="bottom"
                          tooltipBg="bg-black/60 backdrop-blur-md"
                          tooltipTextColor="text-white py-2 px-4 font-medium"
                          labelCls="text-[10px] font-medium"
                          showTooltip={!hasPermission("cb_query", "create")}
                        >
                          <Button
                            disabled={!hasPermission("cb_query", "create")}
                            className="rounded-lg bg-[#5297ff] text-white btn-text px-3 md:px-4 py-2"
                            onClick={() => {
                              setSelectedQuery(q);
                              setFormData({
                                adminReply: q?.adminReply ?? "",
                                status: q?.status ?? "Active",
                              });
                              setOpenModal(true);
                            }}
                          >
                            Respond
                          </Button>
                        </CustomTooltip>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Drawer */}
      {openModal && selectedQuery && (
        <Drawer
          open={openModal}
          handleDrawerToggle={() => setOpenModal(false)}
          closeIconCls="text-black"
          openVariant="right"
          panelCls="w-[92%] sm:w-[95%] lg:w-[calc(100%-180px)] shadow-xl"
          overLayCls="bg-gray-700 bg-opacity-40"
        >
          <div className="w-full flex flex-col gap-0">
            {/* Header */}
            <div className="md:px-8 px-4 md:py-5 py-4 border-b border-gray-100 bg-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[18px] md:text-[22px] font-bold">
                    Respond to:&nbsp;
                    <span className="text-[#3586FF] ">{selectedQuery?.title}</span>
                  </h2>
                  <p className="sublabel-text text-gray-600 mt-1">{selectedQuery?.message}</p>
                </div>
                <StatusBadge status={formData.status || selectedQuery?.status} />
              </div>
            </div>

            {/* Body: 2-column on md+ */}
            <form
              className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 md:px-8 px-4 md:py-6 py-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!selectedQuery) return;
                const payload = {
                  adminReply: formData.adminReply?.trim(),
                  status: formData.status || "Active",
                };
                if (!payload.adminReply) {
                  toast.error("Please write a response");
                  return;
                }
                try {
                  const res = await apiClient.patch(
                    `${apiClient.URLS.queries}/${selectedQuery.id}`,
                    payload,
                    true
                  );
                  if (res.status === 200 || res.status === 201) {
                    toast.success("Reply submitted successfully");
                    setOpenModal(false);
                    setFormData({ adminReply: "", status: "" });
                    if (customBuilderId) FetchQueries(customBuilderId, selectedDateFilter);
                  }
                } catch (err) {
                  console.error(err);
                  toast.error("Failed to submit reply");
                }
              }}
            >
              {/* Left: Composer */}
              <div className="md:col-span-8 col-span-12 space-y-4">
                {/* Quick replies */}
                <div className="flex flex-wrap gap-2">
                  {[
                    "Thanks for reporting — we’re on it.",
                    "We’ve escalated this to our team.",
                    "Could you share a screenshot for clarity?",
                    "This has been resolved. Please verify from your end.",
                    "We’re reviewing your query and will update you shortly.",
                    "This looks like a configuration issue — our support team will assist you.",
                    "Appreciate your patience while we work on this.",
                    "We’ve logged this internally for investigation.",
                    "This is a known issue, and we’re preparing a fix.",
                    "We’ve applied the changes. Kindly refresh and check again.",
                  ].map((q, i) => (
                    <Button
                      key={i}
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({
                          ...p,
                          adminReply: p.adminReply ? `${p.adminReply}\n${q}` : q,
                        }))
                      }
                      className="rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 transition px-3 py-1 sublabel-text font-regular"
                    >
                      {q}
                    </Button>
                  ))}
                </div>

                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <label className="label-text">Response</label>
                    <span className="sublabel-text text-gray-500">
                      {formData.adminReply?.length || 0}/500
                    </span>
                  </div>
                  <CustomInput
                    label=""
                    type="textarea"
                    name="adminReply"
                    labelCls="hidden"
                    placeholder="Enter response here"
                    className="min-h-[120px] md:min-h-[140px] md:px-3 px-2 py-2 text-[12px] border w-full border-[#CFCFCF] rounded-[8px]"
                    required
                    maxLength={500}
                    value={formData.adminReply}
                    onChange={handleInputChange}
                  />
                  {selectedQuery?.adminReply && (
                    <div className="mt-2 rounded-md bg-gray-50 border border-gray-200 p-3">
                      <p className="sublabel-text text-gray-600">
                        <span className="font-medium text-gray-800">Previous reply:</span>{" "}
                        {selectedQuery.adminReply}
                      </p>
                    </div>
                  )}
                </div>

                {/* Status selector inline card */}
                <div className="rounded-xl border border-gray-200 bg-white p-3 md:p-4">
                  <p className="label-text mb-2">Update status</p>
                  <SingleSelect
                    type="single-select"
                    name="status"
                    options={Statusdata}
                    rootCls="border px-2 rounded-[8px] border-[#CFCFCF] flex items-center"
                    buttonCls="border-none w-full"
                    
                     selectedOption={selectedStatusOption} 
                    
                    optionsInterface={{ isObj: true, displayKey: "status" }}
                    handleChange={(_, value) => handleSelectstatus(value)}
                  />
                </div>
              </div>

              {/* Right: Details sidebar */}
              <aside className="md:col-span-4 col-span-12">
                <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-5">
                  <p className="sub-heading mb-2">Query details</p>
                  <div className="h-px bg-gray-100 mb-2" />
                  <InfoRow label="Status" value={<StatusBadge status={formData.status || selectedQuery?.status} />} />
                  <InfoRow label="Created on" value={formatDate(selectedQuery.createdAt)} />
                  {!!selectedQuery?.updatedAt && <InfoRow label="Last updated" value={formatDate(selectedQuery.updatedAt)} />}
                  {!!selectedQuery?.id && <InfoRow label="Query ID" value={`#${selectedQuery.id}`} />}

                  {/* If you have these fields in your payload, they’ll show; else they fall back to “—” */}
                  <InfoRow label="From" value={selectedQuery?.createdBy?.name} />
                  <InfoRow label="Email" value={selectedQuery?.createdBy?.email} />
                  <InfoRow label="Phone" value={selectedQuery?.createdBy?.phone} />
                </div>

                {selectedQuery?.tags?.length ? (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 mt-3">
                    <p className="sub-heading mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedQuery.tags.map((t: string, i: number) => (
                        <span
                          key={i}
                          className="sublabel-text rounded-full bg-gray-100 text-gray-700 px-3 py-1 border border-gray-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </aside>

              {/* Footer actions */}
              <div className="md:col-span-12 col-span-12 flex items-center justify-between md:px-0 px-0 mt-2">
                <div className="sublabel-text text-gray-500 md:px-2">
                  Created on{" "}
                  <span className="font-medium">{formatDate(selectedQuery.createdAt)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    className="rounded-md border-2 border-[#3B82F6] btn-text px-3 md:px-4 py-2"
                    onClick={() => setOpenModal(false)}
                  >
                    Close
                  </Button>

                  <Button
                    type="submit"
                    className="rounded-md border-2 bg-[#3B82F6] text-white btn-text px-3 md:px-4 py-2"
                    onClick={() => {
                      // keep chosen status
                    }}
                  >
                    Send
                  </Button>

                  <Button
                    type="submit"
                    className="rounded-md border-2 bg-gray-600 text-white btn-text px-3 md:px-4 py-2"
                    onClick={() => setFormData((p) => ({ ...p, status: "Resolved" }))}
                  >
                    Send & Mark Resolved
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </Drawer>
      )}

    </>
  );
}
