import React from "react";
import CustomInput from "@/src/common/FormElements/CustomInput";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import MultiCheckbox from "@/src/common/FormElements/MultiCheckbox";
import { Button } from "@headlessui/react";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import SelectBtnGrp from "@/src/common/SelectBtnGrp";
import { indianStateOptions } from "@/src/stores/custom-builder";
import CheckboxInput from "@/src/common/FormElements/CheckBoxInput";
import { UserIcon } from "lucide-react";

interface UserDetailsProps {
  userDetails: {
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
  };
  handleDrawerClose: () => void;
  setUserDetails: React.Dispatch<
    React.SetStateAction<{
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
    }>
  >;
  isEdit?: boolean;
  userId?: number | null;
  onSuccess?: () => void;
  formSubmitting: boolean;
  setFormSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  branches: any[];
  selectedBranchId?: number | null;
  branchRoles: any[];
  branchHasHead?: boolean;
}

const UserDetailsView = ({
  userDetails,
  setUserDetails,
  handleDrawerClose,
  isEdit = false,
  userId = null,
  onSuccess,
  formSubmitting,
  setFormSubmitting,
  branches,
  selectedBranchId,
  branchRoles,
  branchHasHead,
}: UserDetailsProps) => {
  const [errors, setErrors] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleInputChange = (key: string, value: any) => {
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setUserDetails((prev) => ({ ...prev, [key]: value }));
  };
 

  const validate = () => {
    let hasError = false;
    const newErrors = { ...errors };

    if (!userDetails.firstName.trim()) {
      newErrors.firstName = "First Name is required";
      hasError = true;
    }
    if (!userDetails.lastName.trim()) {
      newErrors.lastName = "Last Name is required";
      hasError = true;
    }
    if (
      !userDetails.email ||
      !userDetails.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    ) {
      newErrors.email = "Invalid email address";
      hasError = true;
    }
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{7,}$/;

    if (
      !isEdit &&
      (!userDetails.password || !passwordRegex.test(userDetails.password))
    ) {
      newErrors.password =
        "Password must contain at least 1 uppercase letter, 1 number, 1 special character (!@#$%^&*), and be at least 7 characters long.";
      hasError = true;
    }

    if (!userDetails.phone.match(/^(0|91)?[6-9][0-9]{9}$/)) {
      newErrors.phone = "Invalid phone number";
      hasError = true;
    }

    setErrors(newErrors);
    return hasError;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) return;

    setFormSubmitting(true);

    try {
      const baseUser = {
        email: userDetails.email,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,

        phone: userDetails.phone,
        states: userDetails.states || [],
      };

      const userPayload = {
        ...baseUser,
        ...(!isEdit && userDetails.password
          ? { password: userDetails.password }
          : {}),
        ...(isEdit && userDetails.password
          ? { password: userDetails.password }
          : {}),
      };
      console.log("selectedBranchId", selectedBranchId);

      const payload = {
        user: userPayload,
        membership: {
          branchId: (selectedBranchId),
          branchRoleIds: (userDetails.branchRoleIds ?? []).map(String),
          isBranchHead: !!userDetails.isBranchHead,
          isPrimary: !!userDetails.isPrimary,

          kind: userDetails.userKind || "STAFF",
        },
      };

      let res;
      if (isEdit && userId) {
        res = await apiClient.patch(
          `${apiClient.URLS.user}/admin/update-with-branch/${userId}`,
          payload,
          true
        );

        if (res.status === 200) {
          toast.success("User updated successfully");
          onSuccess?.();
        }
      } else {
        res = await apiClient.post(
          `${apiClient.URLS.user}/admin/create-with-branch`,
          payload,
          true
        );
        if (res.status === 201) {
          toast.success("User created successfully");
          onSuccess?.();
        }
      }
    } catch (err) {
      toast.error("Something went wrong");
      console.error(err);
    } finally {
      setFormSubmitting(false);
    }
  };

  const roleOptions = branchRoles.map((role) => ({
  id: role.id,
  name: role.roleName,
}));

const selectedRole =
  roleOptions.find(
    (role) => role.id === userDetails.branchRoleIds?.[0]
  ) || null;

  return (
    <div className="w-full flex flex-col max-w-[1200px] bg-gradient-to-b from-white via-blue-50/10 to-gray-50 rounded-2xl border border-gray-200 shadow-xl md:p-6 p-3 space-y-6 transition-all duration-300">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <h1 className="font-medium md:text-2xl text-[16px] bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
          {isEdit ? "Edit User" : "Add New User"}
        </h1>
        <div className="h-[4px] w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
      </div>

      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-y-5 gap-y-3"
        onSubmit={handleSubmit}
      >
        <CustomInput
          outerInptCls="md:p-1 p-0.5"
          label="First Name"
          className="md:px-2 px-1 py-1 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
          labelCls="font-medium text-[#000000]"
          type="text"
          name="firstName"
          required
          value={userDetails.firstName}
          onChange={(e) => handleInputChange("firstName", e.target.value)}
          placeholder="Enter First Name"
          errorMsg={errors.firstName}
          leftIcon={<UserIcon />}
        />

        <CustomInput
          outerInptCls="md:p-1 p-0.5"
          label="Last Name"
          type="text"
          name="lastName"
          className="md:px-2 px-1 py-1 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
          labelCls="font-medium text-[#000000]"
          required
          value={userDetails.lastName}
          onChange={(e) => handleInputChange("lastName", e.target.value)}
          placeholder="Enter Last Name"
          errorMsg={errors.lastName}
        />

        <CustomInput
          outerInptCls="md:p-1 p-0.5"
          label="Email"
          type="email"
          name="email"
          className="md:px-2 px-1 py-1 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
          labelCls="font-medium text-[#000000]"
          required
          value={userDetails.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          placeholder="Enter Email"
          errorMsg={errors.email}
        />

        <CustomInput
          outerInptCls="md:p-1 p-0.5"
          label="Password"
          type="password"
          name="password"
          className="md:px-2 px-1 py-1 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
          labelCls="font-medium text-[#000000]"
          required={!isEdit}
          value={userDetails.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          placeholder="Enter Password"
          errorMsg={errors.password}
          disabled={isEdit}
        />

        <CustomInput
          outerInptCls="md:p-1 p-0.5"
          label="Phone Number"
          type="number"
          name="phone"
          className="md:px-2 px-1 py-1 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
          labelCls="font-medium text-[#000000]"
          required
          value={userDetails.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          placeholder="Enter Phone Number"
          errorMsg={errors.phone}
        />

        <MultiCheckbox
          label="Assign States"
          ClassName="md:h-5 h-3 md:w-5 w-3"
          labelCls="font-medium md:text-[14px] text-[12px] text-[#000000]"
          options={indianStateOptions}
          selectedValues={userDetails.states}
          onChange={(selectedStates) =>
            handleInputChange("states", selectedStates)
          }
        />

        <div className="flex flex-col w-full">
          <SingleSelect
            type="single-select"
            label="Assign Roles"
            name="branchRoleIds"
            options={roleOptions}
  selectedOption={selectedRole}
            labelCls="font-medium text-[#000000]"
            rootCls="border border-gray-300 rounded-lg "
            // buttonCls="border-none rounded-lg " 
            optionCls="font-medium text-[12px] md:text-[12px]"
            selectedOptionCls="font-medium text-[12px] md:text-[14px]"
            buttonCls="w-full px-2 py-2 border border-gray-300 rounded-md"
            // optionCls="bg-red-400 text-black"
            // optionsInterface={{ isObj: true, displayKey: "roleName" }}
            optionsInterface={{ isObj: true, displayKey: "name" }}

            handleChange={(_name, value) =>
              setUserDetails((prev: any) => ({
                ...prev,
                branchRoleIds: value ? [value.id] : [],
              }))
            }
          />
        </div>

        <SelectBtnGrp
          options={["CUSTOMER", "SELLER", "STAFF"]}
          label="User Kind"
          labelCls="text-[#000000] font-medium"
          btnClass="md:text-[12px] text-[10px] font-medium rounded-md md:px-3 px-2 md:py-[6px] py-[4px] border border-gray-300 hover:bg-blue-50"
          className="flex flex-row md:gap-2 gap-3"
          onSelectChange={(value) => handleInputChange("userKind", value)}
          slant={false}
          defaultValue={userDetails.userKind}
        />
        {(branchHasHead || userDetails.isBranchHead) && (
          <CheckboxInput
            label="Is Branch Head"
            labelCls="font-medium text-[#000000]"
            name="isBranchHead"
            className="md:w-3 w-2 md:h-[15px] !h-3 px-2"
            checked={!!userDetails.isBranchHead}
            onChange={(checked) => handleInputChange("isBranchHead", checked)}
          />
        )}

        <CheckboxInput
          label="Is Primary"
          labelCls="font-medium text-[#000000]"
          name="isPrimary"
          className="md:w-3 w-2 md:h-[15px] !h-3 px-2"
          checked={!!userDetails.isPrimary}
          onChange={(checked) => handleInputChange("isPrimary", checked)}
        />

        <div className="col-span-full flex justify-end items-center gap-4 pt-4 border-t border-gray-200">
          <Button
            type="button"
            className="text-gray-700 md:text-[15px] text-[12px] md:px-6 md:py-2 px-4 py-1.5 font-medium bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg shadow-sm transition-all"
            onClick={handleDrawerClose}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white md:text-[15px] text-[12px] md:px-6 md:py-2 px-4 py-1.5 font-medium rounded-lg shadow-md transition-all"
          >
            {formSubmitting ? "Submitting..." : isEdit ? "Update" : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserDetailsView;
