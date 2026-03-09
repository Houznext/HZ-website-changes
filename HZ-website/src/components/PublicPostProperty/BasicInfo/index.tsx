import Button from "@/common/Button";
import CustomInput from "@/common/FormElements/CustomInput";
import SelectBtnGrp from "@/common/SelectBtnGrp";
import apiClient from "@/utils/apiClient";
import React, { useState } from "react";
import { EmailIcon } from "@/components/Products/icons";
import Loader from "@/components/Loader";
import VerifyStep from "../VerifyStep";
import { useRegisterUpStore } from "@/store/loginstore";
import usePostPropertyStore from "@/store/postproperty";
import {
  LookingType,
  OwnerType,
  PurposeType,
} from "@/components/Property/PropertyDetails/PropertyHelpers";
import validator from "validator";
import toast from "react-hot-toast";

const BasicInfo = () => {
  const onwerType = ["Owner", "Agent", "Builder"];
  const lookingType = ["Rent", "Sell", "PG/Co-living", "Flat Share"];
  const purposeOptions = ["Residential", "Commercial"];
  const [formState, setFormState] = useState<{
    selectedOwnerType: "Owner" | "Agent" | "Builder";
    selectedLookingType: LookingType;
    selectedPurposeType: PurposeType;
    phone: string;
    email: string;
    isEmail: boolean;
  }>({
    selectedOwnerType: OwnerType.owner,
    selectedLookingType: LookingType.Rent,
    selectedPurposeType: PurposeType.Residential,
    phone: "",
    email: "",
    isEmail: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verify, setVerify] = useState(false);
  const setRegisterState = useRegisterUpStore(
    (state) => state.setRegisterState
  );

  const setProperty = usePostPropertyStore((state) => state.setProperty);
  const setBasicDetails = usePostPropertyStore(
    (state) => state.setBasicDetails
  );

  const handleInputChange = (key: string, value: string | boolean | object) => {
    if (key === "phone" || key === "email") {
      setError("");
    }
    setFormState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email: string): boolean => {
    return validator.isEmail(email);
  };

  const validateForm = (): boolean => {
    if (formState.isEmail) {
      if (!formState.email.trim()) {
        setError("Email is required");
        return false;
      }
      if (!validateEmail(formState.email)) {
        setError("Invalid email address");
        return false;
      }
    } else {
      if (!formState.phone.trim()) {
        setError("Phone number is required");
        return false;
      }
      if (!validatePhoneNumber(formState.phone)) {
        setError("Phone number must be exactly 10 digits");
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload: { email?: string; phone?: string } = formState.isEmail
      ? { email: formState.email }
      : { phone: formState.phone };
    try {
      setLoading(true);
      setError("");
      const res = await apiClient.post(`${apiClient.URLS.otp}/send`, payload);
      console.log("res", res);

      if (res.status === 201) {
        setRegisterState({
          email: formState.email || "",
        });
        const data = {
          ownerType: formState.selectedOwnerType,
          lookingType: formState.selectedLookingType,
          purpose: formState.selectedPurposeType,
          email: formState.email || "",
          phone: formState.phone || "",
        };
        toast.success("OTP sent successfully");

        console.log("step 1: ", data);
        // setCurrentStep(prev => prev + 1);
        setBasicDetails({
          // currentStep: 2,
          basicDetails: data,
        });
        // setBasicDetails({
        //     curr
        // })
        setVerify(true);
      }
    } catch (error: any) {
      setError("Failed to send OTP. Please try again.");
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleInputMethod = () => {
    console.log("hi")
    setFormState((prev) => ({
      ...prev,
      isEmail: !prev.isEmail,
      phone: prev.isEmail ? prev.phone : "",
      email: prev.isEmail ? "" : prev.email,
    }));
    setError("");
  };


  return (
    <div>
      {!verify ? (
        loading ? (
          <Loader />
        ) : (
          <form className="md:fixed bottom-5 bg-white p-6 rounded-[10px]">
            <div className="flex flex-row  items-center md:gap-3 gap-1">
              <h1 className="relative md:text-[28px] text-[16px] -mt-2 md:leading-8 leading-4 font-bold">
                Are you Property
              </h1>
              <SelectBtnGrp
                options={onwerType}
                className="my-custom-class"
                btnClass="md:text-[16px] text-[12px] font-medium"
                onSelectChange={(value) =>
                  handleInputChange("selectedOwnerType", value)
                }
                defaultValue={formState.selectedOwnerType}
                slant={true}
              />
            </div>
            <div className="flex flex-col mt-5 ">
              <SelectBtnGrp
                options={purposeOptions}
                label="Purpose"
                labelCls="md:text-[16px] text-[14px] text-black  md:leading-8  leading-4 font-medium"
                className="gap-2"
                btnClass="md:text-[14px] text-[12px] font-medium rounded-md px-3 py-2"
                onSelectChange={(value) =>
                  handleInputChange("selectedPurposeType", value)
                }
                required
                defaultValue={formState.selectedPurposeType}
                slant={false}
              />
            </div>

            <div className="mt-4 mb-8">
              <SelectBtnGrp
                options={lookingType}
                label=" Looking for"
                labelCls="md:text-[16px] text-[14px] font-medium text-black"
                className="gap-2"
                btnClass="md:text-[14px] text-[12px] font-medium md:text-wrap text-nowrap rounded-md md:px-[21px] px-[15px]  md:py-[10px] py-[7px]"
                onSelectChange={(value) =>
                  handleInputChange("selectedLookingType", value)
                }
                defaultValue={formState.selectedLookingType}
                slant={false}
                required
              />
            </div>

            <div className="mb-2">
              {!formState.isEmail ? (
                <CustomInput
                  type="number"
                  name="phone"
                  labelCls="md:text-[14px] text-[12px] font-medium"
                  label="Phone Number"
                  errorMsg={error}
                  required
                  rootCls="max-w-[455px]"
                  outerInptCls="bg-white"
                  className="placeholder:text-[12px] leading-[20px] font-regular md:py-[2px] py-0 placeholder:text-[#959595] max-w-[400px]"
                  value={formState.phone}
                  onChange={(e: any) =>
                    handleInputChange("phone", e.target.value)
                  }
                  placeholder="Enter your Phone Number"
                />
              ) : (
                <CustomInput
                  type="email"
                  name="email"
                  labelCls="text-[14px] font-medium"
                  label="Email"
                  errorMsg={error}
                  required
                  rootCls="md:max-w-[455px] max-w-[430px] "
                  outerInptCls="bg-white"
                  className="placeholder:text-[14px] leading-[20px] font-regular md:h-[32px] h-[24px] placeholder:text-[#959595] max-w-[400px]"
                  value={formState.email}
                  onChange={(e: any) =>
                    handleInputChange("email", e.target.value)
                  }
                  placeholder="Enter your Email"
                />
              )}
              <Button
                className="bg-[#488ff9] text-[14px] md:py-[8px] mt-6 py-[6px] md:w-[455px] w-full rounded-[6px] text-white font-bold"
                disabled={loading}
                onClick={handleSubmit}
                type="submit"
              >
                {loading ? "Proceeding..." : "Proceed"}
              </Button>
            </div>
            <div className="my-5 max-w-[455px]">
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 text-gray-500 font-medium">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              <div className=" flex flex-col justify-center items-center ">
                <Button
                  className="flex w-full py-2  rounded-[8px] px-10 border-gray-400 border-[1px] bg-gray-50 items-center justify-center font-500 text-[16px] leading-[20.5px] text-gray-500"
                  onClick={toggleInputMethod}
                  type="button"
                >
                  <div className="flex flex-row text-[14px] justify-center items-center ">
                    <EmailIcon />
                    <p className="ml-2 font-medium">
                      Continue with {formState.isEmail ? "Phone" : "Email"}
                    </p>
                  </div>
                </Button>
              </div>
            </div>

          </form>
        )
      ) : (
        <div className="mt-20">
          <VerifyStep />
        </div>
      )}
    </div>
  );
};

export default BasicInfo;
