import React from "react";
import { FaCalendarAlt, FaStar } from "react-icons/fa";
import { MdUpdate } from "react-icons/md";
import { Lead, propertyTypeIcons, roleColors, roleIcons, GetDateshow } from "./types";
import { LeadActionsMenu } from "./Leadactionsmenu";
import LeadStatusSelect from "./LeadStatusSelect";

interface LeadCardProps {
    lead: Lead;
    onDragStart: (lead: Lead) => void;
    onClick: () => void;
    onStatusChange: (id: string, status: string) => void;
    hasPermission: (module: string, action: string) => boolean;
    onEdit: (lead: Lead) => void;
    onDelete: (lead: Lead) => void;
    onAssign: (leadId: string, userId: string) => void;
    roleUsers: Array<{ id: string; name: string }>;
}

export default function LeadCard({
    lead,
    onDragStart,
    onClick,
    onStatusChange,
    hasPermission,
    onEdit,
    onDelete,
    onAssign,
    roleUsers,
}: LeadCardProps) {
    return (
        <div
            draggable
            onDragStart={() => onDragStart(lead)}
            onClick={onClick}
            className="relative flex items-center md:gap-3 gap-2 md:px-3 md:py-2.5 px-2 py-2 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm cursor-pointer transition-all duration-200"
        >
            {/* Actions Menu */}
            <div
                className="absolute top-[2px] -right-1"
                onClick={(e) => e.stopPropagation()}
            >
                <LeadActionsMenu
                    lead={lead}
                    roleUsers={roleUsers}
                    hasPermission={hasPermission}
                    onAssign={onAssign}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            </div>

            {/* Avatar */}
            <div className="md:w-10 w-8 md:h-10 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold md:text-[12px] text-[10px] flex-shrink-0 shadow-sm">
                {lead?.Fullname?.charAt(0).toUpperCase()}
            </div>

            {/* Lead Info */}
            <div className="flex-1 flex flex-col md:gap-[2px] gap-[2px] min-w-0">
                <h3 className="font-medium text-gray-900 text-[12px] truncate flex items-center gap-1">
                    {lead?.Fullname}, {lead?.city}
                    {lead?.isFuturePotential && (
                      <span className="inline-flex items-center text-amber-600" title="Future Potential">
                        <FaStar className="text-[10px]" />
                      </span>
                    )}
                </h3>

                <p className="text-[12px] font-medium">
                    <a
                        href={`tel:${lead.Phonenumber}`}
                        className="text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {lead?.Phonenumber}
                    </a>
                </p>

                <div className="capitalize md:text-[11px] text-[10px] font-medium md:rounded-[6px] rounded-[4px] text-nowrap text-center flex items-center gap-1">
                    {propertyTypeIcons[lead?.propertytype]}
                    {lead?.propertytype}, {lead?.bhk}
                </div>

                <span className="flex items-center gap-1 font-medium mt-1">
                    <FaCalendarAlt className="text-gray-500 text-[10px]" />
                    <span className="md:text-[10px] text-[10px]">
                        {new Date(lead?.[GetDateshow(lead?.leadstatus)] as string).toLocaleDateString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            }
                        )}
                    </span>
                </span>
            </div>

            {/* Status & Meta */}
            <div className="flex justify-between flex-col items-center gap-2 font-medium">
                <div
                    className={`md:text-[10px] text-[10px] md:rounded-[6px] rounded-[4px] text-center px-1.5 py-1 flex items-center justify-center gap-1 ${roleColors[lead.serviceType] || "text-gray-700"
                        }`}
                >
                    {roleIcons[lead.serviceType]}
                    {lead.serviceType}
                </div>

                <span className="text-[10px] flex items-center gap-1">
                    <MdUpdate className="text-gray-500 text-[12px]" />
                    {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })}
                </span>

                <div onClick={(e) => e.stopPropagation()} className="min-w-[100px]">
                    <LeadStatusSelect
                        value={lead.leadstatus}
                        onChange={(status) => onStatusChange(lead.id, status)}
                        variant="compact"
                    />
                </div>
            </div>
        </div>
    );
}