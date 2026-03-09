import React, { useState, useEffect } from "react";
import { ClipboardCheck } from "lucide-react";
import { useRouter } from "next/router";

import { useCustomBuilderStore } from "@/store/useCustomBuilderStore ";
import RouterBack from "../RouterBack";
import Loader from "@/components/Loader";
import { iconMap } from "./helper";

const snakeToCamel = (str: string) =>
  str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace("-", "").replace("_", "")
  );

const formatLabel = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/\b\w/g, (s) => s.toUpperCase())
    .trim();

const ServicesSelectedView = () => {
  const router = useRouter();
  const custom_builder_id = router?.query?.id;

  const [activeTab, setActiveTab] = useState<string | null>(null);
  const { data: customBuilder, isLoading, fetchData } = useCustomBuilderStore();
  const isRouterReady = router.isReady;

  useEffect(() => {
    if (isRouterReady && custom_builder_id) {
      fetchData(custom_builder_id.toString());
    }
  }, [isRouterReady, custom_builder_id, fetchData]);

  useEffect(() => {
    if (customBuilder?.servicesRequired?.selectedServices?.length) {
      setActiveTab(customBuilder.servicesRequired.selectedServices[0]);
    }
  }, [customBuilder]);

  const getServiceData = (tab: string) => {
    if (!customBuilder?.servicesRequired) return null;
    const normalized = tab.replace(/_/g, "").toLowerCase();
    const matchedKey = Object.keys(customBuilder.servicesRequired).find(
      (key) => key.replace(/_/g, "").toLowerCase() === normalized
    );
    return matchedKey ? customBuilder.servicesRequired[matchedKey] : null;
  };

  if (!isRouterReady || isLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const services =
    customBuilder?.servicesRequired?.selectedServices ?? [];

  return (
    <div className="w-full">
      <div className="mb-4">
        <RouterBack />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 md:p-6 p-4">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <ClipboardCheck size={20} className="text-[#3586FF]" />
          </div>
          <h1 className="heading-text font-bold md:text-xl text-base">
            Services Selected
          </h1>
        </div>

        {services.length > 0 ? (
          <>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
              {services.map((item: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(item)}
                  className={`capitalize whitespace-nowrap md:px-5 px-3.5 md:py-1 py-[2px] label-text font-medium md:text-sm text-xs rounded-full transition-all duration-200 ${
                    activeTab === item
                      ? "bg-[#3586FF] text-white shadow-md shadow-blue-200"
                      : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {item.replace(/_/g, " ")}
                </button>
              ))}
            </div>

            {activeTab && (
              <div>
                <h2 className="heading-text font-semibold md:text-lg text-sm text-gray-800 mb-4">
                  {activeTab.replace(/_/g, " ")} — Details
                </h2>
                {(() => {
                  const serviceData = getServiceData(activeTab);
                  if (serviceData) return <ServiceCard data={serviceData} />;
                  return (
                    <p className="label-text text-gray-400 text-sm py-8 text-center">
                      No data found for this service.
                    </p>
                  );
                })()}
              </div>
            )}
          </>
        ) : (
          <p className="label-text text-gray-400 text-sm py-8 text-center">
            No services have been selected yet.
          </p>
        )}
      </div>
    </div>
  );
};

const HIDDEN_KEYS = new Set([
  "serviceType",
  "id",
  "updatedAt",
  "createdAt",
]);

const ServiceCard = ({ data }: { data: any }) => {
  const mainData =
    Object.keys(data).length === 1 &&
    typeof data[Object.keys(data)[0]] === "object" &&
    !Array.isArray(data[Object.keys(data)[0]])
      ? data[Object.keys(data)[0]]
      : data;

  const entries = Object.entries(mainData).filter(
    ([key]) => !HIDDEN_KEYS.has(key)
  );

  return (
    <div className="border border-gray-100 bg-gray-50/50 rounded-xl md:p-6 p-4">
      <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 md:gap-5 gap-4">
        {entries.map(([key, value]) => (
          <DetailItem key={key} label={key} value={value} />
        ))}
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }: { label: string; value: any }) => {
  if (Array.isArray(value)) {
    if (label === "featureBreakDown" && value.length > 0) {
      return (
        <div className="col-span-full">
          <ItemLabel label={label} />
          <div className="overflow-x-auto mt-2 rounded-lg border border-gray-200">
            <table className="w-full label-text text-xs">
              <thead>
                <tr className="bg-gray-100">
                  {Object.keys(value[0]).map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2 text-left font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      {col.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {value.map((item: any, idx: number) => (
                  <tr
                    key={idx}
                    className="border-t border-gray-100 even:bg-gray-50/60"
                  >
                    {Object.values(item).map((val: any, i) => (
                      <td
                        key={i}
                        className="px-3 py-2 text-gray-700"
                      >
                        {val?.toString() || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="col-span-full sm:col-span-2">
        <ItemLabel label={label} />
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {value.map((item: string, i: number) => (
            <span
              key={i}
              className="label-text capitalize md:text-xs text-[10px] px-2.5 py-1 rounded-md bg-blue-50 text-[#3586FF] font-medium"
            >
              {item?.toString().replace(/_/g, " ")}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (typeof value === "object" && value !== null) {
    if (label === "rooms") {
      return (
        <div className="col-span-full sm:col-span-2">
          <ItemLabel label={label} />
          <div className="flex flex-wrap gap-2 mt-1.5">
            {Object.entries(value).map(([room, count]) => (
              <span
                key={room}
                className="label-text md:text-xs text-[10px] bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium"
              >
                {formatLabel(room)}: {count as any}
              </span>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div>
        <ItemLabel label={label} />
        <p className="label-text md:text-sm text-xs text-gray-500 mt-1">
          {JSON.stringify(value)}
        </p>
      </div>
    );
  }

  const display =
    value === true
      ? "Yes"
      : value === false
      ? "No"
      : value?.toString() || "N/A";

  return (
    <div>
      <ItemLabel label={label} />
      <p className="heading-text capitalize md:text-[15px] text-sm font-semibold text-gray-900 mt-1">
        {display}
      </p>
    </div>
  );
};

const ItemLabel = ({ label }: { label: string }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-[#3586FF] shrink-0">{iconMap[label]}</span>
    <span className="label-text md:text-[13px] text-[11px] text-gray-400 font-medium truncate">
      {formatLabel(label)}
    </span>
  </div>
);

export default ServicesSelectedView;
