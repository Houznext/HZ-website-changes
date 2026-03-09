"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import apiClient from "@/src/utils/apiClient";
import Loader from "@/src/common/Loader";
import Drawer from "@/src/common/Drawer";
import Button from "@/src/common/Button";
import ReusableSearchFilter from "@/src/common/SearchFilter";
import StatusDropdown, { StatusOption } from "@/src/common/StatusDropdown";
import { usePermissionStore } from "@/src/stores/usePermissions";
import {
  FaCheckCircle,
  FaUser,
  FaRupeeSign,
  FaPhoneAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaSolarPanel,
  FaBolt,
  FaRulerCombined,
  FaClipboardList,
} from "react-icons/fa";
import {
  MdPending,
  MdCancel,
  MdAssignment,
  MdOutlineChat,
  MdSolarPower,
} from "react-icons/md";
import { IoFlash } from "react-icons/io5";
import { HiTrendingUp } from "react-icons/hi";
import { Pagination } from "@mui/material";

// ─── Types ───────────────────────────────────────────────────────

type SolarDetail = {
  id: string;
  orderId: string;
  solarType: string;
  category: string;
  monthlyBill: string;
  recommendedSystemSize: string;
  annualGeneration: string;
  spaceRequired: string;
  systemCost: string;
  subsidy: string;
  effectiveCost: string;
  estimatedAnnualSavings: string;
  emiOptions?: { tenure: number; monthlyEmi: number }[];
  preferredDate?: string;
  contactName?: string;
  contactPhone?: string;
  assignedAgentId?: string;
  assignedAgent?: { id: string; firstName?: string; lastName?: string; email?: string };
  assignedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    orderNo: string;
    status: string;
    type: string;
    grandTotal: string;
    amountPaid: string;
    amountDue: string;
    statusHistory?: { status: string; at: string; by?: string; byUserId?: string; note?: string }[];
    user?: { id: string; firstName?: string; lastName?: string; email?: string; phone?: string };
    branch?: { id: string; name?: string };
    createdAt: string;
  };
};

type DashboardStats = {
  totalInstalls: number;
  pending: number;
  assigned: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
};

// ─── Constants ───────────────────────────────────────────────────

const STATUS_PIPELINE = ["CREATED", "CONFIRMED", "ASSIGNED", "IN_PROGRESS", "COMPLETED"];

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  CREATED:     { label: "Created",      bg: "bg-gray-100",   text: "text-gray-700",   icon: <FaClipboardList className="w-3 h-3" /> },
  CONFIRMED:   { label: "Confirmed",    bg: "bg-blue-100",   text: "text-blue-700",   icon: <FaCheckCircle className="w-3 h-3" /> },
  ASSIGNED:    { label: "Assigned",     bg: "bg-yellow-100", text: "text-yellow-700", icon: <MdAssignment className="w-3 h-3" /> },
  IN_PROGRESS: { label: "In Progress",  bg: "bg-purple-100", text: "text-purple-700", icon: <IoFlash className="w-3 h-3" /> },
  COMPLETED:   { label: "Completed",    bg: "bg-green-100",  text: "text-green-700",  icon: <FaCheckCircle className="w-3 h-3" /> },
  CANCELLED:   { label: "Cancelled",    bg: "bg-red-100",    text: "text-red-700",    icon: <MdCancel className="w-3 h-3" /> },
  PENDING:     { label: "Pending",      bg: "bg-orange-100", text: "text-orange-700", icon: <MdPending className="w-3 h-3" /> },
};

const STATUS_OPTIONS: StatusOption[] = Object.entries(STATUS_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
  colorClass: `${cfg.bg} ${cfg.text}`,
}));

const FILTER_OPTIONS = ["ALL", ...STATUS_PIPELINE, "CANCELLED"];

const ITEMS_PER_PAGE = 15;

// ─── Main Component ──────────────────────────────────────────────

export default function SolarManagement() {
  const { data: session } = useSession();
  const { activeBranchId, hasPermission, isAdmin } = usePermissionStore();

  const [tab, setTab] = useState<"dashboard" | "orders">("dashboard");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<SolarDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<SolarDetail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [agentId, setAgentId] = useState("");
  const [notesText, setNotesText] = useState("");
  const [saving, setSaving] = useState(false);

  const canEdit = isAdmin() || hasPermission("solar", "edit");

  // ─── Data Fetching ─────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (activeBranchId) params.branchId = activeBranchId;
      const res = await apiClient.get(`${apiClient.URLS.solarOrders}/dashboard/stats`, params, true);
      setStats(res.body);
    } catch {
      toast.error("Failed to load dashboard stats");
    }
  }, [activeBranchId]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(ITEMS_PER_PAGE) };
      if (activeBranchId) params.branchId = activeBranchId;
      if (statusFilter !== "ALL") params.status = statusFilter;
      const res = await apiClient.get(apiClient.URLS.solarOrders, params, true);
      setOrders(res.body.items ?? []);
      setTotal(res.body.total ?? 0);
    } catch {
      toast.error("Failed to load solar orders");
    } finally {
      setLoading(false);
    }
  }, [activeBranchId, page, statusFilter]);

  useEffect(() => {
    if (session) {
      fetchStats();
      fetchOrders();
    }
  }, [session, fetchStats, fetchOrders]);

  // ─── Filtered Orders (client-side search) ──────────────────────

  const filteredOrders = useMemo(() => {
    if (!searchText.trim()) return orders;
    const q = searchText.toLowerCase();
    return orders.filter((item) => {
      const o = item.order;
      const u = o.user;
      return (
        o.orderNo?.toLowerCase().includes(q) ||
        u?.firstName?.toLowerCase().includes(q) ||
        u?.lastName?.toLowerCase().includes(q) ||
        u?.email?.toLowerCase().includes(q) ||
        u?.phone?.includes(q) ||
        item.solarType?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
      );
    });
  }, [orders, searchText]);

  // ─── Actions ───────────────────────────────────────────────────

  const openDetail = (item: SolarDetail) => {
    setSelectedOrder(item);
    setAgentId(item.assignedAgentId ?? "");
    setNotesText(item.notes ?? "");
    setDrawerOpen(true);
  };

  const handleAssignAgent = async () => {
    if (!selectedOrder || !agentId.trim()) return;
    setSaving(true);
    try {
      await apiClient.patch(
        `${apiClient.URLS.solarOrders}/${selectedOrder.id}/assign`,
        { agentUserId: agentId.trim(), assignedBy: session?.user?.id },
        true,
      );
      toast.success("Agent assigned successfully");
      fetchOrders();
      fetchStats();
      const res = await apiClient.get(`${apiClient.URLS.solarOrders}/${selectedOrder.id}`, {}, true);
      setSelectedOrder(res.body);
    } catch {
      toast.error("Failed to assign agent");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    try {
      await apiClient.patch(
        `${apiClient.URLS.solarOrders}/${selectedOrder.id}/notes`,
        { notes: notesText },
        true,
      );
      toast.success("Notes saved");
      fetchOrders();
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await apiClient.patch(`${apiClient.URLS.orders}/${orderId}/status`, { status: newStatus }, true);
      toast.success(`Status updated to ${STATUS_CONFIG[newStatus]?.label ?? newStatus}`);
      fetchOrders();
      fetchStats();
      if (selectedOrder && selectedOrder.order.id === orderId) {
        const res = await apiClient.get(`${apiClient.URLS.solarOrders}/${selectedOrder.id}`, {}, true);
        setSelectedOrder(res.body);
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleStartChat = async (item: SolarDetail) => {
    if (!item.order.user?.id || !session?.user?.id) {
      toast.error("User information not available");
      return;
    }
    try {
      const res = await apiClient.post(
        `${apiClient.URLS.chat}/dm?userId=${session.user.id}`,
        { otherUserId: item.order.user.id },
        true,
      );
      if (res.body?.id) {
        window.open(`/chat?thread=${res.body.id}`, "_blank");
      }
    } catch {
      toast.error("Failed to start chat");
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // ─── Render ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen w-full bg-gray-50 md:p-6 p-3">
      {/* Header */}
      <div className="bg-white min-w-full rounded-lg shadow-sm md:p-6 p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <MdSolarPower className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="heading-text !text-gray-800 !text-[18px] md:!text-[22px]">Solar Management</h1>
              <p className="sublabel-text text-gray-500">Manage solar installation orders &amp; assignments</p>
            </div>
          </div>

          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(["dashboard", "orders"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 text-sm font-medium capitalize transition-colors ${
                  tab === t
                    ? "bg-[#5297ff] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard Tab */}
      {tab === "dashboard" && <DashboardView stats={stats} />}

      {/* Orders Tab */}
      {tab === "orders" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm md:p-4 p-3">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
              <div className="flex-1 w-full md:max-w-sm">
                <ReusableSearchFilter
                  searchText={searchText}
                  onSearchChange={setSearchText}
                  placeholder="Search orders, customers..."
                  rootCls="!mb-0"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {FILTER_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setPage(1); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      statusFilter === s
                        ? "bg-[#5297ff] text-white border-[#5297ff]"
                        : "bg-white text-gray-600 border-gray-200 hover:border-[#5297ff] hover:text-[#5297ff]"
                    }`}
                  >
                    {s === "ALL" ? "All" : STATUS_CONFIG[s]?.label ?? s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50">
              <div className="col-span-2 label-text font-semibold text-gray-600">Order</div>
              <div className="col-span-3 label-text font-semibold text-gray-600">Customer</div>
              <div className="col-span-2 label-text font-semibold text-gray-600">System</div>
              <div className="col-span-2 label-text font-semibold text-gray-600">Cost</div>
              <div className="col-span-1 label-text font-semibold text-gray-600">Status</div>
              <div className="col-span-2 label-text font-semibold text-gray-600 text-right">Actions</div>
            </div>

            {loading ? (
              <div className="p-12"><Loader /></div>
            ) : filteredOrders.length === 0 ? (
              <div className="md:p-12 p-8 text-center">
                <MdSolarPower className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No solar orders found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              filteredOrders.map((item) => (
                <SolarOrderRow
                  key={item.id}
                  item={item}
                  onView={openDetail}
                  onStatusChange={handleStatusChange}
                  onChat={handleStartChat}
                  canEdit={canEdit}
                />
              ))
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center py-4 border-t border-gray-100">
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, p) => setPage(p)}
                  size="small"
                  shape="rounded"
                  sx={{
                    "& .MuiPaginationItem-root.Mui-selected": {
                      backgroundColor: "#5297ff",
                      color: "#fff",
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Detail Drawer */}
      <Drawer open={drawerOpen} handleDrawerToggle={setDrawerOpen} title="" panelCls="!w-[85%] sm:!w-[55%] md:!w-[45%]">
        {selectedOrder && (
          <OrderDetailView
            item={selectedOrder}
            agentId={agentId}
            setAgentId={setAgentId}
            notesText={notesText}
            setNotesText={setNotesText}
            saving={saving}
            canEdit={canEdit}
            onAssignAgent={handleAssignAgent}
            onSaveNotes={handleSaveNotes}
            onStatusChange={handleStatusChange}
            onChat={handleStartChat}
          />
        )}
      </Drawer>
    </div>
  );
}

// ─── Dashboard View ──────────────────────────────────────────────

function DashboardView({ stats }: { stats: DashboardStats | null }) {
  if (!stats) return <div className="p-12"><Loader /></div>;

  const cards = [
    { label: "Total Installations", value: stats.totalInstalls, icon: <FaSolarPanel className="w-5 h-5" />, gradient: "from-blue-500 to-blue-600", lightBg: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "Pending Review", value: stats.pending, icon: <MdPending className="w-5 h-5" />, gradient: "from-orange-400 to-orange-500", lightBg: "bg-orange-50", iconColor: "text-orange-600" },
    { label: "Assigned", value: stats.assigned, icon: <MdAssignment className="w-5 h-5" />, gradient: "from-yellow-400 to-yellow-500", lightBg: "bg-yellow-50", iconColor: "text-yellow-600" },
    { label: "In Progress", value: stats.inProgress, icon: <IoFlash className="w-5 h-5" />, gradient: "from-purple-500 to-purple-600", lightBg: "bg-purple-50", iconColor: "text-purple-600" },
    { label: "Completed", value: stats.completed, icon: <FaCheckCircle className="w-5 h-5" />, gradient: "from-green-500 to-green-600", lightBg: "bg-green-50", iconColor: "text-green-600" },
    { label: "Cancelled", value: stats.cancelled, icon: <MdCancel className="w-5 h-5" />, gradient: "from-red-400 to-red-500", lightBg: "bg-red-50", iconColor: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg ${c.lightBg} flex items-center justify-center mb-3`}>
              <span className={c.iconColor}>{c.icon}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm font-medium">Total Revenue</p>
            <p className="text-3xl font-bold mt-1">₹{stats.totalRevenue.toLocaleString("en-IN")}</p>
            <p className="text-emerald-200 text-xs mt-2">From {stats.completed} completed installations</p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <HiTrendingUp className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h3 className="sub-heading text-gray-800 mb-4">Completion Rate</h3>
          <div className="flex items-end gap-4">
            <p className="text-4xl font-bold text-[#5297ff]">
              {stats.totalInstalls > 0 ? Math.round((stats.completed / stats.totalInstalls) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-500 mb-1">{stats.completed} of {stats.totalInstalls} orders</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div
              className="bg-[#5297ff] h-2 rounded-full transition-all"
              style={{ width: `${stats.totalInstalls > 0 ? (stats.completed / stats.totalInstalls) * 100 : 0}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h3 className="sub-heading text-gray-800 mb-4">Requires Attention</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Assignment</span>
              <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">{stats.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Installations</span>
              <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{stats.inProgress}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ready to Start</span>
              <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">{stats.assigned}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Order Row ───────────────────────────────────────────────────

function SolarOrderRow({
  item,
  onView,
  onStatusChange,
  onChat,
  canEdit,
}: {
  item: SolarDetail;
  onView: (item: SolarDetail) => void;
  onStatusChange: (orderId: string, status: string) => void;
  onChat: (item: SolarDetail) => void;
  canEdit: boolean;
}) {
  const o = item.order;
  const u = o.user;
  const statusCfg = STATUS_CONFIG[o.status] ?? STATUS_CONFIG.CREATED;

  return (
    <div
      className="grid md:grid-cols-12 grid-cols-1 gap-4 md:p-4 p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onView(item)}
    >
      {/* Order Info */}
      <div className="col-span-2">
        <p className="font-semibold text-[#3586FF] text-sm">#{o.orderNo}</p>
        <p className="sublabel-text text-gray-400 mt-0.5">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
      </div>

      {/* Customer */}
      <div className="col-span-3">
        <p className="label-text text-gray-800">{u?.firstName} {u?.lastName}</p>
        <p className="sublabel-text text-gray-400">{u?.email}</p>
        {u?.phone && <p className="sublabel-text text-gray-400">{u.phone}</p>}
      </div>

      {/* System */}
      <div className="col-span-2">
        <p className="label-text text-gray-800">{item.recommendedSystemSize} kW</p>
        <p className="sublabel-text text-gray-400 capitalize">{item.solarType} • {item.category}</p>
      </div>

      {/* Cost */}
      <div className="col-span-2">
        <p className="label-text text-gray-800 font-semibold">₹{Number(item.effectiveCost).toLocaleString("en-IN")}</p>
        {Number(item.subsidy) > 0 && (
          <p className="sublabel-text text-green-600">Subsidy: ₹{Number(item.subsidy).toLocaleString("en-IN")}</p>
        )}
      </div>

      {/* Status */}
      <div className="col-span-1" onClick={(e) => e.stopPropagation()}>
        {canEdit ? (
          <StatusDropdown
            value={o.status}
            options={STATUS_OPTIONS}
            onChange={(val) => onStatusChange(o.id, val)}
            variant="compact"
          />
        ) : (
          <span className={`inline-flex items-center gap-1 px-2 py-1 ${statusCfg.bg} ${statusCfg.text} text-xs rounded-full font-medium`}>
            {statusCfg.icon} {statusCfg.label}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="col-span-2 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onView(item)}
          className="px-3 py-1.5 text-xs font-medium text-[#5297ff] border border-[#5297ff] rounded-lg hover:bg-blue-50 transition-colors"
        >
          View
        </button>
        {u?.id && (
          <button
            onClick={() => onChat(item)}
            className="p-1.5 text-gray-400 hover:text-[#5297ff] transition-colors"
            title="Chat with customer"
          >
            <MdOutlineChat className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Order Detail Drawer ─────────────────────────────────────────

function OrderDetailView({
  item,
  agentId,
  setAgentId,
  notesText,
  setNotesText,
  saving,
  canEdit,
  onAssignAgent,
  onSaveNotes,
  onStatusChange,
  onChat,
}: {
  item: SolarDetail;
  agentId: string;
  setAgentId: (v: string) => void;
  notesText: string;
  setNotesText: (v: string) => void;
  saving: boolean;
  canEdit: boolean;
  onAssignAgent: () => void;
  onSaveNotes: () => void;
  onStatusChange: (orderId: string, status: string) => void;
  onChat: (item: SolarDetail) => void;
}) {
  const o = item.order;
  const u = o.user;
  const statusCfg = STATUS_CONFIG[o.status] ?? STATUS_CONFIG.CREATED;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">#{o.orderNo}</h2>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 ${statusCfg.bg} ${statusCfg.text} text-xs rounded-full font-medium`}>
              {statusCfg.icon} {statusCfg.label}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Created {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        {u?.id && (
          <button
            onClick={() => onChat(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5297ff] text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            <MdOutlineChat className="w-3.5 h-3.5" /> Chat
          </button>
        )}
      </div>

      {/* Status Pipeline */}
      <StatusPipeline currentStatus={o.status} />

      {/* Customer Card */}
      {u && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
          <h3 className="label-text font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaUser className="w-3.5 h-3.5 text-[#5297ff]" /> Customer Details
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="sublabel-text text-gray-400">Name</p>
              <p className="label-text text-gray-800">{u.firstName} {u.lastName}</p>
            </div>
            <div>
              <p className="sublabel-text text-gray-400">Email</p>
              <p className="label-text text-gray-800 flex items-center gap-1"><FaEnvelope className="w-3 h-3 text-gray-400" /> {u.email}</p>
            </div>
            <div>
              <p className="sublabel-text text-gray-400">Phone</p>
              <p className="label-text text-gray-800 flex items-center gap-1"><FaPhoneAlt className="w-3 h-3 text-gray-400" /> {u.phone || "—"}</p>
            </div>
            {o.branch?.name && (
              <div>
                <p className="sublabel-text text-gray-400">Branch</p>
                <p className="label-text text-gray-800">{o.branch.name}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Info (if different from user) */}
      {item.contactName && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h3 className="label-text font-semibold text-gray-700 mb-2">Site Contact</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="sublabel-text text-gray-400">Name</p>
              <p className="label-text text-gray-800">{item.contactName}</p>
            </div>
            <div>
              <p className="sublabel-text text-gray-400">Phone</p>
              <p className="label-text text-gray-800">{item.contactPhone || "—"}</p>
            </div>
            {item.preferredDate && (
              <div>
                <p className="sublabel-text text-gray-400">Preferred Date</p>
                <p className="label-text text-gray-800 flex items-center gap-1">
                  <FaCalendarAlt className="w-3 h-3 text-gray-400" /> {item.preferredDate}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Specifications */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="label-text font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaSolarPanel className="w-3.5 h-3.5 text-yellow-500" /> System Specifications
        </h3>
        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
          <InfoItem label="Solar Type" value={item.solarType} icon={<MdSolarPower className="w-3.5 h-3.5 text-yellow-500" />} />
          <InfoItem label="Category" value={item.category} />
          <InfoItem label="System Size" value={`${item.recommendedSystemSize} kW`} icon={<FaBolt className="w-3.5 h-3.5 text-yellow-500" />} />
          <InfoItem label="Annual Generation" value={`${item.annualGeneration} kWh`} icon={<IoFlash className="w-3.5 h-3.5 text-purple-500" />} />
          <InfoItem label="Space Required" value={`${item.spaceRequired} sq.ft`} icon={<FaRulerCombined className="w-3.5 h-3.5 text-gray-500" />} />
          <InfoItem label="Monthly Bill" value={`₹${Number(item.monthlyBill).toLocaleString("en-IN")}`} />
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="label-text font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaRupeeSign className="w-3.5 h-3.5 text-emerald-500" /> Cost Breakdown
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-1.5 border-b border-dashed border-gray-100">
            <span className="text-sm text-gray-500">System Cost</span>
            <span className="text-sm font-medium text-gray-800">₹{Number(item.systemCost).toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-dashed border-gray-100">
            <span className="text-sm text-green-600">Government Subsidy</span>
            <span className="text-sm font-medium text-green-600">-₹{Number(item.subsidy).toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
            <span className="text-sm font-semibold text-gray-800">Effective Cost</span>
            <span className="text-base font-bold text-[#5297ff]">₹{Number(item.effectiveCost).toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-sm text-emerald-600">Est. Annual Savings</span>
            <span className="text-sm font-semibold text-emerald-600">₹{Number(item.estimatedAnnualSavings).toLocaleString("en-IN")}/yr</span>
          </div>
        </div>

        {item.emiOptions && item.emiOptions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="sublabel-text text-gray-500 font-medium mb-2">EMI Options</p>
            <div className="flex gap-2 flex-wrap">
              {item.emiOptions.map((emi) => (
                <span key={emi.tenure} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100">
                  {emi.tenure}mo — ₹{emi.monthlyEmi.toLocaleString("en-IN")}/mo
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payment Summary */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="label-text font-semibold text-gray-700 mb-3">Payment</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="sublabel-text text-gray-400">Total</p>
            <p className="label-text font-bold text-gray-800">₹{Number(o.grandTotal).toLocaleString("en-IN")}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="sublabel-text text-gray-400">Paid</p>
            <p className="label-text font-bold text-green-700">₹{Number(o.amountPaid).toLocaleString("en-IN")}</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="sublabel-text text-gray-400">Due</p>
            <p className="label-text font-bold text-orange-700">₹{Number(o.amountDue).toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* Agent Assignment */}
      {canEdit && (
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="label-text font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <MdAssignment className="w-3.5 h-3.5 text-[#5297ff]" /> Agent Assignment
          </h3>
          {item.assignedAgent ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100 mb-3">
              <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-green-700 text-xs font-bold">
                {(item.assignedAgent.firstName?.[0] ?? "").toUpperCase()}{(item.assignedAgent.lastName?.[0] ?? "").toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{item.assignedAgent.firstName} {item.assignedAgent.lastName}</p>
                <p className="text-xs text-gray-500">{item.assignedAgent.email}</p>
              </div>
              {item.assignedAt && (
                <p className="text-xs text-gray-400 ml-auto">
                  Since {new Date(item.assignedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100 mb-3">
              No agent assigned yet
            </p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              placeholder="Enter Agent User ID"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#5297ff] transition-colors"
            />
            <Button
              onClick={onAssignAgent}
              disabled={saving || !agentId.trim()}
              className="bg-[#5297ff] text-white px-4 py-2 rounded-lg btn-text disabled:opacity-50"
            >
              {saving ? "..." : "Assign"}
            </Button>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="label-text font-semibold text-gray-700 mb-3">Installation Notes</h3>
        <textarea
          value={notesText}
          onChange={(e) => setNotesText(e.target.value)}
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none outline-none focus:border-[#5297ff] transition-colors"
          placeholder="Site survey notes, special instructions..."
          readOnly={!canEdit}
        />
        {canEdit && (
          <div className="flex justify-end mt-2">
            <Button
              onClick={onSaveNotes}
              disabled={saving}
              className="bg-[#5297ff] text-white px-4 py-1.5 rounded-lg btn-text disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Notes"}
            </Button>
          </div>
        )}
      </div>

      {/* Status History / Timeline */}
      {o.statusHistory && o.statusHistory.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="label-text font-semibold text-gray-700 mb-4">Activity Timeline</h3>
          <div className="relative pl-6">
            <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-gray-200" />
            {o.statusHistory.map((h, i) => {
              const cfg = STATUS_CONFIG[h.status] ?? STATUS_CONFIG.CREATED;
              return (
                <div key={i} className="relative mb-4 last:mb-0">
                  <div className={`absolute -left-4 w-4 h-4 rounded-full border-2 border-white ${cfg.bg} flex items-center justify-center`}>
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? "bg-[#5297ff]" : "bg-gray-400"}`} />
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${cfg.bg} ${cfg.text} text-[10px] rounded-full font-medium`}>
                        {cfg.label}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(h.at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {h.note && <p className="text-xs text-gray-500 mt-1">{h.note}</p>}
                    {h.by && <p className="text-[10px] text-gray-400 mt-0.5">by {h.by}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {canEdit && o.status !== "COMPLETED" && o.status !== "CANCELLED" && (
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="label-text font-semibold text-gray-700 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            {o.status === "CREATED" && (
              <button
                onClick={() => onStatusChange(o.id, "CONFIRMED")}
                className="px-4 py-2 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
              >
                Confirm Order
              </button>
            )}
            {o.status === "CONFIRMED" && !item.assignedAgentId && (
              <p className="text-xs text-amber-600 py-2">Assign an agent to progress this order.</p>
            )}
            {o.status === "ASSIGNED" && (
              <button
                onClick={() => onStatusChange(o.id, "IN_PROGRESS")}
                className="px-4 py-2 bg-purple-500 text-white text-xs font-medium rounded-lg hover:bg-purple-600 transition-colors"
              >
                Start Installation
              </button>
            )}
            {o.status === "IN_PROGRESS" && (
              <button
                onClick={() => onStatusChange(o.id, "COMPLETED")}
                className="px-4 py-2 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors"
              >
                Mark Completed
              </button>
            )}
            {["CREATED", "CONFIRMED"].includes(o.status) && (
              <button
                onClick={() => onStatusChange(o.id, "CANCELLED")}
                className="px-4 py-2 bg-white text-red-600 text-xs font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Status Pipeline Visual ──────────────────────────────────────

function StatusPipeline({ currentStatus }: { currentStatus: string }) {
  const idx = STATUS_PIPELINE.indexOf(currentStatus);
  const isCancelled = currentStatus === "CANCELLED";

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        {STATUS_PIPELINE.map((s, i) => {
          const isCompleted = !isCancelled && i <= idx;
          const isCurrent = !isCancelled && i === idx;
          const cfg = STATUS_CONFIG[s];
          return (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-[#5297ff] text-white ring-4 ring-blue-100"
                      : isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {isCompleted && !isCurrent ? "✓" : i + 1}
                </div>
                <span className={`text-[9px] font-medium text-center ${isCurrent ? "text-[#5297ff]" : isCompleted ? "text-green-600" : "text-gray-400"}`}>
                  {cfg?.label}
                </span>
              </div>
              {i < STATUS_PIPELINE.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 rounded ${isCompleted && i < idx ? "bg-green-500" : "bg-gray-200"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      {isCancelled && (
        <div className="mt-3 flex items-center justify-center gap-2 p-2 bg-red-50 rounded-lg border border-red-100">
          <MdCancel className="w-4 h-4 text-red-500" />
          <span className="text-xs font-medium text-red-600">This order has been cancelled</span>
        </div>
      )}
    </div>
  );
}

// ─── Info Item ────────────────────────────────────────────────────

function InfoItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="sublabel-text text-gray-400">{label}</p>
      <p className="label-text text-gray-800 flex items-center gap-1.5 capitalize">
        {icon} {value}
      </p>
    </div>
  );
}
