import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import apiClient from "@/src/utils/apiClient";
import Button from "@/src/common/Button";
import Modal from "@/src/common/Modal";
import CustomInput from "@/src/common/FormElements/CustomInput";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import toast from "react-hot-toast";
import CustomDate from "@/src/common/FormElements/CustomDate";
import { DropDown } from "@/src/common/PopOver";
import { IoMdArrowDropdown } from "react-icons/io";
import Loader from "@/src/components/SpinLoader";
import { MdArrowBack } from "react-icons/md";
import { useRef } from "react";
import { uploadFile } from "@/src/utils/uploadFile";
import ReusableSearchFilter from "@/src/common/SearchFilter";

type LeaveType = "CASUAL" | "SICK" | "LOP";
type LeaveStatus = "APPLIED" | "APPROVED" | "REJECTED" | "CANCELLED";

interface EmployeeLeave {
  id: number;
  type: LeaveType;
  fromDate: string;
  toDate: string;
  days: number;
  reason?: string;
  status: LeaveStatus;
  createdAt?: string;
}

type PayslipStatus = "GENERATED" | "PAID" | "CANCELLED" | string;

interface EmployeePayslip {
  id: number;
  month: number;
  year: number;
  grossEarnings: number;
  totalDeductions: number;
  netPay: number;
  payDate: string;
  payslipNumber?: string;
  pdfUrl?: string;
  status: PayslipStatus;
}

export default function UserDetails() {
  const router = useRouter();
  const { id } = router.query as { id: string };

  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<"leaves" | "payslips" | "attendance">(
    "leaves",
  );
  const [loading, setLoading] = useState(false);

  const fetchUser = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`${apiClient.URLS.user}/${id}`, {}, true);
      setUser(res.body);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  return (
    <div className="md:p-6 p-3">
      <div
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-3 cursor-pointer"
      >
        <MdArrowBack className="w-[20px] h-[20px]" />
        <span className="text-[14px] md:text-[16px] font-medium">Back</span>
      </div>

      <h1 className="md:text-2xl text-[16px] font-bold">
        {user?.firstName} {user?.lastName}
      </h1>
      <p className="text-gray-600 md:text-[14px] text-[12px] font-medium">
        {user?.email}
      </p>

      <div className="flex gap-5 md:mt-5 mt-3 border-b pb-2">
        <Button
          className={`pb-2 font-medium md:text-[16px] text-[12px] ${
            tab === "leaves" ? "border-b-2 border-[#5297ff] " : "text-gray-500"
          }`}
          onClick={() => setTab("leaves")}
        >
          Leaves
        </Button>

        <Button
          className={`pb-2 font-medium md:text-[16px] text-[12px] ${
            tab === "payslips"
              ? "border-b-2 border-[#5297ff] "
              : "text-gray-500"
          }`}
          onClick={() => setTab("payslips")}
        >
          Payslips
        </Button>
        <Button
          className={`pb-2 font-medium md:text-[16px] text-[12px] ${
            tab === "attendance"
              ? "border-b-2 border-[#5297ff] "
              : "text-gray-500"
          }`}
          onClick={() => setTab("attendance")}
        >
          Attendance
        </Button>
      </div>

      {tab === "leaves" && <LeavesSection userId={id} />}
      {tab === "payslips" && <PayslipSection userId={id} />}
      {tab === "attendance" && <AttendanceSection userId={id} />}
    </div>
  );
}
type AttendanceStatus =
  | "CLOCKED_IN"
  | "CLOCKED_OUT"
  | "APPROVED"
  | "REJECTED"
  | "PENDING_APPROVAL";

interface AttendanceRecord {
  id: string;
  date: string;
  clockInTime?: string | null;
  clockOutTime?: string | null;
  workedHours?: number | null;
  status: AttendanceStatus;
  workLog?: string | null;
  notes?: string | null;
  clockInLocation?: string | null;
  clockOutLocation?: string | null;
  approvedById?: string | null;
  approvalNotes?: string | null;
  approvedAt?: string | null;
}

// export interface AttendanceRecord {
//   id: string;
//   userId: string;
//   date: string;

//   clockInTime?: string | null;
//   clockOutTime?: string | null;

//   clockInLocation?: string | null;
//   clockOutLocation?: string | null;

//   workedHours?: number | null;

//   notes?: string | null;
//   workLog?: string | null;

//   status: AttendanceStatus;

//   approvedAt?: string | null;
//   approvalNotes?: string | null;

//   approvedBy?: any;
// }

// ---------------- Component ----------------

function AttendanceSection({ userId }: { userId: string }) {
  const [rows, setRows] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  interface AttendanceFilterState {
    status?: { [key: string]: boolean };
    month?: { [key: string]: boolean };
  }

  const [selectedFilters, setSelectedFilters] = useState<AttendanceFilterState>(
    {},
  );

  // ✅ Approve/Reject/View Modal state
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"VIEW" | "APPROVE" | "REJECT">(
    "VIEW",
  );
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null,
  );
  const [approvalNotes, setApprovalNotes] = useState("");

  const isEmpty = (filters?: Record<string, boolean>) =>
    !filters || Object.values(filters).every((v) => !v);

  const monthOptions = [
    { id: 1, label: "Jan" },
    { id: 2, label: "Feb" },
    { id: 3, label: "Mar" },
    { id: 4, label: "Apr" },
    { id: 5, label: "May" },
    { id: 6, label: "Jun" },
    { id: 7, label: "Jul" },
    { id: 8, label: "Aug" },
    { id: 9, label: "Sep" },
    { id: 10, label: "Oct" },
    { id: 11, label: "Nov" },
    { id: 12, label: "Dec" },
  ];

  const statusOptions = [
    { id: "PENDING_APPROVAL", label: "Pending" },
    { id: "APPROVED", label: "Approved" },
    { id: "REJECTED", label: "Rejected" },
    { id: "CLOCKED_IN", label: "Clocked In" },
    { id: "CLOCKED_OUT", label: "Clocked Out" },
  ];

  const statusPill: Record<AttendanceStatus, string> = {
    CLOCKED_IN: "bg-blue-100 text-blue-700",
    CLOCKED_OUT: "bg-purple-100 text-purple-700",
    PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-IN") : "-";

  const formatDT = (d?: string | null) =>
    d ? new Date(d).toLocaleString("en-IN") : "-";

  // ---------------- API ----------------

  const fetchAttendance = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const qs = new URLSearchParams();
      if (from) qs.append("from", from);
      if (to) qs.append("to", to);

      const res = await apiClient.get(
        `${apiClient.URLS.staffattendance}/by-user/${userId}${
          qs.toString() ? "?" + qs.toString() : ""
        }`,
        {},
        true,
      );

      if (res?.status === 200) {
        setRows(res.body || []);
      } else {
        toast.error("Failed to fetch attendance");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.body?.message || "Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ---------------- Modal helpers ----------------

  const openModal = (
    record: AttendanceRecord,
    mode: "VIEW" | "APPROVE" | "REJECT",
  ) => {
    setSelectedRecord(record);
    setModalMode(mode);
    setApprovalNotes("");

    // optional defaults
    if (mode === "APPROVE") setApprovalNotes("Approved by HR");
    if (mode === "REJECT") setApprovalNotes("");

    setActionModalOpen(true);
  };

  const closeModal = () => {
    setActionModalOpen(false);
    setSelectedRecord(null);
    setModalMode("VIEW");
    setApprovalNotes("");
  };

  const submitApproveReject = async () => {
    if (!selectedRecord?.id) return;

    const action: "APPROVED" | "REJECTED" =
      modalMode === "APPROVE" ? "APPROVED" : "REJECTED";

    // ✅ Require notes on reject
    if (action === "REJECTED" && approvalNotes.trim().length < 3) {
      toast.error("Please enter rejection reason (min 3 chars)");
      return;
    }

    try {
      if (updatingId) return;
      setUpdatingId(selectedRecord.id);

      const res = await apiClient.patch(
        `${apiClient.URLS.staffattendance}/${selectedRecord.id}/approve`,
        {
          status: action,
          approvalNotes:
            approvalNotes.trim() ||
            (action === "REJECTED" ? "Rejected by HR" : "Approved by HR"),
        },
        true,
      );

      if (res?.status === 200) {
        toast.success(`Attendance ${action.toLowerCase()} ✅`);
        closeModal();
        await fetchAttendance();
      } else {
        toast.error("Failed to update attendance");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.body?.message || "Error updating attendance");
    } finally {
      setUpdatingId(null);
    }
  };

  // ---------------- Derived views ----------------

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return rows.filter((r) => {
      const matchSearch =
        !q ||
        r.status?.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q) ||
        r.workLog?.toLowerCase().includes(q) ||
        r.clockInLocation?.toLowerCase().includes(q) ||
        r.clockOutLocation?.toLowerCase().includes(q) ||
        r.date?.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (!isEmpty(selectedFilters.status)) {
        if (!selectedFilters.status?.[r.status]) return false;
      }

      if (!isEmpty(selectedFilters.month)) {
        const m = new Date(r.date).getMonth() + 1;
        if (!selectedFilters.month?.[m]) return false;
      }

      return true;
    });
  }, [rows, searchQuery, selectedFilters]);

  const stats = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter((r) => r.status === "PENDING_APPROVAL").length;
    const approved = rows.filter((r) => r.status === "APPROVED").length;
    const rejected = rows.filter((r) => r.status === "REJECTED").length;
    const totalHours = rows.reduce(
      (acc, r) => acc + Number(r.workedHours || 0),
      0,
    );

    return {
      total,
      pending,
      approved,
      rejected,
      totalHours: Math.round(totalHours * 100) / 100,
    };
  }, [rows]);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="md:mt-4 mt-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="heading-text">Attendance</h3>

        <div className="flex items-center gap-2">
          <Button
            className="md:rounded-[8px] rounded-[4px] btn-text border border-[#5297ff] text-[#3586FF] md:px-4 px-2 md:py-1 py-2 font-medium md:text-sm text-[12px]"
            onClick={fetchAttendance}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 mb-3">
        <div className="bg-white border rounded-lg md:p-3 p-1 shadow-sm">
          <p className="md:text-[12px] text-[10px] text-gray-500 font-medium">
            Total Records
          </p>
          <p className="md:text-[18px] text-[14px] font-bold">{stats.total}</p>
        </div>
        <div className="bg-white border rounded-lg md:p-3 p-1 shadow-sm">
          <p className="md:text-[12px] text-[10px] text-gray-500 font-medium">
            Pending
          </p>
          <p className="md:text-[18px] text-[14px] font-bold text-yellow-700">
            {stats.pending}
          </p>
        </div>
        <div className="bg-white border rounded-lg md:p-3 p-1 shadow-sm">
          <p className="md:text-[12px] text-[10px] text-gray-500 font-medium">
            Approved
          </p>
          <p className="md:text-[18px] text-[14px] font-bold text-green-700">
            {stats.approved}
          </p>
        </div>
        <div className="bg-white border rounded-lg md:p-3 p-1 shadow-sm">
          <p className="md:text-[12px] text-[10px] text-gray-500 font-medium">
            Rejected
          </p>
          <p className="md:text-[18px] text-[14px] font-bold text-red-700">
            {stats.rejected}
          </p>
        </div>
        <div className="bg-white border rounded-lg md:p-3 p-1 shadow-sm">
          <p className="md:text-[12px] text-[10px] text-gray-500 font-medium">
            Total Hours
          </p>
          <p className="md:text-[18px] text-[14px] font-bold">
            {stats.totalHours}
          </p>
        </div>
      </div>

      {/* Date range */}
      <div className="w-full flex flex-col md:flex-row justify-between md:items-center gap-2 md:gap-3 mb-3">
        <div className="flex md:items-center md:flex-row flex-col md:gap-6 gap-2">
          <CustomDate
            type="date"
            label="From"
            labelCls="mb-0 mr-2 text-[12px] font-medium text-gray-700 whitespace-nowrap"
            rootCls="flex items-center md:gap-2 gap-1 w-auto"
            outerInputCls="py-1 md:min-w-[140px] min-w-[100px]"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            name="from"
          />

          <CustomDate
            type="date"
            label="To"
            labelCls="mb-0 mr-2 text-[12px] font-medium text-gray-700 whitespace-nowrap"
            rootCls="flex items-center md:gap-2 gap-1 w-auto"
            outerInputCls="py-1 md:min-w-[140px] min-w-[100px]"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            name="to"
          />
        </div>

        <div className="flex gap-2">
          <Button
            className="md:rounded-[8px] rounded-[4px] bg-[#5297ff] btn-text text-white md:px-4 px-2 md:py-2 py-1 font-medium md:text-sm text-[12px]"
            onClick={fetchAttendance}
          >
            Apply
          </Button>

          <Button
            className="rounded border md:px-4 px-2 md:py-2 py-1 btn-text font-medium md:text-sm text-[12px]"
            onClick={() => {
              setFrom("");
              setTo("");
              setSearchQuery("");
              setSelectedFilters({});
              fetchAttendance();
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex-1 md:mt-2 mt-0">
        <ReusableSearchFilter
          searchText={searchQuery}
          placeholder="Search by status, notes, work log, location, date..."
          onSearchChange={setSearchQuery}
          filters={[
            { groupLabel: "Status", key: "status", options: statusOptions },
            { groupLabel: "Month", key: "month", options: monthOptions },
          ]}
          selectedFilters={selectedFilters}
          onFilterChange={setSelectedFilters}
        />
      </div>

      {filteredRows.length === 0 ? (
        <p className="flex items-center justify-center md:text-[16px] text-[12px] font-medium mt-3">
          No attendance records found.
        </p>
      ) : (
        <div className="overflow-x-auto border shadow-custom rounded-md mt-3">
          <table className="min-w-full md:text-sm text-[12px]">
            <thead className="bg-gray-100 text-black font-medium md:text-[14px] text-[12px]">
              <tr>
                <th className="px-3 py-2 text-center text-nowrap">Date</th>
                <th className="px-3 py-2 text-center text-nowrap">In</th>
                <th className="px-3 py-2 text-center text-nowrap">Out</th>
                <th className="px-3 py-2 text-center text-nowrap">Hours</th>
                <th className="px-3 py-2 text-center text-nowrap">Status</th>
                <th className="px-3 py-2 text-center text-nowrap">Actions</th>
              </tr>
            </thead>

            <tbody className="text-gray-900 bg-white text-center md:text-[14px] text-[12px]">
              {filteredRows.map((r) => {
                const isPending = r.status === "PENDING_APPROVAL";

                return (
                  <tr key={r.id} className="border-t font-medium text-gray-900">
                    <td className="px-3 py-2 text-nowrap">
                      {formatDate(r.date)}
                    </td>
                    <td className="px-3 py-2 text-nowrap">
                      {r.clockInTime || "-"}
                    </td>
                    <td className="px-3 py-2 text-nowrap">
                      {r.clockOutTime || "-"}
                    </td>
                    <td className="px-3 py-2">{r.workedHours ?? "-"}</td>

                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-[2px] rounded md:text-xs text-[11px] font-semibold ${
                          statusPill[r.status]
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-2">
                        {/* ✅ View always available */}
                        <Button
                          onClick={() => openModal(r, "VIEW")}
                          className="md:px-3 px-2 btn-text md:py-[4px] py-[2px] rounded-md md:text-[12px] text-[10px] font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          View
                        </Button>

                        <Button
                          disabled={!isPending || updatingId === r.id}
                          onClick={() => openModal(r, "APPROVE")}
                          className={`md:px-3 px-2 btn-text md:py-[4px] py-[2px] rounded-md md:text-[12px] text-[10px] font-medium border ${
                            isPending
                              ? "border-green-500 text-green-700 hover:bg-green-50"
                              : "border-gray-200 text-gray-400"
                          }`}
                        >
                          {updatingId === r.id ? "..." : "Approve"}
                        </Button>

                        <Button
                          disabled={!isPending || updatingId === r.id}
                          onClick={() => openModal(r, "REJECT")}
                          className={`md:px-3 px-2 btn-text md:py-[4px] py-[2px] rounded-md md:text-[12px] text-[10px] font-medium border ${
                            isPending
                              ? "border-red-500 text-red-700 hover:bg-red-50"
                              : "border-gray-200 text-gray-400"
                          }`}
                        >
                          {updatingId === r.id ? "..." : "Reject"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[12px] text-gray-500 mt-3">
        * Approve/Reject is enabled only when status is <b>PENDING_APPROVAL</b>.
      </p>

      {/* ---------------- Modal ---------------- */}
      {actionModalOpen && selectedRecord && (
        <Modal
          isOpen={actionModalOpen}
          closeModal={closeModal}
          title={
            modalMode === "VIEW"
              ? "Attendance Details"
              : modalMode === "APPROVE"
                ? "Approve Attendance"
                : "Reject Attendance"
          }
          className="md:max-w-[560px] max-w-[320px]"
          rootCls="z-[99999]"
        >
          <div className="space-y-3">
            {/* Details */}
            <div className="border rounded-md p-2 bg-gray-50">
              <div className="text-[12px] text-gray-700">
                <b>Date:</b> {formatDate(selectedRecord.date)} &nbsp; | &nbsp;
                <b>Status:</b>{" "}
                <span className="font-semibold">{selectedRecord.status}</span>
              </div>

              <div className="text-[12px] text-gray-700 mt-2 grid grid-cols-2 gap-2">
                <div>
                  <div>
                    <b>Clock In:</b> {selectedRecord.clockInTime || "-"}
                  </div>
                  <div className="text-gray-600">
                    <b>In Location:</b> {selectedRecord.clockInLocation || "-"}
                  </div>
                </div>
                <div>
                  <div>
                    <b>Clock Out:</b> {selectedRecord.clockOutTime || "-"}
                  </div>
                  <div className="text-gray-600">
                    <b>Out Location:</b>{" "}
                    {selectedRecord.clockOutLocation || "-"}
                  </div>
                </div>
              </div>

              <div className="text-[12px] text-gray-700 mt-2">
                <b>Worked Hours:</b> {selectedRecord.workedHours ?? "-"}
              </div>

              <div className="text-[12px] text-gray-700 mt-2">
                <b>Staff Notes:</b> {selectedRecord.notes || "-"}
              </div>

              {/* ✅ Work log preview */}
              <div className="text-[12px] text-gray-700 mt-2">
                <b>Work Log:</b>
                <div className="mt-1 whitespace-pre-wrap bg-white border rounded p-2 max-h-[160px] overflow-auto">
                  {selectedRecord.workLog || "-"}
                </div>
              </div>

              {/* ✅ Final action details */}
              <div className="text-[12px] text-gray-700 mt-2">
                <b>Approved At:</b> {formatDT(selectedRecord.approvedAt)}
              </div>
              <div className="text-[12px] text-gray-700">
                <b>Approval Notes:</b> {selectedRecord.approvalNotes || "-"}
              </div>
            </div>

            {/* Notes input only for approve/reject */}
            {modalMode !== "VIEW" && (
              <div>
                <label className="text-[12px] font-medium text-gray-700">
                  {modalMode === "REJECT"
                    ? "Rejection Reason *"
                    : "Approval Notes (optional)"}
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder={
                    modalMode === "REJECT"
                      ? "Why are you rejecting this attendance?"
                      : "Any note for approval (optional)"
                  }
                  className="w-full border rounded-md p-2 text-[12px] mt-1 min-h-[90px]"
                />
              </div>
            )}

            {/* Footer buttons */}
            <div className="flex items-center justify-end gap-2">
              <Button
                className="rounded border md:px-4 px-3 md:py-2 py-1 btn-text"
                onClick={closeModal}
              >
                Close
              </Button>

              {modalMode !== "VIEW" && (
                <Button
                  disabled={updatingId === selectedRecord.id}
                  className={`md:rounded-[8px] rounded-[6px] md:px-4 px-3 md:py-2 py-1 btn-text text-white ${
                    modalMode === "APPROVE" ? "bg-green-600" : "bg-red-600"
                  }`}
                  onClick={submitApproveReject}
                >
                  {updatingId === selectedRecord.id
                    ? "Saving..."
                    : modalMode === "APPROVE"
                      ? "Approve"
                      : "Reject"}
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function LeavesSection({ userId }: { userId: any }) {
  const [leaves, setLeaves] = useState<EmployeeLeave[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  interface LeavesFilterState {
    type?: { [key: string]: boolean };
    status?: { [key: string]: boolean };
    month?: { [key: string]: boolean };
  }

  const [selectedFilters, setSelectedFilters] = useState<LeavesFilterState>({});

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(
        `${apiClient.URLS.hrBaseUrl}/leaves/user/${userId}`,
        {},
        true,
      );
      setLeaves(res.body || []);
    } catch (err) {
      setLeaves([]);
      console.error(err);
      // toast.error("Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchLeaves();
  }, [userId]);

  const handleStatusChange = async (leaveId: number, status: LeaveStatus) => {
    try {
      setUpdatingId(leaveId);
      const res = await apiClient.patch(
        `${apiClient.URLS.hrBaseUrl}/leaves/${leaveId}/status`,
        { status },
        true,
      );
      if (res?.status === 200) {
        toast.success(`Leave ${status.toLowerCase()} successfully`);
        await fetchLeaves();
      } else {
        toast.error("Failed to update status");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.body?.message || "Error updating leave status");
    } finally {
      setUpdatingId(null);
    }
  };

  const monthOptions = [
    { id: 1, label: "Jan" },
    { id: 2, label: "Feb" },
    { id: 3, label: "Mar" },
    { id: 4, label: "Apr" },
    { id: 5, label: "May" },
    { id: 6, label: "Jun" },
    { id: 7, label: "Jul" },
    { id: 8, label: "Aug" },
    { id: 9, label: "Sep" },
    { id: 10, label: "Oct" },
    { id: 11, label: "Nov" },
    { id: 12, label: "Dec" },
  ];
  const isEmpty = (filters?: Record<string, boolean>) =>
    !filters || Object.values(filters).every((v) => !v);

  const filteredLeaves = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return leaves.filter((l) => {
      const matchSearch =
        !q ||
        l?.type?.toLowerCase().includes(q) ||
        l?.reason?.toLowerCase().includes(q);

      if (!matchSearch) return false;

      const typeFilters = selectedFilters.type;
      const matchesType = isEmpty(typeFilters) || typeFilters?.[l.type];

      if (!matchesType) return false;

      const statusFilters = selectedFilters.status;
      const matchesStatus = isEmpty(statusFilters) || statusFilters?.[l.status];

      if (!matchesStatus) return false;

      const monthFilters = selectedFilters.month;
      const month = new Date(l.fromDate).getMonth() + 1;

      const matchesMonth = isEmpty(monthFilters) || monthFilters?.[month];

      if (!matchesMonth) return false;
      return true;
    });
  }, [leaves, searchQuery, selectedFilters]);

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-IN") : "-";
  const LeaveType = {
    CASUAL: "CASUAL",
    SICK: "SICK",
    EARNED: "EARNED",
    COMP_OFF: "COMP_OFF",
    LOP: "LOP",
  } as const;

  type LeaveType = (typeof LeaveType)[keyof typeof LeaveType];

  const LeaveStatus = {
    APPLIED: "APPLIED",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    CANCELLED: "CANCELLED",
  } as const;

  type LeaveStatus = (typeof LeaveStatus)[keyof typeof LeaveStatus];

  const statusColors: Record<LeaveStatus, string> = {
    [LeaveStatus.APPLIED]: "bg-yellow-100 text-yellow-700",
    [LeaveStatus.APPROVED]: "bg-green-100 text-green-700",
    [LeaveStatus.REJECTED]: "bg-red-100 text-red-700",
    [LeaveStatus.CANCELLED]: "bg-gray-200 text-gray-700",
  };
  const leaveTypeOptions = [
    { id: LeaveType.CASUAL, label: "Casual" },
    { id: LeaveType.SICK, label: "Sick" },
    { id: LeaveType.EARNED, label: "Earned" },
    { id: LeaveType.COMP_OFF, label: "Comp Off" },
    { id: LeaveType.LOP, label: "Loss of Pay" },
  ];

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="md:mt-4 mt-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="heading-text">Leaves</h3>
      </div>
      <div className="flex-1 md:mt-2 mt-0">
        <ReusableSearchFilter
          searchText={searchQuery}
          placeholder="Search by leave type or reason"
          onSearchChange={setSearchQuery}
          filters={[
            {
              groupLabel: "Leave Type",
              key: "type", // maps → selectedFilters.type
              options: leaveTypeOptions,
            },
            {
              groupLabel: "Status",
              key: "status", // maps → selectedFilters.status
              options: [
                { id: LeaveStatus.APPLIED, label: "Applied" },
                { id: LeaveStatus.APPROVED, label: "Approved" },
                { id: LeaveStatus.REJECTED, label: "Rejected" },
                { id: LeaveStatus.CANCELLED, label: "Cancelled" },
              ],
            },
            {
              groupLabel: "Month",
              key: "month", // maps → selectedFilters.month
              options: monthOptions,
            },
          ]}
          selectedFilters={selectedFilters}
          onFilterChange={setSelectedFilters}
        />
      </div>

      {filteredLeaves.length === 0 ? (
        <p className="flex items-center justify-center md:text-[16px] text-[12px] font-medium">
          No leave records.
        </p>
      ) : (
        <div className="overflow-x-auto border font-medium shadow-custom rounded-md mt-3">
          <table className="min-w-full md:text-sm text-[12px]">
            <thead className="bg-gray-100 text-black font-medium md:text-[14px] text-[12px]">
              <tr>
                <th className="px-3 py-2 text-center text-nowrap">Type</th>
                <th className="px-3 py-2 text-center text-nowrap">From</th>
                <th className="px-3 py-2 text-center text-nowrap">To</th>
                <th className="px-3 py-2 text-center text-nowrap">Days</th>
                <th className="px-3 py-2 text-center text-nowrap">Reason</th>
                <th className="px-3 py-2 text-center text-nowrap">Status</th>
                <th className="px-3 py-2 text-center text-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 font-regular bg-white text-center md:text-[14px] text-[12px]">
              {filteredLeaves.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="px-3 py-2 text-nowrap">{l.type}</td>
                  <td className="px-3 py-2 text-nowrap">
                    {formatDate(l.fromDate)}
                  </td>
                  <td className="px-3 py-2 text-nowrap">
                    {formatDate(l.toDate)}
                  </td>
                  <td className="px-3 py-2">{l.days}</td>
                  <td className="px-3 py-2 max-w-[200px] truncate">
                    {l.reason || "-"}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-[2px] rounded md:text-xs text-[12px] font-medium ${
                        statusColors[l.status]
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>

                  <td className="px-3 py-2">
                    <DropDown
                      gapY={8}
                      placement="bottom-start"
                      fallBackPlcmnts={["bottom", "bottom-end"]}
                      buttonElement={
                        <Button
                          className="flex items-center font-medium border rounded-[20px] text-[10px] text-nowrap md:text-sm px-3 py-[4px] bg-white text-black hover:bg-gray-100"
                          disabled={updatingId === l.id}
                        >
                          {updatingId === l.id
                            ? "Updating..."
                            : "Change Status"}
                          <IoMdArrowDropdown className="w-4 h-4 ml-2" />
                        </Button>
                      }
                    >
                      <div className="md:absolute relative max-h-[200px] top-full left-0 mt-1 bg-white border rounded-md shadow-lg md:max-h-60 overflow-auto flex flex-col p-2 min-w-[120px]">
                        <Button
                          onClick={() =>
                            handleStatusChange(
                              l.id,
                              LeaveStatus.APPROVED as LeaveStatus,
                            )
                          }
                          className={`border border-gray-200 text-left font-medium px-2 py-1 text-xs rounded 
                            ${
                              l.status === LeaveStatus.APPROVED
                                ? "bg-green-500 text-white"
                                : "bg-gray-100"
                            }`}
                          disabled={updatingId === l.id}
                        >
                          Approve
                        </Button>

                        <Button
                          onClick={() =>
                            handleStatusChange(
                              l.id,
                              LeaveStatus.REJECTED as LeaveStatus,
                            )
                          }
                          className={`border border-gray-200 text-left px-2 py-1  font-medium text-xs rounded 
                            ${
                              l.status === LeaveStatus.REJECTED
                                ? "bg-red-500 text-white"
                                : "bg-gray-100"
                            }`}
                          disabled={updatingId === l.id}
                        >
                          Reject
                        </Button>

                        <Button
                          onClick={() =>
                            handleStatusChange(
                              l.id,
                              LeaveStatus.CANCELLED as LeaveStatus,
                            )
                          }
                          className={`border border-gray-200 text-left px-2 py-1 font-medium text-xs rounded 
                            ${
                              l.status === LeaveStatus.CANCELLED
                                ? "bg-gray-500 text-white"
                                : "bg-gray-100"
                            }`}
                          disabled={updatingId === l.id}
                        >
                          Cancel
                        </Button>
                      </div>
                    </DropDown>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PayslipSection({ userId }: { userId: string }) {
  const [slips, setSlips] = useState<EmployeePayslip[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const headerUploadInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingHeaderPdf, setUploadingHeaderPdf] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  interface PayslipFilterState {
    status?: { [key: string]: boolean };
    month?: { [key: string]: boolean };
  }

  const [selectedFilters, setSelectedFilters] = useState<PayslipFilterState>(
    {},
  );

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<EmployeePayslip | null>(
    null,
  );
  const [updateSaving, setUpdateSaving] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    pdfUrl: "",
  });

  const [form, setForm] = useState({
    month: "",
    year: "",
    grossEarnings: "",
    totalDeductions: "",
    netPay: "",
    payDate: "",
    payslipNumber: "",
    pdfUrl: "",
  });

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(
        `${apiClient.URLS.hrBaseUrl}/payslips/user/${userId}`,
        {},
        true,
      );
      setSlips(res.body || []);
    } catch (err) {
      setSlips([]);
      console.error(err);
      // toast.error("Failed to fetch payslips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchPayslips();
  }, [userId]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm({
      month: "",
      year: "",
      grossEarnings: "",
      totalDeductions: "",
      netPay: "",
      payDate: "",
      payslipNumber: "",
      pdfUrl: "",
    });
  };

  const handleCreatePayslip = async () => {
    if (!form.month || !form.year || !form.netPay || !form.payDate) {
      toast.error("Month, Year, Net Pay and Pay Date are required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        month: Number(form.month),
        year: Number(form.year),
        grossEarnings: Number(form.grossEarnings || 0),
        totalDeductions: Number(form.totalDeductions || 0),
        netPay: Number(form.netPay),
        payDate: form.payDate,
        payslipNumber: form.payslipNumber || undefined,
        pdfUrl: form.pdfUrl || undefined,
      };

      const res = await apiClient.post(
        `${apiClient.URLS.hrBaseUrl}/payslips/user/${userId}`,
        payload,
        true,
      );

      if (res?.status === 201 || res?.status === 200) {
        toast.success("Payslip created");
        setIsCreateModalOpen(false);
        resetForm();
        await fetchPayslips();
      } else {
        toast.error("Failed to create payslip");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.body?.message || "Error creating payslip");
    } finally {
      setSaving(false);
    }
  };
  const monthOptions = [
    { id: 1, label: "Jan" },
    { id: 2, label: "Feb" },
    { id: 3, label: "Mar" },
    { id: 4, label: "Apr" },
    { id: 5, label: "May" },
    { id: 6, label: "Jun" },
    { id: 7, label: "Jul" },
    { id: 8, label: "Aug" },
    { id: 9, label: "Sep" },
    { id: 10, label: "Oct" },
    { id: 11, label: "Nov" },
    { id: 12, label: "Dec" },
  ];
  const PayslipStatus = {
    GENERATED: "GENERATED",
    SENT: "SENT",
    PAID: "PAID",
  } as const;

  type PayslipStatus = (typeof PayslipStatus)[keyof typeof PayslipStatus];
  const PAYSLIP_STATUS = [
    { id: PayslipStatus.GENERATED, label: "Generated" },
    { id: PayslipStatus.SENT, label: "Sent" },
    { id: PayslipStatus.PAID, label: "Paid" },
  ];

  const formatMonthYear = (m: number, y: number) =>
    `${String(m).padStart(2, "0")}/${y}`;
  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-IN") : "-";
  const handleHeaderPdfUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingHeaderPdf(true);

      const url = await uploadFile(file, "hr/payslips");

      setForm((prev) => ({
        ...prev,
        pdfUrl: url,
      }));
      setIsCreateModalOpen(true);

      toast.success("Payslip PDF uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload PDF");
    } finally {
      setUploadingHeaderPdf(false);
      e.target.value = "";
    }
  };

  const isEmpty = (filters?: Record<string, boolean>) =>
    !filters || Object.values(filters).every((v) => !v);

  const filteredSlips = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return slips.filter((s) => {
      const monthYear = formatMonthYear(s.month, s.year).toLowerCase();
      const matchSearch =
        !q ||
        s.payslipNumber?.toLowerCase().includes(q) ||
        monthYear.includes(q);

      if (!matchSearch) return false;

      if (!isEmpty(selectedFilters.status)) {
        if (!selectedFilters.status?.[s.status]) return false;
      }

      if (!isEmpty(selectedFilters.month)) {
        const monthKey = String(s.month);
        if (!selectedFilters.month?.[monthKey]) return false;
      }

      return true;
    });
  }, [slips, searchQuery, selectedFilters]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const PAYSLIP_STATUS_OPTIONS = [
    { id: "GENERATED", label: "Generated" },
    { id: "SENT", label: "Sent" },
    { id: "PAID", label: "Paid" },
  ];

  const openUpdateModal = (slip: EmployeePayslip) => {
    setSelectedSlip(slip);

    setUpdateForm({
      status: slip.status || "",
      pdfUrl: slip.pdfUrl || "",
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdateChange = (key: "status" | "pdfUrl", value: string) => {
    setUpdateForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdatePayslip = async () => {
    if (!selectedSlip) return;

    const payload: any = {};
    if (updateForm.status) payload.status = updateForm.status;
    if (updateForm.pdfUrl) payload.pdfUrl = updateForm.pdfUrl;

    if (!payload.status && !payload.pdfUrl) {
      toast.error("Nothing to update");
      return;
    }

    setUpdateSaving(true);
    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.hrBaseUrl}/payslips/${selectedSlip.id}`,
        payload,
        true,
      );

      if (res?.status === 200) {
        toast.success("Payslip updated");
        setIsUpdateModalOpen(false);
        setSelectedSlip(null);
        await fetchPayslips();
      } else {
        toast.error("Failed to update payslip");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.body?.message || "Error updating payslip");
    } finally {
      setUpdateSaving(false);
    }
  };

  return (
    <div className="md:mt-4 mt-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold heading-text text-lg">Payslips</h3>

        <div className="flex items-center gap-2">
          <Button
            className="rounded bg-blue-500 text-white px-3 py-2 font-medium md:text-sm text-[12px]"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Generate Payslip
          </Button>

          <Button
            className="rounded border border-[#5297ff] text-[#3586FF]  px-3 py-2 font-medium md:text-sm text-[12px]"
            onClick={() => headerUploadInputRef.current?.click()}
            disabled={uploadingHeaderPdf}
          >
            {uploadingHeaderPdf ? "Uploading..." : "Upload Payslip"}
          </Button>

          <input
            ref={headerUploadInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleHeaderPdfUpload}
          />
        </div>
      </div>
      <div className="flex-1 md:mt-2 mt-0">
        <ReusableSearchFilter
          searchText={searchQuery}
          placeholder="Search by payslip no. or month/year"
          onSearchChange={setSearchQuery}
          filters={[
            {
              groupLabel: "Status",
              key: "status",
              options: PAYSLIP_STATUS,
            },
            {
              groupLabel: "Month",
              key: "month",
              options: monthOptions,
            },
          ]}
          selectedFilters={selectedFilters}
          onFilterChange={setSelectedFilters}
        />
      </div>

      {filteredSlips.length === 0 ? (
        <p className="flex items-center justify-center md:text-[16px] text-[12px] font-medium">
          No payslips found.
        </p>
      ) : (
        <div className="overflow-x-auto border shadow-custom rounded-md">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-black font-medium md:text-[14px] text-[12px]">
              <tr>
                <th className="px-3 py-2 text-center text-nowrap">
                  Month / Year
                </th>
                <th className="px-3 py-2 text-center text-nowrap">Net Pay</th>
                <th className="px-3 py-2 text-center text-nowrap">Gross</th>
                <th className="px-3 py-2 text-left text-nowrap">Deductions</th>
                <th className="px-3 py-2 text-center text-nowrap">Pay Date</th>
                <th className="px-3 py-2 text-center text-nowrap">Status</th>
                <th className="px-3 py-2 text-center text-nowrap">
                  Payslip No
                </th>
                <th className="px-3 py-2 text-center text-nowrap">PDF</th>
                <th className="px-3 py-2 text-center text-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="font-medium text-gray-700 bg-white md:text-[14px] text-[12px]">
              {filteredSlips.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-3 py-2 text-center">
                    {formatMonthYear(s.month, s.year)}
                  </td>
                  <td className="px-3 py-2 text-center">{s.netPay}</td>
                  <td className="px-3 py-2 text-center">{s.grossEarnings}</td>
                  <td className="px-3 py-2 text-left">{s.totalDeductions}</td>
                  <td className="px-3 py-2 text-center">
                    {formatDate(s.payDate)}
                  </td>
                  <td className="px-3 py-2 text-center">{s.status}</td>
                  <td className="px-3 py-2 text-center">
                    {s.payslipNumber || "-"}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {s.pdfUrl ? (
                      <a
                        href={s.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Button
                      className="px-2 py-[2px] rounded-[4px] border border-[#5297ff] text-[#3586FF]  md:text-[12px] text-[10px]"
                      onClick={() => openUpdateModal(s)}
                    >
                      Update
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isCreateModalOpen && (
        <Modal
          isOpen={true}
          closeModal={() => setIsCreateModalOpen(false)}
          className="md:max-w-[600px] max-w-[320px] w-full"
          isCloseRequired={false}
          title="Generate Payslip"
          titleCls="font-medium md:text-[18px] text-[12px] text-center text-[#3586FF] "
          rootCls="z-[99999]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 gap-1">
            <CustomInput
              type="number"
              label="Month (1-12)"
              name="month"
              value={form.month}
              onChange={(e) =>
                setForm((f) => ({ ...f, month: e.target.value }))
              }
              labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
              className="md:px-2 px-1 py-0 border border-[#CFCFCF] rounded-[4px] w-full"
              rootCls="md:px-2 px-1 md:py-0 py-0"
              placeholder="Enter month"
            />
            <CustomInput
              type="number"
              label="Year"
              name="year"
              value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
              className="md:px-2 px-1 py-0 border border-[#CFCFCF] rounded-[4px] w-full"
              rootCls="md:px-2 px-1 md:py-0 py-0"
              labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
              placeholder="Enter Year"
            />
            <CustomInput
              type="number"
              label="Gross Earnings"
              name="grossEarnings"
              value={form.grossEarnings}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  grossEarnings: e.target.value,
                }))
              }
              labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
              className="md:px-2 px-1 py-0 border border-[#CFCFCF] rounded-[4px] w-full"
              rootCls="md:px-2 px-1 md:py-0 py-0"
              placeholder="Enter Gross Earnings"
            />
            <CustomInput
              type="number"
              label="Total Deductions"
              name="totalDeductions"
              value={form.totalDeductions}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  totalDeductions: e.target.value,
                }))
              }
              className="md:px-2 px-1 py-0 border border-[#CFCFCF] rounded-[4px] w-full"
              rootCls="md:px-2 px-1 md:py-0 py-0"
              labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
              placeholder="Enter Total Deductions"
            />
            <CustomInput
              type="number"
              label="Net Pay"
              name="netPay"
              value={form.netPay}
              onChange={(e) =>
                setForm((f) => ({ ...f, netPay: e.target.value }))
              }
              labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
              className="md:px-2 px-1 py-0 border border-[#CFCFCF] rounded-[4px] w-full"
              rootCls="md:px-2 px-1 md:py-0 py-0"
              placeholder="Enter Net Pay"
            />
            <CustomDate
              label="Pay Date"
              name="payDate"
              labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
              value={form.payDate}
              placeholder="Enter Pay Date"
              onChange={(e) => handleChange("payDate", e.target.value)}
              className="w-full text-[12px] py-[0px] rounded-[8px] border border-[#C7C6C6]"
            />

            <CustomInput
              type="text"
              label="Payslip Number (optional)"
              name="payslipNumber"
              value={form.payslipNumber}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  payslipNumber: e.target.value,
                }))
              }
              placeholder="Enter PaySlip Number"
              className="md:px-2 px-1 py-0 border border-[#CFCFCF] rounded-[4px] w-full"
              rootCls="md:px-2 px-1 md:py-0 py-0"
              labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
            />
            <CustomInput
              type="text"
              label="PDF URL (optional)"
              name="pdfUrl"
              placeholder="Enter pdf url"
              value={form.pdfUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, pdfUrl: e.target.value }))
              }
              labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
              className="md:px-2 px-1 py-0 border border-[#CFCFCF] rounded-[4px] w-full"
              rootCls="md:px-2 px-1 md:py-0 py-0"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              className="md:py-[6px] py-[4px] md:px-[18px] px-[16px] rounded-[4px] border-2 btn-text border-[#5297ff]"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={saving}
              className="md:py-[4px] py-[4px] md:px-[18px] px-[16px] rounded-[6px] border-2 btn-text bg-[#5297ff] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCreatePayslip}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </Modal>
      )}

      {isUpdateModalOpen && selectedSlip && (
        <Modal
          isOpen={true}
          closeModal={() => {
            setIsUpdateModalOpen(false);
            setSelectedSlip(null);
          }}
          className="md:max-w-[500px] max-w-[320px] w-full"
          isCloseRequired={false}
          title={`Update Payslip #${
            selectedSlip.payslipNumber || selectedSlip.id
          }`}
          titleCls="font-medium md:text-[18px] text-[12px] text-center text-[#3586FF] "
          rootCls="z-[99999]"
        >
          <div className="grid grid-cols-1 gap-3">
            <div className="flex flex-col gap-1">
              <SingleSelect
                label=" Status"
                labelCls="font-medium label-text text-[#000000]"
                type="single-select"
                name="status"
                selectedOption={
                  PAYSLIP_STATUS_OPTIONS.find(
                    (o) => o.id === updateForm.status,
                  ) || null
                }
                options={PAYSLIP_STATUS_OPTIONS}
                optionsInterface={{ isObj: true, displayKey: "label" }}
                buttonCls="w-full h-[40px]"
                handleChange={(name, opt) =>
                  handleUpdateChange("status", opt?.id || "")
                }
              />
            </div>

            <CustomInput
              type="text"
              label="PDF URL"
              name="pdfUrl"
              value={updateForm.pdfUrl}
              onChange={(e) => handleUpdateChange("pdfUrl", e.target.value)}
              labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
              className="md:px-2 px-1 py-0 border border-[#CFCFCF] rounded-[4px] w-full"
              rootCls="md:px-2 px-1 md:py-0 py-0"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              className="md:py-[6px] py-[4px] md:px-[18px] px-[16px] rounded-[4px] border-2 btn-text border-[#5297ff] font-medium"
              onClick={() => {
                setIsUpdateModalOpen(false);
                setSelectedSlip(null);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={updateSaving}
              className="md:py-[4px] py-[4px] font-medium md:px-[18px] px-[16px] rounded-[6px] border-2 btn-text bg-[#5297ff] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleUpdatePayslip}
            >
              {updateSaving ? "Updating..." : "Update"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
