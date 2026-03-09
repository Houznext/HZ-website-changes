import Button from "@/common/Button";
import Modal from "@/common/Modal";
import SelectBtnGrp from "@/common/SelectBtnGrp";
import Loader from "@/components/Loader";
import apiClient from "@/utils/apiClient";
import React, { useState } from "react";
import usePostPropertyStore from "@/store/postproperty";
import { useRouter } from "next/navigation";
import {
  LookingType,
  LookingTypeEnum,
  OwnerType,
  PurposeType,
} from "@/components/Property/PropertyDetails/PropertyHelpers";
import toast from "react-hot-toast";
import CustomInput from "@/common/FormElements/CustomInput";

const BasicDetails = ({
  handleNext,
  user,
}: {
  handleNext: () => void;
  user: any;
}) => {
  const ownerType = Object.values(OwnerType);
  const lookingType = Object.values(LookingType);
  const lookingTypeEnum = Object.values(LookingTypeEnum);
  const purposeOptions = Object.values(PurposeType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [typeModal, setTypeModal] = useState(false);
  const [clearData, setClearData] = useState(false);

  const {
    basicDetails,
    setBasicDetails,
    currentStep,
    errors,
    setProperty,
    setErrors,
    resetState,
  } = usePostPropertyStore();
  const router = useRouter();
  const getProperty = usePostPropertyStore((state) => state.getProperty);
  const property = usePostPropertyStore((state) => state);

  const validate = () => {
    let validationErrors: Record<string, string> = {};
    if (!basicDetails?.ownerType) {
      validationErrors.ownerType = "Owner type is required.";
    }
    if (!basicDetails?.purpose) {
      validationErrors.purpose = "Purpose is required.";
    }
    if (!basicDetails?.lookingType) {
      validationErrors.lookingType = "Looking type is required.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleInputChange = (key: string, value: any) => {
    if (key === "ownerType" && basicDetails?.ownerType) {
      setClearData(true);
      setTypeModal(true);
      return;
    }
    if (key === "purpose" && basicDetails?.purpose) {
      setClearData(true);
      setTypeModal(true);
      return;
    }

    if (key === "lookingType" && basicDetails?.lookingType) {
      setClearData(true);
      setTypeModal(true);
      return;
    }

    const updatedBasicDetails = {
      ...basicDetails,
      [key]: value,
    };

    setBasicDetails({
      ...property,
      currentStep: currentStep,
      basicDetails: updatedBasicDetails,
    });
    if (errors[key]) {
      setErrors({
        [key]: "",
      });
    }
  };

  const handleModalContinue = async () => {
    try {
      if (!property.propertyId) {
        resetState();
        setTypeModal(false);
        setClearData(false);
        return;
      }

      if (clearData) {
        const response = await apiClient.delete(
          `${apiClient.URLS.property}/${property.propertyId}`,
          {},
          true
        );

        if (response.status === 200) {
          toast.success("Property deleted successfully!");
          resetState();
          setTypeModal(false);
          setClearData(false);
        }
      }
    } catch (error) {
      console.error("Error while deleting property:", error);
      toast.error("Failed to delete property. Please try again.");
    }
  };
  // Helper to check if string is a valid UUID
  const isValidUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const checkPropertyPost = async () => {
    try {
      // Skip check if user.id is not a valid UUID
      if (!user?.id || !isValidUUID(user.id)) {
        console.warn("User ID is not a valid UUID, skipping property count check");
        return true;
      }

      const res = await apiClient.get(
        `${apiClient.URLS.user}/${user.id}/property-count`,
        {},
        true
      );

      if (res.body?.count > 5) {
        toast.error(
          "You can only post up to 5 properties. Please delete or update existing ones."
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Failed to fetch property count", error);
      return true;
    }
  };

  const handleContinue = async () => {
    if (!user || user.id === undefined) router.push("/login");
    console.log(validate());
    if (!validate()) return;
    const canPost = await checkPropertyPost();
    if (!canPost) return;

    const payload = {
      ownerType: basicDetails?.ownerType || "Owner",
      purpose: basicDetails?.purpose || "Residential",
      lookingType: basicDetails?.lookingType || "Sell",
      name: "fallback-user-name",
      email: basicDetails?.email || user.email,
    };

    const body = {
      postedByUserId: user.id,
      basicDetails: payload,
    };

    try {
      let res = null;
      setLoading(true);
      if (!property.propertyId) {
        res = await apiClient.post(
          `${apiClient.URLS.property}/basic-details`,
          body,
          true
        );
      } else {
        res = await apiClient.patch(
          `${apiClient.URLS.property}/basic-details/${property.propertyId}`,
          body,
          true
        );
      }
      if (
        (!property.propertyId && res.status !== 201) ||
        (property.propertyId && res.status !== 200)
      ) {
        setLoading(false);
        toast.error("something went wrong");
        return;
      }
      if (res.body && res.body.propertyId !== property.propertyId) {
        handleNext();
        setProperty(res.body);
        setLoading(false);
        toast.success("successfully basic details");
      }

      setProperty(res.body);
    } catch (e) {
      toast.error("something went wrong");
      setLoading(false);
      console.log("something went wrong.", e);
    }
  };

  if (loading) {
    return <Loader tagline="Setting up your listing..." />;
  }

  return (
    <div className="max-w-[820px]">
      {/* Header */}
      <h1 className="text-lg md:text-xl font-bold text-[#3586FF] mb-1">Basic Details</h1>
      <p className="label-text text-slate-500 mb-5">
        Welcome back! Fill out the basic details to get started.
      </p>

      {/* Owner Type */}
      <div className="mb-4">
        <SelectBtnGrp
          options={ownerType}
          label="I am a Property"
          labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium mb-2"
          btnClass="text-[12px] md:text-[13px] font-medium rounded-lg px-4 py-2 border border-slate-200 hover:border-[#3586FF] transition-colors duration-200"
          className="flex flex-row flex-wrap gap-2"
          onSelectChange={(value) => handleInputChange("ownerType", value)}
          defaultValue={basicDetails?.ownerType}
          error={errors?.ownerType}
          required
        />
      </div>

      {/* Purpose */}
      <div className="mb-4">
        <SelectBtnGrp
          options={purposeOptions}
          label="Purpose"
          labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium mb-2"
          btnClass="text-[12px] md:text-[13px] font-medium rounded-lg px-4 py-2 border border-slate-200 hover:border-[#3586FF] transition-colors duration-200"
          className="flex flex-row flex-wrap gap-2"
          onSelectChange={(value) => handleInputChange("purpose", value)}
          defaultValue={basicDetails?.purpose}
          error={errors?.purpose}
          required
        />
      </div>

      {/* Looking Type */}
      <div className="mb-4">
        <SelectBtnGrp
          options={basicDetails?.purpose === PurposeType.Residential ? lookingType : lookingTypeEnum}
          label="I am Looking to"
          labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium mb-2"
          btnClass="text-[12px] md:text-[13px] font-medium rounded-lg px-4 py-2 border border-slate-200 hover:border-[#3586FF] transition-colors duration-200"
          className="flex flex-row flex-wrap gap-2"
          onSelectChange={(value) => handleInputChange("lookingType", value)}
          defaultValue={basicDetails?.lookingType}
          error={errors?.lookingType}
          required
        />
      </div>

      {/* Contact Info */}
      <div className="mb-4 hidden">
        <CustomInput
          label={basicDetails?.phone ? "Phone Number" : "Email"}
          labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium"
          type={basicDetails?.phone ? "number" : "text"}
          value={basicDetails?.phone || basicDetails?.email || user?.email}
          onChange={(e) => handleInputChange(
            basicDetails?.phone ? "phone" : "email",
            e.target.value
          )}
          className="text-sm"
          rootCls="max-w-[400px]"
          disabled
          required
          errorMsg={errors?.email}
          name="contact"
        />
      </div>

      {/* Error */}
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      {/* Continue Button */}
      <Button
        className="w-full max-w-[400px] py-2.5 bg-[#3586FF] hover:bg-[#2d75e6] text-white font-medium rounded-lg text-[14px] md:text-[15px] transition-colors duration-200"
        onClick={handleContinue}
      >
        Continue
      </Button>

      {/* Modal */}
      <Modal
        isOpen={typeModal}
        closeModal={() => {
          setTypeModal(false);
          setClearData(false);
        }}
        className="max-w-[400px] py-8 rounded-lg"
        isCloseRequired={false}
      >
        <div className="max-w-[320px] mx-auto flex flex-col gap-4 px-4">
          <p className="text-[14px] text-center font-medium text-slate-700">
            Changing this field will reset your property details. Continue?
          </p>
          <div className="flex flex-row gap-3 justify-center">
            <Button
              className="px-6 py-2 text-[13px] font-medium border-2 border-[#3586FF] text-[#3586FF] rounded-lg hover:bg-blue-50 transition-colors"
              onClick={() => {
                setTypeModal(false);
                setClearData(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="px-6 py-2 text-[13px] font-medium bg-[#3586FF] text-white rounded-lg hover:bg-[#2d75e6] transition-colors"
              onClick={handleModalContinue}
            >
              Continue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BasicDetails;
