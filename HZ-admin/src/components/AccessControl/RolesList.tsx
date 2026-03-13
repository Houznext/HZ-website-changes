import { useEffect, useState } from "react";
import { Role } from ".";
import apiClient from "@/src/utils/apiClient";
import Button from "@/src/common/Button";
import Image from "next/image";
import Modal from "@/src/common/Modal";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import Loader from "@/src/common/Loader";
import SearchComponent from "@/src/common/SearchSelect";
import toast from "react-hot-toast";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CustomTooltip from "@/src/common/ToolTip";

const validRoles = [
  "SuperAdmin",
  "FurnitureAdmin",
  "InteriorsAdmin",
  "PropertyListingAdmin",
  "PropertyBuilder",
  "DefaultUser",
  "Telecaller",
  "SalesManager",
  "SolarAdmin",
  "CompanyProjectSeller",
  "CompanyDeveloper",
  "ContentWriter",
  "CareersAdmin",
  "CustomBuilderAdmin",
  "CustomBuilderUser",
  "CustomBuilderProjectManager",
  "CustomBuilderSupervisor",
  "CustomBuilderFinance",
];

const RolesList = ({ onEditRole }) => {
  const [roles, setRoles] = useState<Role[]>();
  const [openAddRollModal, setOpenAddRollModal] = useState<boolean>(false);
  const [newRole, setNewRole] = useState<string>("");
  const [filteredRoles, setFilteredRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { hasPermission, permissions } = usePermissionStore((state) => state);

  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get(apiClient.URLS.roles);
        setRoles(res.body);
        console.log(
          validRoles.filter(
            (role) => !res.body.map((item) => item.roleName).includes(role)
          )
        );
        setFilteredRoles(
          validRoles.filter(
            (role) => !res.body.map((item) => item.roleName).includes(role)
          )
        );
        // setFilteredRoles(validRoles);
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const handleAddRole = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.post(apiClient.URLS.roles, {
        roleName: newRole,
      }, true);
      setRoles((prev) => [...prev, res.body]);
      setOpenAddRollModal(false);
      toast.success("Role added successfully");
      setIsLoading(false);
      setNewRole("");
    } catch (e) {
      console.error(e);
      toast.error("Failed to add role");
      setIsLoading(false);
      setOpenAddRollModal(false);
    }
  };
  if (isLoading) {
    return (
      <div className="w-full">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 w-full mx-auto">
      <div className="md:mb-10 mb-5">
        <h1 className="heading-text">Roles List</h1>
        <p className="text-gray-600 md:text-[13px] font-medium text-[12px]">
          A role provides access to predefined menus and features so that
          depending on assigned role an administrator can have access to what
          they need
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles &&
          roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onEdit={onEditRole}
              hasPermission={hasPermission}
            />
          ))}
        {/* Checking if there are any possible roles to create. If yes then showing the add role button */}
        {validRoles.filter(
          (role) => !roles?.map((item) => item.roleName).includes(role)
        ).length > 0 && (
            <div className="rounded-md p-6 shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px] hover:shadow-md transition-shadow duration-300 bg-white">
              <div className="flex flex-col gap-1">
                <h3 className="md:text-lg text-[14px] font-medium text-gray-900">
                  Add Role
                </h3>
                <p className="md:text-sm text-[10px] text-gray-600">
                  Add a new role if it doesn't exist.
                </p>
                <CustomTooltip
                  label="Access Restricted Contact Admin"
                  position="bottom"
                  tooltipBg="bg-black/60 backdrop-blur-md"
                  tooltipTextColor="text-white py-2 px-4 font-medium"
                  labelCls="text-[10px] font-medium"
                  showTooltip={!hasPermission("role", "create")}
                >
                  <Button
                    onClick={() => setOpenAddRollModal(true)}
                    disabled={!hasPermission("role", "create")}
                    className="py-2 md:px-4 px-2 rounded-md  bg-blue-50 text-[#3586FF]  hover:bg-blue-100 hover:text-blue-700 md:text-sm text-[12px] font-medium transition-colors duration-200 w-max"
                  >
                    Add Role
                  </Button>
                </CustomTooltip>
              </div>
            </div>
          )}
      </div>
      {
        openAddRollModal && (
          <Modal
            isOpen={openAddRollModal}
            closeModal={() => setOpenAddRollModal(false)}
            title="Add New Role"
            titleCls="font-medium text-[#3586FF]  md:text-lg text-[14px] "
            className="max-w-[300px] max-h-[400px] min-h-[300px] relative"
            isCloseRequired={false}
            rootCls="z-[1000000] "
          >
            <div className="flex flex-col justify-between  max-h-[400px] min-h-[280px]">
              <div className="max-w-[270px] min-h-[24px] flex items-center gap-x-[67px] cursor-pointer mt-[24px]">
                <SearchComponent
                  label="Select role"
                  labelCls="md:text-[14px] text-[12px] font-medium mb-2"
                  value={newRole}
                  onChange={(val) => setNewRole(val.value)}
                  options={filteredRoles.map((r) => ({ label: r, value: r }))}
                  placeholder="Search role..."
                  inputClassName="text-gray-500  py-[2px] md:placeholder:text-[] placeholder:text-[12px] "
                  rootClassName=""
                  showDeleteIcon={true}
                  dropdownCls="!z-[100000000]"
                />
              </div>
              <div className="flex flex-row justify-between w-full">
                <Button
                  className="border-[1px] border-[#5297FF] md:py-[5px] py-[4px] md:px-[20px] px-[10px] md:text-[14px] text-[12px] mt-3 rounded-[4px] text-gray-500 font-medium"
                  onClick={handleAddRole}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#5297FF] md:py-[5px] py-[4px] md:px-[20px] px-[10px] md:text-[14px] text-[12px] mt-3 rounded-[4px] text-white font-medium"
                  onClick={handleAddRole}
                >
                  Save
                </Button>
              </div>
            </div>
          </Modal>
        )
        // <div>Add role under development</div>
      }
    </div>
  );
};

export default RolesList;

const RoleCard = ({ role, onEdit, hasPermission }) => {
  const maxVisibleUsers = 4;
  const extraUsersCount = role.users.length - maxVisibleUsers;

  return (
    <div className="rounded-md md:p-6 p-4 shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px] hover:shadow-md transition-shadow duration-300 bg-white">
      <div className="w-full justify-between h-full flex flex-col md:gap-4 gap-2">
        {/* Header Section */}
        <div className="flex md:flex-row flex-col justify-between items-center">
          <p className="md:text-sm text-[14px] text-gray-600 font-medium">
            Total{" "}
            <span className="font-semibold text-gray-800">
              {role?.users?.length}
            </span>{" "}
            users
          </p>
          {role?.users?.length > 0 ? (
            <div className="flex items-center md:-space-x-2 space-x-1">
              {role?.users?.slice(0, maxVisibleUsers).map((user) => (
                <div
                  key={user.id}
                  className="md:w-10 w-5 h-5 md:h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300"
                >
                  {user.profile ? (
                    <div className="relative md:w-[40px] w-[20px] md:h-[40px] h-[20px]">
                      <Image
                        src={user.profile}
                        alt={user.firstName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <span className="md:text-sm text-[10px] font-semibold text-[#3586FF] ">
                      {user?.firstName?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              ))}
              {extraUsersCount > 0 && (
                <div
                  className="md:w-10 w-5 h-5 md:h-10 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300 md:text-sm 
                                 text-[10px] font-semibold text-gray-700"
                >
                  +{" "}
                  <span className="ml-1 md:text-[14px] text-[10px]">
                    {extraUsersCount}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="md:w-10 w-5 h-5 md:h-10 rounded-full flex items-center justify-center text-gray-400 md:text-sm text-[10px] font-medium"></div>
          )}
        </div>
        <div>
          <h3 className="md:text-lg text-wrap text-[12px] font-medium text-gray-900">
            {role.roleName
              .replace(/([a-z])([A-Z])/g, "$1 $2")
              .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
              .trim()}
          </h3>
        </div>

        <div>
          <CustomTooltip
            label="Access Restricted Contact Admin"
            position="bottom"
            tooltipBg="bg-black/60 backdrop-blur-md"
            tooltipTextColor="text-white py-2 px-4 font-medium"
            labelCls="text-[10px] font-medium"
            showTooltip={!hasPermission("role", "edit")}
          >
            <Button
              className="py-[6px] md:px-4 px-2 rounded-md bg-blue-100 text-[#3586FF]  hover:bg-blue-100 hover:text-blue-700 md:text-sm text-[12px] font-medium transition-colors duration-200 w-max"
              onClick={() => onEdit(role)}
              disabled={!hasPermission("role", "edit")}
            >
              Edit Role
            </Button>
          </CustomTooltip>
        </div>
      </div>
    </div>
  );
};
