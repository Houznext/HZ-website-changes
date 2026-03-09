import CustomInput from "@/src/common/FormElements/CustomInput";
import React from "react";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import { Button } from "@headlessui/react";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import MultiCheckbox from "@/src/common/FormElements/MultiCheckbox";
import { indianStateOptions } from "@/src/stores/custom-builder";
import { UserRole } from "../BranchesView/BranchRoleForm";

interface UserDetailsProps {
  userDetails: any;
  handleDrawerClose: () => void;
  setUserDetails: React.Dispatch<React.SetStateAction<any>>;
  isEdit?: boolean;
  userId?: number | null;
  onSuccess?: () => void;
  formSubmitting: boolean;
  setFormSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}

const debounceTimeout = 100;

const UserDetailsView = ({
  userDetails,
  setUserDetails,
  handleDrawerClose,
  isEdit = false,
  userId = null,
  onSuccess,
  formSubmitting,
  setFormSubmitting
}: UserDetailsProps) => {
  const [errors, setErrors] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });

  let debounceTimeoutId: any;

  const handleInputChange = (key: string, value: any) => {

    clearTimeout(debounceTimeoutId);
    debounceTimeoutId = setTimeout(() => {
      setErrors((prev) => ({
        ...prev,
        [key]: "",
      }));
    }, debounceTimeout);

    setUserDetails((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validate = () => {
    let errors = false;

    if (!userDetails.firstName || userDetails.firstName.length < 3) {
      setErrors((prev) => ({ ...prev, firstName: "First Name is required" }));
      errors = true;
    }

    if (!userDetails.lastName || userDetails.lastName.length < 3) {
      setErrors((prev) => ({ ...prev, lastName: "Last Name is required" }));
      errors = true;
    }

    if (
      !userDetails.email ||
      !userDetails.email.match(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    ) {
      setErrors((prev) => ({ ...prev, email: "Invalid email address" }));
      errors = true;
    }

    if (!isEdit && (!userDetails.password || userDetails.password.length < 8)) {
      setErrors((prev) => ({
        ...prev,
        password: "Password must be at least 8 characters",
      }));
      errors = true;
    }

    if (
      !isEdit &&
      (!userDetails.phone || !userDetails.phone.match(/^(0|91)?[6-9][0-9]{9}$/))
    ) {
      setErrors((prev) => ({ ...prev, phone: "Invalid phone number" }));
      errors = true;
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) return;
    setFormSubmitting(true);
    try {
      if (isEdit && userId) {
        const res = await apiClient.put(
          `${apiClient.URLS.user}/admin/update/${userId}`,
          userDetails,true
        );
        if (res.status === 200) {
          toast.success("User updated successfully");
          onSuccess?.();
        }
      } else {
        const res = await apiClient.post(
          `${apiClient.URLS.user}/admin/create`,
          userDetails,true
        );
        if (res.status === 201) {
          toast.success("User created successfully");
          onSuccess?.();
        }
      }
    } catch (e) {
      console.error("API Error:", e);
      toast.error("Something went wrong");
    }
    finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col max-w-[1200px] gap-5 pb-10 shadow-custom">
      <div className="md:p-5 p-2">
        <h1 className="font-medium md:text-2xl text-[16px]">
          {isEdit ? "Edit User" : "Add New User"}
        </h1>
      </div>

      <form
        className="grid grid-cols-1 md:gap-5 gap-3 sm:grid-cols-1 md:grid-cols-2 p-5"
        onSubmit={handleSubmit}
      >
        <CustomInput
          outerInptCls="border-b-[1px] border-gray-300 md:p-3 p-2"
          type="text"
          name="firstName"
          label="First Name"
          required
          labelCls="font-medium md:text-[16px] text-[12px]"
          className="px-2 md:py-1 border w-full border-[#CFCFCF] rounded-[4px]"
          value={userDetails.firstName}
          placeholder="Enter First Name"
          onChange={(e) => handleInputChange("firstName", e.target.value)}
          errorMsg={errors.firstName}
        />

        <CustomInput
          outerInptCls="border-b-[1px] border-gray-300 md:p-3 p-2"
          type="text"
          name="lastName"
          label="Last Name"
          required
          labelCls="font-medium md:text-[16px] text-[12px]"
          className="px-2 md:py-1 border w-full border-[#CFCFCF] rounded-[4px]"
          placeholder="Enter Last Name"
          value={userDetails.lastName}
          onChange={(e) => handleInputChange("lastName", e.target.value)}
          errorMsg={errors.lastName}
        />

        <CustomInput
          outerInptCls="border-b-[1px] border-gray-300 md:p-3 p-2"
          type="email"
          name="email"
          label="Email"
          required
          labelCls="font-medium md:text-[16px] text-[12px]"
          className="px-2 md:py-1 border w-full border-[#CFCFCF] rounded-[4px]"
          placeholder="Enter Email"
          value={userDetails.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          errorMsg={errors.email}
        />


        <MultiCheckbox
          label="Assign States"
          labelCls="font-medium md:text-[16px] text-[12px]"
          options={indianStateOptions}
          selectedValues={userDetails.states || []}
          onChange={(selectedStates) => handleInputChange("states", selectedStates)}
          ClassName="border-gray-400"
        />

        <CustomInput
          outerInptCls="border-b-[1px] border-gray-300 md:p-3 p-2"
          type="password"
          name="password"
          label="Password"
          required={!isEdit}
          labelCls="font-medium md:text-[16px] text-[12px]"
          className="px-2 md:py-1 border w-full border-[#CFCFCF] rounded-[4px]"
          placeholder="Enter Password"
          value={userDetails.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          errorMsg={errors.password}
          disabled={isEdit}
        />

        <CustomInput
          outerInptCls="border-b-[1px] border-gray-300 md:p-3 p-2"
          type="number"
          name="phone"
          label="Phone number"
          required={!isEdit}
          labelCls="font-medium md:text-[16px] text-[12px]"
          className="px-2 md:py-1 border w-full border-[#CFCFCF] rounded-[4px]"
          placeholder="Enter Phone number"
          value={userDetails.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          errorMsg={errors.phone}
          disabled={isEdit}
        />

        <div className="flex flex-col items-start gap-2">
          <p className="font-medium text-[12px] md:text-[16px]">
            User Role<span className="text-red-600 ml-1">*</span>
          </p>
          <SingleSelect
            type="single-select"
            name="roleName"
            optionsInterface={{ isObj: false }}
            options={Object.keys(UserRole).map((key) => UserRole[key])}
            selectedOption={userDetails.roleName}
            handleChange={(name, value) => handleInputChange(name, value)}
            optionCls="font-medium text-[12px] md:text-[14px]"
            selectedOptionCls="font-medium text-[12px] md:text-[14px]"
            buttonCls="w-full px-2 md:py-4 py-2 border border-gray-300 rounded-md"
            rootCls="w-full"
          />
        </div>

        <div className="flex md:flex-row col-span-full gap-4 justify-between mt-6">
          <Button
            type="button"
            className="text-slate-700 md:px-6 md:py-2 px-4 py-1.5 font-medium bg-slate-100 border border-slate-300 rounded"
            onClick={handleDrawerClose}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="bg-[#3586FF] text-white md:px-6 md:py-2 px-4 py-1.5 font-medium rounded"
          >
            {formSubmitting ? "Submitting..." : (isEdit ? "Update" : "Submit")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserDetailsView;
