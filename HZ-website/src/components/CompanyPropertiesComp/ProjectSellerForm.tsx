import Button from "@/common/Button";
import CustomInput from "@/common/FormElements/CustomInput";
import ImageFileUploader from "@/common/ImageFileUploader";
import { CautionIcon, ResendIcon } from "@/components/Products/icons"
import { useCompanyPropertyStore } from "@/store/companyproperty";
import apiClient from "@/utils/apiClient";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";

const ProjectSellerForm = ({
  setOpendrawer,
  selectedSellerIndex,
  setSelectedSellerIndex,
}: {
  setOpendrawer: Dispatch<SetStateAction<boolean>>;
  selectedSellerIndex: number;
  setSelectedSellerIndex: React.Dispatch<React.SetStateAction<number>>;
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
    if (
      selectedProjectIndex !== null &&
      selectedSellerIndex !== null &&
      projects[selectedProjectIndex]?.sellers
    ) {
      const selectedSeller =
        projects[selectedProjectIndex]?.sellers[selectedSellerIndex];
      if (selectedSeller) {
        setSellerDetails({
          firstName: selectedSeller.firstName,
          lastName: selectedSeller.lastName,
          email: selectedSeller.email,
          password: "",
          phone: selectedSeller.phone,
          profile: selectedSeller.profile,
          priceRange: selectedSeller.priceRange,
        });
        setOtpVerifed(true);
        setIsEditing(true);
      }
    }
  }, [selectedSellerIndex]);


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
    if (!sellerDetails.profile) {
      newErrors.profile = "Profile picture is required";
    }
    if (!sellerDetails.priceRange) {
      newErrors.priceRange = "Price range is required";
    }

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
    setSelectedSellerIndex(-1);
  };

  const handleOtpChange = (value: any, index: number) => {
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

  const sendOtp = async () => {
    if (selectedProjectIndex === null) {
      toast.error("Please create a project first and then you can add sellers");
      return
    }
    try {
      setLoading(true);
      const payLoad = {
        email: sellerDetails.email,
        projectId: projects[selectedProjectIndex].id,
      };

      const response = await apiClient.post(
        `${apiClient.URLS.companyonboarding}/projects/verify-seller-email`,
        payLoad
      );

      if (response.body?.id) {
        setSellerDetails({
          firstName: response.body?.firstName,
          lastName: response.body?.lastName,
          email: response.body?.email,
          password: response.body?.password,
          phone: response.body?.phone,
          profile: response.body?.profile,
          priceRange: response.body?.priceRange,
        });
        setOtpVerifed(true);
        setIsEditing(true);
        setIsExisting(true);
      } else {
        toast.success(`OTP sent successfully to this email ${payLoad.email}`);
        setSentOtp(true);
      }
    } catch (error) {
      console.log(error);
      //   toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      if (selectedProjectIndex === null || selectedProjectIndex === undefined) {
        toast.error("No project selected");
        setLoading(false);
        return;
      }
      const payLoad = {
        email: sellerDetails.email,
        otp: otp.join("").toString(),
        projectId: projects[selectedProjectIndex].id,
      };
      const response = await apiClient.post(
        `${apiClient.URLS.companyonboarding}/projects/verify-seller-otp`,
        payLoad
      );

      if (response.status === 200) {
        toast.success("OTP verified successfully");
        setOtpVerifed(true);
      }
    } catch (error) {
      console.log(error);
      //   toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitDetails = async () => {
    if (selectedProjectIndex === null) {
      toast.error("Please create a project first and then you can add sellers");
      return
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
          `${apiClient.URLS.companyonboarding}/projects/save-seller-details`,
          payLoad
        );
        if (response.status) {
          toast.success("Successfully saved seller details");
          handleDrawerClose();
          return;

        }

        addSeller(selectedProjectIndex, sellerDetails);

        toast.success("Successfully saved seller details");
      } catch (error) {
        console.log(error);
        // toast.error(error.message);
      } finally {
        setLoading(false);
        setOpendrawer(false);
        setSelectedSellerIndex(-1);
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
          `${apiClient.URLS.companyonboarding}/projects/update-seller-details`,
          payLoad
        );

        if (isExisting) {
          addSeller(selectedProjectIndex, sellerDetails);
        } else {
          updateSeller(
            selectedProjectIndex,
            selectedSellerIndex,
            sellerDetails
          );
        }

        toast.success("Successfully updated seller details");
      } catch (error) {
        console.log(error);
        toast.error((error as Error).message);
      } finally {
        setLoading(false);
        setOpendrawer(false);
        setSelectedSellerIndex(-1);
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
    <div className="w-full sm:w-[80%] lg:w-[70%] rounded-md px-3 py-5">
      <div className="font-bold md:text-[18px] text-[14px] flex flex-row gap-2 mb-4">
        <CautionIcon />
        <p>Seller details</p>
      </div>
      <div className="w-full flex flex-col gap-3 px-3 py-3">
        <div className="flex md:flex-row flex-col gap-3">
          <CustomInput
            label="Enter Mobile Number"
            labelCls="text-[#636B70] md:text-[14px] text-[12px] font-medium"
            name="mobile"
            placeholder="Mobile number"
            value={sellerDetails.phone || ""}
            onChange={(e) =>
              handleChange({ name: "phone", value: e.target.value })
            }


            errorMsg={errors?.phone}
            type="text"
            className="w-full p-[6px]"
            disabled
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
            className="w-full p-[6px]"
            disabled
          />
        </div>

        <div className="flex md:flex-row flex-col  justify-between gap-x-3 gap-y-2 my-3 w-full">
          {!otpVerifed && (
            <div className="flex flex-col p-3 w-[40%]">
              <div className="flex flex-row gap-2">
                {sentOtp ? (
                  <Button
                    className="bg-[#3B82F6] text-white md:text-[16px] text-[12px] rounded-md px-2 py-1 w-full"
                    onClick={() => verifyOtp()}
                  >
                    Verify OTP
                  </Button>
                ) : (
                  <Button
                    className="bg-[#3B82F6] text-white text-nowrap md:text-[16px] text-[12px] rounded-md px-2 md:py-1 py-0 w-full"
                    onClick={() => sendOtp()}
                  >
                    Send OTP
                  </Button>
                )}
                <Button className="bg-[white] text-[#3B82F6] text-nowrap md:text-[16px] text-[12px]  rounded-md px-3 py-1 w-full flex items-center gap-2">
                  Retry in 30 secs
                  <ResendIcon />
                </Button>
              </div>
              <div className="mt-3 flex flex-col">
                <p className="text-[#636B70] text-[12px] md:text-[14px] font-medium">
                  Validate OTP
                </p>
                <div className="flex flex-row gap-2">
                  {Array(4)
                    .fill("")
                    .map((_, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        pattern="[0-9]*"
                        className="md:w-12 md:h-12 w-8 h-8 text-center border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] appearance-none [-moz-appearance:textfield]"
                        onChange={(e) => handleOtpChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                      />
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Password and confirm password */}
          {otpVerifed && !isEditing && (
            <div className="flex md:flex-row flex-col  w-[70%] gap-3">
              <CustomInput
                label="Create Password"
                labelCls="text-[#636B70] md:text-[14px] text-[12px] font-medium"
                name="password"
                type="password"
                placeholder="Password"
                value={sellerDetails?.password}
                errorMsg={errors?.password}
                disabled
                onChange={(e) =>
                  handleChange({ name: "password", value: e.target.value })
                }
                className="w-full p-[6px]"
              />
              <CustomInput
                label="Confirm password"
                labelCls="text-[#636B70] md:text-[14px] text-[12px] font-medium"
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                disabled
                value={confirmPassword}
                errorMsg={errors?.confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                className="w-full p-[6px]"
              />
            </div>
          )}
        </div>
        {/* First name and last name and price range */}
        {otpVerifed && (
          <div className="flex md:flex-row flex-col gap-x-5 my-3">
            <CustomInput
              label="First name"
              labelCls="text-[#636B70] md:text-[14px] text-[12px] font-medium"
              name="firstName"
              className="w-full p-[6px]"
              placeholder="First name"
              disabled
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
              className="w-full p-[6px]"
              placeholder="Last name"
              labelCls="text-[#636B70] md:text-[14px] text-[12px] font-medium"
              value={sellerDetails?.lastName}
              errorMsg={errors?.lastName}
              disabled
              onChange={(e) =>
                handleChange({ name: "lastName", value: e.target.value })
              }
              type="text"
            />
            <CustomInput
              label="Price range"
              name="priceRange"
              className="w-full p-[6px]"
              placeholder="Price range"
              labelCls="text-[#636B70] md:text-[14px] text-[12px] font-medium"
              value={sellerDetails?.priceRange}
              errorMsg={errors?.priceRange}
              disabled
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
              labelCls="text-black md:text-[14px] text-[12px] font-medium mb-4 block"
              className="w-[250px] sm:w-[400px] "
              onFileChange={(data) =>
                handleChange({ name: "profile", value: data[0] })
              }
              initialFileUrl={
                sellerDetails?.profile ? [sellerDetails?.profile] : undefined
              }
              folderName="company-project/sellerProfile"
            />
          </div>
        )}

        <div className="flex justify-between items-center mt-20">
          <Button
            onClick={handleDrawerClose}
            className="md:px-10 px-7 md:py-[10px] py-[7px] border-[#3586FF] border-[1px] md:text-[16px] text-[12px] text-black hover:bg-blue-200 hover:text-white rounded-md font-medium"
          >
            Cancel
          </Button>
          <Button
            className="px-5 py-3 bg-[#3B82F6] md:text-[16px] text-[12px] text-white rounded-[8px]"
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
