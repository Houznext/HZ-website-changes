"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import apiClient from "@/src/utils/apiClient";
import Button from "@/src/common/Button";
import Modal from "@/src/common/Modal";
import Drawer from "@/src/common/Drawer";
import Loader from "@/src/common/Loader";
import CheckboxInput from "@/src/common/FormElements/CheckBoxInput";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import CustomInput from "@/src/common/FormElements/CustomInput";
import ReusableSearchFilter from "@/src/common/SearchFilter";
import { ViewToggleIcons } from "@/src/features/CustomBuilder/ViewSelector";
import BranchNavigation from "./BranchNavigation";
import UserDetailsView from "./UserDetails";
import BranchRoleForm from "./BranchRoleForm";
import BranchStatistics from "./BranchStatistics";
import { useSession } from "next-auth/react";
import CreateBranch from "./CreateBranch";
import {
  Building2,
  Users as UsersIcon,
  ShieldCheck,
  UserPlus,
  Plus,
  Pencil,
  Trash2,
  User,
  Crown,
  Phone,
  Tag,
} from "lucide-react";
import PaginationControls from "../CrmView/pagination";

interface Branch {
  id: number;
  name: string;
  level: string;
  path?: string;
  parentId?: number | null;
  isStateHQ?: boolean;
  isHeadOffice?: boolean;
  hasFranchiseFeePaid?: boolean;
  franchisePaymentRef?: string;
  category?: "GENERAL" | "CUSTOM_BUILDER" | "INTERIORS";
  stateId?: number | null;
  cityId?: number | null;
  parent?: { id: number; name: string } | null;
  ownerAadhaarNumber?: string | null;
  ownerPanNumber?: string | null;
  ownerGstNumber?: string | null;
  ownerIdProofType?: string | null;
  ownerIdProofUrl?: string | null;
  ownerPhotoUrl?: string | null;
  ownerDateOfBirth?: string | null;
  ownerAddress?: string | null;
  branchAddress?: string | null;
  branchPhone?: string | null;
  branchEmail?: string | null;
  branchPhotoUrl?: string | null;
}

interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  states: string[];
  branchId: string | null;
  branchRoleIds: number[];
  userKind: string;
  isBranchHead: boolean;
  isPrimary: boolean;
}

export default function BranchesView() {
  const router = useRouter();
  const { data: sessionData } = useSession();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
  const [view, setView] = useState<"cards" | "compact">("cards");
  const [query, setQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Drawers
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openUserModal, setOpenUserModal] = useState(false);
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    parentId: null as number | null,
    level: "ORG",
    isStateHQ: false,
  });

  const [userDetails, setUserDetails] = useState<UserDetails>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    states: [],
    branchId: null,
    branchRoleIds: [],
    userKind: "CUSTOMER",
    isBranchHead: false,
    isPrimary: true,
  });

  // Data States
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null);
  // const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchRoles, setBranchRoles] = useState<any[]>([]);
  const [branchUsers, setBranchUsers] = useState<any[]>([]);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [branchHasHead, setBranchHasHead] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showDeleteRoleModal, setShowDeleteRoleModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<any>(null);
  type BranchActionType = "soft" | "restore" | "hard" | null;

  const [actionBranch, setActionBranch] = useState<Branch | null>(null);
  const [actionType, setActionType] = useState<BranchActionType>(null);

  const [openActionModal, setOpenActionModal] = useState(false);
  const [openHardDeleteModal, setOpenHardDeleteModal] = useState(false);

  const promptDeleteRole = (role: any) => {
    setRoleToDelete(role);
    setShowDeleteRoleModal(true);
  };

  // --- Session-based membership / access info ---

  const membership: any =
    (sessionData as any)?.user?.branchMemberships?.[0] ??
    (sessionData as any)?.membership ??
    (sessionData as any)?.user?.branchMembership ??
    null;

  const activeBranchId: number | undefined = (sessionData as any)?.user
    ?.activeBranchId;

  const isOrgHead = useMemo(() => {
    if (!membership || !branches.length) return false;
    const branchForMembership = branches.find(
      (b) => b.id === membership.branchId,
    );
    if (!branchForMembership) return false;
    return (
      branchForMembership.level === "ORG" && membership.isBranchHead === true
    );
  }, [branches, membership]);

  const isStateHQHead = useMemo(() => {
    if (!membership || !branches.length) return false;
    const branchForMembership = branches.find(
      (b) => b.id === membership.branchId,
    );
    if (!branchForMembership) return false;
    return (
      branchForMembership.isStateHQ === true && membership.isBranchHead === true
    );
  }, [branches, membership]);

  const canCreateBranch = isOrgHead || isStateHQHead;

  // Computed Values
  const selectedBranch = useMemo(
    () => branches?.find((b) => String(b.id) === selectedBranchId) || null,
    [branches, selectedBranchId],
  );

  const filteredUsers = useMemo(() => {
    if (!query) return branchUsers;
    const lowerQuery = query.toLowerCase();
    return branchUsers.filter((item) => {
      const { user, membership } = item;
      return (
        user?.firstName?.toLowerCase().includes(lowerQuery) ||
        user?.lastName?.toLowerCase().includes(lowerQuery) ||
        user?.email?.toLowerCase().includes(lowerQuery) ||
        user?.phone?.includes(query) ||
        membership?.kind?.toLowerCase().includes(lowerQuery)
      );
    });
  }, [branchUsers, query]);

  const filteredRoles = useMemo(() => {
    if (!query) return branchRoles;
    const lowerQuery = query.toLowerCase();
    return branchRoles.filter((role) =>
      role.roleName?.toLowerCase().includes(lowerQuery),
    );
  }, [branchRoles, query]);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (router.query.selectedBranch && branches.length > 0) {
      const found = branches.find(
        (b) =>
          b.name.toLowerCase() ===
          String(router.query.selectedBranch).toLowerCase(),
      );
      console.log(found);
      if (found) {
        setSelectedBranchId(String(found.id));
      }
    }
  }, [router.query.selectedBranch, branches]);

  useEffect(() => {
    if (!selectedBranchId) {
      setBranchRoles([]);
      setBranchHasHead(false);
      return;
    }
    fetchBranchRoles(selectedBranchId);
  }, [selectedBranchId]);

  useEffect(() => {
    if (!selectedBranchId) {
      setBranchUsers([]);
      return;
    }
    fetchUsers(selectedBranchId);
  }, [selectedBranchId]);

  useEffect(() => {
    if (editingBranch) {
      setFormData({
        name: editingBranch.name || "",
        parentId: editingBranch.parent?.id ?? null,
        level: editingBranch.level || "ORG",
        isStateHQ: editingBranch.isStateHQ ?? false,
      });
    } else {
      setFormData({
        name: "",
        parentId: null,
        level: "ORG",
        isStateHQ: false,
      });
    }
  }, [editingBranch]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, activeTab, selectedBranchId, pageSize]);
  const paginate = <T,>(data: T[], page: number, size: number) => {
    const start = (page - 1) * size;
    const end = start + size;
    return data.slice(start, end);
  };
  const totalUsers = filteredUsers.length;
  const totalUserPages = Math.ceil(totalUsers / pageSize);

  const paginatedUsers = paginate(filteredUsers, currentPage, pageSize);
  const totalRoles = filteredRoles.length;
  const totalRolePages = Math.ceil(totalRoles / pageSize);

  const paginatedRoles = paginate(filteredRoles, currentPage, pageSize);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      // backend now returns only branches visible for current user
      const res = await apiClient.get(apiClient.URLS.branches, {}, true);
      const list: Branch[] = res.body || [];
      setBranches(list);

      if (!selectedBranchId && list?.length) {
        let defaultId: number | undefined;

        // Prefer activeBranchId from session if present and part of list
        if (activeBranchId && list.some((b) => b.id === activeBranchId)) {
          defaultId = activeBranchId;
        }

        // Else, try Head Office / ORG
        if (!defaultId) {
          const headOffice = list.find(
            (b) => b.isHeadOffice || b.level === "ORG" || b.path === "1",
          );
          if (headOffice) defaultId = headOffice.id;
        }

        // Fallback to first branch
        if (!defaultId) {
          defaultId = list[0].id;
        }

        if (defaultId) {
          setSelectedBranchId(String(defaultId));
        }
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("Failed to load branches");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBranchRoles = async (branchId: string) => {
    try {
      setLoadingRoles(true);
      const res = await apiClient.get(
        `${apiClient.URLS.branchroles}?branchId=${branchId}&_=${Date.now()}`,
      );
      console.log("res", res);
      setBranchRoles(res.body);
      const hasHeadRole = res.body.some((r: any) => r.isBranchHead === true);
      setBranchHasHead(hasHeadRole);
    } catch (error) {
      console.error("Error fetching branch roles:", error);
      toast.error("Failed to load branch roles");
      setBranchRoles([]);
      setBranchHasHead(false);
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchUsers = async (branchId: string) => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(
        `${apiClient.URLS.user}/by-branch/${branchId}/admin-users`,{},true
      );
      setBranchUsers(res.body);
      const hasHead = res.body.some((u: any) => u.isBranchHead === true);
      setBranchHasHead(hasHead);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      setBranchUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers
  const handleDrawerClose = () => {
    setOpenUserModal(false);
    setEditMode(false);
    setSelectedUserId(null);
    setUserDetails({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      states: [],
      branchId: null,
      branchRoleIds: [],
      userKind: "CUSTOMER",
      isBranchHead: false,
      isPrimary: true,
    });
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    // setOpenModal(true);
    setOpenDrawer(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter a branch name.");
      return;
    }

    setIsLoading(true);
    const payload: any = {
      name: formData.name.trim(),
      level: formData.level,
      parentId: formData.parentId ? Number(formData.parentId) : undefined,
    };

    if (formData.level === "CITY") {
      payload.isStateHQ = !!formData.isStateHQ;
    }

    try {
      let res;
      if (editingBranch) {
        res = await apiClient.patch(
          `${apiClient.URLS.branches}/${editingBranch.id}`,
          payload,
          true,
        );
      } else {
        res = await apiClient.post(apiClient.URLS.branches, payload, true);
      }

      if (res.status === 200 || res.status === 201) {
        setFormData({
          name: "",
          parentId: null,
          level: "ORG",
          isStateHQ: false,
        });
        setEditingBranch(null);
        setOpenModal(false);
        await fetchBranches();
        toast.success(
          editingBranch
            ? "Branch updated successfully"
            : "Branch created successfully",
        );
      }
    } catch (error) {
      console.error("Error submitting branch:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleDelete = async (id: number) => {
    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.branches}/${id}`,
        true,
      );

      if (res?.status === 200 || res?.status === 204) {
        setBranches((prev) =>
          prev.map((b) => (b.id === id ? { ...b, isActive: false } : b)),
        );

        // if user is currently viewing deleted branch, clear selection
        if (String(id) === selectedBranchId) setSelectedBranchId(null);

        toast.success("Branch deactivated");
      } else {
        toast.error("Failed to deactivate branch");
      }
    } catch (e) {
      toast.error("Deactivation failed");
    }
  };

  const handleRestore = async (id: number) => {
    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.branches}/${id}/restore`,
        {},
        true,
      );

      if (res?.status === 200 || res?.status === 204) {
        setBranches((prev) =>
          prev.map((b) => (b.id === id ? { ...b, isActive: true } : b)),
        );
        toast.success("Branch restored");
      } else {
        toast.error("Restore failed");
      }
    } catch (e) {
      toast.error("Restore failed");
    }
  };

  const handleHardDelete = async (id: number) => {
    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.branches}/${id}/hard`,
        true,
      );

      if (res?.status === 200 || res?.status === 204) {
        setBranches((prev) => prev.filter((b) => b.id !== id));

        if (String(id) === selectedBranchId) setSelectedBranchId(null);

        toast.success("Branch permanently deleted");
      } else {
        toast.error("Hard delete failed");
      }
    } catch (e) {
      toast.error("Hard delete failed");
    }
  };

  // const handleDelete = async (id: number) => {
  //   try {
  //     const res = await apiClient.delete(
  //       `${apiClient.URLS.branches}/${id}`,
  //       true,
  //     );
  //     if (res) {
  //       setBranches((prev) => prev.filter((b) => b.id !== id));
  //       toast.success("Branch deleted successfully");
  //     }
  //   } catch (error) {
  //     console.error("Failed to delete branch", error);
  //     toast.error("Failed to delete branch");
  //   } finally {
  //     setOpenDeleteModal(false);
  //     setBranchToDelete(null);
  //   }
  // };

  const handleEditRole = (role: any) => {
    setEditingRole(role);
    setOpenRoleModal(true);
  };

  const handleDeleteRole = async (id: string) => {
    try {
      await apiClient.delete(`${apiClient.URLS.branchroles}/${id}`, true);
      toast.success("Role deleted successfully");
      if (selectedBranchId) {
        fetchBranchRoles(selectedBranchId);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete role");
    }
  };

  const handleEditUser = (data: any) => {
    const { user, membership } = data;
    setUserDetails({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      password: "",
      phone: user?.phone || "",
      states: user?.states || [],
      branchId: membership?.branchId || null,
      // branchRoleIds: membership?.branchRoleIds || [],
      branchRoleIds: membership.branchRoles.map((r) => r.id),
      userKind: membership?.kind || "CUSTOMER",
      isBranchHead: membership?.isBranchHead || false,
      isPrimary: membership?.isPrimary ?? true,
    });
    setSelectedUserId(user?.id || null);
    setEditMode(true);
    setOpenUserModal(true);
  };

  const promptDeleteUser = (id: number) => {
    setUserIdToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (!userIdToDelete) return;
    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.user}/${userIdToDelete}`,
        true,
      );
      if (res.status === 200 || res.status === 204) {
        toast.success("User deleted successfully");
        if (selectedBranchId) {
          fetchUsers(selectedBranchId);
        }
      } else {
        toast.error("Failed to delete user");
      }
    } catch (err) {
      toast.error("Error deleting user");
    } finally {
      setShowDeleteModal(false);
      setUserIdToDelete(null);
    }
  };
  const totalItems =
    activeTab === "users" ? filteredUsers.length : filteredRoles.length;

  const showPagination = totalItems > pageSize;

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="mx-auto md:p-4 p-3 md:space-y-6 space-y-4 w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 min-h-screen">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white rounded-[6px] shadow-sm border border-gray-200 p-2 md:p-3">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-500 rounded-[6px] shadow-lg">
            <Building2 className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              Branch & Role Management
            </h1>
            <p className="text-[10px] md:text-[12px] text-gray-600 font-medium mt-1">
              Manage your organization's structure and permissions
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canCreateBranch && (
            <Button
              onClick={() => {
                setEditingBranch(null);
                setOpenDrawer(true);
              }}
              className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white font-medium text-xs md:text-[12px] px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" /> Create Branch
            </Button>
          )}
        </div>
      </div>

      <BranchStatistics
        branches={branches}
        selectedBranch={selectedBranch}
        totalUsers={branchUsers.length}
        totalRoles={branchRoles.length}
        branchHasHead={branchHasHead}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-1">
          <div className="bg-white rounded-[6px] border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <h2 className="text-lg md:text-xl text-[#3586FF]  font-bold flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Branch Hierarchy
              </h2>
            </div>
            <div className="p-4 max-h-[600px] overflow-y-auto">
              <BranchNavigation
                branches={branches as any}
                selectedId={selectedBranchId || ""}
                onSelect={(id) => {
                  const selected = branches.find((b) => String(b.id) === id);
                  if (selected) {
                    setSelectedBranchId(id);
                    router.push(
                      {
                        pathname: router.pathname,
                        query: {
                          ...router.query,
                          selectedBranch: selected.name,
                        },
                      },
                      undefined,
                      { shallow: true },
                    );
                  }
                }}
                onEdit={handleEdit}
                // onDelete={(branch) => {
                //   setBranchToDelete(branch);
                //   setOpenDeleteModal(true);
                // }}
                onDelete={(branch: any) => {
                  setActionBranch(branch);

                  if (branch.action === "hard") {
                    setActionType("hard");
                    setOpenHardDeleteModal(true);
                    return;
                  }

                  if (branch.action === "restore") {
                    setActionType("restore");
                    setOpenActionModal(true);
                    return;
                  }

                  setActionType("soft");
                  setOpenActionModal(true);
                }}
              />
            </div>
          </div>
        </section>

        <section className="lg:col-span-2">
          <div className="bg-white rounded-[6px] border border-gray-200 shadow-sm px-4 py-2 mb-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              <div className="flex-1">
                <ReusableSearchFilter
                  searchText={query}
                  placeholder="Search by name, phone, email, or role..."
                  onSearchChange={setQuery}
                  className="py-[4px]"
                  filters={[]}
                  rootCls="!mb-0 md:mb-0"
                  selectedFilters={selectedFilters}
                  onFilterChange={setSelectedFilters}
                />
              </div>
              <ViewToggleIcons view={view} onChange={setView} />
            </div>
          </div>
          <div className="flex items-center justify-between mb-4 border-b border-gray-300 bg-white rounded-t-[6px] md:px-4 px-2 md:p-3 p-1">
            <div className="flex gap-2  px-4 pt-1">
              <Button
                className={`px-4 py-2 font-medium text-[10px] md:text-[12px] transition-all ${
                  activeTab === "users"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("users")}
              >
                <UsersIcon className="md:w-4 w-3 md:h-4 h-3 inline md:mr-2 mr-1" />
                Users ({paginatedUsers.length})
              </Button>
              <Button
                className={`px-4 py-2 font-medium text-[10px] md:text-[12px] transition-all ${
                  activeTab === "roles"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("roles")}
              >
                <ShieldCheck className="md:w-4 w-3 md:h-4 h-3 inline md:mr-2 mr-1" />
                Roles ({paginatedRoles.length})
              </Button>
            </div>
            {activeTab === "users" ? (
              <Button
                onClick={() => setOpenUserModal(true)}
                className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-600 hover:to-gray-700 text-white font-medium text-xs md:text-[12px] px-3 md:px-4 py-2 rounded-lg flex items-center md:gap-2 gap-1 flex-nowrap shadow-md hover:shadow-lg transition-all"
              >
                <UserPlus className="w-4 h-4" /> Create User
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (!selectedBranchId) {
                    toast.error("Please select a branch first");
                    return;
                  }
                  setOpenRoleModal(true);
                }}
                className="bg-gradient-to-r from-purple-300   to-purple-500 hover:from-yellow-600 hover:to-purple-700 text-white font-medium text-xs md:text-[12px] px-3 md:px-4 py-2 rounded-lg flex items-center md:gap-2 gap-1 flex-nowrap shadow-md hover:shadow-lg transition-all"
              >
                <ShieldCheck className="w-4 h-4" /> Create Role
              </Button>
            )}
          </div>

          {activeTab === "roles" ? (
            <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 rounded-[6px] border border-gray-200 shadow-sm p-4 md:p-6 min-h-[400px]">
              {loadingRoles ? (
                <div className="flex justify-center items-center py-10">
                  <Loader />
                </div>
              ) : !selectedBranch ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-[#3586FF] " />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    No Branch Selected
                  </h3>
                  <p className="text-[12px] text-gray-600 font-medium">
                    Please select a branch from the hierarchy to view its roles
                  </p>
                </div>
              ) : paginatedRoles.length > 0 ? (
                view === "cards" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                    {paginatedRoles.map((role: any) => (
                      <div
                        key={role.id}
                        className="relative group bg-white rounded-[6px] border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 p-4 md:p-5"
                      >
                        <div className="absolute inset-0 rounded-[6px] bg-gradient-to-br from-transparent via-purple-50/10 to-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-5 h-5 text-blue-600" />
                              <h3 className="text-base font-bold text-gray-900">
                                {role.roleName}
                              </h3>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-bold ${
                                role.isBranchHead
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {role.isBranchHead ? "HEAD" : "MEMBER"}
                            </span>
                          </div>

                          <div className="h-[1px] bg-gray-200 mb-4"></div>

                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => handleEditRole(role)}
                              className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-[12px] font-medium"
                            >
                              <Pencil className="w-4 h-4" /> Edit
                            </Button>
                            <Button
                              // onClick={() => handleDeleteRole(role.id)}
                              onClick={() => {
                                setRoleToDelete(role);
                                setShowDeleteRoleModal(true);
                              }}
                              className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-[12px] font-medium"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-[6px] border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left px-4 py-3 text-[12px] font-bold text-gray-700">
                            Role Name
                          </th>
                          <th className="text-center px-4 py-3 text-[12px] font-medium text-gray-600">
                            Type
                          </th>
                          <th className="text-right px-4 py-3 text-[12px] font-bold text-gray-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedRoles.map((role: any) => (
                          <tr
                            key={role.id}
                            className="border-b hover:bg-blue-50/30"
                          >
                            <td className="px-4 py-3 font-medium">
                              {role.roleName}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`text-xs px-3 py-1 rounded-full font-medium ${
                                  role.isBranchHead
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {role.isBranchHead ? "Branch Head" : "Member"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                <Button
                                  onClick={() => handleEditRole(role)}
                                  className="p-2 hover:bg-blue-50 rounded"
                                >
                                  <Pencil className="w-4 h-4 text-blue-600" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteRole(role.id)}
                                  className="p-2 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-blue-200">
                  <ShieldCheck className="w-10 h-10 mx-auto text-blue-400 mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    No Roles Found
                  </h3>
                  <p className="text-[12px] text-gray-600 font-medium">
                    Create new roles to assign responsibilities
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 rounded-[6px] border border-gray-200 shadow-sm p-4 md:p-6 min-h-[400px]">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader />
                </div>
              ) : !selectedBranch ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UsersIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    No Branch Selected
                  </h3>
                  <p className="text-[12px] text-gray-600 font-medium">
                    Please select a branch from the hierarchy to view its users
                  </p>
                </div>
              ) : paginatedUsers.length > 0 ? (
                view === "cards" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                    {paginatedUsers.map((item: any) => {
                      const { user, membership } = item;
                      const isBranchHead = membership.isBranchHead;

                      return (
                        <div
                          key={user.id}
                          className="relative group bg-white rounded-[6px] border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 p-4 md:p-5"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`relative ${
                                  isBranchHead
                                    ? "p-1 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full"
                                    : ""
                                }`}
                              >
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    isBranchHead ? "bg-white" : "bg-blue-100"
                                  }`}
                                >
                                  <User
                                    className={`w-5 h-5 ${
                                      isBranchHead
                                        ? "text-yellow-600"
                                        : "text-blue-600"
                                    }`}
                                  />
                                </div>
                                {isBranchHead && (
                                  <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" />
                                )}
                              </div>
                              <div>
                                <h3 className="text-base font-bold text-gray-900">
                                  {user.firstName} {user.lastName}
                                  <span
                                    className={`text-[10px] ml-2 md:text-[12px] px-2 py-1 rounded-[2px] font-medium ${
                                      isBranchHead
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {isBranchHead ? "HEAD" : "MEMBER"}
                                  </span>
                                </h3>
                                <p className="text-[12px] text-gray-600 font-medium">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2 flex flex-row items-center gap-2  mb-1">
                            <div className="flex items-center gap-2 text-[12px]">
                              <Phone className="w-3 h-3 text-blue-600" />
                              <span className="text-gray-600 text-[12px] font-medium">
                                {user.phone || "—"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[12px]">
                              <Tag className="w-3 h-3 text-green-600" />
                              <span className="text-gray-600 font-medium text-[12px]">
                                {membership.kind}
                              </span>
                            </div>
                          </div>
                          <div className="h-[1px] bg-gray-200"></div>
                          <div className="flex justify-end gap-2 mt-2">
                            <Button
                              onClick={() => handleEditUser(item)}
                              className="flex items-center border-gray-200 border-[1px] gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg text-[12px] font-medium"
                            >
                              <Pencil className="w-4 h-4" /> Edit
                            </Button>
                            <Button
                              onClick={() => promptDeleteUser(user.id)}
                              className="flex items-center gap-1 text-red-500 border-gray-200 border-[1px] hover:bg-red-50 px-3 py-1 rounded-lg text-[12px] font-medium"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-[6px] border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left px-4 py-3 text-[12px] font-bold text-gray-700">
                            User
                          </th>
                          <th className="text-left px-4 py-3 text-[12px] font-bold text-gray-700">
                            Contact
                          </th>
                          <th className="text-center px-4 py-3 text-[12px] font-bold text-gray-700">
                            Status
                          </th>
                          <th className="text-right px-4 py-3 text-[12px] font-bold text-gray-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedUsers.map((item: any) => {
                          const { user, membership } = item;
                          const isBranchHead = membership.isBranchHead;

                          return (
                            <tr
                              key={user.id}
                              className="border-b hover:bg-blue-50/30"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                      isBranchHead
                                        ? "bg-yellow-100"
                                        : "bg-blue-100"
                                    }`}
                                  >
                                    <User
                                      className={`w-5 h-5 ${
                                        isBranchHead
                                          ? "text-yellow-600"
                                          : "text-blue-600"
                                      }`}
                                    />
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900">
                                      {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-[12px] text-gray-600">
                                      {user.email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-[12px] text-gray-700">
                                {user.phone || "—"}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`text-xs px-3 py-1 rounded-full font-bold ${
                                    isBranchHead
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {isBranchHead ? "Branch Head" : "Member"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    onClick={() => handleEditUser(item)}
                                    className="p-2 hover:bg-blue-50 rounded"
                                  >
                                    <Pencil className="w-4 h-4 text-blue-600" />
                                  </Button>
                                  <Button
                                    onClick={() => promptDeleteUser(user.id)}
                                    className="p-2 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-blue-200">
                  <User className="w-10 h-10 mx-auto text-blue-400 mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    No Users Found
                  </h3>
                  <p className="text-[12px] text-gray-600 font-medium">
                    Add team members to manage branch operations
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="flex items-end justify-end">
            {showPagination && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={
                  activeTab === "users" ? totalUserPages : totalRolePages
                }
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            )}
          </div>
        </section>
      </div>
      {openDrawer && (
        <Drawer
          open={openDrawer}
          handleDrawerToggle={() => setOpenDrawer(false)}
          closeIconCls="!text-black z-[9999] mt-10"
          openVariant="right"
          title="Create Custom Builder"
          panelCls="w-[95%] lg:w-[calc(100%-400px)] shadow-xl"
          overLayCls="bg-black/40"
        >
          <CreateBranch
            setopenDrawer={setOpenDrawer}
            handleClose={() => setOpenDrawer(false)}
            branches={branches}
            mode={editingBranch ? "edit" : "create"}
            editingBranch={editingBranch}
            refetchBranches={fetchBranches}
          />
        </Drawer>
      )}

      <Modal
        isOpen={openModal}
        closeModal={() => {
          setOpenModal(false);
          setFormData({
            name: "",
            parentId: null,
            level: "ORG",
            isStateHQ: false,
          });
          setEditingBranch(null);
        }}
        title={editingBranch ? "Update Branch" : "Create Branch"}
        isCloseRequired={false}
        titleCls="font-bold uppercase text-lg text-center text-[#3586FF] "
        className="md:max-w-[600px] max-w-[90%]"
        rootCls="z-[99999]"
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <CustomInput
            label="Branch Name"
            name="name"
            type="text"
            labelCls="font-medium text-[12px] text-gray-700"
            className="md:px-3 px-1 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., OneCasa / Telangana / Madhapur"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />

          <SingleSelect
            type="single-select"
            label="Branch Level"
            labelCls="font-medium text-[12px] text-gray-700"
            name="level"
            options={[
              { id: "ORG", name: "ORG (Head Office)" },
              { id: "STATE", name: "STATE" },
              { id: "CITY", name: "CITY" },
              { id: "AREA", name: "AREA" },
              { id: "OFFICE", name: "OFFICE" },
            ]}
            rootCls="border-[1px] border-gray-100 rounded-lg"
            buttonCls="px-3 py-2"
            selectedOption={
              formData.level
                ? { id: formData.level, name: formData.level }
                : { id: "ORG", name: "ORG" }
            }
            optionsInterface={{ isObj: true, displayKey: "name" }}
            handleChange={(_name, value) =>
              setFormData((prev) => ({ ...prev, level: value?.id }))
            }
          />

          <SingleSelect
            type="single-select"
            label="Parent Branch"
            labelCls="font-medium text-[12px] text-gray-700"
            name="parentBranch"
            options={[
              { id: null, name: "— None (Root level) —" },
              ...(Array.isArray(branches) ? branches : []),
            ]}
            rootCls="border-[1px] border-gray-100 rounded-lg"
            buttonCls="px-3 py-2"
            selectedOption={
              branches.find((b) => b.id === formData.parentId) || {
                id: null,
                name: "— None (Root level) —",
              }
            }
            optionsInterface={{ isObj: true, displayKey: "name" }}
            handleChange={(_name, value) =>
              setFormData((prev) => ({
                ...prev,
                parentId: value?.id || null,
              }))
            }
          />

          {formData.level === "CITY" && (
            <CheckboxInput
              label="Is this a State HQ?"
              labelCls="font-medium text-[12px] text-gray-700"
              name="isStateHQ"
              className="w-4 h-4"
              checked={!!formData.isStateHQ}
              onChange={(checked) =>
                setFormData((prev) => ({ ...prev, isStateHQ: checked }))
              }
            />
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              className="px-5 md:py-1 border-2 label-text border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              onClick={() => {
                setOpenModal(false);
                setEditingBranch(null);
                setFormData({
                  name: "",
                  parentId: null,
                  level: "ORG",
                  isStateHQ: false,
                });
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-5 md:py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
              disabled={!formData.name.trim() || isLoading}
            >
              {isLoading
                ? "Saving..."
                : editingBranch
                  ? "Update Branch"
                  : "Create Branch"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Role Modal */}
      <Modal
        isOpen={openRoleModal}
        closeModal={() => {
          setOpenRoleModal(false);
          setEditingRole(null);
        }}
        title={editingRole ? "Edit Branch Role" : "Create Branch Role"}
        titleCls="font-bold uppercase text-lg text-center text-[#3586FF] "
        isCloseRequired={false}
        className="md:max-w-[900px] max-w-[95%]"
        rootCls="z-[99999]"
      >
        {selectedBranchId ? (
          <BranchRoleForm
            branchId={selectedBranchId}
            role={editingRole}
            onClose={() => {
              setOpenRoleModal(false);
              setEditingRole(null);
            }}
            branchHasHead={branchHasHead}
            onSuccess={() => {
              toast.success(
                editingRole
                  ? "Branch role updated successfully"
                  : "Branch role created successfully",
              );
              setOpenRoleModal(false);
              setEditingRole(null);
              fetchBranchRoles(selectedBranchId!);
            }}
          />
        ) : (
          <p className="text-center text-gray-600 p-8">
            Please select a branch first.
          </p>
        )}
      </Modal>

      {/* User Drawer */}
      {openUserModal && (
        <Drawer
          open={openUserModal}
          handleDrawerToggle={() => setOpenUserModal(false)}
          closeIconCls="text-gray-700"
          openVariant="right"
          panelCls="w-[95%] md:w-[80%] lg:w-[70%] shadow-2xl bg-white"
          overLayCls="bg-gray-900 bg-opacity-50"
        >
          {formSubmitting ? (
            <div className="fixed inset-0 z-[9999] bg-white bg-opacity-75 flex justify-center items-center">
              <Loader />
            </div>
          ) : (
            <UserDetailsView
              userDetails={userDetails}
              setUserDetails={setUserDetails}
              handleDrawerClose={handleDrawerClose}
              isEdit={editMode}
              userId={selectedUserId}
              onSuccess={() => {
                if (selectedBranchId) {
                  fetchUsers(selectedBranchId);
                }
                handleDrawerClose();
              }}
              formSubmitting={formSubmitting}
              setFormSubmitting={setFormSubmitting}
              branches={branches}
              selectedBranchId={selectedBranchId ? selectedBranchId : undefined}
              branchRoles={branchRoles}
              branchHasHead={branchHasHead}
            />
          )}
        </Drawer>
      )}
      <Modal
        isOpen={openHardDeleteModal}
        closeModal={() => {
          setOpenHardDeleteModal(false);
          setActionBranch(null);
          setActionType(null);
        }}
        className="md:max-w-[520px] max-w-[92%]"
        rootCls="flex items-center justify-center z-[99999]"
        isCloseRequired={false}
      >
        <div className="p-6">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-700 text-xl">🗑️</span>
          </div>

          <h3 className="text-lg md:text-xl font-medium text-center text-gray-900">
            Permanently delete branch?
          </h3>

          <p className="mt-2 text-center text-sm text-gray-600 font-medium">
            You’re about to permanently delete{" "}
            <b className="text-gray-900">{actionBranch?.name}</b>.
          </p>

          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium">
            This action cannot be undone. All users, roles, and related data
            linked to this branch may be permanently removed.
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <Button
              className="md:px-6  px-3 btn-text py-1.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              onClick={() => {
                setOpenHardDeleteModal(false);
                setActionBranch(null);
                setActionType(null);
              }}
            >
              Cancel
            </Button>

            <Button
              className="md:px-6 px-3 btn-text py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg font-medium"
              onClick={async () => {
                if (!actionBranch) return;
                await handleHardDelete(actionBranch.id);

                setOpenHardDeleteModal(false);
                setActionBranch(null);
                setActionType(null);
              }}
            >
              Delete Forever
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={openActionModal}
        closeModal={() => {
          setOpenActionModal(false);
          setActionBranch(null);
          setActionType(null);
        }}
        className="md:max-w-[520px] max-w-[92%]"
        rootCls="flex items-center justify-center z-[99999]"
        isCloseRequired={false}
      >
        <div className="bg-white rounded-xl overflow-hidden">
          {/* Top Gradient Bar */}
          <div
            className={`h-2 w-full ${
              actionType === "restore"
                ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                : "bg-gradient-to-r from-rose-500 to-red-500"
            }`}
          />

          <div className="md:p-6 p-3">
            {/* Icon */}
            <div className="flex justify-center md:mb-4 mb-2">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${
                  actionType === "restore"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                <span className="md:text-[18px] text-[14px] font-bold ">
                  {actionType === "restore" ? "♻️" : "⚠️"}
                </span>
              </div>
            </div>

            {/* Title */}
            <h3 className="md:text-[16px] text-[12px] font-bold text-center  mb-3">
              {actionType === "restore"
                ? "Restore Branch"
                : "Deactivate Branch"}
            </h3>

            {/* Description */}
            <p className="text-center leading-relaxed md:mb-4 mb-2 font-medium">
              {actionType === "restore" ? (
                <>
                  Are you sure you want to restore{" "}
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                    {actionBranch?.name}
                  </span>
                  ? This branch will become active again.
                </>
              ) : (
                <>
                  Are you sure you want to deactivate{" "}
                  <span className="font-semibold text-red-700 bg-red-50 px-2 py-1 rounded-md">
                    {actionBranch?.name}
                  </span>
                  ? It will be hidden from active operations.
                </>
              )}
            </p>

            {/* Warning Box */}
            {actionType !== "restore" && (
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-100">
                <p className="text-sm text-red-700 font-medium mb-1">
                  ⚠️ Important Note
                </p>
                <p className="text-sm text-red-600">
                  Users and roles under this branch may not function properly
                  until it is restored. You can restore it later from the
                  archived section.
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              {/* Cancel */}
              <Button
                className="flex-1 md:px-6 px-3 btn-text py-3.5 rounded-xl border border-gray-300  font-medium
          hover:bg-gray-50 hover:border-gray-400 transition-all active:scale-[0.98]"
                onClick={() => {
                  setOpenActionModal(false);
                  setActionBranch(null);
                  setActionType(null);
                }}
              >
                Cancel
              </Button>

              {/* Confirm */}
              <Button
                className={`flex-1 md:px-6 px-3 btn-text  py-3.5 rounded-xl font-medium text-white transition-all
          hover:shadow-lg active:scale-[0.98] ${
            actionType === "restore"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
              : "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
          }`}
                onClick={async () => {
                  if (!actionBranch || !actionType) return;

                  if (actionType === "restore")
                    await handleRestore(actionBranch.id);
                  if (actionType === "soft")
                    await handleDelete(actionBranch.id);

                  setOpenActionModal(false);
                  setActionBranch(null);
                  setActionType(null);
                }}
              >
                {actionType === "restore"
                  ? "Confirm Restore"
                  : "Deactivate Branch"}
              </Button>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-400 mt-6 pt-6 border-t border-gray-100">
              This action can be reversed at any time
            </p>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={showDeleteRoleModal}
        closeModal={() => setShowDeleteRoleModal(false)}
        title=""
        className="md:max-w-[500px] max-w-[90%]"
        rootCls="flex items-center justify-center z-[9999]"
        isCloseRequired={false}
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Confirm Role Deletion
          </h3>

          <p className="text-[12px] max-w-[300px] mx-auto text-gray-600 mb-6 text-center">
            Are you sure you want to delete the role{" "}
            <span className="font-bold">{roleToDelete?.roleName}</span>? This
            action cannot be undone.
          </p>

          <div className="flex justify-center gap-3">
            {/* Cancel */}
            <Button
              className="px-6 py-1 border-2 border-gray-300 rounded-lg text-gray-700 font-medium"
              onClick={() => {
                setShowDeleteRoleModal(false);
                setRoleToDelete(null);
              }}
            >
              Cancel
            </Button>

            {/* Confirm Delete */}
            <Button
              className="px-6 py-1 bg-red-500 text-white rounded-lg font-medium hover:bg-red-700"
              onClick={async () => {
                if (!roleToDelete) return;

                await handleDeleteRole(roleToDelete.id);

                setShowDeleteRoleModal(false);
                setRoleToDelete(null);
              }}
            >
              Delete Role
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Branch Modal */}
      <Modal
        isOpen={openDeleteModal}
        closeModal={() => setOpenDeleteModal(false)}
        title=""
        className="md:max-w-[500px] max-w-[90%]"
        rootCls="flex items-center justify-center z-[9999]"
        isCloseRequired={false}
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Confirm Deletion
          </h3>
          <p className="text-[12px] md:text-[14px] text-gray-600 mb-6 text-center">
            Are you sure you want to delete the branch{" "}
            <strong className="text-gray-900">{branchToDelete?.name}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex justify-center gap-3">
            <Button
              className="px-6 py-1 border-2 border-gray-300 rounded-[4px] label-text text-gray-700 font-medium hover:bg-gray-50"
              onClick={() => setOpenDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="px-6 py-1 bg-red-500 text-white rounded-[4px] label-text font-medium hover:bg-red-700"
              onClick={() => branchToDelete && handleDelete(branchToDelete.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={showDeleteModal}
        closeModal={() => setShowDeleteModal(false)}
        title=""
        className="md:max-w-[500px] max-w-[90%]"
        rootCls="flex items-center justify-center z-[9999]"
        isCloseRequired={false}
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Confirm User Deletion
          </h3>
          <p className="text-[12px] max-w-[300px] mx-auto text-gray-600 mb-6 text-center">
            Do you really want to delete this user? This action cannot be
            undone.
          </p>
          <div className="flex justify-center gap-3">
            <Button
              className="px-6 py-1 border-2 border-gray-300 rounded-lg label-text text-gray-700 font-medium hover:bg-gray-50"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="px-6 py-1 bg-red-500 text-white rounded-lg label-text font-medium hover:bg-red-700"
              onClick={handleDeleteUser}
            >
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
