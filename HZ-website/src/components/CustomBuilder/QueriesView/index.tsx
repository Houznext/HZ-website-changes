import React, { useState, useEffect, useMemo } from "react";
import { HelpCircle, Plus } from "lucide-react";
import { FaCalendarAlt } from "react-icons/fa";
import { MdPending } from "react-icons/md";
import { BsCheck2Circle } from "react-icons/bs";
import { FiSliders } from "react-icons/fi";

import Button from "@/common/Button";
import RouterBack from "../RouterBack";
import Drawer from "@/common/Drawer";
import Modal from "@/common/Modal";
import CustomInput from "@/common/FormElements/CustomInput";
import CustomDate from "@/common/FormElements/CustomDate";
import Loader from "@/components/Loader";

import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import apiClient from "@/utils/apiClient";
import { filtersdata } from "../ServicesSelectedView/helper";
import { getDateRange } from "@/utils/dateRange";


const TabPill: React.FC<{
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  count: number;
  onClick: () => void;
}> = ({ active, icon, label, count, onClick }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-full border px-3 md:px-4 md:py-1.5 py-1 transition
      ${active ? "bg-[#3586FF] text-white border-[#3586FF]" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}
  >
    <span className="shrink-0">{icon}</span>
    <span className="btn-text capitalize">{label}</span>
    <span
      className={`ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${active ? "bg-white text-[#3586FF]" : "bg-gray-100 text-gray-700"
        }`}
    >
      {count}
    </span>
  </button>
);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/* ------------------------------ Component ------------------------------ */

export default function QueriesView() {
  const router = useRouter();
  const custom_builder_id = router?.query?.id;

  const session = useSession();
  const [user, setUser] = useState<any>();

  const [activeTab, setActiveTab] = useState<"active" | "resolved">("active");
  const [openModal, setOpenModal] = useState(false);
  const [OpenMessageModal, setOpenMessageModal] = useState(false);
  const [SelectedQuery, setSelectedQuery] = useState<any>();

  const [isOpen, setIsOpen] = useState(false);
  type FilterType = (typeof filtersdata)[number]["id"];
  const [selectedDateFilter, setSelectedDateFilter] =
    useState<FilterType>("all");
  const [customRange, setCustomRange] = useState({ startDate: "", endDate: "" });

  const [isLoading, setIsLoading] = useState(false);
  const [tabContent, setTabContent] = useState<{ active: any[]; resolved: any[] }>({
    active: [],
    resolved: [],
  });

  const [FormData, setFormData] = useState({ title: "", message: "" });

  useEffect(() => {
    if (session.status === "authenticated") setUser(session?.data?.user);
  }, [session?.status]);

  const FetchQueries = async (
    filter: FilterType,
    custom?: { startDate: string; endDate: string }
  ) => {
    if (!custom_builder_id) return;
    setIsLoading(true);
    try {
      let qs = "";
      if (filter !== "all") {
        const { startDate, endDate } = getDateRange(filter, custom);
        if (!startDate || !endDate) throw new Error("Invalid date range");
        qs = `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
      }
      const res = await apiClient.get(
        `${apiClient.URLS.queries}/custom-builder/${custom_builder_id}${qs}`
      );
      if (res.status === 200 && res.body) {
        const all = res.body;
        setTabContent({
          active: all.filter((q: any) => q.status === "Active"),
          resolved: all.filter((q: any) => q.status === "Resolved"),
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch queries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (custom_builder_id) FetchQueries("all");
  }, [custom_builder_id]);

  function applyFilter() {
    try {
      let range;
      if (selectedDateFilter === "custom") {
        if (!customRange.startDate || !customRange.endDate) return;
        range = { startDate: customRange.startDate, endDate: customRange.endDate };
      }
      const { startDate, endDate } = getDateRange(selectedDateFilter, range);
      FetchQueries(selectedDateFilter, { startDate, endDate });
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  }

  const tabIcons: Record<string, JSX.Element> = {
    active: <MdPending className="mr-1 md:w-[16px] md:h-[16px] w-[12px] h-[12px]" />,
    resolved: <BsCheck2Circle className="mr-1 md:w-[16px] md:h-[16px] w-[12px] h-[12px]" />,
  };

  const emptyState = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10">
        <HelpCircle className="h-8 w-8 text-gray-400" />
        <p className="label-text text-gray-700 mt-2">No {activeTab} queries found</p>
        <p className="sublabel-text text-gray-500">Try changing the date filter above.</p>
      </div>
    ),
    [activeTab]
  );

  const handleClick = (index: number) => {
    const q = tabContent[activeTab][index];
    if (q) {
      setSelectedQuery(q);
      setOpenMessageModal(true);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handlesubmit = async (e: any) => {
    e.preventDefault();
    if (!FormData.title.trim() || !FormData.message.trim()) {
      toast.error("Please fill in both Title and Message");
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        title: FormData.title.trim(),
        message: FormData.message.trim(),
        customBuilderId: custom_builder_id,
      };
      const res = await apiClient.post(`${apiClient.URLS.queries}/${user.id}`, payload, true);
      if (res.status === 200 || res.status === 201) {
        toast.success("Query submitted");
        setFormData({ title: "", message: "" });
        setOpenModal(false);
        FetchQueries("all");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit query");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !openModal && !OpenMessageModal) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-4 w-full flex flex-col gap-2">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="px-2 py-4">
          <RouterBack />
        </div>
        <Button
          className="bg-[#3B82F6] text-white font-medium text-[12px] rounded-[6px] md:px-[14px] px-[10px] md:py-[6px] py-[4px]  md:text-[14px]"
          onClick={() => setOpenModal(true)}
          aria-label="Create a new query"
        >
          Add query
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-custom">
        <div className="flex items-start justify-between md:px-6 px-3 md:py-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100">
              <HelpCircle className="text-[#3586FF] md:w-6 md:h-6 w-4 h-4" />
            </div>
            <div>
              <h1 className="heading-text">Queries</h1>
              <p className="text-[12px] text-gray-500">
                View your queries, filter by date, and create a new one.
              </p>
            </div>
          </div>

          {/* Sort / Filter */}
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
                <ul className="md:py-2 py-1 max-h-[50vh] overflow-auto">
                  {filtersdata.map((filter) => (
                    <li key={filter.id} className="flex items-center gap-2 px-3 md:py-2 py-1  hover:bg-gray-50">
                      <input
                        type="radio"
                        id={filter.id}
                        name="dateFilter"
                        className="accent-[#3586FF]"
                        checked={selectedDateFilter === filter.id}
                        onChange={() => setSelectedDateFilter(filter.id)}
                      />
                      <label htmlFor={filter.id} className="key-text cursor-pointer">
                        {filter.label}
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
                        onChange={(e) => setCustomRange((p) => ({ ...p, startDate: e.target.value }))}
                        placeholder="Date"
                        className="px-3 md:py-1 py-[2px]"
                        name="date"
                      />
                      <CustomDate
                        type="date"
                        label="End Date"
                        labelCls="label-text"
                        value={customRange.endDate}
                        onChange={(e) => setCustomRange((p) => ({ ...p, endDate: e.target.value }))}
                        placeholder="Date"
                        className="px-3 md:py-1 py-[2px]"
                        name="date"
                      />
                    </li>
                  )}
                </ul>
                <div className="flex justify-end gap-2 px-3 py-2 border-t border-gray-100">
                  <Button
                    className="rounded-md border-2 p-1 border-[#3B82F6] btn-text"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="rounded-md border-2 p-1 bg-[#3B82F6] text-white btn-text"
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
          <div className="flex gap-2 overflow-x-auto py-1">
            {(["active", "resolved"] as const).map((tab) => (
              <TabPill
                key={tab}
                active={activeTab === tab}
                icon={tabIcons[tab]}
                label={tab}
                count={tabContent[tab].length}
                onClick={() => setActiveTab(tab)}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="md:px-6 px-3 md:pb-6 pb-4">
          {isLoading ? (
            <div className="grid gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-gray-50 h-24" />
              ))}
            </div>
          ) : tabContent[activeTab].length === 0 ? (
            emptyState
          ) : (
            <div className="grid gap-4">
              {tabContent[activeTab].map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-gray-200 bg-white shadow-custom hover:shadow-md transition"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-medium">{item.title}</p>
                        <p className="sublabel-text text-gray-600">{item.message}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-500">
                        <FaCalendarAlt className="text-[#3586FF] md:w-[16px] md:h-[16px] h-[12px] w-[12px]" />
                        <p className="sublabel-text">
                          Created on <span className="font-medium">{formatDate(item.createdAt)}</span>
                        </p>
                      </div>

                      <Button
                        className="rounded-lg bg-[#3586FF] text-white btn-text px-3 md:px-4 py-2"
                        onClick={() => handleClick(index)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View Reply Modal */}
      {OpenMessageModal && SelectedQuery && (
        <Modal
          isOpen={OpenMessageModal}
          closeModal={() => setOpenMessageModal(false)}
          className="md:max-w-[620px] max-w-[340px] md:min-h-[220px] min-h-[200px]"
          rootCls="z-[99999]"
        >
          {SelectedQuery?.adminReply ? (
            <div className="p-4 md:p-6">
              <p className="sub-heading mb-2">Admin reply</p>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-[14px] md:text-[16px] font-medium text-gray-800">
                  {SelectedQuery.adminReply}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-6">
              <h1 className="text-medium">No reply for this query yet</h1>
            </div>
          )}
        </Modal>
      )}

      {/* New Query Drawer */}
      {openModal && (
        <Drawer
          open={openModal}
          handleDrawerToggle={() => setOpenModal(false)}
          closeIconCls="text-black"
          openVariant="right"
          panelCls="w-[80%] sm:w-[80%] lg:w-[calc(100%-190px)] shadow-xl"
          overLayCls="bg-gray-700 bg-opacity-40"
        >
          <div className="w-full flex flex-col gap-0">
            <div className="md:px-8 px-4 md:py-5 py-4 border-b border-gray-100 bg-white">
              <h2 className="heading-text">Create a query</h2>
              <p className="text-[12px] text-gray-500">
                Tell us what you need help with. We’ll get back to you as soon as possible.
              </p>
            </div>
            <form className="md:px-8 px-4 md:py-6 py-4 space-y-4" onSubmit={handlesubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomInput
                  label="Title"
                  type="text"
                  name="title"
                  labelCls="label-text"
                  placeholder="Enter title"
                  className=" md:px-3 px-2 py-[2px]  border w-full border-[#CFCFCF] rounded-[8px]"
                  rootCls="px-1"
                  value={FormData.title}
                  onChange={handleInputChange}
                  required
                />
                <div className="md:col-span-2 col-span-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="label-text">Message</label>
                    <span className="text-[12px] text-gray-500">
                      {(FormData.message?.length || 0)}/500
                    </span>
                  </div>
                  <CustomInput
                    label=""
                    type="textarea"
                    name="message"
                    labelCls="hidden"
                    placeholder="Describe the issue or request…"
                    className="md:text-[14px] text-[12px] font-regular min-h-[100px] md:min-h-[140px] border border-[#CFCFCF] rounded-[8px] text-black px-3 "
                    rootCls="px-1"
                    value={FormData.message}
                    onChange={handleInputChange}
                    maxLength={500}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 md:mt-4">
                <Button
                  className="rounded-md border-2 border-[#3B82F6] btn-text px-3 md:px-4 py-1 "
                  type="button"
                  onClick={() => setOpenModal(false)}
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  className="rounded-md border-2 bg-[#3B82F6] text-white btn-text px-3 md:px-4 py-1"
                >
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </Drawer>
      )}
    </div>
  );
}
