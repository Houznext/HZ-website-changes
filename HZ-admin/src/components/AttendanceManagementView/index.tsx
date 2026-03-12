"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import apiClient from "@/src/utils/apiClient";
import Loader from "@/src/components/SpinLoader";
import Button from "@/src/common/Button";
import toast from "react-hot-toast";
import { RefreshCcw, Check, X } from "lucide-react";
import { useSession } from "next-auth/react";

import AttendanceManualEntryModal from "./AttendanceManualEntryModal";
import SingleSelect from "@/src/common/FormElements/SingleSelect";

/** ---------------- Types ---------------- */
type AttendanceStatus = "CLOCKED_IN" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";

type AttendanceRecord = {
  id: string;
  userId: string;
  date: string;
  clockInTime?: string;
  clockOutTime?: string;
  workedHours?: number;
  status: AttendanceStatus;
  notes?: string;
  workLog?: string;
  location?: string;
  user?: { firstName: string; lastName: string; email?: string };
  lateMinutes?: number;
};

type AdminUserRow = {
  user: { id: string; firstName: string; lastName: string; email?: string; phone?: string };
  membership?: { branchId?: string; kind?: string; branchRoles?: Array<{ id: string; roleName: string }> };
};

type BranchOption = { label: string; value: string };

type RequestType = "FORGOT_CLOCK_IN" | "FORGOT_CLOCK_OUT" | "FORGOT_BOTH" | "CORRECTION";
type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

type AttendanceRequest = {
  id: string;
  userId: string;
  date: string;
  type: RequestType;
  requestedClockInTime?: string | null;
  requestedClockOutTime?: string | null;
  reason?: string | null;
  workLog?: string | null;
  location?: string | null;
  status: RequestStatus;
  createdAt: string;
  actionNotes?: string | null;
  user?: { firstName: string; lastName: string; email?: string };
};

type TabKey = "PENDING" | "ALL" | "APPROVED" | "REJECTED" | "REQUESTS";

const tabToStatus: Record<Exclude<TabKey, "REQUESTS">, AttendanceStatus | undefined> = {
  PENDING: "PENDING_APPROVAL",
  ALL: undefined,
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

/** ---------------- UI helpers ---------------- */
const statusPill = (status: AttendanceStatus) => {
  if (status === "PENDING_APPROVAL") return "bg-orange-100 text-orange-700 border border-orange-200";
  if (status === "APPROVED") return "bg-green-100 text-green-700 border border-green-200";
  if (status === "REJECTED") return "bg-red-100 text-red-700 border border-red-200";
  return "bg-blue-100 text-blue-700 border border-blue-200";
};

const labelStatus = (s: AttendanceStatus) => {
  if (s === "PENDING_APPROVAL") return "Pending";
  if (s === "APPROVED") return "Approved";
  if (s === "REJECTED") return "Rejected";
  return "Clocked In";
};

const reqPill = (status: RequestStatus) => {
  if (status === "PENDING") return "bg-orange-100 text-orange-700 border border-orange-200";
  if (status === "APPROVED") return "bg-green-100 text-green-700 border border-green-200";
  return "bg-red-100 text-red-700 border border-red-200";
};

export default function AttendanceManagementView() {
  const { data: session } = useSession();
  const membership = session?.user?.branchMemberships?.[0];

  const canShowBranchFilter =
    membership?.branchRoles?.some((r: any) => r.roleName === "SuperAdmin") &&
    membership?.isBranchHead === true &&
    membership?.level === "ORG";

  const sessionBranchId = membership?.branchId ? String(membership.branchId) : null;

  const [activeTab, setActiveTab] = useState<TabKey>("PENDING");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");

  const [branchOptions, setBranchOptions] = useState<BranchOption[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const [branchUsers, setBranchUsers] = useState<AdminUserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [rows, setRows] = useState<AttendanceRecord[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);

  const [requests, setRequests] = useState<AttendanceRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [manualOpen, setManualOpen] = useState(false);

  /** ✅ effective branch id for APIs */
  const effectiveBranchId = useMemo(() => {
    if (canShowBranchFilter) return selectedBranch || sessionBranchId;
    return sessionBranchId;
  }, [canShowBranchFilter, selectedBranch, sessionBranchId]);

  /** ------------- Fetch branches ------------- */
  const fetchBranches = useCallback(() => {
    // Backend branch listing has been removed; derive a simple option from session if present.
    const formatted: BranchOption[] = sessionBranchId
      ? [{ label: "Current Branch", value: sessionBranchId }]
      : [];
    setBranchOptions(formatted);

    if (!selectedBranch && sessionBranchId) {
      setSelectedBranch(sessionBranchId);
    }
  }, [selectedBranch, sessionBranchId]);

  /** ------------- Fetch branch users ------------- */
  const fetchBranchUsers = useCallback(async () => {
    if (!effectiveBranchId) return;
    try {
      setLoadingUsers(true);
      const res = await apiClient.get(
        `${apiClient.URLS.user}/by-branch/${effectiveBranchId}/admin-users`,
        {},
        true
      );
      setBranchUsers(res.body || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load branch users");
      setBranchUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [effectiveBranchId]);

  /** ------------- Fetch attendance ------------- */
  const fetchAttendance = useCallback(async () => {
    if (activeTab === "REQUESTS") return;

    try {
      setLoadingRows(true);

      const status = tabToStatus[activeTab as Exclude<TabKey, "REQUESTS">];
      const params: any = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (status) params.status = status;

      // ✅ only ORG can pass branchId
      if (canShowBranchFilter && effectiveBranchId) params.branchId = effectiveBranchId;

      const res = await apiClient.get(`${apiClient.URLS.staffattendance}/all`, params, true);
      setRows(res.body || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load attendance");
      setRows([]);
    } finally {
      setLoadingRows(false);
    }
  }, [activeTab, from, to, canShowBranchFilter, effectiveBranchId]);

  /** ------------- Fetch requests ------------- */
  const fetchRequests = useCallback(async () => {
    if (activeTab !== "REQUESTS") return;

    try {
      setLoadingRequests(true);
      const params: any = { status: "PENDING" };
      if (from) params.from = from;
      if (to) params.to = to;

      // ✅ only ORG can pass branchId
      if (canShowBranchFilter && effectiveBranchId) params.branchId = effectiveBranchId;

      const res = await apiClient.get(`${apiClient.URLS.staffattendance}/requests`, params, true);
      setRequests(res.body || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load requests");
      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  }, [activeTab, from, to, canShowBranchFilter, effectiveBranchId]);

  /** ------------- Approve / Reject attendance record ------------- */
  const approveOrReject = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await apiClient.patch(
        `${apiClient.URLS.staffattendance}/${id}/approve`,
        { status, approvalNotes: status === "APPROVED" ? "Approved by HR" : "Rejected by HR" },
        true
      );
      toast.success(status === "APPROVED" ? "Approved" : "Rejected");
      fetchAttendance();
    } catch (e) {
      console.error(e);
      toast.error("Action failed");
    }
  };

  /** ------------- Approve / Reject request ------------- */
  const approveRequest = async (requestId: string) => {
    try {
      await apiClient.patch(
        `${apiClient.URLS.staffattendance}/requests/${requestId}/approve`,
        { status: "APPROVED", actionNotes: "Approved by HR" },
        true
      );
      toast.success("Request approved");
      fetchRequests();
      fetchAttendance();
    } catch (e) {
      console.error(e);
      toast.error("Approve request failed");
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      await apiClient.patch(
        `${apiClient.URLS.staffattendance}/requests/${requestId}/reject`,
        { status: "REJECTED", actionNotes: "Rejected by HR" },
        true
      );
      toast.success("Request rejected");
      fetchRequests();
    } catch (e) {
      console.error(e);
      toast.error("Reject request failed");
    }
  };

  /** ------------- Effects ------------- */
  useEffect(() => {
    // lock selectedBranch to session branch when dropdown is not allowed
    if (!membership) return;
    if (!canShowBranchFilter && sessionBranchId) setSelectedBranch(sessionBranchId);
  }, [membership, canShowBranchFilter, sessionBranchId]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    fetchBranchUsers();
  }, [fetchBranchUsers]);

  useEffect(() => {
    if (activeTab === "REQUESTS") fetchRequests();
    else fetchAttendance();
  }, [activeTab, from, to, effectiveBranchId, canShowBranchFilter, fetchRequests, fetchAttendance]);

  /** ✅ base attendance: backend is already branch-scoped */
  const baseAttendance = rows;

  /** ------------- Search filter ------------- */
  const filteredAttendanceRows = useMemo(() => {
    if (!search.trim()) return baseAttendance;
    const q = search.toLowerCase();
    return baseAttendance.filter((r) => {
      const name = `${r.user?.firstName || ""} ${r.user?.lastName || ""}`.toLowerCase();
      const email = (r.user?.email || "").toLowerCase();
      return name.includes(q) || email.includes(q) || (r.userId || "").toLowerCase().includes(q);
    });
  }, [baseAttendance, search]);

  const filteredRequestRows = useMemo(() => {
    if (!search.trim()) return requests;
    const q = search.toLowerCase();
    return requests.filter((r) => {
      const name = `${r.user?.firstName || ""} ${r.user?.lastName || ""}`.toLowerCase();
      const email = (r.user?.email || "").toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        (r.userId || "").toLowerCase().includes(q) ||
        (r.reason || "").toLowerCase().includes(q) ||
        (r.type || "").toLowerCase().includes(q)
      );
    });
  }, [requests, search]);

  /** ------------- Summary ------------- */
  const summary = useMemo(() => {
    const pending = baseAttendance.filter((r) => r.status === "PENDING_APPROVAL").length;
    const approved = baseAttendance.filter((r) => r.status === "APPROVED").length;
    const rejected = baseAttendance.filter((r) => r.status === "REJECTED").length;
    const late = baseAttendance.filter((r) => (r.lateMinutes || 0) > 0).length;
    return { pending, approved, rejected, late };
  }, [baseAttendance]);

  // const selectedBranchLabel = branchOptions.find((b) => b.value === effectiveBranchId)?.label || "";
  const selectedBranchLabel =
  branchOptions.find((b) => b.value === (canShowBranchFilter ? selectedBranch : effectiveBranchId))?.label || "";


  const refreshAll = () => {
    fetchBranchUsers();
    if (activeTab === "REQUESTS") fetchRequests();
    else fetchAttendance();
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-[#6D28D9]">Attendance Management</h1>
          <p className="text-xs md:text-sm text-gray-500 font-medium">Review staff attendance + forgot punch requests</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setManualOpen(true)}
            className="rounded-xl bg-[#7C3AED] btn-text font-medium px-2 md:px-4 py-1 md:py-2 hover:bg-[#6D28D9] text-white"
          >
            + Manual Entry
          </Button>

          <Button
            onClick={refreshAll}
            className="h-10 w-10 rounded-xl border bg-white flex items-center justify-center hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCcw className="w-4 h-4 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Branch row */}
      <div className="mt-4 bg-white border rounded-2xl p-3 md:p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          {canShowBranchFilter ? (
            <div className="w-full md:w-[280px]">
              <SingleSelect
                type="single-select"
                name="branch"
                label="Branch"
                 labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                optionsInterface={{ isObj: true, displayKey: "label" }}
                options={branchOptions}
                selectedOption={branchOptions.find((b) => b.value === selectedBranch) || null}
                placeholder="Select Branch"
                handleChange={(name, value) => setSelectedBranch(value?.value || "")}
              />
            </div>
          ) : (
            <div className="text-sm font-bold text-gray-700">
              Branch: <span className="text-[#6D28D9]">{selectedBranchLabel}</span>
            </div>
          )}

          <div className="flex-1" />

          {/* Date range */}
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs font-bold text-gray-500">From:</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-10 px-3 rounded-xl border bg-white text-sm"
            />
            <label className="text-xs font-bold text-gray-500">To:</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-10 px-3 rounded-xl border bg-white text-sm"
            />
          </div>

          {/* Search */}
          <div className="w-full md:w-[280px]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name/email/userId/reason..."
              className="h-10 w-full px-3 rounded-xl border bg-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
        <SummaryCard title="Pending" value={String(summary.pending)} gradient="from-orange-400 to-orange-600" />
        <SummaryCard title="Approved" value={String(summary.approved)} gradient="from-emerald-400 to-emerald-600" />
        <SummaryCard title="Rejected" value={String(summary.rejected)} gradient="from-pink-500 to-rose-600" />
        <SummaryCard title="Late Check-ins" value={String(summary.late)} gradient="from-blue-500 to-indigo-600" />
      </div>

      {/* Tabs */}
      <div className="mt-4 bg-white border rounded-2xl p-3">
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl w-fit flex-wrap">
          <TabButton active={activeTab === "PENDING"} onClick={() => setActiveTab("PENDING")}>
            Pending{" "}
            <span className="ml-1 px-2 py-[2px] rounded-lg text-xs bg-orange-100 text-orange-700">{summary.pending}</span>
          </TabButton>
          <TabButton active={activeTab === "ALL"} onClick={() => setActiveTab("ALL")}>
            All
          </TabButton>
          <TabButton active={activeTab === "APPROVED"} onClick={() => setActiveTab("APPROVED")}>
            Approved
          </TabButton>
          <TabButton active={activeTab === "REJECTED"} onClick={() => setActiveTab("REJECTED")}>
            Rejected
          </TabButton>
          <TabButton active={activeTab === "REQUESTS"} onClick={() => setActiveTab("REQUESTS")}>
            Requests{" "}
            <span className="ml-1 px-2 py-[2px] rounded-lg text-xs bg-violet-100 text-violet-700">
              {requests.filter((r) => r.status === "PENDING").length}
            </span>
          </TabButton>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 bg-white border rounded-2xl overflow-hidden">
        {activeTab === "REQUESTS" ? (
          loadingRequests || loadingUsers ? (
            <div className="h-[360px] flex items-center justify-center">
              <Loader />
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left p-4 font-bold">STAFF</th>
                    <th className="text-left p-4 font-bold">DATE</th>
                    <th className="text-left p-4 font-bold">TYPE</th>
                    <th className="text-left p-4 font-bold">REQ IN</th>
                    <th className="text-left p-4 font-bold">REQ OUT</th>
                    <th className="text-left p-4 font-bold">REASON</th>
                    <th className="text-left p-4 font-bold">WORK LOG</th>
                    <th className="text-left p-4 font-bold">STATUS</th>
                    <th className="text-left p-4 font-bold">ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequestRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-10 text-center text-gray-500 font-medium">
                        No requests found.
                      </td>
                    </tr>
                  ) : (
                    filteredRequestRows.map((r) => {
                      const fullName = `${r.user?.firstName || ""} ${r.user?.lastName || ""}`.trim() || r.userId;

                      return (
                        <tr key={r.id} className="border-t hover:bg-gray-50/60">
                          <td className="p-4">
                            <p className="font-bold text-gray-900">{fullName}</p>
                            <p className="text-xs text-gray-500">{r.user?.email || ""}</p>
                          </td>

                          <td className="p-4 font-medium text-gray-900">{r.date}</td>

                          <td className="p-4">
                            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700">
                              {r.type.replace(/_/g, " ")}
                            </span>
                          </td>

                          <td className="p-4 font-bold text-emerald-600">{r.requestedClockInTime || "-"}</td>
                          <td className="p-4 font-bold text-rose-600">{r.requestedClockOutTime || "-"}</td>

                          <td className="p-4 text-xs text-gray-700">{r.reason || "-"}</td>
                          <td className="p-4 text-xs text-indigo-700">{r.workLog || "-"}</td>

                          <td className="p-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold ${reqPill(r.status)}`}>
                              {r.status}
                            </span>
                          </td>

                          <td className="p-4">
                            {r.status === "PENDING" ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => approveRequest(r.id)}
                                  className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center hover:bg-emerald-200"
                                  title="Approve request"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>

                                <Button
                                  onClick={() => rejectRequest(r.id)}
                                  className="h-9 w-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center hover:bg-rose-200"
                                  title="Reject request"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500 font-medium">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )
        ) : loadingRows || loadingUsers ? (
          <div className="h-[360px] flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left p-4 font-bold">STAFF</th>
                  <th className="text-left p-4 font-bold">DATE</th>
                  <th className="text-left p-4 font-bold">CHECK IN</th>
                  <th className="text-left p-4 font-bold">CHECK OUT</th>
                  <th className="text-left p-4 font-bold">HOURS</th>
                  <th className="text-left p-4 font-bold">STATUS</th>
                  <th className="text-left p-4 font-bold">FLAGS</th>
                  <th className="text-left p-4 font-bold">ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredAttendanceRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-gray-500 font-medium">
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  filteredAttendanceRows.map((r) => {
                    const fullName =
                      r.user?.firstName || r.user?.lastName
                        ? `${r.user?.firstName || ""} ${r.user?.lastName || ""}`.trim()
                        : r.userId;

                    const lateLabel = (r.lateMinutes || 0) > 0 ? `Late ${r.lateMinutes}m` : null;

                    return (
                      <tr key={r.id} className="border-t hover:bg-gray-50/60">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold">
                              {(fullName?.[0] || "U").toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{fullName}</p>
                              <p className="text-xs text-gray-500">{r.user?.email || ""}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-medium text-gray-900">{r.date}</td>

                        <td className="p-4">
                          <p className="font-bold text-emerald-600">{r.clockInTime || "-"}</p>
                          <p className="text-xs text-gray-500">{r.location || ""}</p>
                        </td>

                        <td className="p-4">
                          <p className="font-bold text-rose-600">{r.clockOutTime || "-"}</p>
                        </td>

                        <td className="p-4">
                          <p className="font-bold text-indigo-600">
                            {!isNaN(Number(r.workedHours)) ? `${Number(r.workedHours).toFixed(1)}h` : "-"}
                          </p>
                        </td>

                        <td className="p-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold ${statusPill(r.status)}`}>
                            {labelStatus(r.status)}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            {lateLabel && (
                              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-orange-100 text-orange-700">
                                {lateLabel}
                              </span>
                            )}
                            {r.workLog && (
                              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-purple-100 text-purple-700">
                                WorkLog
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-4">
                          {r.status === "PENDING_APPROVAL" ? (
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => approveOrReject(r.id, "APPROVED")}
                                className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center hover:bg-emerald-200"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </Button>

                              <Button
                                onClick={() => approveOrReject(r.id, "REJECTED")}
                                className="h-9 w-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center hover:bg-rose-200"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500 font-medium">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      <AttendanceManualEntryModal
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        onSuccess={() => {
          fetchAttendance();
          fetchBranchUsers();
        }}
        users={branchUsers}
      />
    </div>
  );
}

function SummaryCard({ title, value, gradient }: { title: string; value: string; gradient: string }) {
  return (
    <div className={`rounded-2xl p-4 text-white bg-gradient-to-r ${gradient} shadow-sm`}>
      <p className="text-sm font-bold opacity-90">{title}</p>
      <p className="text-3xl font-extrabold mt-2">{value}</p>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm font-bold transition ${
        active ? "bg-white shadow-sm text-violet-700" : "text-gray-600 hover:bg-white"
      }`}
    >
      {children}
    </Button>
  );
}
