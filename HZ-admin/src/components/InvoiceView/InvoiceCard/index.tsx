import React from "react";
import Button from "@/src/common/Button";
import { useRouter } from "next/router";
import {
  FiUser,
  FiHash,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiMap,
} from "react-icons/fi";
import { BiRupee } from "react-icons/bi";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CustomTooltip from "@/src/common/ToolTip";

export const InvoiceCard = ({ data, hasPermission }: any) => {
  const router = useRouter();
  return (
    <div
      key={data.id}
      className="w-full bg-white md:max-w-[1352px] max-w-[320px] rounded flex flex-col md:gap-4 gap-2 md:px-4  p-2 shadow shadow-gray-200 border border-gray-200 md:items-start items-center"
    >
      <div className="grid md:grid-cols-4 lg:grid-cols-6 grid-cols-2 w-full  gap-2 px-1 md:py-4 py-2 md:px-0">
        <div className="flex flex-col  gap-1">
          <p className="flex items-center gap-1 md:text-[14px] text-[12px] text-nowrap text-gray-500 font-medium">
            <FiUser /> Name
          </p>
          <p className="font-medium md:text-[14px] text-[10px] text-nowrap">
            {data?.billToName}
          </p>
        </div>

        <div className="flex flex-col  gap-1">
          <p className="flex items-center gap-1 md:text-[14px] text-[12px] text-nowrap text-gray-500 font-medium">
            <FiHash /> Invoice No
          </p>
          <p className="font-medium md:text-[14px] text-[10px] text-nowrap">
            {data?.invoiceNumber}
          </p>
        </div>

        <div className="flex flex-col  gap-1">
          <p className="flex items-center gap-1 md:text-[14px] text-[12px] text-nowrap text-gray-500 font-medium">
            <FiCalendar /> Date
          </p>
          <p className="font-medium md:text-[14px] text-[10px] text-nowrap">
            {new Date(data.invoiceDate).toDateString()}
          </p>
        </div>

        <div className="flex flex-col  gap-1">
          <p className="flex items-center gap-1 md:text-[14px] text-[12px] text-nowrap text-gray-500 font-medium">
            <FiClock /> Due
          </p>
          <p className="font-medium md:text-[14px] text-[10px] text-nowrap">
            {new Date(data?.invoiceDue).toDateString()}
          </p>
        </div>

        <div className="flex flex-col  gap-1">
          <p className="flex items-center gap-1 md:text-[14px] text-[12px] text-nowrap text-gray-500 font-medium">
            <FiMapPin /> Address
          </p>
          <p className="font-medium md:text-[14px] text-[10px] text-wrap">
            {data?.billToAddress}
          </p>
        </div>

        <div className="flex flex-col  gap-1">
          <p className="flex items-center gap-1 md:text-[14px] text-[12px] text-nowrap text-gray-500 font-medium">
            <FiMap /> City
          </p>
          <p className="font-medium md:text-[14px] text-[10px] text-nowrap">
            {data.billToCity}
          </p>
        </div>
        <div className="flex flex-col  gap-1">
          <p className="flex items-center gap-1 tracking-[1.2px] md:text-[14px] text-[12px] text-nowrap text-gray-500 font-medium">
            <BiRupee /> SubTotal
          </p>
          <p className="font-medium md:text-[14px] text-[10px] text-nowrap">
            {data.subTotal}
          </p>
        </div>
      </div>

      <div className="flex items-center md:justify-start justify-center w-full">
        <CustomTooltip
          label="Access Restricted Contact Admin"
          position="bottom"
          tooltipBg="bg-black/60 backdrop-blur-md"
          tooltipTextColor="text-white py-2 px-4 font-medium"
          labelCls="text-[10px] font-medium"
          showTooltip={!hasPermission("invoice_estimator", "view")}
        >
          <Button
            className="md:px-5 px-3 py-2 md:text-[14px] text-[12px] rounded font-medium text-white bg-[#3586FF]"
            onClick={() => router.push(`/invoice/${data.id}`)}
            disabled={!hasPermission("invoice_estimator", "view")}
          >
            View Details
          </Button>
        </CustomTooltip>
      </div>
    </div>
  );
};
