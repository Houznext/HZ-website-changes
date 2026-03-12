import { useEffect, useState, useMemo } from "react";
import apiClient from "@/src/utils/apiClient";
import ReusableSearchFilter from "@/src/common/SearchFilter";
import { useRouter } from "next/router";
import Loader from "@/src/components/SpinLoader";
import {
  User,
  Users,
  Mail,
  Phone,
  Shield,
  Crown,
  ChevronRight,
  UserCheck,
  Building2,
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function HumanResourceView() {
  const router = useRouter();

  const [branchUsers, setBranchUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<any>({});
  const [branchOptions, setBranchOptions] = useState<any[]>([]);

  const { data: session, status } = useSession();

  // ✅ your current membership (first one)
  const membership = session?.user?.branchMemberships?.[0];
  const sessionBranchId = membership?.branchId ?? null;

  // ✅ this decides whether to show branch dropdown
  const canShowBranchFilter =
    membership?.branchRoles?.some((r: any) => r.roleName === "SuperAdmin") &&
    membership?.isBranchHead === true &&
    membership?.level === "ORG";

  // ✅ fetch branches ONLY if dropdown is allowed – now derived from session, no backend call
  const fetchBranches = async () => {
    const formatted = sessionBranchId && membership?.branchName
      ? [{ label: membership.branchName, value: sessionBranchId }]
      : [];

    setBranchOptions(formatted);

    if (!selectedBranch && sessionBranchId) {
      setSelectedBranch(sessionBranchId);
    }
  };

  // ✅ if dropdown is NOT allowed, lock branch to session branch
  useEffect(() => {
    if (!sessionBranchId) return;

    if (!canShowBranchFilter) {
      setSelectedBranch(sessionBranchId);
    }
  }, [sessionBranchId, canShowBranchFilter]);

  // ✅ fetch branches only when dropdown is allowed (and after session loads)
  useEffect(() => {
    if (status !== "authenticated") return;

    if (canShowBranchFilter) {
      fetchBranches();
    } else {
      // if dropdown isn't shown, still set branchOptions from session (for display label)
      if (sessionBranchId && membership?.branchName) {
        setBranchOptions([{ label: membership.branchName, value: sessionBranchId }]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, canShowBranchFilter]);

  const fetchUsers = async () => {
    if (!selectedBranch) return;

    try {
      setLoading(true);
      const res = await apiClient.get(
        `${apiClient.URLS.user}/by-branch/${selectedBranch}/admin-users`
      );
      setBranchUsers(res.body || []);
    } catch (error) {
      console.error(error);
      setBranchUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch]);

  const filteredUsers = useMemo(() => {
    return branchUsers.filter((item: any) => {
      const fullName = `${item.user.firstName} ${item.user.lastName}`.toLowerCase();
      const email = (item.user.email || "").toLowerCase();
      const phone = item.user.phone || "";

      const q = searchQuery.toLowerCase();

      const matchSearch =
        fullName.includes(q) ||
        email.includes(q) ||
        phone.includes(searchQuery);

      if (!matchSearch) return false;

      // match branch (only relevant when you have branch selection)
      const matchBranch =
        !selectedBranch ||
        item?.membership?.branchId?.toString() === selectedBranch?.toString();

      if (!matchBranch) return false;

      return true;
    });
  }, [branchUsers, searchQuery, selectedBranch]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="flex flex-col items-center gap-3">
          <Loader />
          <p className="text-sm text-slate-500 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  const selectedBranchName =
    branchOptions.find((b) => b.value === selectedBranch)?.label || "All Branches";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-6">
      <div className="mx-auto max-w-8xl space-y-5">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                  Human Resources
                </h1>
                <p className="mt-1 text-sm text-slate-500 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Manage team members & roles
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 text-sm font-medium text-indigo-700">
                <UserCheck className="w-4 h-4" />
                {filteredUsers.length}{" "}
                {filteredUsers.length === 1 ? "User" : "Users"}
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <ReusableSearchFilter
            searchText={searchQuery}
            placeholder="Search by name, phone, email..."
            onSearchChange={setSearchQuery}
            branchOptions={branchOptions}
            selectedBranch={selectedBranch}
            onBranchChange={(opt) => setSelectedBranch(opt?.value ?? null)}
            filters={[
              {
                groupLabel: "User Type",
                key: "role",
                options: [
                  { id: "STAFF", label: "Staff" },
                  { id: "CUSTOMER", label: "Customer" },
                ],
              },
            ]}
            selectedFilters={selectedFilters}
            onFilterChange={setSelectedFilters}
            showBranchFilter={canShowBranchFilter}
          />
        </div>

        {/* Users Grid Section */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Team Members</h2>
                <p className="text-xs text-slate-500">{selectedBranchName}</p>
              </div>
            </div>
          </div>

          {filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((item: any) => {
                const { user, membership } = item;
                const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

                return (
                  <div
                    key={user.id}
                    onClick={() => {
                      const branchName = branchOptions.find(
                        (b) => b.value === membership.branchId
                      )?.label;

                      const cleanName = branchName
                        ? branchName.replace(/\s+/g, "-").toLowerCase()
                        : "branch";

                      router.push(`/human-resource/${user.id}?branch=${cleanName}`);
                    }}
                    className="group relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md ${
                          membership.kind === "STAFF"
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                            : "bg-gradient-to-br from-emerald-500 to-green-600"
                        }`}
                      >
                        {initials}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                          {user.firstName} {user.lastName}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${
                            membership.kind === "STAFF"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {membership.kind === "STAFF" ? (
                            <Shield className="w-3 h-3" />
                          ) : (
                            <User className="w-3 h-3" />
                          )}
                          {membership.kind}
                        </span>
                      </div>

                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{user.phone}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
                      {membership.isBranchHead && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-semibold shadow-sm">
                          <Crown className="w-3 h-3" />
                          Branch Head
                        </span>
                      )}

                      {membership.branchRoles?.length > 0 ? (
                        membership.branchRoles.map((role: any) => (
                          <span
                            key={role.id}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-semibold border border-indigo-100"
                          >
                            <Shield className="w-3 h-3" />
                            {role.roleName}
                          </span>
                        ))
                      ) : (
                        !membership.isBranchHead && (
                          <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-medium">
                            No Roles Assigned
                          </span>
                        )
                      )}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all pointer-events-none" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-4">
                <Users className="w-10 h-10 text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No Users Found</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                No team members match your search criteria. Try adjusting your
                filters or add new members.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
