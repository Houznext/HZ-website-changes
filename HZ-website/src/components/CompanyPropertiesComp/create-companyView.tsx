import Button from "@/common/Button";
import Drawer from "@/common/Drawer";
import FileInput from "@/common/FileInput";
import { useCompanyPropertyStore } from "@/store/companyproperty";
import React, { useEffect, useRef, useState } from "react";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import CustomInput from "@/common/FormElements/CustomInput";
import CompanyAddress from "./companyAddress";
import CompanyAward from "./companyAward";
// import { ResendIcon } from "@/features/CustomBuilder/Icons";
import { IoArrowBack } from "react-icons/io5";
import Loader from "@/components/Loader";

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
        `${apiClient.URLS.companyonboarding}/verify-developer-otp`,
        {
          email: companyDetails.developerInformation.officialEmail,
          otp: otp.join("").toString(),
        }
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
          `${apiClient.URLS.companyonboarding}`,
          payload
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
  // const handleFileChange = async (event:any) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     const url = URL.createObjectURL(file);
  //     setCompanyDetails({
  //       Logo: [url],
  //     });
  //   }
  // };

  const sendOtp = async () => {
    const developerEmail = companyDetails.developerInformation.officialEmail;
    if (developerEmail?.length === 0) {
      toast.error("Please enter developer official email");
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.post(
        `${apiClient.URLS.companyonboarding}/verify-developer-email`,
        {
          email: developerEmail,
        }
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
      labelCls={"md:text-[16px] text-[12px] font-medium"}
      className={`px-3 py-[6px] text-[12px] placeholder:text-[12px] ${type == "textarea" ? "h-[140px]" : ""
        }`}
      type={type}
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
      labelCls={"md:text-[16px] text-[12px] font-medium "}
      className="px-3 py-[6px] text-[14px] placeholder:text-[12px] "
      rootCls="w-full"
      type={type}
      placeholder={placeholder}
      value={
        companyDetails.developerInformation[
        name as keyof typeof companyDetails.developerInformation
        ] || ""
      }
      onChange={(e) => handleInputChange(e, true)}
    // errorMsg={
    //   errors[`developerInformation${name[0].toUpperCase()}${name.slice(1)}`]
    // }
    />
  );

  if (loading) return (
    <div className="w-full">
      <Loader />
    </div>
  )
  // render modals
  return (
    <div className="relative flex flex-col gap-3 md:px-10 px-4 py-5 w-full ">
      <div className="flex flex-row justify-start items-center gap-2 cursor-pointer" onClick={() => router.push("/user/company-property")}>
        <IoArrowBack />
        <p className="md:text-[16px] text-[14px] font-medium">Back</p>
      </div>
      <h1 className="md:text-[24px] text-[18px] mt-4 font-medium">
        Company Properties OnBoarding
      </h1>
      {/* ---company create section--- */}
      <section >
        <div className="flex flex-col rounded-md  w-full md:px-7 px-4 py-4 shadow-custom mb-5 bg-white">
          <p className="md:text-[24px] text-[16px] font-medium mb-3 text-[#3586FF]">
            Company Basic Details
          </p>
          <div className="flex flex-col gap-3 mt-5 w-full ">
            <div className="grid md:grid-cols-2 grid-cols-1 md:gap-6 gap-3">
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
            </div>
            <div className="grid md:grid-cols-2 grid-cols-1 md:gap-6 gap-3">
              <div>
                <FileInput
                  type={"file"}
                  label="Upload Company Logo"
                  labelCls="md:text-[16px] text-[12px] tetx-[#3B82F6] font-medium"
                  onFileChange={handleFileChange}
                  folderName="companylogo"
                  initialFileUrl={companyDetails?.Logo[0

                  ]}
                />
              </div>
              <div className="flex flex-row gap-5 justify-between mt-4">
                {renderInput(
                  "about",
                  "Enter About Company...",
                  "textarea",
                  "About Company ..."
                )}
              </div>
            </div>

            <div className=" rounded-md  w-full">
              <p className="text-[20px] font-medium text-[#3586FF]">
                Developer Information :
              </p>
              <div className="flex md:flex-row flex-col w-full gap-4 mt-4 shadow-custom px-5 py-4 rounded-md">
                <div className="w-full  flex flex-col md:gap-5 gap-4">
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
                    "Enter Phone Number "
                  )}
                </div>
                <div className="w-full flex flex-col gap-5">
                  <div className="w-full">
                    {renderDeveloperInput(
                      "officialEmail",
                      "Official Email",
                      "text",
                      "Enter official email..."
                    )}
                  </div>

                  {renderDeveloperInput(
                    "whatsappNumber",
                    "WhatsApp Number",
                    "number",
                    "Enter whatsapp number .."
                  )}
                </div>
              </div>
            </div>
            {otpVerifed && (
              <div className="flex w-full justify-end">

                <Button
                  onClick={handleCompanySubmit}
                  className="mt-5 px-10 py-[10px] bg-[#3586FF] text-white rounded-md font-medium"
                >
                  Submit
                </Button>
              </div>
            )}
            {!otpVerifed && (
              <>
                <div className="flex flex-row justify-between gap-2 ">
                  {!sentOtp && <div></div>}
                  {sentOtp && (
                    <div className="flex flex-col px-3">
                      <p className="md:text-[18px] text-[12px] font-medium">
                        Enter your Otp
                      </p>
                      <div className="flex flex-row gap-2">
                        {Array(4)
                          .fill("")
                          .map((_, index) => (
                            <input
                              key={index}
                              type="text"
                              maxLength={1}
                              ref={(el) => (inputRefs.current[index] = el) as any}
                              pattern="[0-9]*"
                              className="md:w-10 md:h-10 w-8 h-8 text-center border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] appearance-none [-moz-appearance:textfield]"
                              onChange={(e) =>
                                handleOtpChange(e.target.value, index)
                              }
                              onKeyDown={(e) => handleKeyDown(e, index)}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                  {sentOtp ? (
                    <>

                      <Button
                        className="bg-[#3B82F6] text-white font-medium md:text-[16px] text-[12px] rounded-md px-2 py-2 w-full max-w-[100px] "
                        onClick={() => verifyOtp()}
                      >
                        Verify OTP
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="bg-[#3B82F6] text-white font-medium  md:text-[16px] text-[12px] rounded-md px-2 py-2 w-full max-w-[100px] md:h-[50px]"
                      onClick={() => sendOtp()}

                    >
                      Send OTP
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      <div className="mt-4 flex flex-col gap-4">
        {otpVerifed &&
          <>
            <p className="text-[20px] font-medium text-[#3586FF]"> Company Details:</p>
            <div>
              <CompanyAddress />
            </div>
            <div>
              <CompanyAward />
            </div></>
        }
      </div>
    </div>
  );
};

export default CreateCompanyView;
