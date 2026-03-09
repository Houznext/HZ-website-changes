import React, { useEffect, useState } from "react";
import Modal from "@/src/common/Modal";
import Button from "@/src/common/Button";
import apiClient from "@/src/utils/apiClient";
import { Lead, GetDateshow } from "./types";
import LeadStatusSelect from "./LeadStatusSelect";
import {
  FaEdit,
  FaPhone,
  FaEnvelope,
  FaCity,
  FaHome,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
  FaStar,
} from "react-icons/fa";
import { LuTrash2 } from "react-icons/lu";
import { BiLogoWhatsapp } from "react-icons/bi";
import { MdSms } from "react-icons/md";
import CustomTooltip from "@/src/common/ToolTip";
import { MdApartment, MdPin, MdOutlineCategory } from "react-icons/md";
import { HiOutlineHomeModern } from "react-icons/hi2";
import LeadTimelineStepper from "../CrmView/LeadTimelineStepper";
import toast from "react-hot-toast";

interface LeadDetailsModalProps {
  lead: Lead;
  open: boolean;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onStatusChange: (id: string, status: string) => void;
  onUpdateLead?: (leadId: string, patch: Partial<Lead>) => void;
  hasPermission: (module: string, action: string) => boolean;
}

export default function LeadDetailsModal({
  lead,
  open,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onUpdateLead,
  hasPermission,
}: LeadDetailsModalProps) {
  const [steps, setSteps] = useState<{ status: string; at: string }[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [branchName, setBranchName] = useState<string>("N/A");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchBranchName = async () => {
    if (!lead?.branchId) return;

    try {
      const res = await apiClient.get(
        `${apiClient.URLS.branches}/${lead.branchId}`,
        {},
        true,
      );

      if (res.status === 200) {
        setBranchName(res.body?.name || "N/A");
      }
    } catch (error) {
      console.error("Error fetching branch:", error);
      setBranchName("N/A");
    }
  };

  useEffect(() => {
    if (lead?.id) {
      fetchTimeline();
      fetchBranchName();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead?.id]);

  const fetchTimeline = async () => {
    try {
      const branchId = lead?.branchId;
      const res = await apiClient.get(
        `${apiClient.URLS.crmlead}/${lead?.id}/timeline`,
        { branchId },
        true,
      );
      if (res.status === 200) {
        setSteps(res?.body?.steps || []);
        setCurrentStatus(res?.body?.currentStatus || lead.leadstatus);
      }
    } catch (error) {
      console.error("Error fetching timeline:", error);
    }
  };

  const handleWhatsappSend = async () => {
    try {
      const payload = {
        name: lead.Fullname,
        phone: lead.Phonenumber,
      };
      const res = await apiClient.post(
        `${apiClient.URLS.whatsappSend}/document`,
        payload,
        true,
      );
      if (res.status === 201) {
        toast.success("WhatsApp message sent successfully");
      }
    } catch (error) {
      console.error("Error sending WhatsApp:", error);
      toast.error("Failed to send WhatsApp message");
    }
  };

  const handleSmsSend = async () => {
    try {
      const res = await apiClient.post(
        `${apiClient.URLS.crmlead}/bulk-send`,
        {
          leadIds: [lead.id],
          channel: "sms",
          branchId: lead.branchId,
        },
        true,
      );
      if (res?.body?.sent) {
        toast.success("SMS sent successfully");
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
      toast.error("Failed to send SMS");
    }
  };

  const handleToggleFuturePotential = async () => {
    if (!onUpdateLead) return;
    try {
      onUpdateLead(lead.id, {
        isFuturePotential: !lead.isFuturePotential,
      });
      toast.success(
        lead.isFuturePotential
          ? "Removed from Future Potential"
          : "Marked as Future Potential",
      );
    } catch {
      toast.error("Failed to update");
    }
  };
  const handleDeleteClick = () => {
    setConfirmOpen(true);
  };

  return (
    <Modal
      isOpen={open}
      closeModal={onClose}
      title="Lead Details"
      rootCls="z-[999]"
      titleCls="font-medium md:text-[18px] text-[12px] text-center text-[#3586FF] "
      isCloseRequired={true}
      className="md:max-w-[1100px] w-full max-w-[95vw]"
    >
      <div className="md:p-6 p-3 bg-white shadow-custom rounded-[12px] border border-gray-200 max-w-full mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E3EEFF] text-[#3586FF]  font-bold uppercase">
                {lead.Fullname?.[0] || "L"}
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="md:text-[20px] text-[14px] font-bold text-gray-900 flex items-center gap-2">
                  {lead.Fullname}
                </h2>
                <p className="text-[11px] md:text-[12px] text-gray-500">
                  Lead ID: <span className="font-medium">#{lead.id}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center md:gap-3 gap-2">
              <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-[#2563eb] text-[11px] font-medium">
                Current Status: {lead.leadstatus}
              </span>

              <CustomTooltip
                label="Access Restricted. Contact Admin."
                position="bottom"
                tooltipBg="bg-black/60 backdrop-blur-md"
                tooltipTextColor="text-white py-2 px-4 font-medium"
                labelCls="text-[10px] font-medium"
                showTooltip={!hasPermission("crm", "edit")}
              >
                <button
                  type="button"
                  disabled={!hasPermission("crm", "edit")}
                  onClick={() => hasPermission("crm", "edit") && onEdit(lead)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-blue-50 transition disabled:opacity-60"
                >
                  <FaEdit className="text-[#3586FF]  md:text-[18px] text-[14px]" />
                </button>
              </CustomTooltip>

              {/* Delete */}
              <CustomTooltip
                label="Access Restricted. Contact Admin."
                position="bottom"
                tooltipBg="bg-black/60 backdrop-blur-md"
                tooltipTextColor="text-white py-2 px-4 font-medium"
                labelCls="text-[10px] font-medium"
                showTooltip={!hasPermission("crm", "delete")}
              >
                <button
                  type="button"
                  disabled={!hasPermission("crm", "delete")}
                  onClick={handleDeleteClick}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-red-50 transition disabled:opacity-60"
                >
                  <LuTrash2 className="md:text-[18px] text-[14px] text-red-500" />
                </button>
              </CustomTooltip>
              <Modal
                isOpen={confirmOpen}
                closeModal={() => setConfirmOpen(false)}
                rootCls="z-[99999]"
                titleCls="font-medium md:text-[18px] text-[12px] text-center text-[#3586FF] "
                isCloseRequired={false}
                className="md:max-w-[500px] max-w-[270px]"
              >
                <div className="md:px-2 py-1 p-1 flex flex-col gap-2 z-20">
                  <div className="flex justify-between items-center md:mb-2 mb-1">
                    <h3 className="md:text-[16px] text-center w-full text-[12px] font-medium text-gray-900">
                      Confirm Deletion
                    </h3>
                  </div>
                  <p className="md:text-[12px] text-center text-[10px] text-gray-500 mb-2">
                    Are you sure you want to delete this Lead? This action
                    cannot be undone.
                  </p>
                  <div className="md:mt-2 mt-1 flex items-end justify-end gap-2 md:space-x-3 space-x-1">
                    <Button
                      className="border-2 font-medium md:text-[12px] text-[10px] btn-text border-gray-300 md:px-3 px-2 md:py-1 py-1 rounded-md"
                      onClick={() => setConfirmOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-red-600 text-white font-medium md:text-[12px] text-[10px] md:px-3 px-2 md:py-1 py-1 rounded-md"
                      onClick={() => {
                        onDelete(lead);
                        setConfirmOpen(false);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Modal>

              <Button
                className="md:px-3 px-2 md:py-2 py-1 md:text-[12px] text-[10px] bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center gap-1 shadow-sm"
                onClick={handleWhatsappSend}
              >
                <BiLogoWhatsapp className="text-white md:text-[18px] text-[14px]" />
                <span className="hidden md:inline">WhatsApp</span>
              </Button>
              <Button
                className="md:px-3 px-2 md:py-2 py-1 md:text-[12px] text-[10px] bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center gap-1 shadow-sm"
                onClick={handleSmsSend}
              >
                <MdSms className="text-white md:text-[18px] text-[14px]" />
                <span className="hidden md:inline">SMS</span>
              </Button>
              {onUpdateLead && hasPermission("crm", "edit") && (
                <Button
                  className={`md:px-3 px-2 md:py-2 py-1 md:text-[12px] text-[10px] rounded-full flex items-center gap-1 shadow-sm ${
                    lead.isFuturePotential
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                  onClick={handleToggleFuturePotential}
                >
                  <FaStar className="md:text-[18px] text-[14px]" />
                  <span className="hidden md:inline">
                    {lead.isFuturePotential ? "Future Potential" : "Mark Future"}
                  </span>
                </Button>
              )}
            </div>
          </div>

          <span className="md:hidden inline-flex self-start items-center px-2 py-1 rounded-full bg-blue-50 text-[#2563eb] text-[10px] font-medium">
            Status: {lead.leadstatus}
          </span>
        </div>

        <div className="w-full rounded-[10px] bg-[#F9FAFB] border border-gray-100 px-2 md:px-3 py-2">
          <p className="text-[11px] md:text-[12px] font-medium text-gray-600 mb-2">
            Timeline
          </p>
          <div className="w-full flex items-center justify-center md:overflow-x-auto">
            <LeadTimelineStepper
              steps={steps}
              currentStatus={currentStatus}
              showTimes
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[12px] md:text-[13px] font-medium text-gray-700">
              Lead Information
            </p>
          </div>

          <div className="grid md:grid-cols-4 grid-cols-2 gap-2 font-medium">
            {/* Contact */}
            <IconBlock
              icon={<FaPhone className="text-green-500" />}
              label="Phone"
              value={
                <a
                  href={`tel:${lead.Phonenumber}`}
                  className="text-blue-600 hover:underline break-all"
                >
                  {lead.Phonenumber}
                </a>
              }
            />

            <IconBlock
              icon={<FaEnvelope className="text-yellow-500" />}
              label="Email"
              value={lead.email || "N/A"}
            />

            <IconBlock
              icon={<FaHome className="text-orange-500" />}
              label="Property Type"
              value={lead.propertytype}
            />

            <IconBlock
              icon={<MdApartment className="text-indigo-500" />}
              label="BHK"
              value={lead?.bhk || "N/A"}
            />

            {/* Location */}
            <IconBlock
              icon={<FaCity className="text-pink-500" />}
              label="City"
              value={lead?.city}
            />

            <IconBlock
              icon={<FaMapMarkerAlt className="text-pink-500" />}
              label="State"
              value={lead?.state}
            />

            <IconBlock
              icon={<MdOutlineCategory className="text-green-500" />}
              label="Platform"
              value={lead?.platform || "N/A"}
            />

            <IconBlock
              icon={<FaUser className="text-gray-600" />}
              label="Service Type"
              value={lead?.serviceType || "N/A"}
            />
            <IconBlock
              icon={<MdApartment className="text-purple-500" />}
              label="Branch"
              value={branchName}
            />

            {lead?.createdBy && (
              <IconBlock
                icon={<FaUser className="text-slate-500" />}
                label="Created By"
                value={lead.createdBy}
              />
            )}

            {lead?.rejectionReason && (
              <div className="md:col-span-2 col-span-2 flex flex-col gap-1 min-w-0 p-2 rounded-lg bg-red-50 border border-red-100">
                <div className="flex items-center gap-2 md:text-[12px] text-[10px] text-red-700 font-medium">
                  <span>Rejection Reason</span>
                </div>
                <p className="font-medium text-[10px] md:text-[13px] text-red-800 break-words">
                  {lead.rejectionReason}
                </p>
              </div>
            )}

            {lead?.houseNo && (
              <IconBlock
                icon={<HiOutlineHomeModern className="text-blue-400" />}
                label="House No"
                value={lead.houseNo}
              />
            )}

            {lead?.apartmentName && (
              <IconBlock
                icon={<MdApartment className="text-blue-400" />}
                label="Apartment"
                value={lead.apartmentName}
              />
            )}

            {lead?.areaName && (
              <IconBlock
                icon={<FaMapMarkerAlt className="text-blue-400" />}
                label="Location"
                value={lead.areaName}
              />
            )}

            {lead?.pincode && (
              <IconBlock
                icon={<MdPin className="text-blue-400" />}
                label="Pin Code"
                value={lead.pincode}
              />
            )}

            <IconBlock
              icon={<FaCalendarAlt className="text-teal-500" />}
              label="Created At"
              value={new Date(lead.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            />

            <IconBlock
              icon={<FaCalendarAlt className="text-teal-500" />}
              label={GetDateshow(lead?.leadstatus)}
              value={(() => {
                const key = GetDateshow(lead?.leadstatus);
                const val = lead?.[key] as string | undefined;
                if (!val) return "N/A";
                const d = new Date(val);
                return isNaN(d.getTime())
                  ? "N/A"
                  : d.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
              })()}
            />

            <div className="flex md:flex-row flex-col md:items-center items-start gap-2 text-gray-700">
              <span className="md:text-[12px] text-[11px] font-medium">Status:</span>
              <div className="w-full md:max-w-[220px]">
                <LeadStatusSelect
                  value={lead.leadstatus}
                  onChange={(status) => onStatusChange(lead.id, status)}
                  variant="full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/** Safely render user reference (string or object with fullName/firstName) */
function safeUserDisplay(val: unknown): string {
  if (val == null) return "N/A";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null) {
    const o = val as Record<string, unknown>;
    if (typeof o.fullName === "string") return o.fullName;
    if (typeof o.firstName === "string")
      return o.firstName + (typeof o.lastName === "string" ? ` ${o.lastName}` : "");
  }
  return "N/A";
}

const IconBlock = ({
  icon,
  label,
  value,
}: {
  icon: JSX.Element;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1 min-w-0">
    <div className="flex items-center gap-2 md:text-[12px] text-[10px] text-gray-600">
      {icon}
      <span className="font-medium text-[10px] md:text-[13px]">{label}</span>
    </div>
    <p className="font-medium text-[10px] md:text-[13px] text-gray-800 break-words">
      {typeof value === "object" && value !== null && !React.isValidElement(value)
        ? safeUserDisplay(value)
        : value}
    </p>
  </div>
);
