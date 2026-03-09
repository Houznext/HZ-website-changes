"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import apiClient from "@/src/utils/apiClient";
import Button from "@/src/common/Button";
import CustomDate from "@/src/common/FormElements/CustomDate";
import CustomInput from "@/src/common/FormElements/CustomInput";
import Modal from "@/src/common/Modal";
import { 
  FiClock, 
  FiLogIn, 
  FiLogOut, 
  FiRefreshCw, 
  FiCalendar, 
  FiMapPin, 
  FiFileText, 
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiSend,
  FiFilter,
  FiClipboard,
  FiActivity,
  FiTrendingUp,
  FiX
} from "react-icons/fi";
type RequestType =
  | "FORGOT_CLOCK_IN"
  | "FORGOT_CLOCK_OUT"
  | "FORGOT_BOTH"
  | "CORRECTION";

type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

interface AttendanceRequest {
  id: string;
  date: string;
  type: RequestType;
  requestedClockInTime?: string | null;
  requestedClockOutTime?: string | null;
  reason?: string | null;
  location?: string | null;
  workLog?: string | null;
  status: RequestStatus;
  createdAt: string;
  actionNotes?: string | null;
}

type AttendanceStatus =
  | "CLOCKED_IN"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED";

interface AttendanceRecord {
  id: string;
  date: string;
  clockInTime?: string;
  clockOutTime?: string;
  workedHours?: number;
  status: AttendanceStatus;
  notes?: string;
  workLog?: string;
}

export default function AttendanceView() {
  const { status } = useSession();

  const [loading, setLoading] = useState(false);
  const [todayLoading, setTodayLoading] = useState(false);
  const [today, setToday] = useState<any>(null);

  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [workLog, setWorkLog] = useState("");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [requestModal, setRequestModal] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [myRequests, setMyRequests] = useState<AttendanceRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const [requestForm, setRequestForm] = useState({
    date: "",
    type: "FORGOT_CLOCK_IN" as RequestType,
    requestedClockInTime: "",
    requestedClockOutTime: "",
    reason: "",
    location: "",
    workLog: "",
  });

  // ---------------- Fetch today status ----------------
  const fetchTodayStatus = async () => {
    try {
      setTodayLoading(true);
      const res = await apiClient.get(
        `${apiClient.URLS.staffattendance}/today-status`,
        {},
        true,
      );
      if (res.status === 200) setToday(res.body);
    } catch {
      toast.error("Failed to load today status");
    } finally {
      setTodayLoading(false);
    }
  };

  // ---------------- Fetch history ----------------
  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const qs = new URLSearchParams();
      if (from) qs.append("from", from);
      if (to) qs.append("to", to);

      const res = await apiClient.get(
        `${apiClient.URLS.staffattendance}/my${
          qs.toString() ? "?" + qs.toString() : ""
        }`,
        {},
        true,
      );
      if (res.status === 200) setHistory(res.body || []);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  };

  // ---------------- Clock In ----------------
  const handleClockIn = async () => {
    try {
      setLoading(true);
      const res = await apiClient.post(
        `${apiClient.URLS.staffattendance}/clock-in`,
        { location, notes },
        true,
      );
      if (res.status === 200 || res.status === 201) {
        toast.success("Clock In successful ✅");
        setNotes("");
        fetchTodayStatus();
        fetchHistory();
      }
    } catch (e: any) {
      toast.error(e?.message || "Clock In failed");
    } finally {
      setLoading(false);
    }
  };

  // const handleClockOut = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await apiClient.post(
  //       `${apiClient.URLS.staffattendance}/clock-out`,
  //       { location, notes },
  //       true,
  //     );
  //     if (res.status === 200 || res.status === 201) {
  //       toast.success("Clock Out successful ✅");
  //       setNotes("");
  //       fetchTodayStatus();
  //       fetchHistory();
  //     }
  //   } catch (e: any) {
  //     toast.error(e?.message || "Clock Out failed");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleClockOut = async () => {
    try {
      // ✅ require workLog only when clocking out
      if (!workLog.trim() || workLog.trim().length < 5) {
        toast.error(
          "Please fill Work Log (min 5 characters) before Clock Out.",
        );
        return;
      }

      setLoading(true);

      const res = await apiClient.post(
        `${apiClient.URLS.staffattendance}/clock-out`,
        { location, notes, workLog: workLog.trim() }, // ✅ send workLog
        true,
      );

      if (res.status === 200 || res.status === 201) {
        toast.success("Clock Out successful ✅");
        setNotes("");
        setWorkLog(""); // ✅ reset
        fetchTodayStatus();
        fetchHistory();
      }
    } catch (e: any) {
      toast.error(e?.message || "Clock Out failed");
    } finally {
      setLoading(false);
    }
  };

  const openRequestModal = () => {
    const todayDate = today?.record?.date || today?.date || "";

    let defaultType: RequestType = "FORGOT_CLOCK_IN";
    if (today?.hasClockedIn && !today?.hasClockedOut)
      defaultType = "FORGOT_CLOCK_OUT";
    if (!today?.hasClockedIn && !today?.hasClockedOut)
      defaultType = "FORGOT_CLOCK_IN";

    setRequestForm((p) => ({
      ...p,
      date: todayDate,
      type: defaultType,
      location: location || "",
      reason: "",
      requestedClockInTime: "",
      requestedClockOutTime: "",
      workLog: "",
    }));

    setRequestModal(true);
  };
  const handleRequestInputChange = (e: any) => {
    const { name, value } = e.target;
    setRequestForm((p) => ({ ...p, [name]: value }));
  };

  const handleSendRequest = async () => {
    try {
      const {
        date,
        type,
        requestedClockInTime,
        requestedClockOutTime,
        reason,
        location: reqLocation,
        workLog: reqWorkLog,
      } = requestForm;

      if (!date) return toast.error("Please select date");

      // validations by type
      if (type === "FORGOT_CLOCK_IN" && !requestedClockInTime)
        return toast.error("Please enter requested Clock-In time");

      if (type === "FORGOT_CLOCK_OUT" && !requestedClockOutTime)
        return toast.error("Please enter requested Clock-Out time");

      if (
        type === "FORGOT_BOTH" &&
        (!requestedClockInTime || !requestedClockOutTime)
      )
        return toast.error("Please enter both Clock-In and Clock-Out time");

      // workLog required if clock-out involved
      const needsWorkLog =
        type === "FORGOT_CLOCK_OUT" || type === "FORGOT_BOTH";
      if (needsWorkLog && (!reqWorkLog.trim() || reqWorkLog.trim().length < 5))
        return toast.error("Work Log is required (min 5 characters)");

      setRequestLoading(true);

      const payload: any = {
        date,
        type,
        reason: reason?.trim() || undefined,
        location: reqLocation?.trim() || undefined,
      };

      if (requestedClockInTime)
        payload.requestedClockInTime = requestedClockInTime;
      if (requestedClockOutTime)
        payload.requestedClockOutTime = requestedClockOutTime;
      if (needsWorkLog) payload.workLog = reqWorkLog.trim();

      const res = await apiClient.post(
        `${apiClient.URLS.staffattendance}/requests`,
        payload,
        true,
      );

      if (res.status === 200 || res.status === 201) {
        toast.success("Request sent to Admin ✅");
        setRequestModal(false);
        fetchMyRequests();
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to send request");
    } finally {
      setRequestLoading(false);
    }
  };

  // useEffect(() => {
  //   if (status !== "authenticated") return;
  //   fetchTodayStatus();
  //   fetchHistory();

  //   const interval = setInterval(fetchTodayStatus, 20000);
  //   return () => clearInterval(interval);
  // }, [status]);
  useEffect(() => {
    if (status !== "authenticated") return;
    fetchTodayStatus();
    fetchHistory();
    fetchMyRequests();

    const interval = setInterval(fetchTodayStatus, 20000);
    return () => clearInterval(interval);
  }, [status]);

  const fetchMyRequests = async () => {
    try {
      setRequestsLoading(true);
      const res = await apiClient.get(
        `${apiClient.URLS.staffattendance}/requests/my`,
        {},
        true,
      );
      if (res.status === 200) setMyRequests(res.body || []);
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setRequestsLoading(false);
    }
  };
  const showRequestBtn =
    !today?.hasClockedIn || (today?.hasClockedIn && !today?.hasClockedOut);

  const RequestPill = ({ value }: { value: string }) => {
    const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      PENDING: { 
        bg: "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200", 
        text: "text-amber-700",
        icon: <FiClock className="w-3 h-3" />
      },
      APPROVED: { 
        bg: "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200", 
        text: "text-emerald-700",
        icon: <FiCheckCircle className="w-3 h-3" />
      },
      REJECTED: { 
        bg: "bg-gradient-to-r from-rose-50 to-red-50 border-rose-200", 
        text: "text-rose-700",
        icon: <FiXCircle className="w-3 h-3" />
      },
    };
    const c = config[value] || { bg: "bg-gray-50 border-gray-200", text: "text-gray-700", icon: null };
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold border ${c.bg} ${c.text}`}>
        {c.icon}
        {value}
      </span>
    );
  };

  const canClockIn = today && !today.hasClockedIn;
  const canClockOut = today && today.hasClockedIn && !today.hasClockedOut;

  const statusText: string = today?.record?.status || "NO RECORD";

  const StatusPill = ({ value }: { value: string }) => {
    const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      CLOCKED_IN: { 
        bg: "bg-gradient-to-r from-emerald-500 to-green-500", 
        text: "text-white",
        icon: <FiCheckCircle className="w-3.5 h-3.5" />
      },
      APPROVED: { 
        bg: "bg-gradient-to-r from-blue-500 to-indigo-500", 
        text: "text-white",
        icon: <FiCheckCircle className="w-3.5 h-3.5" />
      },
      PENDING_APPROVAL: { 
        bg: "bg-gradient-to-r from-amber-400 to-orange-400", 
        text: "text-white",
        icon: <FiClock className="w-3.5 h-3.5" />
      },
      REJECTED: { 
        bg: "bg-gradient-to-r from-rose-500 to-red-500", 
        text: "text-white",
        icon: <FiXCircle className="w-3.5 h-3.5" />
      },
      "NO RECORD": { 
        bg: "bg-gradient-to-r from-slate-400 to-gray-400", 
        text: "text-white",
        icon: <FiAlertCircle className="w-3.5 h-3.5" />
      },
    };
    const c = config[value] || { bg: "bg-gray-400", text: "text-white", icon: null };
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-sm ${c.bg} ${c.text}`}>
        {c.icon}
        <span className="hidden sm:inline">{value.replace(/_/g, ' ')}</span>
        <span className="sm:hidden">{value === "NO RECORD" ? "None" : value.replace(/_/g, ' ').split(' ')[0]}</span>
      </span>
    );
  };

  const Skeleton = () => (
    <div className="animate-pulse space-y-4">
      <div className="h-4 w-40 rounded-lg bg-slate-200" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 rounded-2xl bg-slate-200" />
        <div className="h-24 rounded-2xl bg-slate-200" />
      </div>
      <div className="h-12 rounded-xl bg-slate-200" />
    </div>
  );

  return (
    <div className="overflow-auto bg-gradient-to-br w-full from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-6">
      <div className="mx-auto max-w-8xl space-y-5">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
                <FiClock className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">Staff Attendance</h1>
                <p className="mt-1 text-sm text-slate-500 flex items-center gap-2">
                  <FiLogIn className="w-4 h-4" />
                  Clock In / Clock Out
                  <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs font-medium">IST</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  fetchTodayStatus();
                  fetchHistory();
                }}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
              >
                <FiRefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <StatusPill value={statusText} />
            </div>
          </div>

          <div className="relative mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
              <FiCalendar className="w-3.5 h-3.5 text-blue-500" />
              Today: <span className="font-semibold text-slate-800">{today?.record?.date || "-"}</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <FiActivity className="w-3.5 h-3.5" />
              Auto refresh: <span className="font-semibold">20s</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600">
                  <FiActivity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Today Status</h2>
                  <p className="text-xs text-slate-500">Track your attendance in real-time</p>
                </div>
              </div>

              {todayLoading ? (
                <span className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                  <FiRefreshCw className="w-3 h-3 animate-spin" />
                  Loading...
                </span>
              ) : (
                <StatusPill value={statusText} />
              )}
            </div>

            <div className="mt-5">
              {todayLoading ? (
                <Skeleton />
              ) : (
                <>
                  {/* Clock In/Out Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`relative overflow-hidden rounded-2xl p-4 transition-all ${
                      today?.record?.clockInTime 
                        ? 'bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200'
                        : 'bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          today?.record?.clockInTime ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                          <FiLogIn className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-slate-600">Clock In</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-800">
                        {today?.record?.clockInTime || "--:--"}
                      </p>
                      <p className={`mt-1 text-xs font-medium ${today?.record?.clockInTime ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {today?.record?.clockInTime ? "✓ Recorded" : "Not yet"}
                      </p>
                      {today?.record?.clockInTime && (
                        <div className="absolute top-2 right-2">
                          <FiCheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                      )}
                    </div>

                    <div className={`relative overflow-hidden rounded-2xl p-4 transition-all ${
                      today?.record?.clockOutTime 
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200'
                        : 'bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          today?.record?.clockOutTime ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                          <FiLogOut className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-slate-600">Clock Out</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-800">
                        {today?.record?.clockOutTime || "--:--"}
                      </p>
                      <p className={`mt-1 text-xs font-medium ${today?.record?.clockOutTime ? 'text-blue-600' : 'text-slate-400'}`}>
                        {today?.record?.clockOutTime ? "✓ Recorded" : "Not yet"}
                      </p>
                      {today?.record?.clockOutTime && (
                        <div className="absolute top-2 right-2">
                          <FiCheckCircle className="w-5 h-5 text-blue-500" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <CustomInput
                      label="Location (optional)"
                       labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                      type="text"
                      name="location"
                      value={location}
                      placeholder="Eg: Office / Site / WFH"
                      leftIcon={<FiMapPin className="w-4 h-4" />}
                      onChange={(e) => setLocation(e.target.value)}
                    />

                    <CustomInput
                      label="Notes (optional)"
                       labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                      type="text"
                      name="notes"
                      value={notes}
                      placeholder="Eg: Client visit / Meeting"
                      leftIcon={<FiFileText className="w-4 h-4" />}
                      onChange={(e) => setNotes(e.target.value)}
                    />

                    {canClockOut && (
                      <div className="sm:col-span-2">
                        <CustomInput
                          label="Work Log (required for Clock Out)"
                          type="textarea"
                          name="workLog"
                           labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                          value={workLog}
                          placeholder="Eg: Called 40 leads, updated CRM, attended meeting, site visit, closed 2 deals..."
                          onChange={(e) => setWorkLog(e.target.value)}
                          required
                        />
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-slate-500 flex items-center gap-1">
                            <FiClipboard className="w-3 h-3" />
                            Tell what you worked on today
                          </span>
                          <span className={`font-semibold ${workLog.trim().length < 5 ? "text-rose-500" : "text-emerald-600"}`}>
                            {workLog.trim().length}/5 min
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      // disabled={!canClockIn || loading}
                      onClick={handleClockIn}
                      className={`group flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-semibold text-sm transition-all active:scale-[0.98] ${
                        canClockIn && !loading
                          ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:from-emerald-600 hover:to-green-600"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <FiLogIn className={`w-5 h-5 ${canClockIn && !loading ? 'group-hover:translate-x-0.5 transition-transform' : ''}`} />
                      {loading && canClockIn ? "Processing..." : "Clock In"}
                    </button>

                    <button
                      // disabled={!canClockOut || loading || workLog.trim().length < 5}
                      onClick={handleClockOut}
                      className={`group flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-semibold text-sm transition-all active:scale-[0.98] ${
                        canClockOut && !loading && workLog.trim().length >= 5
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:from-blue-600 hover:to-indigo-600"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <FiLogOut className={`w-5 h-5 ${canClockOut && !loading ? 'group-hover:translate-x-0.5 transition-transform' : ''}`} />
                      {loading && canClockOut ? "Processing..." : "Clock Out"}
                    </button>
                  </div>

                  {showRequestBtn && (
                    <button
                      onClick={openRequestModal}
                      className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                    >
                      <FiAlertCircle className="w-4 h-4" />
                      Forgot Punch? Send Request
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          {/* Request Modal */}
          <Modal
            isOpen={requestModal}
            closeModal={() => setRequestModal(false)}
            title=""
            isCloseRequired={false}
            className="md:w-[600px] w-[320px] !p-0 overflow-hidden"
            rootCls="z-[9999999]"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <FiSend className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Attendance Request</h3>
                    <p className="text-amber-100 text-xs">Send request to Admin for approval</p>
                  </div>
                </div>
                <button onClick={() => setRequestModal(false)} className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                  <FiX className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Date */}
              <CustomDate
                type="date"
                 labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                label="Date"
                value={requestForm.date}
                onChange={(e) => setRequestForm((p) => ({ ...p, date: e.target.value }))}
                name="date"
                required
              />

              {/* Request Type */}
              <div>
                <label className="mb-1.5 inline-block text-[13px] font-semibold text-slate-700 tracking-wide">
                  Request Type <sup className="text-red-500">*</sup>
                </label>
                <select
                  value={requestForm.type}
                  onChange={(e) =>
                    setRequestForm((p) => ({
                      ...p,
                      type: e.target.value as RequestType,
                      requestedClockInTime: "",
                      requestedClockOutTime: "",
                      workLog: "",
                    }))
                  }
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl bg-white text-sm text-slate-800 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                >
                  <option value="FORGOT_CLOCK_IN">Forgot Clock In</option>
                  <option value="FORGOT_CLOCK_OUT">Forgot Clock Out</option>
                  <option value="FORGOT_BOTH">Forgot Both</option>
                  <option value="CORRECTION">Correction</option>
                </select>
              </div>

              {/* Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(requestForm.type === "FORGOT_CLOCK_IN" ||
                  requestForm.type === "FORGOT_BOTH" ||
                  requestForm.type === "CORRECTION") && (
                  <CustomDate
                    label="Requested In Time"
                    type="time"
                     labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                    name="requestedClockInTime"
                    value={requestForm.requestedClockInTime}
                    onChange={handleRequestInputChange}
                    required
                  />
                )}

                {(requestForm.type === "FORGOT_CLOCK_OUT" ||
                  requestForm.type === "FORGOT_BOTH" ||
                  requestForm.type === "CORRECTION") && (
                  <CustomDate
                    label="Requested Out Time"
                    type="time"
                     labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                    name="requestedClockOutTime"
                    value={requestForm.requestedClockOutTime}
                    onChange={handleRequestInputChange}
                    required
                  />
                )}
              </div>

              {/* Work Log for out/both */}
              {(requestForm.type === "FORGOT_CLOCK_OUT" ||
                requestForm.type === "FORGOT_BOTH") && (
                <div>
                  <CustomInput
                    label="Work Log"
                    type="textarea"
                    name="workLog"
                     labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                    value={requestForm.workLog}
                    placeholder="Eg: Calls, CRM update, meetings, closures..."
                    onChange={handleRequestInputChange}
                    required
                  />
                  <div className="mt-1 flex items-center justify-between text-xs px-1">
                    <span className="text-slate-500">Min 5 characters required</span>
                    <span className={`font-semibold ${requestForm.workLog.trim().length < 5 ? "text-rose-500" : "text-emerald-600"}`}>
                      {requestForm.workLog.trim().length}/5
                    </span>
                  </div>
                </div>
              )}

              {/* Location & Reason */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomInput
                  label="Location (Optional)"
                  type="text"
                  name="location"
                   labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  value={requestForm.location}
                  placeholder="Office / Site / WFH"
                  leftIcon={<FiMapPin className="w-4 h-4" />}
                  onChange={handleRequestInputChange}
                />

                <CustomInput
                  label="Reason (Optional)"
                  type="text"
                  name="reason"
                   labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  value={requestForm.reason}
                  placeholder="Network issue / forgot..."
                  leftIcon={<FiFileText className="w-4 h-4" />}
                  onChange={handleRequestInputChange}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setRequestModal(false)}
                  className="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendRequest}
                  disabled={requestLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 hover:shadow-xl hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50"
                >
                  <FiSend className="w-4 h-4" />
                  {requestLoading ? "Sending..." : "Send Request"}
                </button>
              </div>
            </div>
          </Modal>

          {/* Side summary card */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 flex items-center justify-center">
                <FiTrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Quick Summary</h3>
                <p className="text-xs text-slate-500">At-a-glance view for today</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Status Card */}
              <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 text-white">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Current Status</p>
                <p className="mt-1 text-xl font-bold">{statusText.replace(/_/g, ' ')}</p>
              </div>

              {/* In/Out Times */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 p-3">
                  <div className="flex items-center gap-2 text-emerald-600 mb-1">
                    <FiLogIn className="w-4 h-4" />
                    <span className="text-xs font-semibold">In</span>
                  </div>
                  <p className="text-lg font-bold text-slate-800">
                    {today?.record?.clockInTime || "--"}
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-3">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <FiLogOut className="w-4 h-4" />
                    <span className="text-xs font-semibold">Out</span>
                  </div>
                  <p className="text-lg font-bold text-slate-800">
                    {today?.record?.clockOutTime || "--"}
                  </p>
                </div>
              </div>

              {/* Worked Hours */}
              <div className="rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 p-4">
                <div className="flex items-center gap-2 text-violet-600 mb-2">
                  <FiClock className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Worked Hours</span>
                </div>
                <p className="text-3xl font-bold text-slate-800">
                  {today?.record?.workedHours ?? "--"}
                  {today?.record?.workedHours && <span className="text-sm font-medium text-slate-500 ml-1">hrs</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* My Requests Section */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 flex items-center justify-center">
                <FiSend className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">My Requests</h2>
                <p className="text-xs text-slate-500">Track approval status from Admin</p>
              </div>
            </div>
            <button
              onClick={fetchMyRequests}
              className="group flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              <FiRefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>

          <div className="mt-5">
            {requestsLoading ? (
              <div className="space-y-3">
                <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
              </div>
            ) : myRequests.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                  <FiFileText className="w-7 h-7 text-slate-400" />
                </div>
                <p className="font-semibold text-slate-700">No requests yet</p>
                <p className="mt-1 text-sm text-slate-500">If you miss punch, send a request above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-800">
                            <FiCalendar className="w-4 h-4 text-slate-400" />
                            {r.date}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                            {r.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <FiLogIn className="w-3.5 h-3.5 text-emerald-500" />
                            In: <span className="font-medium text-slate-700">{r.requestedClockInTime || "--:--"}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <FiLogOut className="w-3.5 h-3.5 text-blue-500" />
                            Out: <span className="font-medium text-slate-700">{r.requestedClockOutTime || "--:--"}</span>
                          </span>
                        </div>
                        {r.reason && (
                          <p className="mt-2 text-xs text-slate-600 bg-slate-100 rounded-lg px-2 py-1 inline-block">
                            <span className="font-semibold">Reason:</span> {r.reason}
                          </p>
                        )}
                        {r.actionNotes && (
                          <p className="mt-2 text-xs text-blue-600 bg-blue-50 rounded-lg px-2 py-1 inline-block">
                            <span className="font-semibold">Admin Note:</span> {r.actionNotes}
                          </p>
                        )}
                      </div>
                      <RequestPill value={r.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600 flex items-center justify-center">
                <FiCalendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">My Attendance History</h2>
                <p className="text-xs text-slate-500">Filter records by date range</p>
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="w-full sm:w-[160px]">
                <CustomDate
                  type="date"
                  label="From Date"
                  value={from}
                   labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  onChange={(e) => setFrom(e.target.value)}
                  name="from"
                />
              </div>

              <div className="w-full sm:w-[160px]">
                <CustomDate
                  type="date"
                  label="To Date"
                  value={to}
                   labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  onChange={(e) => setTo(e.target.value)}
                  name="to"
                />
              </div>

              <button
                onClick={fetchHistory}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl hover:from-blue-600 hover:to-indigo-600 transition-all"
              >
                <FiFilter className="w-4 h-4" />
                Apply
              </button>
            </div>
          </div>

          <div className="mt-5">
            {historyLoading ? (
              <div className="space-y-3">
                <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
              </div>
            ) : history.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-10 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <FiCalendar className="w-8 h-8 text-slate-400" />
                </div>
                <p className="font-semibold text-slate-700">No records found</p>
                <p className="mt-1 text-sm text-slate-500">Try adjusting the date range</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((r) => (
                  <div
                    key={r.id}
                    className="group rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 transition-all hover:shadow-md hover:border-slate-300"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-800">
                            <FiCalendar className="w-4 h-4 text-slate-400" />
                            {r.date}
                          </span>
                          <StatusPill value={r.status} />
                        </div>

                        {r.notes && (
                          <p className="text-xs text-slate-600 bg-slate-100 rounded-lg px-2 py-1 inline-block mb-2">
                            <span className="font-semibold">Notes:</span> {r.notes}
                          </p>
                        )}

                        {(r as any).workLog && (
                          <p className="text-xs text-indigo-600 bg-indigo-50 rounded-lg px-2 py-1 inline-block line-clamp-1">
                            <span className="font-semibold">Work:</span> {(r as any).workLog}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Time display */}
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-100">
                          <div className="text-center">
                            <p className="text-[10px] font-medium text-emerald-600 uppercase">In</p>
                            <p className="text-sm font-bold text-slate-800">{r.clockInTime || "--:--"}</p>
                          </div>
                          <span className="text-slate-300">→</span>
                          <div className="text-center">
                            <p className="text-[10px] font-medium text-blue-600 uppercase">Out</p>
                            <p className="text-sm font-bold text-slate-800">{r.clockOutTime || "--:--"}</p>
                          </div>
                        </div>

                        {/* Worked Hours */}
                        <div className="px-4 py-2 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 text-center min-w-[80px]">
                          <p className="text-[10px] font-medium text-violet-600 uppercase">Hours</p>
                          <p className="text-lg font-bold text-slate-800">{r.workedHours ?? "--"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
