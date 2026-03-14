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
      className="w-full bg-white border border-[rgba(0,0,0,0.08)] hover:border-[#1D4E7A] rounded-[12px] flex flex-col md:gap-4 gap-3 md:px-5 p-4 transition-colors"
    >
      <div className="grid md:grid-cols-4 lg:grid-cols-6 grid-cols-2 w-full gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="flex items-center gap-1 text-[11px] text-[#6B7280]">
            <FiUser className="h-3.5 w-3.5 text-[#6B7280]" /> Name
          </p>
          <p className="text-[13px] font-medium text-[#111827]">{data?.billToName}</p>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="flex items-center gap-1 text-[11px] text-[#6B7280]">
            <FiHash className="h-3.5 w-3.5 text-[#6B7280]" /> Invoice No
          </p>
          <p className="text-[13px] font-medium text-[#111827]">{data?.invoiceNumber}</p>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="flex items-center gap-1 text-[11px] text-[#6B7280]">
            <FiCalendar className="h-3.5 w-3.5 text-[#6B7280]" /> Date
          </p>
          <p className="text-[13px] font-medium text-[#111827]">{new Date(data.invoiceDate).toDateString()}</p>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="flex items-center gap-1 text-[11px] text-[#6B7280]">
            <FiClock className="h-3.5 w-3.5 text-[#6B7280]" /> Due
          </p>
          <p className="text-[13px] font-medium text-[#111827]">{new Date(data?.invoiceDue).toDateString()}</p>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="flex items-center gap-1 text-[11px] text-[#6B7280]">
            <FiMapPin className="h-3.5 w-3.5 text-[#6B7280]" /> Address
          </p>
          <p className="text-[13px] font-medium text-[#111827] line-clamp-1">{data?.billToAddress}</p>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="flex items-center gap-1 text-[11px] text-[#6B7280]">
            <FiMap className="h-3.5 w-3.5 text-[#6B7280]" /> City
          </p>
          <p className="text-[13px] font-medium text-[#111827]">{data.billToCity}</p>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="flex items-center gap-1 text-[11px] text-[#6B7280]">
            <BiRupee className="h-3.5 w-3.5 text-[#6B7280]" /> SubTotal
          </p>
          <p className="text-[15px] font-medium text-[#1D4E7A]">₹ {Number(data.subTotal).toLocaleString("en-IN")}</p>
        </div>
      </div>
      <div className="flex items-center md:justify-start justify-center w-full pt-1">
        <CustomTooltip
          label="Access Restricted Contact Admin"
          position="bottom"
          tooltipBg="bg-black/60 backdrop-blur-md"
          tooltipTextColor="text-white py-2 px-4 font-medium"
          labelCls="text-[10px] font-medium"
          showTooltip={!hasPermission("invoice_estimator", "view")}
        >
          <Button
            className="inline-flex items-center px-4 py-[6px] rounded-[8px] bg-[#1D4E7A] hover:bg-[#16375a] text-white text-[12px] font-medium transition-colors"
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
