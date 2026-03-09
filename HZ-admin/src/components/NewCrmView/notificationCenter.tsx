import React, { useState } from "react";
import { FaBell, FaExclamationCircle, FaCalendarAlt, FaClock } from "react-icons/fa";
import { Lead, formatDate } from "./types";
import Button from "@/src/common/Button";

interface NotificationCenterProps {
  upcomingFollowUps: Lead[];
  overdueFollowUps: Lead[];
  todayFollowUps: Lead[];
}

export default function NotificationCenter({
  upcomingFollowUps,
  overdueFollowUps,
  todayFollowUps,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const totalNotifications = upcomingFollowUps.length + overdueFollowUps.length + todayFollowUps.length;

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <FaBell className="text-gray-600 text-[20px]" />
        {totalNotifications > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {totalNotifications > 9 ? "9+" : totalNotifications}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-2xl z-50 max-h-[500px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-bold text-gray-800">
                  Follow-up Reminders
                </h3>
                <Button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
              <p className="text-[12px] text-gray-600 mt-1">
                {totalNotifications} pending follow-up{totalNotifications !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {totalNotifications === 0 ? (
                <div className="p-6 text-center">
                  <FaBell className="text-gray-300 text-[48px] mx-auto mb-3" />
                  <p className="text-gray-500 text-[14px] font-medium">
                    No pending follow-ups
                  </p>
                  <p className="text-gray-400 text-[12px] mt-1">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <>
                  {/* Overdue */}
                  {overdueFollowUps.length > 0 && (
                    <div className="border-b border-gray-200">
                      <div className="bg-red-50 px-4 py-2 flex items-center gap-2">
                        <FaExclamationCircle className="text-red-500 text-[14px]" />
                        <h4 className="text-[13px] font-bold text-red-700">
                          Overdue ({overdueFollowUps.length})
                        </h4>
                      </div>
                      {overdueFollowUps.map((lead) => (
                        <NotificationItem
                          key={lead.id}
                          lead={lead}
                          type="overdue"
                        />
                      ))}
                    </div>
                  )}

                  {/* Today */}
                  {todayFollowUps.length > 0 && (
                    <div className="border-b border-gray-200">
                      <div className="bg-yellow-50 px-4 py-2 flex items-center gap-2">
                        <FaClock className="text-yellow-600 text-[14px]" />
                        <h4 className="text-[13px] font-bold text-yellow-700">
                          Today ({todayFollowUps.length})
                        </h4>
                      </div>
                      {todayFollowUps.map((lead) => (
                        <NotificationItem
                          key={lead.id}
                          lead={lead}
                          type="today"
                        />
                      ))}
                    </div>
                  )}

                  {/* Upcoming */}
                  {upcomingFollowUps.length > 0 && (
                    <div>
                      <div className="bg-blue-50 px-4 py-2 flex items-center gap-2">
                        <FaCalendarAlt className="text-blue-600 text-[14px]" />
                        <h4 className="text-[13px] font-bold text-blue-700">
                          Upcoming ({upcomingFollowUps.length})
                        </h4>
                      </div>
                      {upcomingFollowUps.map((lead) => (
                        <NotificationItem
                          key={lead.id}
                          lead={lead}
                          type="upcoming"
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface NotificationItemProps {
  lead: Lead;
  type: "overdue" | "today" | "upcoming";
}

function NotificationItem({ lead, type }: NotificationItemProps) {
  const bgColor = {
    overdue: "hover:bg-red-50",
    today: "hover:bg-yellow-50",
    upcoming: "hover:bg-blue-50",
  }[type];

  const dotColor = {
    overdue: "bg-red-500",
    today: "bg-yellow-500",
    upcoming: "bg-blue-500",
  }[type];

  return (
    <div
      className={`p-3 border-b border-gray-100 ${bgColor} transition-colors cursor-pointer`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full ${dotColor} mt-2 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-gray-800 truncate">
            {lead.Fullname}
          </p>
          <p className="text-[12px] text-gray-600 truncate">
            {lead.Phonenumber} • {lead.city}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <FaCalendarAlt className="text-gray-400 text-[10px]" />
            <p className="text-[11px] text-gray-500">
              {formatDate(lead.followUpDate)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}