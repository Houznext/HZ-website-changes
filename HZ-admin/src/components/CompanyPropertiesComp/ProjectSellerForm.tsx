import Button from "@/src/common/Button";
import CustomInput from "@/src/common/FormElements/CustomInput";
import ImageFileUploader from "@/src/common/ImageFileUploader";
import { CautionIcon, ResendIcon } from "@/src/features/CustomBuilder/Icons";
import { useCompanyPropertyStore } from "@/src/stores/companyproperty";
import apiClient from "@/src/utils/apiClient";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import Loader from "@/src/common/Loader";

const ProjectSellerForm = ({
  setOpendrawer,
  selectedSellerIndex,
  setSelectedSellerIndex,
}: {
  setOpendrawer: Dispatch<SetStateAction<boolean>>;
   selectedSellerIndex: number | null;
  setSelectedSellerIndex: React.Dispatch<React.SetStateAction<number|null>>;
}) => {
  const { projects, selectedProjectIndex, updateSeller, addSeller } =
    useCompanyPropertyStore();
  const [otpVerifed, setOtpVerifed] = useState(false);
  const [sentOtp, setSentOtp] = useState(false);
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    profile: "",
    priceRange: "",
    confirmPassword: "",
  });

  const [sellerDetails, setSellerDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: null,
    profile: null,
    priceRange: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = useState(Array(4).fill(""));
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isExisting, setIsExisting] = useState(false);
  useEffect(() => {
  if (selectedSellerIndex === null) {
    setOtpVerifed(false);
    setSentOtp(false);
    setIsEditing(false);
    setIsExisting(false);
    setOtp(Array(4).fill(""));
    setConfirmPassword("");
    setSellerDetails({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: null,
      profile: null,
      priceRange: "",
    });
  }
}, [selectedSellerIndex]);

  useEffect(() => {
  if (
    selectedProjectIndex === null ||
    selectedSellerIndex === null
  ) {
    return;
  }

  const selectedSeller =
    projects?.[selectedProjectIndex]?.sellers?.[selectedSellerIndex];

  if (!selectedSeller) return;

  setSellerDetails({
    firstName: selectedSeller.firstName || "",
    lastName: selectedSeller.lastName || "",
    email: selectedSeller.email || "",
    password: "",
    phone: selectedSeller.phone || "",
    profile: selectedSeller.profile || null,
    priceRange: selectedSeller.priceRange || "",
  });

  setOtpVerifed(true);
  setIsEditing(true);
}, [projects, selectedProjectIndex, selectedSellerIndex]);


  // useEffect(() => {
  //   const selectedSeller =
  //     projects[selectedProjectIndex]?.sellers?.[selectedSellerIndex];
  //   if (selectedSeller) {
  //     setSellerDetails({
  //       firstName: selectedSeller.firstName,
  //       lastName: selectedSeller.lastName,
  //       email: selectedSeller.email,
  //       password: "",
  //       phone: selectedSeller.phone,
  //       profile: selectedSeller.profile,
  //       priceRange: selectedSeller.priceRange,
  //     });
  //     setOtpVerifed(true);
  //     setIsEditing(true);
  //   }
  // }, [selectedSellerIndex]);

  const validateSellerDetails = () => {
    const newErrors: any = {};

    if (!sellerDetails.firstName) {
      newErrors.firstName = "First name is required";
    }
    if (!sellerDetails.lastName) {
      newErrors.lastName = "Last name is required";
    }
    if (!sellerDetails.email) {
      newErrors.email = "Email is required";
    }
    if (!isEditing) {
      if (!sellerDetails.password) {
        newErrors.password = "Password is required";
      }
      if (sellerDetails.password !== confirmPassword) {
        newErrors.confirmPassword = "Password does not match";
      }
    }
    if (!sellerDetails.phone) {
      newErrors.phone = "Phone number is required";
    }
    // if (!sellerDetails.profile) {
    //   newErrors.profile = "Profile picture is required";
    // }
   

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = ({ name, value }: { name: string; value: string }) => {
    setSellerDetails((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (sellerDetails.password !== value) {
      errors.confirmPassword = "Password does not match";
    } else {
      errors.confirmPassword = "";
    }
  };

  const handleDrawerClose = () => {
    setOpendrawer(false);
    setSellerDetails({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: null,
      profile: null,
      priceRange: "",
    });
    setSelectedSellerIndex(null);
  };

  const handleOtpChange = (value, index) => {
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // const sendOtp = async () => {
  //   if (selectedProjectIndex === null) {
  //     toast.error("Please create a project first and then you can add sellers");
  //     return;
  //   }
  //   try {
  //     setLoading(true);
  //     const payLoad = {
  //       email: sellerDetails.email,
  //       projectId: projects[selectedProjectIndex].id,
  //     };

  //     const response = await apiClient.post(
  //       `${apiClient.URLS.company_Onboarding}/projects/verify-seller-email`,
  //       payLoad,
  //       true
  //     );

  //     if (response.body?.id) {
  //       setSellerDetails({
  //         firstName: response.body?.firstName,
  //         lastName: response.body?.lastName,
  //         email: response.body?.email,
  //         password: response.body?.password,
  //         phone: response.body?.phone,
  //         profile: response.body?.profile,
  //         priceRange: response.body?.priceRange,
  //       });
  //       setOtpVerifed(true);
  //       setIsEditing(true);
  //       setIsExisting(true);
  //     } else {
  //       toast.success(`OTP sent successfully to this email ${payLoad.email}`);
  //       setSentOtp(true);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     toast.error(error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
 const sendOtp = async () => {
  if (selectedProjectIndex === null) {
    toast.error("Please create a project first and then you can add sellers");
    return;
  }

  // ✅ reset before sending
  setOtp(Array(4).fill(""));
  setOtpVerifed(false);
  setSentOtp(false);

  try {
    setLoading(true);

    const payLoad = {
      email: sellerDetails.email,
      projectId: projects[selectedProjectIndex].id,
    };

    const response = await apiClient.post(
      `${apiClient.URLS.company_Onboarding}/projects/verify-seller-email`,
      payLoad,
      true
    );

    // If backend returns user but still sends OTP → still show otp UI
    if (response.body?.id) {
      setSellerDetails((prev) => ({
        ...prev,
        firstName: response.body?.firstName || "",
        lastName: response.body?.lastName || "",
        email: response.body?.email || prev.email,
        phone: response.body?.phone || "",
        profile: response.body?.profile || null,
        priceRange: response.body?.priceRange || "",
        password: "",
      }));

      setIsExisting(true);
      setIsEditing(false); // ✅ do NOT treat as edit mode
    }

    // ✅ Always show verify step after sending OTP
    setSentOtp(true);
    toast.success(`OTP sent successfully to ${payLoad.email}`);
  } catch (error: any) {
    console.log(error);
    toast.error(error?.message || "Failed to send OTP");
  } finally {
    setLoading(false);
  }
};
;


  const verifyOtp = async () => {
    try {
      setLoading(true);
      const payLoad = {
        email: sellerDetails.email,
        otp: otp.join("").toString(),
        projectId: projects[selectedProjectIndex].id,
      };
      const response = await apiClient.post(
        `${apiClient.URLS.company_Onboarding}/projects/verify-seller-otp`,
        payLoad,
        true
      );

      if (response.status === 200) {
        setOtpVerifed(true);
        setSentOtp(false);
        toast.success("OTP verified successfully");
        
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitDetails = async () => {
    if (selectedProjectIndex === null) {
      toast.error("Please create a project first and then you can add sellers");
      return;
    }
    if (!validateSellerDetails()) return;

    if (!otpVerifed) {
      toast.error("Please verify your email address");
      return;
    }
     

    if (!isEditing) {
      try {
        setLoading(true);
        const payLoad = {
          projectId: projects[selectedProjectIndex].id,
          firstName: sellerDetails.firstName,
          lastName: sellerDetails.lastName,
          email: sellerDetails.email,
          password: sellerDetails.password,
          phone: sellerDetails.phone,
          profilePhoto: sellerDetails.profile,
          priceRange: sellerDetails.priceRange,
        };

       
        const response = await apiClient.post(
          `${apiClient.URLS.company_Onboarding}/projects/save-seller-details`,
          payLoad,
          true
        );
       if (response.status === 200 || response.status === 201) {
  const savedSeller = response.body ?? sellerDetails;

  addSeller(selectedProjectIndex, {
    id: savedSeller.id,
    firstName: savedSeller.firstName ?? sellerDetails.firstName,
    lastName: savedSeller.lastName ?? sellerDetails.lastName,
    email: savedSeller.email ?? sellerDetails.email,
    password: "",
    phone: savedSeller.phone ?? sellerDetails.phone,
    profile: savedSeller.profile ?? savedSeller.profilePhoto ?? sellerDetails.profile,
    priceRange: savedSeller.priceRange ?? sellerDetails.priceRange,
  });

  toast.success("Successfully saved seller details");
  handleDrawerClose();
  return;
}


        toast.success("Successfully saved seller details");
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      } finally {
        setLoading(false);
        setOpendrawer(false);
        setSelectedSellerIndex(null);
      }
    } else {
      try {
        setLoading(true);
        const payLoad = {
          projectId: projects[selectedProjectIndex].id,
          firstName: sellerDetails.firstName,
          lastName: sellerDetails.lastName,
          email: sellerDetails.email,
          phone: sellerDetails.phone,
          profilePhoto: sellerDetails.profile,
          priceRange: sellerDetails.priceRange,
        };

        const response = await apiClient.put(
          `${apiClient.URLS.company_Onboarding}/projects/update-seller-details`,
          payLoad,
          true
        );

        // if (isExisting) {
        //   addSeller(selectedProjectIndex, sellerDetails);
        // } else {
        //   updateSeller(
        //     selectedProjectIndex,
        //     selectedSellerIndex,
        //     sellerDetails
        //   );
        // }
        if (response.status === 200) {
  const updatedSeller = response.body ?? sellerDetails;

  updateSeller(selectedProjectIndex, selectedSellerIndex, {
    id: updatedSeller.id,
    firstName: updatedSeller.firstName ?? sellerDetails.firstName,
    lastName: updatedSeller.lastName ?? sellerDetails.lastName,
    email: updatedSeller.email ?? sellerDetails.email,
    password: "",
    phone: updatedSeller.phone ?? sellerDetails.phone,
    profile: updatedSeller.profile ?? updatedSeller.profilePhoto ?? sellerDetails.profile,
    priceRange: updatedSeller.priceRange ?? sellerDetails.priceRange,
  });

  toast.success("Successfully updated seller details");
  handleDrawerClose();
  return;
}


        toast.success("Successfully updated seller details");
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      } finally {
        setLoading(false);
        setOpendrawer(false);
        setSelectedSellerIndex(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full sm:w-[80%] lg:w-[70%] rounded-xl bg-white shadow-md px-5 py-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-6 border-b pb-3">
        <CautionIcon />
        <p className="font-bold md:text-[18px] text-[14px] text-gray-800">
          Seller details
        </p>
      </div>

      <div className="flex flex-col md:gap-6 gap-3">
        <div className=" bg-gray-100 md:p-4 p-2 flex md:flex-row flex-col md:gap-4 gap-2">
          <CustomInput
            label="Enter Mobile Number"
            labelCls="text-[#636B70] md:text-[14px] text-[12px] font-medium"
            name="mobile"
            placeholder="Mobile number"
            value={sellerDetails.phone}
            onChange={(e) =>
              handleChange({ name: "phone", value: e.target.value })
            }
            errorMsg={errors?.phone}
            type="text"
            className="w-full md:p-[6px] p-[1px]"
            // disabled={isEditing}
          />
          <CustomInput
            label="Enter email address"
            labelCls="text-[#636B70] md:text-[14px] text-[12px] font-medium"
            name="email"
            placeholder="Email address"
            value={sellerDetails?.email}
            onChange={(e) =>
              handleChange({ name: "email", value: e.target.value })
            }
            errorMsg={errors?.email}
            type="email"
            className="w-full md:p-[6px] p-[1px]"
            disabled={isEditing}
          />
        </div>

      {/* ✅ STEP 1: OTP NOT VERIFIED & OTP NOT SENT → show ONLY Send OTP */}
{!otpVerifed && !sentOtp && (
  <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 bg-gray-50">
    <div className="flex gap-3">
      <Button
        className="bg-[#3B82F6] text-white text-nowrap font-medium md:text-[16px] text-[12px] rounded-md px-3 py-2 w-full"
        onClick={sendOtp}
      >
        Send OTP
      </Button>

      <Button className="bg-white text-[#3B82F6] text-nowrap font-medium md:text-[16px] text-[12px] rounded-md px-3 py-2 w-full flex items-center justify-center gap-2 border border-[#3B82F6]">
        Retry in 30 secs
        <ResendIcon />
      </Button>
    </div>
  </div>
)}

{/* ✅ STEP 2: OTP NOT VERIFIED & OTP SENT → show OTP boxes + Verify OTP */}
{!otpVerifed && sentOtp && (
  <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 bg-gray-50">
    <div className="flex gap-3">
      <Button
        className="bg-[#3B82F6] text-white font-medium md:text-[16px] text-[12px] rounded-md px-3 py-2 w-full"
        onClick={verifyOtp}
      >
        Verify OTP
      </Button>

      <Button
        className="bg-white text-[#3B82F6] text-nowrap font-medium md:text-[16px] text-[12px] rounded-md px-3 py-2 w-full flex items-center justify-center gap-2 border border-[#3B82F6]"
        onClick={sendOtp} // ✅ resend OTP
      >
        Resend OTP
        <ResendIcon />
      </Button>
    </div>

    <div>
      <p className="text-[#636B70] text-[12px] md:text-[14px] font-medium mb-2">
        Validate OTP
      </p>

      <div className="flex gap-3">
        {otp.map((val, index) => (
          <input
            key={index}
            value={val}
            ref={(el) => {
      inputRefs.current[index] = el;
    }}
            type="text"
            maxLength={1}
            inputMode="numeric"
            pattern="[0-9]*"
            className="md:w-12 md:h-12 w-10 h-10 text-center border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            onChange={(e) => handleOtpChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
        ))}
      </div>
    </div>
  </div>
)}


        {otpVerifed && !isEditing && (
          <div className="flex md:flex-row flex-col gap-4">
            <CustomInput
              label="Create Password"
              labelCls="text-[#636B70] md:text-[14px] text-[12px] font-medium"
              name="password"
              type="password"
              placeholder="Password"
              value={sellerDetails?.password}
              errorMsg={errors?.password}
              onChange={(e) =>
                handleChange({ name: "password", value: e.target.value })
              }
              className="w-full md:p-[6px] p-[2px]"
            />
            <CustomInput
              label="Confirm password"
              labelCls="text-[#636B70] md:text-[14px] text-[12px] font-medium"
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              errorMsg={errors?.confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              className="w-full md:p-[6px] p-[2px]"
            />
          </div>
        )}

        {otpVerifed && (
          <div className="flex md:flex-row flex-col gap-4">
            <CustomInput
              label="First name"
              labelCls="text-[#636B70] md:text-[14px] text-[12px] font-medium"
              name="firstName"
              className="w-full md:p-[6px] p-[2px]"
              placeholder="First name"
              value={sellerDetails?.firstName}
              errorMsg={errors?.firstName}
              onChange={(e) =>
                handleChange({ name: "firstName", value: e.target.value })
              }
              type="text"
            />
            <CustomInput
              label="Last name"
              name="lastName"
              className="w-full md:p-[6px] p-[2px]"
              placeholder="Last name"
              labelCls="text-[#636B70] md:text-[14px] text-[12px] font-medium"
              value={sellerDetails?.lastName}
              errorMsg={errors?.lastName}
              onChange={(e) =>
                handleChange({ name: "lastName", value: e.target.value })
              }
              type="text"
            />
            <CustomInput
              label="Price range"
              name="priceRange"
              className="w-full md:p-[6px] p-[2px]"
              placeholder="Price range"
              labelCls="text-[#636B70] md:text-[14px] text-[12px] font-medium"
              value={sellerDetails?.priceRange}
              errorMsg={errors?.priceRange}
              onChange={(e) =>
                handleChange({ name: "priceRange", value: e.target.value })
              }
              type="text"
            />
          </div>
        )}

        {otpVerifed && (
          <div className="w-[250px] sm:w-[400px]">
            <ImageFileUploader
              name="profileImage"
              type="file"
              label="Profile image"
              required
              labelCls="text-black md:text-[14px] text-[12px] font-medium mb-3 block"
              className="w-[250px] sm:w-[400px]"
              folderName="company-project/sellerProfile"
              onFileChange={(data) =>
                handleChange({ name: "profile", value: data[0] })
              }
              initialFileUrl={
                sellerDetails?.profile ? [sellerDetails?.profile] : null
              }
            />
          </div>
        )}

        <div className="flex justify-end gap-4 mt-8">
          <Button
            onClick={handleDrawerClose}
            className="md:px-8 px-4 md:py-[6px] py-1 border border-[#5297ff] md:text-[14px] text-[12px] text-[#3586FF]  hover:bg-blue-50 rounded-md font-medium"
          >
            Cancel
          </Button>
          <Button
            className="md:px-8 px-4 md:py-[6px] py-1 bg-[#3B82F6] md:text-[14px] text-[12px] text-white rounded-lg shadow hover:bg-blue-600"
            onClick={submitDetails}
          >
            Save details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSellerForm;
