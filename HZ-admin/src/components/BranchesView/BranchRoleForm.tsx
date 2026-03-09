"use client";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import apiClient from "@/src/utils/apiClient";
import Button from "@/src/common/Button";
import SearchComponent from "@/src/common/SearchSelect";
import CheckboxInput from "@/src/common/FormElements/CheckBoxInput";
import { PERMISSION_RESOURCES } from "@/src/utils/permissions";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

export enum UserRole {
  SUPER_ADMIN = "SuperAdmin",
  BRANCH_MANAGER = "BranchManager",
  FURNITURE_ADMIN = "FurnitureAdmin",
  CUSTOM_BUILDER_ADMIN = "CustomBuilderAdmin",
  INTERIORS_ADMIN = "InteriorsAdmin",
  PROPERTY_LISTING_ADMIN = "PropertyListingAdmin",
  ELECTRONICS_ADMIN = "ElectronicsAdmin",
  SOLAR_ADMIN = "SolarAdmin",
  LEGAL_ADMIN = "LegalAdmin",
  HOME_DECOR_ADMIN = "HomeDecorAdmin",
  DEFAULT_USER = "DefaultUser",
  CUSTOM_BUILDER_USER = "CustomBuilderUser",
  TELECALLER = "Telecaller",
  SALES_MANGER = "SalesManager",
  COMPANY_PROJECT_SELLER = "CompanyProjectSeller",
  COMPANY_DEVELOPER = "CompanyDeveloper",
  CUSTOM_BUILDER_SUPERVISOR = "CustomBuilderSupervisor",
  CUSTOM_BUILDER_MANAGER = "CustomBuilderManager",
  CONTENT_WRITER = "ContentWriter",
  HR_MANAGER = "HRManager",
  DELIVERY_MANAGER = "DeliveryManager",
  SERVICE_AGENT = "ServiceAgent",
}

interface Permission {
  resource: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

interface BranchRoleFormProps {
  branchId: string;
  role?: any;
  onClose: () => void;
  onSuccess?: () => void;
  branchHasHead?: boolean;
}

export type BranchCategory =
  | "ORGANIZATION"
  | "GENERAL"
  | "CUSTOM_BUILDER"
  | "INTERIORS"
  | "INTERIORS_AND_CONSTRUCTION"
  | "LEGAL"
  | "HOME_DECOR"
  | "FURNITURE"
  | "ELECTRONICS"
  | "SERVICES"
  | "SOLAR"
  | "PAINTING"
  | "PLUMBING"
  | "VASTU"
  | "PROPERTY_LISTING";

const COMMON_BRANCH_RESOURCES = ["crm", "chat", "hr", "attendance"] as const;

export const CATEGORY_RESOURCE_WHITELIST: Record<BranchCategory, readonly string[]> = {
  ORGANIZATION: PERMISSION_RESOURCES,
  GENERAL: PERMISSION_RESOURCES,
  CUSTOM_BUILDER: [
    ...COMMON_BRANCH_RESOURCES,
    "custom_builder", "cost_estimator", "invoice_estimator",
    "phase", "materials", "cb_document", "payment_tracking", "daily_progress",
  ],
  INTERIORS: [
    ...COMMON_BRANCH_RESOURCES,
    "cost_estimator", "interior_service", "invoice_estimator",
  ],
  INTERIORS_AND_CONSTRUCTION: [
    ...COMMON_BRANCH_RESOURCES,
    "custom_builder", "cost_estimator", "interior_service", "invoice_estimator",
    "phase", "materials", "cb_document", "payment_tracking",
  ],
  LEGAL: [
    ...COMMON_BRANCH_RESOURCES,
    "legal_service", "property", "orders", "invoice_estimator",
  ],
  FURNITURE: [
    ...COMMON_BRANCH_RESOURCES,
    "furniture", "furniture_leads", "orders", "shipping", "delivery", "invoice_estimator",
  ],
  ELECTRONICS: [
    ...COMMON_BRANCH_RESOURCES,
    "electronics", "orders", "shipping", "delivery",
  ],
  HOME_DECOR: [
    ...COMMON_BRANCH_RESOURCES,
    "home_decors", "orders", "shipping", "delivery",
  ],
  SERVICES: [
    ...COMMON_BRANCH_RESOURCES,
    "cost_estimator", "servicecustomlead", "orders",
  ],
  SOLAR: [
    ...COMMON_BRANCH_RESOURCES,
    "solar", "servicecustomlead", "orders",
  ],
  PAINTING: [
    ...COMMON_BRANCH_RESOURCES,
    "custom_builder", "orders",
  ],
  PLUMBING: [
    ...COMMON_BRANCH_RESOURCES,
    "custom_builder", "orders",
  ],
  VASTU: [...COMMON_BRANCH_RESOURCES],
  PROPERTY_LISTING: [
    ...COMMON_BRANCH_RESOURCES,
    "property", "property_lead", "premium_plans",
  ],
};

export default function BranchRoleForm({
  branchId,
  role,
  onClose,
  onSuccess,
  branchHasHead,
}: BranchRoleFormProps) {
  const [formData, setFormData] = useState({
    roleName: "",
    isBranchHead: false,
    permissions: [] as Permission[],
    seedDefaultPermissions: true,
  });

  const [newResource, setNewResource] = useState<Permission>({
    resource: "",
    view: true,
    create: true,
    edit: true,
    delete: true,
  });

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [branchCategory, setBranchCategory] =
    useState<BranchCategory>("GENERAL");
  const [branchCategoryLoading, setBranchCategoryLoading] = useState(false);
  useEffect(() => {
    if (!branchId) return;

    const fetchBranchCategory = async () => {
      try {
        setBranchCategoryLoading(true);

        const res = await apiClient.get(
          `${apiClient.URLS.branches}/${branchId}`,
          {},
          true
        );

        const cat = res.body?.category as BranchCategory | null;

        setBranchCategory(cat || "GENERAL");
      } catch (error) {
        console.error("Error fetching branch category:", error);

        setBranchCategory("GENERAL");
      } finally {
        setBranchCategoryLoading(false);
      }
    };

    fetchBranchCategory();
  }, [branchId]);

  useEffect(() => {
    if (role) {
      setFormData({
        roleName: role.roleName || "",
        isBranchHead: role.isBranchHead || false,
        permissions: role.permissions || [],
        seedDefaultPermissions:
          role.seedDefaultPermissions !== undefined
            ? role.seedDefaultPermissions
            : true,
      });
    }
  }, [role]);

  const effectivePermissionResources = useMemo(() => {
    const whitelist = CATEGORY_RESOURCE_WHITELIST[branchCategory];
    if (!whitelist || whitelist === PERMISSION_RESOURCES) {
      return [...PERMISSION_RESOURCES];
    }
    return PERMISSION_RESOURCES.filter((r) => whitelist.includes(r));
  }, [branchCategory]);

  const filteredResources = useMemo(() => {
    const added = formData.permissions.map((p) => p.resource);
    const list = effectivePermissionResources.filter(
      (r) => !added.includes(r) || r === newResource.resource
    );

    return list;
  }, [
    formData.permissions,
    newResource.resource,
    effectivePermissionResources,
    branchCategory,
  ]);

  const formatResourceName = (r: string) =>
    r.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const handleChange = ({
    name,
    checked,
  }: {
    name: keyof Permission;
    checked: boolean;
  }) => {
    setNewResource((prev) => ({ ...prev, [name]: checked }));
  };

  const handleResourceChange = (
    value: string | { label: string; value: string }
  ) => {
    const resourceValue = typeof value === "string" ? value : value?.value;
    setNewResource((prev) => ({ ...prev, resource: resourceValue }));
  };
const handleAddOrUpdateResource = () => {
  if (!newResource.resource) {
    toast.error("Please select a resource");
    return;
  }

  setFormData((prev) => {
    const existingIndex = prev.permissions.findIndex(
      (p) => p.resource === newResource.resource
    );

    // 🚫 BLOCK duplicate resource
    if (existingIndex !== -1 && editIndex === null) {
      toast.error("Permission for this resource already exists");
      return prev; // 👈 STOP here, do NOT add
    }

    // ✏️ EDIT existing permission
    if (editIndex !== null) {
      const updated = [...prev.permissions];
      updated[editIndex] = newResource;

      toast.success("Permission updated successfully");
      return { ...prev, permissions: updated };
    }

    // ➕ ADD new permission
    toast.success("Permission added successfully");
    return {
      ...prev,
      permissions: [...prev.permissions, newResource],
    };
  });

  // reset state
  setEditIndex(null);
  setNewResource({
    resource: "",
    view: false,
    create: false,
    edit: false,
    delete: false,
  });
};

  // const handleAddOrUpdateResource = () => {
  //   if (!newResource.resource) {
  //     toast.error("Please select a resource");
  //     return;
  //   }

  //   if (editIndex !== null) {
  //     const updated = [...formData.permissions];
  //     updated[editIndex] = newResource;
  //     setFormData((prev) => ({ ...prev, permissions: updated }));
  //     setEditIndex(null);
  //     toast.success("Permission updated successfully");
  //   } else {
  //     setFormData((prev) => ({
  //       ...prev,
  //       permissions: [...prev.permissions, newResource],
  //     }));
  //     toast.success("Permission added successfully");
  //   }

  //   setNewResource({
  //     resource: "",
  //     create: false,
  //     delete: false,
  //     edit: false,
  //     view: false,
  //   });
  // };

  const handleEditPermission = (index: number) => {
    setEditIndex(index);
    setNewResource(formData.permissions[index]);
  };

  const handleRemovePermission = async (index: number) => {
    const permToRemove = formData.permissions[index];

    if (!role?.id) {
      const updated = [...formData.permissions];
      updated.splice(index, 1);
      setFormData((prev) => ({ ...prev, permissions: updated }));
      return;
    }

    try {
      // await apiClient.delete(
      //   `${apiClient.URLS.branchroles}/${role.id}/permissions/${permToRemove.resource}`
      // );
      await apiClient.delete(
  `${apiClient.URLS.branchroles}/${role.id}/permissions/${encodeURIComponent(
    permToRemove.resource
  )}`
);

      toast.success(
        `Permission "${permToRemove.resource}" deleted successfully`
      );
      const updated = [...formData.permissions];
      updated.splice(index, 1);
      setFormData((prev) => ({ ...prev, permissions: updated }));
    } catch (error) {
      console.error("Failed to delete permission:", error);
      toast.error("Failed to delete permission");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    const payload = {
      branchId,
      roleName: formData.roleName.trim(),
      isBranchHead: formData.isBranchHead,
      permissions: formData.permissions,
      seedDefaultPermissions: formData.seedDefaultPermissions,
    };

    try {
      setLoading(true);
      let res;

      if (role?.id) {
        await apiClient.patch(`${apiClient.URLS.branchroles}/${role.id}`, {
          roleName: formData.roleName,
          isBranchHead: formData.isBranchHead,
          seedDefaultPermissions: formData.seedDefaultPermissions,
        });

        res = await apiClient.patch(
          `${apiClient.URLS.branchroles}/${role.id}/permissions`,
          { permissions: formData.permissions },
          true
        );
      } else {
        res = await apiClient.post(apiClient.URLS.branchroles, payload, true);
      }

      if (res.status === 200 || res.status === 201) {
        toast.success(
          role?.id
            ? "Branch role updated successfully"
            : "Branch role created successfully"
        );
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error("Error saving branch role:", err);
      toast.error("Failed to save branch role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:p-6 p-2 bg-white rounded-lg shadow-md w-full max-w-full">
      <form onSubmit={handleSubmit} className="md:space-y-4 space-y-2">
        <div className="flex flex-col gap-y-[4px] w-full max-w-full  px-0">
          <SingleSelect
            type="single-select"
            name="roleName"
            label="Role Name"
            labelCls="label-text"
            optionsInterface={{ isObj: false }}
            options={Object.values(UserRole)}
            selectedOption={formData.roleName}
            handleChange={(name, value) =>
              setFormData({ ...formData, [name]: value })
            }
            optionCls="font-medium text-[12px] md:text-[12px]"
            selectedOptionCls="font-medium text-[12px] md:text-[14px]"
            buttonCls="w-full px-2 py-2 border border-gray-300 rounded-md"
            rootCls="w-full"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 grid-cols-1 md:gap-6 gap-2">
          {(!branchHasHead || formData.isBranchHead) && (
            <CheckboxInput
              label="Is Branch Head?"
              labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
              name="isBranchHead"
              className="md:w-3 w-2 md:h-[15px] !h-3 px-2 text-center"
              checked={!!formData.isBranchHead}
              onChange={(checked) =>
                setFormData((prev) => ({ ...prev, isBranchHead: checked }))
              }
            />
          )}

          <CheckboxInput
            label="Use Default Permissions?"
            labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
            name="seedDefaultPermissions"
            className="md:w-3 w-2 md:h-[15px] !h-3 px-2 text-center"
            checked={!!formData.seedDefaultPermissions}
            onChange={(checked) =>
              setFormData((prev) => ({
                ...prev,
                seedDefaultPermissions: checked,
              }))
            }
          />
        </div>

        <div className="flex flex-col max-h-[600px] h-[300px] justify-between border md:p-3 p-2 rounded-md">
          <div>
            <p className="md:text-[16px] text-[12px] text-[#3586FF] font-bold mb-2">
              {editIndex !== null
                ? "Edit Resource Permission"
                : "Add Resource Permission"}
            </p>
            <SearchComponent
              label="Select Resource"
              labelCls="label-text md:text-[14px] text-[12px] text-black font-medium"
              inputClassName="text-[11px] font-regular py-[0px] "
              placeholder="Search resource..."
              value={newResource.resource}
              options={filteredResources.map((r) => ({
                label: formatResourceName(r),
                value: r,
              }))}
              onChange={handleResourceChange}
              rootClassName="w-full py-[4px]"
              // required
            />
          </div>

          <div className="md:py-[6px] py-1">
            <p className="md:mb-3 mb-2 font-medium label-text">
              Select Required Permissions
            </p>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
              {["view", "create", "edit", "delete"].map((perm) => (
                <CheckboxInput
                  key={perm}
                  className="mr-1 rounded-sm md:h-[14px] h-[10px] w-[10px] md:w-[14px]"
                  name={perm}
                  checked={Boolean(newResource[perm as keyof Permission])}
                  onChange={(checked: boolean) =>
                    handleChange({ name: perm as keyof Permission, checked })
                  }
                  label={perm.charAt(0).toUpperCase() + perm.slice(1)}
                  labelCls="font-medium label-text leading-[22.8px] text-gray-600"
                />
              ))}
            </div>
          </div>

          <div className="flex justify-between w-full">
            <Button
              className="border-[#5297FF] border-[2px] btn-text  py-[3px] md:px-[20px] mt-3 px-[12px] rounded-[6px] font-medium"
              onClick={() => {
                setEditIndex(null);
                setNewResource({
                  resource: "",
                  create: false,
                  delete: false,
                  edit: false,
                  view: false,
                });
              }}
              type="button"
            >
              Cancel
            </Button>
            <Button
              className="bg-[#5297FF] btn-text  py-[3px] md:px-[20px] mt-3 px-[12px] rounded-[6px] text-white font-medium"
              type="button"
              onClick={handleAddOrUpdateResource}
            >
              {editIndex !== null ? "Update Permission" : "Save Resource"}
            </Button>
          </div>
        </div>

        <div className="md:mt-4 mt-2">
          {formData.permissions.length === 0 ? (
            <p className="text-gray-600 font-medium md:text-sm text-[12px] text-center">
              No permissions added yet.
            </p>
          ) : (
            <div className="overflow-x-auto border rounded-md shadow-sm">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left md:py-[6px] py-1 md:px-6 px-3 md:text-sm text-[12px] font-medium text-gray-600">
                      Resource
                    </th>
                    <th className="text-center md:py-[6px] py-1 md:px-6 px-3 text-[12px] font-medium text-gray-600">
                      Create
                    </th>
                    <th className="text-center md:py-[6px] py-1 md:px-6 px-3 text-[12px] font-medium text-gray-600">
                      Read
                    </th>
                    <th className="text-center md:py-[6px] py-1 md:px-6 px-3 text-[12px] font-medium text-gray-600">
                      Update
                    </th>
                    <th className="text-center md:py-[6px] py-1 md:px-6 px-3 text-[12px] font-medium text-gray-600">
                      Delete
                    </th>
                    <th className="text-center md:py-[6px] py-1 md:px-6 px-3 text-[12px] font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formData.permissions.map((perm, idx) => (
                    <tr
                      key={idx}
                      className="border-t hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-2 px-4 text-left font-medium text-[#3586FF]  text-[10px] md:text-[12px]">
                        {formatResourceName(perm.resource)}
                      </td>
                      {["create", "view", "edit", "delete"].map((action) => (
                        <td
                          key={`${perm.resource}-${action}`}
                          className="py-[10px] px-4 text-center"
                        >
                          <Button
                            onClick={() => {
                              const updated = [...formData.permissions];
                              updated[idx] = {
                                ...updated[idx],
                                [action]:
                                  !updated[idx][action as keyof Permission],
                              };
                              setFormData((prev) => ({
                                ...prev,
                                permissions: updated,
                              }));
                            }}
                            className={`md:w-5 w-3 md:h-5 h-3 rounded-full transition-colors ${perm[action as keyof Permission]
                              ? "text-green-500"
                              : "text-red-500"
                              }`}
                          >
                            {perm[action as keyof Permission] ? "✓" : "✕"}
                          </Button>
                        </td>
                      ))}
                      <td className="py-2 px-4 text-center">
                        <div className="flex justify-center gap-3">
                          <Button
                            type="button"
                            onClick={() => handleEditPermission(idx)}
                            className="text-[#3586FF]   font-medium text-[12px] md:text-[14px]"
                            title="Edit"
                          >
                            <FiEdit2 className="md:w-4 md:h-4 w-3 h-3 text-[#3586FF] " />
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleRemovePermission(idx)}
                            className="text-red-500 font-medium text-[12px] md:text-[14px]"
                            title="Delete"
                          >
                            <FiTrash2 className="md:w-4 md:h-4 w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            className="bg-white border border-[#5297ff] btn-text py-[3px] md:px-[10px] mt-3 px-[12px] rounded-[6px] font-medium"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#5297FF] btn-text md:py-[5px] py-[3px] md:px-[10px]  mt-3 px-[12px] rounded-[6px] text-white font-medium"
            disabled={loading}
          >
            {loading ? "Saving..." : role ? "Update Role" : "Create Role"}
          </Button>
        </div>
      </form>
    </div>
  );
}
