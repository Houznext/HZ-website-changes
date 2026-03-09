import { useEffect, useMemo, useState } from "react";
import { Permission, Role } from ".";
import Button from "@/src/common/Button";
import { Card, CardContent } from "@mui/material";
import Modal from "@/src/common/Modal";
import apiClient from "@/src/utils/apiClient";
import CheckboxInput from "@/src/common/FormElements/CheckBoxInput";
import toast from "react-hot-toast";
import SearchComponent from "@/src/common/SearchSelect";
import { MdArrowBack } from "react-icons/md";
import { Loader } from "lucide-react";
import { PERMISSION_RESOURCES } from "@/src/utils/permissions";



interface RolePermissionsProps {
  selectedRole: Role;
  updatePermissions: (roleId: string, changedPermissions: Permission[]) => void;
  onBack: () => void;
}

const RolePermissions = ({
  selectedRole: role,
  updatePermissions,
  onBack,
}: RolePermissionsProps) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [originalPermissions, setOriginalPermissions] = useState<Permission[]>([]);
  const [changedPermissions, setChangedPermissions] = useState<Permission[]>([]);
  const [filteredResources, setFilteredResources] = useState<string[]>([]);
  const [openAddResourceModal, setOpenAddResourceModal] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const resources = useMemo(
    () => permissions.map((p) => p.resource),
    [permissions]
  );

  const [newResource, setNewResource] = useState<Permission>({
    resource: "",
    create: true,
    view: true,
    edit: true,
    delete: true,
  });

  useEffect(() => {
    if (!role) return;
    const permissionsCopy = JSON.parse(JSON.stringify(role.permissions));
    setPermissions(permissionsCopy);
    setOriginalPermissions(permissionsCopy);
  }, [role]);

  useEffect(() => {
    const assignedResources = permissions.map((p) => p.resource);
    setFilteredResources(
      PERMISSION_RESOURCES.filter((resource) => !assignedResources.includes(resource))
    );
  }, [permissions]);



  const handleResourceChange = (option: any) => {
    setNewResource((prev) => ({
      ...prev,
      resource: option.value,
    }));
  };

  const hasPermissionsChanged = () => changedPermissions.length > 0;

  const handleUpdatePermissions = () => {
    updatePermissions(role.id, changedPermissions);
    setOriginalPermissions(JSON.parse(JSON.stringify(permissions)));
    setChangedPermissions([]);
  };

  const togglePermission = (resource: string, action: string) => {
    setPermissions((prev) => {
      const updated = prev.map((p) =>
        p.resource === resource ? { ...p, [action]: !p[action] } : p
      );

      // Track changed permissions
      const changed = updated.find((p) => p.resource === resource);
      if (changed) {
        setChangedPermissions((prevChanged) => {
          const exists = prevChanged.find((c) => c.resource === resource);
          if (exists) {
            return prevChanged.map((c) =>
              c.resource === resource ? changed : c
            );
          }
          return [...prevChanged, changed];
        });
      }

      return updated;
    });
  };

  const formatResourceName = (resource: string) =>
    resource
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const handleAddResource = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.post(
        `${apiClient.URLS.roles}/${role.id}/permissions`,
        newResource,true
      );
      if (res?.status == 201) {
        setPermissions((prev) => [...prev, res.body]);
        setOriginalPermissions((prev) => [...prev, res.body]);
        toast.success("Resource added successfully");
        setNewResource({
          resource: "",
          create: true,
          view: true,
          edit: true,
          delete: true,
        });
      }
    } catch (e) {
      console.log(e);
      toast.error("Failed to add resource");
    } finally {
      setIsLoading(false);
      setOpenAddResourceModal(false);
    }
  };

  const getPermissionStatus = (resource: string, action: string) => {
    const permission = permissions.find((p) => p.resource === resource);
    return permission ? permission[action] : false;
  };

  const handleChange = ({ name, checked }: { name: string; checked: boolean }) => {
    setNewResource((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };
  if (isLoading) return (<div className="flex w-full h-full items-center justify-center" >
    <Loader />
  </div>)

  return (
    <div className="w-full max-w-4xl p-6">
      <div
        className="flex items-center text-[12px] md:text-[14px] gap-1 mb-2 font-medium cursor-pointer"
        onClick={onBack}
      >
        <MdArrowBack /> Back
      </div>
      <div className="flex items-center md:mb-4 mb-3 gap-1">
        <div>
          <h1 className="text-[#3586FF]  md:text-[18px] text-[14px] font-bold">
            Role Name
          </h1>
          <p className="text-gray-600 md:text-[12px] text-[10px] font-medium">
            {role.roleName
              .replace(/([a-z])([A-Z])/g, "$1 $2")
              .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
              .trim()}
          </p>
        </div>
      </div>

      <div className="md:mb-4 mb-2 flex justify-between items-center">
        <Button
          onClick={() => setOpenAddResourceModal(true)}
          className="bg-[#5297ff] text-white px-4 py-2 md:text-[14px] text-[12px] rounded font-medium"
        >
          Add new resource
        </Button>
        {hasPermissionsChanged() && (
          <Button
            className="bg-[#5297ff] text-white p-2 px-[10px]  md:text-[14px] text-[12px] rounded font-medium"
            onClick={handleUpdatePermissions}
          >
            Update
          </Button>
        )}
      </div>

      <Card className="w-full">
        <CardContent className="p-0 md:w-full md:overflow-visible max-w-[600x] overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left md:py-[6px] py-1 md:px-6 px-3 md:text-sm text-[12px] font-medium text-gray-500">
                  Resource
                </th>
                <th className="text-center md:py-[6px] py-1 md:px-6 px-3 md:text-sm text-[12px] font-medium text-gray-500">
                  Create
                </th>
                <th className="text-center md:py-[6px] py-1 md:px-6 px-3 md:text-sm text-[12px] font-medium text-gray-500">
                  Read
                </th>
                <th className="text-center md:py-[6px] py-1 md:px-6 px-3 md:text-sm text-[12px] font-medium text-gray-500">
                  Update
                </th>
                <th className="text-centermd:py-[6px] py-1 md:px-6 px-3 md:text-sm text-[12px] font-medium text-gray-500">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource} className="border-t">
                  <td className="py-2 px-5">
                    <div className="flex items-center">
                      <span className="md:text-[14px] text-[10px] font-medium">
                        {formatResourceName(resource)}
                      </span>
                    </div>
                  </td>
                  {["create", "view", "edit", "delete"].map((action) => (
                    <td
                      key={`${resource}-${action}`}
                      className="py-[10px] px-4 text-center"
                    >
                      <button
                        onClick={() => togglePermission(resource, action)}
                        className={`md:w-5 w-3 md:h-5 h-3 rounded-full transition-colors ${getPermissionStatus(resource, action)
                          ? "text-green-500"
                          : "text-red-500"
                          }`}
                      >
                        {getPermissionStatus(resource, action) ? "✓" : "✕"}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add resource modal */}
      <Modal
        isOpen={openAddResourceModal}
        closeModal={() => {
          setNewResource(prev => ({
            resource: "",
            create: false,
            delete: false,
            edit: false,
            view: false
          }))
          setOpenAddResourceModal(false)
        }}
        isCloseRequired={false}
        title="Add Resource"
        titleCls="text-[16px] font-bold text-[#3586FF]  transform uppercase"
        className="md:max-w-[750px] max-w-[280px] max-h-[600px]   relative"
        rootCls="w-full md:max-w-[750px] max-w-[280px] max-h-[600px] z-[100000000]  relative"
      >
        <div className="flex flex-col max-h-[600px] h-[300px] justify-between ">
          <div className=''>
            <p className="md:text-[18px] text-[14px] font-medium  mb-2"></p>
            <div className="max-w-[300px]  flex items-center gap-x-[67px] cursor-pointer mt-[24px]">
              <SearchComponent
                label="Select Resource"
                labelCls="label-text"
                inputClassName="text-[11px] font-regular"
                placeholder="Search resource..."
                value={newResource.resource}
                options={filteredResources.map((r) => ({ label: formatResourceName(r), value: r }))}
                onChange={handleResourceChange}
                rootClassName="w-full"
              />

            </div>
          </div>
          <div className="py-3">
            <p className="mb-3 label-text font-medium">Select Required Permissions</p>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-2 ">
              <CheckboxInput
                className="mr-1 rounded-sm md:h-[14px] h-[10px] w-[10px] md:w-[14px]"
                name="view"
                checked={newResource.view}
                onChange={(checked: boolean) => handleChange({ name: "view", checked })}
                label="View"
                labelCls="md:text-sm text-[12px] font-medium"
              />
              <CheckboxInput
                className="mr-1 rounded-sm md:h-[14px] h-[10px] w-[10px] md:w-[14px]"
                name="create"
                checked={newResource.create}
                onChange={(checked: boolean) => handleChange({ name: "create", checked })}
                label="Create"
                labelCls="md:text-sm text-[12px] font-medium"
              />
              <CheckboxInput
                className="mr-1 rounded-sm md:h-[14px] h-[10px] w-[10px] md:w-[14px]"
                name="edit"
                checked={newResource.edit}
                onChange={(checked: boolean) => handleChange({ name: "edit", checked })}
                label="Edit"
                labelCls="md:text-sm text-[12px] font-medium"
              />
              <CheckboxInput
                className="mr-1 rounded-sm md:h-[14px] h-[10px] w-[10px] md:w-[14px]"
                name="delete"
                checked={newResource.delete}
                onChange={(checked: boolean) => handleChange({ name: "delete", checked })}
                label="Delete"
                labelCls="md:text-sm text-[12px] font-medium"
              />
            </div>
          </div>

          <div className=" flex justify-between w-full">
            <Button
              className="border-[#5297FF] border-[2px] md:text-[16px] text-[12px] md:py-[5px] py-[3px] md:px-[20px] mt-3 px-[12px] rounded-[6px] font-medium"
              onClick={() => {
                setNewResource(prev => ({
                  resource: "",
                  create: false,
                  delete: false,
                  edit: false,
                  view: false
                }))
                setOpenAddResourceModal(false)
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#5297FF] md:text-[16px] text-[12px] md:py-[5px] py-[3px] md:px-[20px] mt-3 px-[12px] rounded-[6px] text-white font-medium"
              onClick={handleAddResource}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RolePermissions;
