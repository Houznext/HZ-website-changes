"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import apiClient from "@/src/utils/apiClient";
import Loader from "@/src/common/Loader";
import Button from "@/src/common/Button";
import toast from "react-hot-toast";
import Drawer from "@/src/common/Drawer";
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Shield,
  Pencil,
} from "lucide-react";
import CustomInput from "@/src/common/FormElements/CustomInput";
import MultiCheckbox from "@/src/common/FormElements/MultiCheckbox";
import { indianStateOptions } from "@/src/stores/custom-builder";

type AdminUserItem = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    states?: string[];
  };
  membership: {
    branchId: string;
    branchRoles: { id: string; roleName: string }[];
    kind: string;
  };
};

type BranchRole = { id: string; roleName: string; branch?: { id: string } };

const defaultUserDetails = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  states: [] as string[],
};

export default function AdminUsersSection() {
  const { data: session } = useSession();
  const membership = (session?.user as any)?.branchMemberships?.[0];
  const branchId = membership?.branchId ?? null;

  const [adminUsers, setAdminUsers] = useState<AdminUserItem[]>([]);
  const [branchRoles, setBranchRoles] = useState<BranchRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [userDetails, setUserDetails] = useState(defaultUserDetails);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  useEffect(() => {
    if (!branchId) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, rolesRes] = await Promise.all([
          apiClient.get(
            `${apiClient.URLS.user}/by-branch/${branchId}/admin-users`,
            {},
            true
          ),
          apiClient.get(
            `${apiClient.URLS.branchroles}?branchId=${branchId}`,
            {},
            true
          ),
        ]);
        setAdminUsers(usersRes?.body ?? []);
        setBranchRoles(rolesRes?.body ?? []);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load admin users");
        setAdminUsers([]);
        setBranchRoles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [branchId]);

  const openCreate = () => {
    setEditingUser(null);
    setUserDetails(defaultUserDetails);
    setSelectedRoleIds([]);
    setDrawerOpen(true);
  };

  const openEdit = (item: AdminUserItem) => {
    setEditingUser(item);
    setUserDetails({
      firstName: item.user.firstName ?? "",
      lastName: item.user.lastName ?? "",
      email: item.user.email ?? "",
      password: "",
      phone: item.user.phone ?? "",
      states: (item.user.states as string[]) ?? [],
    });
    setSelectedRoleIds(
      item.membership.branchRoles?.map((r) => r.id) ?? []
    );
    setDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId) {
      toast.error("No branch context");
      return;
    }
    if (!userDetails.firstName?.trim() || !userDetails.lastName?.trim()) {
      toast.error("First name and last name are required");
      return;
    }
    if (!userDetails.email?.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!editingUser && !userDetails.password) {
      toast.error("Password is required for new users");
      return;
    }
    if (selectedRoleIds.length === 0) {
      toast.error("Select at least one role");
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingUser) {
        const res = await apiClient.patch(
          `${apiClient.URLS.user}/admin/update-with-branch/${editingUser.user.id}`,
          {
            user: {
              firstName: userDetails.firstName,
              lastName: userDetails.lastName,
              email: userDetails.email,
              phone: userDetails.phone,
              states: userDetails.states,
              ...(userDetails.password
                ? { password: userDetails.password }
                : {}),
            },
            membership: {
              branchId,
              branchRoleIds: selectedRoleIds,
              kind: "STAFF",
              isPrimary: true,
            },
          },
          true
        );
        if (res?.status === 200) {
          toast.success("User updated");
          setDrawerOpen(false);
          const [usersRes] = await Promise.all([
            apiClient.get(
              `${apiClient.URLS.user}/by-branch/${branchId}/admin-users`,
              {},
              true
            ),
          ]);
          setAdminUsers(usersRes?.body ?? []);
        }
      } else {
        const res = await apiClient.post(
          `${apiClient.URLS.user}/admin/create-with-branch`,
          {
            user: {
              firstName: userDetails.firstName,
              lastName: userDetails.lastName,
              email: userDetails.email,
              password: userDetails.password,
              phone: userDetails.phone,
              states: userDetails.states,
            },
            membership: {
              branchId,
              branchRoleIds: selectedRoleIds,
              kind: "STAFF",
              isPrimary: true,
            },
          },
          true
        );
        if (res?.status === 201) {
          toast.success("User created");
          setDrawerOpen(false);
          const [usersRes] = await Promise.all([
            apiClient.get(
              `${apiClient.URLS.user}/by-branch/${branchId}/admin-users`,
              {},
              true
            ),
          ]);
          setAdminUsers(usersRes?.body ?? []);
        }
      }
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.body?.message || err?.message || "Request failed";
      toast.error(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  if (!branchId) {
    return (
      <div className="mb-6 rounded-[12px] border border-[rgba(0,0,0,0.08)] bg-white p-6">
        <p className="text-[13px] text-[#6B7280]">
          You need a branch assignment to create or manage admin users. Contact
          your administrator.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mb-6 rounded-[12px] border border-[rgba(0,0,0,0.08)] bg-white p-8 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 rounded-[12px] border border-[rgba(0,0,0,0.08)] bg-white overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-[rgba(0,0,0,0.06)] bg-[#F9FAFB]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[8px] bg-[#E6F1FB] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#0C447C]" />
            </div>
            <div>
              <h2 className="text-[15px] font-medium text-[#111827]">
                Admin Users & Access
              </h2>
              <p className="text-[12px] text-[#6B7280]">
                Create users and assign roles/permissions
              </p>
            </div>
          </div>
          <Button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-[7px] rounded-[8px] bg-[#1D4E7A] hover:bg-[#16375a] text-white text-[13px] font-medium transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Create User
          </Button>
        </div>
        <div className="p-4">
          {adminUsers.length === 0 ? (
            <div className="py-10 text-center text-[#6B7280] text-[13px]">
              No admin users in your branch yet. Click &quot;Create User&quot; to add one.
            </div>
          ) : (
            <div className="space-y-2">
              {adminUsers.map((item) => (
                <div
                  key={item.user.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-[rgba(0,0,0,0.06)] p-3 hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-[8px] bg-[#E6F1FB] flex items-center justify-center text-[#0C447C] font-semibold text-sm shrink-0">
                      {(item.user.firstName?.[0] || "") +
                        (item.user.lastName?.[0] || "")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-[#111827] truncate">
                        {item.user.firstName} {item.user.lastName}
                      </p>
                      <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.user.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.membership.branchRoles?.map((r) => (
                      <span
                        key={r.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-[#E6F1FB] text-[#0C447C] text-[11px] font-medium"
                      >
                        <Shield className="w-3 h-3" />
                        {r.roleName}
                      </span>
                    ))}
                    <Button
                      onClick={() => openEdit(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[#1D4E7A] text-[#1D4E7A] bg-white hover:bg-[#E6F1FB] text-[12px] font-medium transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        handleDrawerToggle={() => setDrawerOpen(false)}
        closeIconCls="text-[#111827]"
        openVariant="right"
        panelCls="w-full max-w-md shadow-xl"
        overLayCls="bg-black/40"
      >
        <div className="p-6">
          <h3 className="text-[17px] font-medium text-[#1A1A1A] mb-4">
            {editingUser ? "Edit User & Roles" : "Create User"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <CustomInput
              label="First Name"
              value={userDetails.firstName}
              onChange={(e) =>
                setUserDetails((p) => ({ ...p, firstName: e.target.value }))
              }
              required
              placeholder="First name"
              className="rounded-[8px] border-[rgba(0,0,0,0.12)]"
            />
            <CustomInput
              label="Last Name"
              value={userDetails.lastName}
              onChange={(e) =>
                setUserDetails((p) => ({ ...p, lastName: e.target.value }))
              }
              required
              placeholder="Last name"
              className="rounded-[8px] border-[rgba(0,0,0,0.12)]"
            />
            <CustomInput
              label="Email"
              type="email"
              value={userDetails.email}
              onChange={(e) =>
                setUserDetails((p) => ({ ...p, email: e.target.value }))
              }
              required
              placeholder="email@example.com"
              className="rounded-[8px] border-[rgba(0,0,0,0.12)]"
              disabled={!!editingUser}
            />
            {!editingUser && (
              <CustomInput
                label="Password"
                type="password"
                value={userDetails.password}
                onChange={(e) =>
                  setUserDetails((p) => ({ ...p, password: e.target.value }))
                }
                required
                placeholder="Min 8 characters"
                className="rounded-[8px] border-[rgba(0,0,0,0.12)]"
              />
            )}
            {editingUser && (
              <CustomInput
                label="New Password (leave blank to keep)"
                type="password"
                value={userDetails.password}
                onChange={(e) =>
                  setUserDetails((p) => ({ ...p, password: e.target.value }))
                }
                placeholder="Optional"
                className="rounded-[8px] border-[rgba(0,0,0,0.12)]"
              />
            )}
            <CustomInput
              label="Phone"
              value={userDetails.phone}
              onChange={(e) =>
                setUserDetails((p) => ({ ...p, phone: e.target.value }))
              }
              placeholder="10-digit mobile"
              className="rounded-[8px] border-[rgba(0,0,0,0.12)]"
            />
            <MultiCheckbox
              label="Assign States"
              options={indianStateOptions}
              selectedValues={userDetails.states}
              onChange={(selectedStates) =>
                setUserDetails((p) => ({ ...p, states: selectedStates }))
              }
              ClassName="border-[rgba(0,0,0,0.12)]"
            />
            <div>
              <label className="block text-[12px] font-medium text-[#6B7280] mb-2">
                Roles (access)
              </label>
              <div className="flex flex-wrap gap-2">
                {branchRoles.map((role) => (
                  <label
                    key={role.id}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-[8px] border border-[rgba(0,0,0,0.12)] cursor-pointer hover:bg-[#F9FAFB]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoleIds.includes(role.id)}
                      onChange={(e) =>
                        setSelectedRoleIds((prev) =>
                          e.target.checked
                            ? [...prev, role.id]
                            : prev.filter((id) => id !== role.id)
                        )
                      }
                      className="rounded text-[#1D4E7A]"
                    />
                    <span className="text-[13px] text-[#111827]">
                      {role.roleName}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex-1 py-2 rounded-[8px] border border-[#1D4E7A] text-[#1D4E7A] bg-white hover:bg-[#E6F1FB] text-[13px] font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formSubmitting}
                className="flex-1 py-2 rounded-[8px] bg-[#1D4E7A] hover:bg-[#16375a] text-white text-[13px] font-medium disabled:opacity-60"
              >
                {formSubmitting
                  ? "Saving..."
                  : editingUser
                    ? "Update"
                    : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </Drawer>
    </>
  );
}
