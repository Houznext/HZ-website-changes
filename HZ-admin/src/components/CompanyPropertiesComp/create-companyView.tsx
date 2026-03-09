import Button from "@/src/common/Button";
import Drawer from "@/src/common/Drawer";
import FileInput from "@/src/common/FileInput";
import { useCompanyPropertyStore } from "@/src/stores/companyproperty";
import React, { useEffect, useRef, useState } from "react";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import CustomInput from "@/src/common/FormElements/CustomInput";
import CompanyAddress from "./companyAddress";
import CompanyAward from "./companyAward";
import { ResendIcon } from "@/src/features/CustomBuilder/Icons";
import { IoArrowBack } from "react-icons/io5";
import Loader from "@/src/common/Loader";

const CreateCompanyView = () => {
  const {
    companyDetails,
    setCompanyId,
    setCompanyDetails,
    setDeveloperInformation,
    resetCompanyDetails,
  } = useCompanyPropertyStore();

  const [errors, setErrors] = useState({});
  const [otpVerifed, setOtpVerifed] = useState(false);
  const [sentOtp, setSentOtp] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = useState(Array(4).fill(""));
  const router = useRouter();
  const [loading, setLoading] = useState(false)


  useEffect(() => {
    resetCompanyDetails();
  }, []);

  // ----handle input changes----
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    developer?: boolean
  ) => {
    const { name, value, type } = e.target;

    const formattedValue =
      type === "number" ? parseInt(value, 10) || "" : value;

    if (developer) {
      setDeveloperInformation({ [name]: formattedValue });
    } else {
      setCompanyDetails({ [name]: formattedValue });
    }
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

  const validateForm = () => {
    const newErrors: any = {};
    const { developerInformation } = companyDetails;

    if (!developerInformation.Name.trim())
      newErrors.developerInformationName = "Developer Name is required";

    const phoneRegex = /^[0-9]{10}$/;
    if (!developerInformation.PhoneNumber.trim())
      newErrors.developerInformationPhoneNumber =
        "Developer Phone Number is required";
    else if (!phoneRegex.test(developerInformation.PhoneNumber))
      newErrors.developerInformationPhoneNumber =
        "Developer Phone Number must be 10 digits";

    if (!developerInformation.whatsappNumber.trim())
      newErrors.developerInformationWhatsappNumber =
        "Developer WhatsApp Number is required";
    else if (!phoneRegex.test(developerInformation.whatsappNumber))
      newErrors.developerInformationWhatsappNumber =
        "Developer WhatsApp Number must be 10 digits";

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!developerInformation.officialEmail.trim())
      newErrors.developerInformationOfficialEmail =
        "Developer Official Email is required";
    else if (!emailRegex.test(developerInformation.officialEmail))
      newErrors.developerInformationOfficialEmail =
        "Developer Official Email is invalid";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCompanyForm = (): boolean => {
    const newErrors: any = {};
    if (!companyDetails.companyName.trim())
      newErrors.companyName = "Company Name is required";
    if (!companyDetails.RERAId.trim()) newErrors.RERAId = "RERA ID is required";

    if (!companyDetails.about.trim())
      newErrors.about = "About Company is required";

    const currentYear = new Date().getFullYear();
    if (!companyDetails.estdYear) {
      newErrors.estdYear = "Established Year is required";
    } else if (
      isNaN(parseInt(companyDetails.estdYear)) ||
      parseInt(companyDetails.estdYear) < 1950 ||
      parseInt(companyDetails.estdYear) > currentYear
    ) {
      newErrors.estdYear = `Established Year must be between 1950 and ${currentYear}`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Backend call functions

  const verifyOtp = async () => {
    setLoading(true)
    try {
      const response = await apiClient.post(
        `${apiClient.URLS.company_Onboarding}/verify-developer-otp`,
        {
          email: companyDetails.developerInformation.officialEmail,
          otp: otp.join("").toString(),
        },true
      );

      toast.success(response?.body?.message);
      setOtpVerifed(true);
      setLoading(false)
    } catch (error) {
      console.log("Error while verifying developer otp", error);
      setLoading(false)
    }
  };

  const handleCompanySubmit = async () => {
    if (!validateCompanyForm()) {
      toast.error("Validation Failed. Please check the form.");
      return;
    }
    if (validateForm()) {
      try {
        const payload = {
          companyName: companyDetails.companyName,
          estdYear: parseInt(companyDetails.estdYear),
          RERAId: companyDetails.RERAId,
          Logo: companyDetails.Logo || "",
          about: companyDetails.about,
          developerInformation: {
            Name: companyDetails.developerInformation.Name,
            PhoneNumber: companyDetails.developerInformation.PhoneNumber,
            whatsappNumber: companyDetails.developerInformation.whatsappNumber,
            officialEmail: companyDetails.developerInformation.officialEmail,
          },
        };

        const res = await apiClient.post(
          `${apiClient.URLS.company_Onboarding}`,
          payload,true
        );

        if (res.status === 201) {
          toast.success("Successfully onboarded Company");
          setCompanyId(res.body.id);
        }
      } catch (error) {
        console.error("Error occurred while submitting", error);
        toast.error("Error while creating company");
      }
    } else {
      console.log("Validation Failed", errors);
    }
  };

  const handleFileChange = async (url: string) => {
    setCompanyDetails({
      Logo: [url],
    });
  };

  const sendOtp = async () => {
    const developerEmail = companyDetails.developerInformation.officialEmail;
    if (developerEmail?.length === 0) {
      toast.error("Please enter developer official email");
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.post(
        `${apiClient.URLS.company_Onboarding}/verify-developer-email`,
        {
          email: developerEmail,
        },true
      );

      if (response.status === 201) {
        toast.success(response?.body?.message);
        setSentOtp(true);
        setLoading(false);
      }
    } catch (error) {
      console.log(
        "Error while sending otp for developer email verification",
        error
      );
      toast.error('Error while sending otp for developer email verification');
      setLoading(false);
    }
  };

  // ---common input components
  const renderInput = (
    name: string,
    label: string,
    type: "text" | "number" | "email" | "password" | "textarea",
    placeholder?: string
  ) => (
    <CustomInput
      name={name}
      label={label}
      labelCls="label-text text-gray-700 font-medium"
      className={`w-full px-3  rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text ${
        type === "textarea" ? "h-[120px]" : ""
      }`}
      type={type}
      required
      placeholder={placeholder}
      onChange={handleInputChange}
      errorMsg={errors[name as keyof typeof errors]}
      value={companyDetails[name as keyof typeof companyDetails] || ("" as any)}
    />
  );

  const renderDeveloperInput = (
    name: string,
    label: string,
    type: "text" | "number" | "email" | "password",
    placeholder = ""
  ) => (
    <CustomInput
      name={name}
      label={label}
      labelCls="label-text text-gray-700 font-medium"
      className="w-full px-3 rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text"
      rootCls="w-full"
      type={type}
      placeholder={placeholder}
      value={
        companyDetails.developerInformation[
        name as keyof typeof companyDetails.developerInformation
        ] || ""
      }
      onChange={(e) => handleInputChange(e, true)}
      errorMsg={
        errors[`developerInformation${name[0].toUpperCase()}${name.slice(1)}`]
      }
    />
  );

  if (loading) return (
    <div className="w-full min-h-[400px] flex items-center justify-center">
      <Loader />
    </div>
  )

  return (
    <div className="relative flex flex-col gap-6 md:px-8 px-4 py-6 w-full">
      {/* Back Button & Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => router.push("/company-property")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors w-fit"
        >
          <IoArrowBack className="w-5 h-5" />
          <span className="label-text font-medium">Back</span>
        </button>
        <div className="border-b border-gray-100 pb-4">
          <h1 className="heading-text">Company Properties OnBoarding</h1>
        </div>
      </div>

      {/* Company Basic Details Section */}
      <section className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#3586FF]/5 to-transparent px-6 py-4 border-b border-gray-100">
          <h2 className="sub-heading text-[#3586FF] font-semibold">
            Company Basic Details
          </h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col gap-5 max-w-[600px]">
            {renderInput(
              "companyName",
              "Enter Company Name",
              "text",
              "Enter Company Name"
            )}
            {renderInput(
              "estdYear",
              "Enter Established Year",
              "number",
              "Enter Established Year"
            )}
            {renderInput(
              "RERAId",
              "Enter RERA Number",
              "text",
              "Enter RERA Number eg:P91343423233"
            )}

            <FileInput
              type={"file"}
              label="Upload Company Logo"
              labelCls="label-text text-gray-700 font-medium"
              onFileChange={handleFileChange}
              folderName="companylogo"
              initialFileUrl={companyDetails?.Logo[0]}
            />

            {renderInput(
              "about",
              "Enter About Company...",
              "textarea",
              "About Company ..."
            )}

            {/* Developer Information Sub-section */}
            <div className="mt-4">
              <h3 className="sub-heading text-[#3586FF] font-semibold mb-4">
                Developer Information
              </h3>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                <div className="grid md:grid-cols-2 gap-5">
                  {renderDeveloperInput(
                    "Name",
                    "Developer Name",
                    "text",
                    "Enter Developer Name"
                  )}
                  {renderDeveloperInput(
                    "PhoneNumber",
                    "Phone Number",
                    "number",
                    "Enter Phone Number"
                  )}
                  {renderDeveloperInput(
                    "officialEmail",
                    "Official Email",
                    "text",
                    "Enter official email..."
                  )}
                  {renderDeveloperInput(
                    "whatsappNumber",
                    "WhatsApp Number",
                    "number",
                    "Enter whatsapp number..."
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            {otpVerifed && (
              <div className="flex w-full justify-end pt-4">
                <Button
                  onClick={handleCompanySubmit}
                  className="bg-[#3586FF] hover:bg-[#2563eb] text-white btn-text font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Submit
                </Button>
              </div>
            )}

            {/* OTP Section */}
            {!otpVerifed && (
              <div className="flex flex-row justify-between items-end gap-4 pt-4 border-t border-gray-100 mt-2">
                {sentOtp ? (
                  <>
                    <div className="flex flex-col gap-2">
                      <p className="label-text font-medium text-gray-700">
                        Enter your OTP
                      </p>
                      <div className="flex gap-2">
                        {Array(4)
                          .fill("")
                          .map((_, index) => (
                            <input
                              key={index}
                              type="text"
                              maxLength={1}
                              ref={(el) => (inputRefs.current[index] = el) as any}
                              pattern="[0-9]*"
                              className="w-11 h-11 text-center border border-gray-200 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#3586FF] focus:border-[#3586FF] transition-all"
                              onChange={(e) =>
                                handleOtpChange(e.target.value, index)
                              }
                              onKeyDown={(e) => handleKeyDown(e, index)}
                            />
                          ))}
                      </div>
                    </div>
                    <Button
                      className="bg-[#3586FF] hover:bg-[#2563eb] text-white btn-text font-semibold rounded-lg px-6 py-2.5 transition-all"
                      onClick={() => verifyOtp()}
                    >
                      Verify OTP
                    </Button>
                  </>
                ) : (
                  <>
                    <div></div>
                    <Button
                      className="bg-[#3586FF] hover:bg-[#2563eb] text-white btn-text font-semibold rounded-lg px-6 py-2.5 transition-all"
                      onClick={() => sendOtp()}
                    >
                      Send OTP
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Company Details Section (after OTP verification) */}
      {otpVerifed && (
        <div className="flex flex-col gap-5">
          <div className="border-b border-gray-100 pb-2">
            <h2 className="sub-heading text-[#3586FF] font-semibold">
              Company Details
            </h2>
          </div>
          <CompanyAddress />
          <CompanyAward />
        </div>
      )}
    </div>
  );
};

export default CreateCompanyView;
