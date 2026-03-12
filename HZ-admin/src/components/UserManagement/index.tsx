// pages/admin/users/overview/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import Button from "@/src/common/Button";
import Loader from "@/src/common/Loader";
import BackRoute from "@/src/common/BackRoute";
import ReusableSearchFilter from "@/src/common/SearchFilter";
import Drawer from "@/src/common/Drawer";

import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import { usePermissionStore } from "@/src/stores/usePermissions";

import {
  FiEye,
  FiShoppingBag,
  FiHeart,
  FiHome,
  FiPhoneCall,
  FiMail,
  FiMapPin,
  FiUsers,
  FiTrendingUp,
  FiPackage,
  FiDollarSign,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiFilter,
} from "react-icons/fi";
import SingleSelect from "@/src/common/FormElements/SingleSelect";

enum UserKind {
  CUSTOMER = "CUSTOMER",
  SELLER = "SELLER",
  STAFF = "STAFF",
  SERVICE_PROVIDER = "SERVICE_PROVIDER",
  AGENT = "AGENT",
}

enum UserRole {
  ADMIN = "ADMIN",
  STANDARD = "STANDARD",
}

type UserOverview = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profile: string | null;
  kind: UserKind;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  branchName: string | null;
  branchId: string | null;
  branchRoles: string[];
  totalProperties: number;
  totalOrders: number;
  totalSpent: number;
  wishlistCount: number;
  customBuilderCount: number;
  crmLeadCount: number;
};

type UserOverviewResponse = {
  users: UserOverview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type UserCardProps = {
  user: UserOverview;
  onView: (user: UserOverview) => void;
  hasPermission: (resource: string, action: string) => boolean;
};

type FiltersState = {
  [key: string]: boolean;
};

const SORT_OPTIONS = [
  { label: "Date Created", value: "createdAt" },
  { label: "Name", value: "firstName" },
  { label: "Total Orders", value: "totalOrders" },
  { label: "Total Spent", value: "totalSpent" },
];

const AdminUsersOverview = () => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserOverviewResponse | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserOverview | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [kindFilterState, setKindFilterState] = useState<FiltersState>({});
  const [selectedKind, setSelectedKind] = useState<UserKind | null>(null);

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [page, setPage] = useState(1);
  const [branches, setBranches] = useState<any[]>([]);

  const { hasPermission } = usePermissionStore((state) => state);
  const session = useSession();
  const router = useRouter();


  const branchList = Array.isArray(branches) ? branches : [];
  const selectedBranchLabel =
    selectedBranch && branchList.length
      ? branchList.find((b) => b.id === selectedBranch)?.name || ""
      : "";

  // Page statistics
  const pageStats = useMemo(() => {
    if (!userData?.users?.length) return null;

    const totalOrders = userData.users.reduce(
      (sum, u) => sum + (u.totalOrders || 0),
      0
    );
    const totalSpent = userData.users.reduce(
      (sum, u) => sum + (u.totalSpent || 0),
      0
    );
    const avgOrderValue =
      totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

    const customers = userData.users.filter(
      (u) => u.kind === UserKind.CUSTOMER
    ).length;
    const staff = userData.users.filter((u) => u.kind === UserKind.STAFF).length;
    const admins = userData.users.filter(
      (u) => u.role === UserRole.ADMIN
    ).length;

    return {
      totalOrders,
      totalSpent,
      avgOrderValue,
      customers,
      staff,
      admins,
    };
  }, [userData]);

  const fetchBranches = async () => {
    // Branch system removed on backend; skip loading branches to avoid 404s.
    setBranches([]);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 20,
        sortBy,
        sortOrder,
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedBranch) params.branchId = selectedBranch;
      if (selectedKind) params.kind = selectedKind;

      const res = await apiClient.get(
        `${apiClient.URLS.user}/admin/overview`,
        { params }
      );

      if (res.status === 200 && res.body) {
        setUserData(res.body);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (user: UserOverview) => {
    setSelectedUser(user);
    setShowUserDetails(true);
    // You can fetch additional details here if needed
  };

  const handleExportData = () => {
    if (!userData?.users?.length) {
      toast.error("No data to export");
      return;
    }

    const csvContent = [
      ["Name", "Email", "Phone", "Role", "Kind", "Branch", "Orders", "Spent", "Properties", "Wishlist", "Projects"].join(","),
      ...userData.users.map(u => [
        `"${u.firstName} ${u.lastName}"`,
        u.email,
        u.phone,
        u.role,
        u.kind,
        u.branchName || "-",
        u.totalOrders,
        u.totalSpent,
        u.totalProperties,
        u.wishlistCount,
        u.customBuilderCount,
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-overview-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Data exported successfully");
  };

  useEffect(() => {
    const activeKinds = Object.entries(kindFilterState)
      .filter(([, val]) => val)
      .map(([key]) => key as UserKind);

    setSelectedKind(activeKinds.length === 1 ? activeKinds[0] : null);
    setPage(1);
  }, [kindFilterState]);

  useEffect(() => {
    if (session.status === "authenticated") {
      fetchBranches();
    }
  }, [session.status]);

  useEffect(() => {
    if (session.status === "authenticated") {
      fetchUsers();
    }
  }, [
    session.status,
    page,
    sortBy,
    sortOrder,
    selectedBranch,
    selectedKind,
    searchQuery,
  ]);

  if (loading && !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  const kindFiltersConfig = Object.values(UserKind).map((kind) => ({
    id: kind,
    label: kind,
  }));

  return (
    <div className="w-full min-h-screen px-4 md:px-6 py-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mb-4">
        <BackRoute />
      </div>

      {/* Enhanced Header Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-500 px-6 py-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold ">
                Users Overview Dashboard
              </h1>
              <p className="text-blue-100 md:text-sm text-[12px]">
                Comprehensive insights into customer and staff activity
              </p>
            </div>
            <Button
              onClick={handleExportData}
              className="flex items-center  justify-center gap-2 bg-white text-[#3586FF]  px-6 py-1 md:rounded-xl rounded-sm text-center hover:bg-blue-50 transition-all shadow-md"
            >
              <FiDownload size={18} />
              <span className="font-medium text-center label-text">Export Data</span>
            </Button>
          </div>
        </div>

        {pageStats && (
          <div className="px-6 py-6 bg-gradient-to-b from-gray-50 to-white">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <StatCard
                icon={<FiUsers className="text-[#3586FF] " size={24} />}
                label="Total Users"
                value={userData?.total || 0}
                subValue="Across all pages"
                bgColor="bg-blue-50"
              />
              <StatCard
                icon={<FiShoppingBag className="text-emerald-600" size={24} />}
                label="Page Orders"
                value={pageStats.totalOrders}
                subValue="Current page"
                bgColor="bg-emerald-50"
              />
              <StatCard
                icon={<FiDollarSign className="text-amber-600" size={24} />}
                label="Page GMV"
                value={`₹${(pageStats.totalSpent / 1000).toFixed(1)}K`}
                subValue="Total spent"
                bgColor="bg-amber-50"
              />
              <StatCard
                icon={<FiTrendingUp className="text-purple-600" size={24} />}
                label="Avg Order"
                value={pageStats.avgOrderValue ? `₹${(pageStats.avgOrderValue / 1000).toFixed(1)}K` : "-"}
                subValue="Per order"
                bgColor="bg-purple-50"
              />
              <StatCard
                icon={<FiUsers className="text-cyan-600" size={24} />}
                label="Customers"
                value={pageStats.customers}
                subValue="Current page"
                bgColor="bg-cyan-50"
              />
              <StatCard
                icon={<FiUsers className="text-indigo-600" size={24} />}
                label="Staff"
                value={pageStats.staff}
                subValue="Current page"
                bgColor="bg-indigo-50"
              />
              <StatCard
                icon={<FiUsers className="text-rose-600" size={24} />}
                label="Admins"
                value={pageStats.admins}
                subValue="Current page"
                bgColor="bg-rose-50"
              />
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filters Section */}
      <div className="bg-white p-5 md:p-6 md:rounded-xl rounded-[4px] shadow-lg mb-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-5">
          <FiFilter className="text-gray-600" size={20} />
          <h2 className="text-lg font-bold text-gray-900">
            Filters & Search
          </h2>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex flex-col gap-2 lg:flex-row items-center justify-center">
            <div className="flex-1">
              <ReusableSearchFilter
                searchText={searchQuery}
                placeholder="Search by name, email, or phone..."
                onSearchChange={(value) => {
                  setSearchQuery(value);
                  setPage(1);
                }}
                filters={kindFiltersConfig}
                selectedFilters={kindFilterState}
                onFilterChange={setKindFilterState}
                rootCls="w-full md:mb-0"
                className="w-full "
              />
            </div>

            {/* Branch Filter */}
            <div className="w-full lg:w-[280px]">
              <SingleSelect
                type="single-select"
                name="branch"
                labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                optionsInterface={{ isObj: false }}
                options={branchList.map((b) => b.name)}
                selectedOption={selectedBranchLabel || "All Branches"}
                handleChange={(_name, val) => {
                  const branch = branchList.find((b) => b.name === val);
                  setSelectedBranch(branch ? branch.id : null);
                  setPage(1);
                }}
                placeholder="All Branches"
                rootCls="border-b-[1px] px-1  w-full border border-[#CFCFCF] rounded-[4px]"
                buttonCls="border-none text-sm"
              />
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-3 items-center border-t border-dashed border-gray-200 pt-5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-gray-600">
                Sort by:
              </span>

              <div className="w-[220px]">
                <SingleSelect
                  type="single-select"
                  name="sortBy"
                  label=""
                  labelCls="font-medium"
                  optionsInterface={{ isObj: false }}
                  options={SORT_OPTIONS.map((o) => o.label)}
                  selectedOption={
                    SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "Date Created"
                  }
                  handleChange={(_name, val) => {
                    const selected = SORT_OPTIONS.find((o) => o.label === val);
                    if (selected) {
                      setSortBy(selected.value);
                      setPage(1);
                    }
                  }}
                  placeholder="Select sort"
                  rootCls="border-2 px-2 py-0 w-full border-gray-200 rounded-[6px]"
                  buttonCls="border-none text-sm"
                />
              </div>

              <Button
                onClick={() => {
                  setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
                  setPage(1);
                }}
                className="px-5 py-1 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-[6px] hover:from-gray-100 hover:to-gray-200 text-sm font-medium border-2 border-gray-200 transition-all"
              >
                {sortOrder === "ASC" ? "↑ Ascending" : "↓ Descending"}
              </Button>
            </div>

            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedBranch(null);
                setKindFilterState({});
                setSelectedKind(null);
                setSortBy("createdAt");
                setSortOrder("DESC");
                setPage(1);
              }}
              className="ml-auto text-sm text-[#3586FF]  hover:text-blue-700 font-medium hover:underline"
            >
              Reset all filters
            </Button>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
              {userData?.users && userData.users.length > 0 ? (
                userData.users.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onView={handleViewUser}
                    hasPermission={hasPermission}
                  />
                ))
              ) : (
                <div className="col-span-full">
                  <div className="bg-white md:rounded-xl rounded-[4px] shadow-lg border border-gray-100 p-16 text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <FiUsers className="text-gray-400" size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      No Users Found
                    </h3>
                    <p className="text-gray-500">
                      Try adjusting your filters or search query
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Pagination */}
            {userData && userData.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 bg-white p-6 md:rounded-xl rounded-[6px] shadow-lg border border-gray-100">
                <Button
                  onClick={() => setPage((prev) => prev - 1)}
                  disabled={page === 1}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-500 text-white rounded-xl disabled:from-gray-300 disabled:to-gray-300 text-sm font-medium shadow-md hover:shadow-lg transition-all"
                >
                  ← Previous
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, userData.totalPages) }, (_, i) => {
                    let pageNum;
                    if (userData.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= userData.totalPages - 2) {
                      pageNum = userData.totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${page === pageNum
                          ? "bg-gradient-to-r from-blue-500 to-blue-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={page === userData.totalPages}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-500 text-white rounded-xl disabled:from-gray-300 disabled:to-gray-300 text-sm font-medium shadow-md hover:shadow-lg transition-all"
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Details Drawer */}
      {showUserDetails && selectedUser && (
        <Drawer
          open={showUserDetails}
          handleDrawerToggle={() => {
            setShowUserDetails(false);
            setSelectedUser(null);
          }}
          closeIconCls="text-gray-700 hover:text-gray-900"
          openVariant="right"
          panelCls="w-full sm:w-[600px] lg:w-[700px] shadow-2xl bg-gray-50"
          overLayCls="bg-black bg-opacity-50 backdrop-blur-sm"
        >
          <UserDetailsView user={selectedUser} />
        </Drawer>
      )}
    </div>
  );
};

export default AdminUsersOverview;

// Enhanced Stat Card Component
const StatCard = ({
  icon,
  label,
  value,
  subValue,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  bgColor: string;
}) => (
  <div className={`${bgColor} rounded-xl p-4 border-2 border-white shadow-sm hover:shadow-md transition-all`}>
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-white rounded-xl shadow-sm">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[11px] uppercase tracking-wide text-gray-600 font-medium">
          {label}
        </p>
        <p className="text-xl md:text-2xl font-bold text-gray-900 mt-0.5">
          {value}
        </p>
      </div>
    </div>
    {subValue && (
      <p className="text-[11px] text-gray-500 mt-1">{subValue}</p>
    )}
  </div>
);

// Enhanced User Card Component
const UserCard: React.FC<UserCardProps> = ({ user, onView, hasPermission }) => {
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const createdDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "";

  const initials =
    (user.firstName?.[0] || user.lastName?.[0] || "U").toUpperCase();

  const canView = hasPermission("user", "read") || hasPermission("user", "view");

  // Determine user activity level
  const getTotalActivity = () =>
    user.totalOrders + user.totalProperties + user.customBuilderCount + user.crmLeadCount;

  const activityLevel = getTotalActivity();
  const activityColor =
    activityLevel > 10 ? "text-green-600" :
      activityLevel > 5 ? "text-amber-600" :
        "text-gray-600";

  const activityLabel =
    activityLevel > 10 ? "High Activity" :
      activityLevel > 5 ? "Medium Activity" :
        "Low Activity";

  return (
    <div className="group relative bg-white md:rounded-xl rounded-[6px] shadow-lg border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-blue-500 to-blue-700" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 md:rounded-xl rounded-[6px] flex items-center justify-center overflow-hidden border-2 border-white shadow-md group-hover:scale-110 transition-transform">
                {user.profile ? (
                  <span className="text-xs text-gray-500">IMG</span>
                ) : (
                  <span className="text-[#3586FF]  font-bold text-xl">
                    {initials}
                  </span>
                )}
              </div>
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                  <FiCheckCircle className="text-white" size={12} />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-gray-900 leading-tight">
                {fullName || user.email || user.phone || "Unnamed User"}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {user.role === UserRole.ADMIN && (
                  <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[11px] rounded-full font-bold">
                    ADMIN
                  </span>
                )}
                <span className="px-2 py-0.5 bg-blue-50 text-[#3586FF] text-[11px] rounded-full font-medium">
                  {user.kind}
                </span>
                <span className={`text-[11px] font-medium ${activityColor}`}>
                  {activityLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4 bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 text-sm">
            <FiMail className="text-gray-400" size={14} />
            <span className="text-gray-600 truncate">{user.email || "-"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FiPhoneCall className="text-gray-400" size={14} />
            <span className="text-gray-600">{user.phone || "-"}</span>
          </div>
          {user.branchName && (
            <div className="flex items-center gap-2 text-sm">
              <FiMapPin className="text-gray-400" size={14} />
              <span className="text-gray-600 truncate">{user.branchName}</span>
            </div>
          )}
        </div>

        {/* Roles Badge */}
        {user.branchRoles.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {user.branchRoles.slice(0, 2).map((role, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 text-[11px] rounded-lg font-medium"
                >
                  {role}
                </span>
              ))}
              {user.branchRoles.length > 2 && (
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[11px] rounded-lg font-medium">
                  +{user.branchRoles.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Primary Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center border border-blue-200">
            <FiHome className="text-[#3586FF]  mx-auto mb-1" size={18} />
            <p className="text-[11px] text-blue-700 font-medium">Properties</p>
            <p className="text-xl font-bold text-blue-900 mt-0.5">
              {user.totalProperties}
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 text-center border border-emerald-200">
            <FiShoppingBag className="text-emerald-600 mx-auto mb-1" size={18} />
            <p className="text-[11px] text-emerald-700 font-medium">Orders</p>
            <p className="text-xl font-bold text-emerald-900 mt-0.5">
              {user.totalOrders}
            </p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 text-center border border-amber-200">
            <FiDollarSign className="text-amber-600 mx-auto mb-1" size={18} />
            <p className="text-[11px] text-amber-700 font-medium">Spent</p>
            <p className="text-[13px] font-bold text-amber-900 mt-0.5 leading-tight">
              ₹{(user.totalSpent / 1000).toFixed(1)}K
            </p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white border-2 border-gray-100 rounded-xl p-2.5 text-center hover:border-blue-200 transition-colors">
            <FiHeart className="text-rose-500 mx-auto mb-1" size={16} />
            <p className="text-[10px] text-gray-500 font-medium">Wishlist</p>
            <p className="text-sm font-bold text-gray-900">
              {user.wishlistCount}
            </p>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-xl p-2.5 text-center hover:border-blue-200 transition-colors">
            <FiPackage className="text-indigo-500 mx-auto mb-1" size={16} />
            <p className="text-[10px] text-gray-500 font-medium">Projects</p>
            <p className="text-sm font-bold text-gray-900">
              {user.customBuilderCount}
            </p>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-xl p-2.5 text-center hover:border-blue-200 transition-colors">
            <FiPhoneCall className="text-cyan-500 mx-auto mb-1" size={16} />
            <p className="text-[10px] text-gray-500 font-medium">Leads</p>
            <p className="text-sm font-bold text-gray-900">
              {user.crmLeadCount}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <FiCalendar size={12} />
            <span>Joined {createdDate}</span>
          </div>
          <Button
            onClick={() => onView(user)}
            // disabled={!canView}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-500 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl hover:from-blue-500 hover:to-blue-700 transition-all flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg group-hover:scale-105"
          >
            <FiEye size={14} />
            <span>View</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

// Enhanced User Details View Component
const UserDetailsView = ({ user }: { user: UserOverview }) => {
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    : "";

  const initials = (user.firstName?.[0] || user.lastName?.[0] || "U").toUpperCase();

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur-sm md:rounded-xl rounded-[6px] flex items-center justify-center text-3xl font-bold border-4 border-white border-opacity-30">
            {initials}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">
              {fullName || "Unnamed User"}
            </h2>
            <div className="flex items-center gap-2">
              {user.role === UserRole.ADMIN && (
                <span className="px-3 py-1 bg-red-500 bg-opacity-90 rounded-full text-sm font-bold">
                  ADMIN
                </span>
              )}
              <span className="px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-sm font-medium">
                {user.kind}
              </span>
              {user.isVerified && (
                <span className="px-3 py-1 bg-green-500 bg-opacity-90 rounded-full text-sm font-medium flex items-center gap-1">
                  <FiCheckCircle size={14} />
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="text-blue-100 label-text">
          Member since {joinedDate}
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto md:px-2 px-2 py-3 space-y-6">
        <div className="bg-white md:rounded-xl rounded-[6px] shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiMail className="text-[#3586FF] " />
            Contact Information
          </h3>
          <div className="space-y-3">
            <DetailRow icon={<FiMail />} label="Email" value={user.email || "Not provided"} />
            <DetailRow icon={<FiPhoneCall />} label="Phone" value={user.phone || "Not provided"} />
            {user.branchName && (
              <DetailRow icon={<FiMapPin />} label="Branch" value={user.branchName} />
            )}
          </div>
        </div>

        {/* Roles & Permissions */}
        {user.branchRoles.length > 0 && (
          <div className="bg-white md:rounded-xl rounded-[6px] shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiUsers className="text-purple-600" />
              Roles & Responsibilities
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.branchRoles.map((role, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-xl font-medium border border-purple-200"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Activity Overview */}
        <div className="bg-white md:rounded-xl rounded-[6px] shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-emerald-600" />
            Activity Overview
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <ActivityCard
              icon={<FiHome className="text-[#3586FF] " size={24} />}
              label="Properties Listed"
              value={user.totalProperties}
              bgColor="from-blue-50 to-blue-100"
            />
            <ActivityCard
              icon={<FiShoppingBag className="text-emerald-600" size={24} />}
              label="Total Orders"
              value={user.totalOrders}
              bgColor="from-emerald-50 to-emerald-100"
            />
            <ActivityCard
              icon={<FiDollarSign className="text-amber-600" size={24} />}
              label="Total Spent"
              value={`₹${user.totalSpent.toLocaleString()}`}
              bgColor="from-amber-50 to-amber-100"
            />
            <ActivityCard
              icon={<FiHeart className="text-rose-600" size={24} />}
              label="Wishlist Items"
              value={user.wishlistCount}
              bgColor="from-rose-50 to-rose-100"
            />
            <ActivityCard
              icon={<FiPackage className="text-indigo-600" size={24} />}
              label="Custom Projects"
              value={user.customBuilderCount}
              bgColor="from-indigo-50 to-indigo-100"
            />
            <ActivityCard
              icon={<FiPhoneCall className="text-cyan-600" size={24} />}
              label="CRM Leads"
              value={user.crmLeadCount}
              bgColor="from-cyan-50 to-cyan-100"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 md:rounded-xl rounded-[6px] border border-blue-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Button className="w-full py-1 md:py-2 bg-white text-[#3586FF]  rounded-xl hover:bg-blue-50 transition-all border-2 border-blue-200 font-medium shadow-sm">
              View Orders
            </Button>
            <Button className="w-full py-1 md:py-2 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-all border-2 border-purple-200 font-medium shadow-sm">
              View Properties
            </Button>
            <Button className="w-full py-1 md:py-2 bg-white text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all border-2 border-emerald-200 font-medium shadow-sm">
              View Projects
            </Button>
            <Button className="w-full py-1 md:py-2 bg-white text-amber-600 rounded-xl hover:bg-amber-50 transition-all border-2 border-amber-200 font-medium shadow-sm">
              Contact User
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const DetailRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-3 px-2 py-[6px] bg-gray-50 md:rounded-xl rounded-[4px]">
    <div className="text-gray-500">{icon}</div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-sm text-gray-900 font-medium">{value}</p>
    </div>
  </div>
);

const ActivityCard = ({
  icon,
  label,
  value,
  bgColor
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bgColor: string;
}) => (
  <div className={`bg-gradient-to-br ${bgColor} md:rounded-xl rounded-md p-2 border-2 border-white shadow-sm`}>
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <div className="flex-1">
        <p className="text-xs text-gray-600 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);