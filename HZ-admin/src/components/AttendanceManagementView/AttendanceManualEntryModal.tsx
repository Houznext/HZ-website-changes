"use client";

import React, { useEffect, useMemo, useState } from "react";
import apiClient from "@/src/utils/apiClient";
import Modal from "@/src/common/Modal";
import Button from "@/src/common/Button";
import CustomInput from "@/src/common/FormElements/CustomInput";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import toast from "react-hot-toast";
import CustomDate from "@/src/common/FormElements/CustomDate";

type AdminUserRow = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  users: AdminUserRow[];
};

const statusOptions = [
  { label: "PENDING_APPROVAL", value: "PENDING_APPROVAL" },
  { label: "APPROVED", value: "APPROVED" },
  { label: "REJECTED", value: "REJECTED" },
];

export default function AttendanceManualEntryModal({
  open,
  onClose,
  onSuccess,
  users,
}: Props) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [clockInTime, setClockInTime] = useState("");
  const [clockOutTime, setClockOutTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [workLog, setWorkLog] = useState("");
  const [status, setStatus] = useState<string>("APPROVED");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedUserId(null);
    setDate("");
    setClockInTime("");
    setClockOutTime("");
    setLocation("");
    setNotes("");
    setWorkLog("");
    setStatus("APPROVED");
  }, [open]);

  const userOptions = useMemo(() => {
    return (users || []).map((u) => ({
      label: `${u.user.firstName} ${u.user.lastName} • ${u.user.email || u.user.phone || ""}`,
      value: u.user.id,
    }));
  }, [users]);

  const saveManual = async () => {
    if (!selectedUserId) return toast.error("Select a user");
    if (!date) return toast.error("Date required (YYYY-MM-DD)");
    // if (!clockInTime) return toast.error("Clock-in required (HH:mm)");
    // if (!clockOutTime) return toast.error("Clock-out required (HH:mm)");
    if (!clockInTime && !clockOutTime) return toast.error("Clock-in or Clock-out required");
if (clockOutTime && workLog.trim().length < 5) return toast.error("Work log required for clock-out");


    try {
      setSaving(true);
      const payload = {
        userId: selectedUserId,
        date,
        clockInTime,
        clockOutTime,
        notes: notes || undefined,
        workLog: workLog || undefined,
        location: location || undefined,
        timezone: "Asia/Kolkata",
        status: status || undefined,
      };

      await apiClient.post(
        `${apiClient.URLS.staffattendance}/manual`,
        payload,
        true,
      );

      toast.success("Manual attendance saved");
      onSuccess?.();
      onClose();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to save manual attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      closeModal={onClose}
      title="Manual Attendance Entry"
      rootCls="z-[999]"
      titleCls="font-medium md:text-[18px] text-[12px] text-center text-[#3586FF]"
      isCloseRequired={false}
      className="md:max-w-[900px] w-full max-w-[95vw]"
    >
      <div className="space-y-4">
        {/* User select only */}
        <div className="border rounded-2xl p-4 bg-white">
          <div className="flex flex-col md:gap-y-[8px] gap-y-[4px]  md:px-3 px-0 md:mt-0 mt-1">
            <SingleSelect
              type="single-select"
              name="user"
              label="select User"
              placeholder="Select user"
              labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
              options={userOptions}
              optionsInterface={{ isObj: true, displayKey: "label" }}
              selectedOption={
                selectedUserId
                  ? (userOptions.find((o) => o.value === selectedUserId) ??
                    null)
                  : null
              }
              handleChange={(name, value) =>
                setSelectedUserId(value?.value ?? null)
              }
            />
          </div>

          {userOptions.length === 0 && (
            <p className="text-xs text-gray-500 mt-2">
              No users found. Please select a branch in the main page.
            </p>
          )}
        </div>

        {/* Form */}
        <div className="border rounded-2xl p-4 bg-white">
          <h3 className="font-bold text-sm mb-3">Attendance Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CustomDate
              label="Date"
              name="date"
              labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
              value={date}
              onChange={(e: any) => setDate(e.target.value)}
            />
            <div className="flex flex-col md:gap-y-[8px] gap-y-[4px] w-full md:max-w-[480px] max-w-[280px] md:px-3 px-0 md:mt-0 mt-1">
              <SingleSelect
                type="single-select"
                name="status"
                label="Status"
                labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                options={statusOptions}
                optionsInterface={{ isObj: true, displayKey: "label" }}
                selectedOption={
                  statusOptions.find((o) => o.value === status) ?? null
                }
                handleChange={(name, value) => setStatus(value?.value)}
              />
            </div>
            <CustomDate
              label="Clock In (HH:mm)"
              type="time"
              name="clockInTime"
              labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
              value={clockInTime}
              onChange={(e: any) => setClockInTime(e.target.value)}
            />
            <CustomDate
              label="Clock Out (HH:mm)"
              type="time"
              name="clockOutTime"
              labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
              value={clockOutTime}
              onChange={(e: any) => setClockOutTime(e.target.value)}
            />

            <CustomInput
              label="Location"
              name="location"
              type="text"
              labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
              value={location}
              onChange={(e: any) => setLocation(e.target.value)}
              placeholder="Office - Kukatpally"
            />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3">
            <CustomInput
              label="Notes"
              name="notes"
              type="text"
              labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
              value={notes}
              onChange={(e: any) => setNotes(e.target.value)}
              placeholder="Manual entry reason..."
            />
            <CustomInput
              label="Work Log"
              value={workLog}
              name="workLog"
              labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
              type="textarea"
              onChange={(e: any) => setWorkLog(e.target.value)}
              placeholder="Called 40 leads, closed 2 deals..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            className="md:py-[6px] py-[4px] md:px-[18px] px-[16px] rounded-[4px] border-2 btn-text border-[#3B82F6]"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            className="md:py-[4px] py-[4px] md:px-[18px] px-[16px] rounded-[6px] border-2 btn-text bg-[#3B82F6] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={saveManual}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Manual Entry"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
