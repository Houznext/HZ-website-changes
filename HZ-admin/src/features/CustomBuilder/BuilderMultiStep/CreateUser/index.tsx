import React, { useEffect, useRef, useState } from "react";
import Button from "@/src/common/Button";
import { CautionIcon, ResendIcon } from "../../Icons";
import CustomInput from "@/src/common/FormElements/CustomInput";
import useCustomBuilderStore from "@/src/stores/custom-builder";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import Loader from "@/src/common/Loader";
import { useSession } from "next-auth/react";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CustomTooltip from "@/src/common/ToolTip";
import {
  getCurrentAddress,
} from "@/src/utils/locationDetails/datafetchingFunctions";
import { MapPin, Mail, Phone, Info, VerifiedIcon } from "lucide-react";

const CreateCBuser = ({ setopenDrawer, handleClose }: any) => {
  const {
    customerOnboarding,
    custom_builder_id,
    customerId,
    setCustomerId,
    updateContactDetails,
    updateaddressDetails,
    contactErrors,
    updateContactErrors,
    clearContactErrors,
    setCustomBuilderID,
  } = useCustomBuilderStore();
  const { contactDetails, addressDetails } = customerOnboarding;
  const [otp, setOtp] = useState(Array(4).fill(""));
  const [sentOtp, setSentOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verificationMode, setVerificationMode] = useState<"email" | "phone">(
    "email"
  );
  const [verifiedBy, setVerifiedBy] = useState<"email" | "phone" | null>(null);
  const [isContactSaved, setIsContactSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [user, setUser] = useState<any>(null);
  const session = useSession();
  const { hasPermission, permissions } = usePermissionStore((state) => state);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (session?.status === "authenticated") {
      setUser(session.data?.user);
    }
  }, [session?.status]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleInputChange = (name: string, value: string) => {
    updateContactDetails({ [name]: value });
    if (contactErrors[name]) {
      const updatedErrors = { ...contactErrors };
      delete updatedErrors[name];
      updateContactErrors(updatedErrors);
    }
  };

  const validateContactFields = () => {
    const newErrors: { [key: string]: string } = {};
    if (!contactDetails.first_name.trim())
      newErrors.first_name = "First name is required.";

    if (!contactDetails.last_name.trim())
      newErrors.last_name = "Last name is required.";

    if (!contactDetails.mobile || contactDetails.mobile.length !== 10)
      newErrors.mobile = "Valid mobile number is required.";

    if (!contactDetails.email || !/\S+@\S+\.\S+/.test(contactDetails.email))
      newErrors.email = "Valid email address is required.";

    if (!contactDetails.password) newErrors.password = "Password is required.";

    if (contactDetails.password !== contactDetails.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

    updateContactErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOtpChange = (value: string, index: number) => {
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const validateAddressFields = () => {
    const newErrors: { [key: string]: string } = {};
    if (!addressDetails.city) newErrors.city = "City is required.";
    if (!addressDetails.state) newErrors.state = "State is required.";
    if (!addressDetails.locality) newErrors.locality = "Locality is required.";
    if (!addressDetails.zipCode || addressDetails.zipCode.length !== 6)
      newErrors.zipCode = "Valid zipCode is required.";
    if (!addressDetails.address_line_1)
      newErrors.address_line_1 = "Address line 1 is required.";
    updateContactErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  const getCurrentPosition = () => {
    setLoading(true);
    setApiError("");

    const normalizeAddress = (raw: any) => {
      const a = raw?.address ?? raw ?? {};
      const street = a.street ?? a.road ?? a.route ?? a.streetName ?? "";
      const pin = String(
        a.zipCode ?? a.postalCode ?? a.pincode ?? a.postal_code ?? ""
      )
        .replace(/\D/g, "")
        .slice(0, 6);

      return {
        city: a.city ?? "",
        state: a.state ?? "",
        locality: a.locality ?? "",
        street,
        zipCode: pin,
        formattedAddress: a.formattedAddress ?? a.formatted_address ?? "",
        city_place_id: a.city_place_id ?? a.cityPlaceId ?? "",
        locality_place_id: a.locality_place_id ?? a.localityPlaceId ?? "",
      };
    };

    try {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const { latitude, longitude } = coords;

          const raw = await getCurrentAddress(latitude, longitude);
          const addr = normalizeAddress(raw);

          updateaddressDetails({
            city: addr.city,
            state: addr.state,
            locality: addr.locality,
            zipCode: addr.zipCode,
            address_line_1: addr.street || "",
            address_line_2: "",
          });

          setLoading(false);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    } catch (e) {
      console.error("Unexpected geolocation error:", e);
      setLoading(false);
    }
  };

  const validateBeforeOtp = () => {
    if (verificationMode === "phone") {
      if (!contactDetails.mobile || contactDetails.mobile.length !== 10) {
        toast.error("Please enter valid phone number");
        return false;
      }
    } else {
      if (!contactDetails.email || !/\S+@\S+\.\S+/.test(contactDetails.email)) {
        toast.error("Please enter valid email address");
        return false;
      }
    }
    return true;
  };

  const handleCancel = () => {
    updateContactDetails({
      mobile: "",
      email: "",
      password: "",
      confirmPassword: "",
      first_name: "",
      last_name: "",
    });

    updateaddressDetails({
      city: "",
      state: "",
      locality: "",
      zipCode: "",
      address_line_1: "",
      address_line_2: "",
    });

    setOtp(Array(4).fill(""));
    setSentOtp(false);
    setOtpVerified(false);
    clearContactErrors();

    handleClose();
  };

  const handleAddressChange = (name: string, value: string) => {
    updateaddressDetails({ [name]: value });
    if (contactErrors[name]) {
      const updatedErrors = { ...contactErrors };
      delete updatedErrors[name];
      updateContactErrors(updatedErrors);
    }
  };

  const handleSendOtp = async (sentOtpFlag: boolean) => {
    if (!validateBeforeOtp()) return;

    setIsLoading(true);
    try {
      if (!sentOtpFlag) {
        // Send OTP
        const res = await apiClient.post(
          `${apiClient.URLS.cb_customer}/verify-email`,
          {
            email:
              verificationMode === "email" ? contactDetails.email : undefined,
            phone:
              verificationMode === "phone" ? contactDetails.mobile : undefined,
          },
          true
        );
        const body = res.body;

        if (body?.status === "already_verified") {
          toast.error(`${body.message}. Please login to continue`);
          handleCancel();
          setIsLoading(false);
          return;
        }

        if (body?.status === "otp_sent") {
          toast.success(body.message);
          setSentOtp(true);
          setOtp(Array(4).fill(""));
          setResendCooldown(30);
        } else {
          toast.error("Unexpected response while sending OTP");
        }
        setIsLoading(false);
      } else {
        // Verify OTP
        const res = await apiClient.post(
          `${apiClient.URLS.cb_customer}/verify-otp`,
          {
            email:
              verificationMode === "email" ? contactDetails.email : undefined,
            phone:
              verificationMode === "phone" ? contactDetails.mobile : undefined,
            otp: otp.join("").toString(),
          },
          true
        );
        setIsLoading(false);
        if (res.body?.message === "Invalid OTP") {
          toast.error("Invalid OTP, please try again");
          return;
        }
        if (
          res.body?.message === "Existing user upgraded to custom builder user"
        ) {
          toast.success("Existing user upgraded to Custom Builder role");
        } else if (
          res.body?.message === "Existing user verified as custom builder user"
        ) {
          toast.success("Existing user verified successfully");
        } else if (res.body?.message === "New custom builder user created") {
          toast.success("New Custom Builder user created and verified");
        } else {
          toast.success("OTP verified successfully");
        }

        if (res.body?.user?.id) {
          setCustomerId(res.body.user.id);
        }

        setOtpVerified(true);
        setVerifiedBy(verificationMode);
      }
    } catch (err) {
      setIsLoading(false);
      console.error("Error sending OTP:", err);
      toast.error("Error occurred while sending or verifying OTP");
    }
  };

  const submitDetails = async () => {
    if (!validateContactFields()) {
      return;
    }
    setIsLoading(true);
    const branchId =
      session?.data?.user?.branchMemberships?.[0]?.branchId;

    if (!branchId) {
      toast.error("Branch information not available");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        firstName: contactDetails.first_name,
        lastName: contactDetails.last_name,
        email: contactDetails.email,
        phone: contactDetails.mobile,
        password: contactDetails.password,
        branchId: String(branchId),
        assignCustomerBranchRole: true,
        createCustomBuilder: true,
      };

      const response = await apiClient.post(
        `${apiClient.URLS.cb_customer}/save-customer-details/${user?.id}`,
        payload,
        true
      );

      if (response.status === 201) {
        setIsLoading(false);
        toast.success("Contact details saved successfully");
        clearContactErrors();
        setIsContactSaved(true);
      }
    } catch (err) {
      setIsLoading(false);
      console.error("Error saving contact details", err);
      toast.error("Error occurred while saving details");
    }
  };

  const onSaveAddress = async () => {
    if (!validateAddressFields()) {
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        city: addressDetails.city,
        state: addressDetails.state,
        locality: addressDetails.locality,
        zipCode: addressDetails.zipCode.toString(),
        address_line_1: addressDetails.address_line_1,
        address_line_2: addressDetails.address_line_2,
        branchId: session?.data?.user?.branchMemberships?.[0]?.branchId,
      };
      const response = await apiClient.post(
        `${apiClient.URLS.cb_location}/${customerId}`,
        {
          ...payload,
        },
        true
      );
      if (response.status === 201) {
        setCustomBuilderID(response?.body?.customBuilderId);
        setIsLoading(false);
        setopenDrawer(false);
        toast.success("Address saved successfully");
      }
    } catch (err) {
      setIsLoading(false);
      console.log("error", err);
      console.log("error occured while saving address", err);
      toast.error("Error occured while saving address");
    }
  };
  if (isLoading)
    return (
      <div className="h-full w-full min-h-[200px]">
        <Loader tagline="Processing..." />
      </div>
    );
  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    handleSendOtp(false);
  };

  const resetVerificationMode = (mode: "email" | "phone") => {
    updateContactDetails({
      mobile: "",
      email: "",
      password: "",
      confirmPassword: "",
      first_name: "",
      last_name: "",
    });
    setVerificationMode(mode);
    setSentOtp(false);
    setOtpVerified(false);
    setOtp(Array(4).fill(""));
  };

  return (
    <div className="flex flex-col  gap-5 md:px-4 px-3 md:py-6 py-4 bg-slate-50 min-w-full">
      <h2 className="text-lg md:text-2xl font-bold md:mb-1 text-[#3586FF] tracking-tight">
        Create Custom Builder User
      </h2>

      {/* Info: Both credentials for login */}
      <div className="flex items-start gap-3 px-1 py-1 rounded-lg max-w-[900px]">
        <Info className="w-4 h-4 text-[#3586FF] shrink-0 mt-0.5" />
        <p className="sublabel-text text-[#3586FF]">
          Both email and phone number will be stored. Users can log in with either credential.
        </p>
      </div>

      <div className="rounded-xl px-4 py-6 w-full bg-white shadow-sm border border-slate-200 max-w-[900px]">
        {!otpVerified && (
          <div className="mb-6">
            <p className="label-text font-medium text-slate-600 mb-3">Verify via</p>
            <div className="inline-flex rounded-lg bg-slate-100 p-1 gap-1">
              <button
                type="button"
                onClick={() => resetVerificationMode("email")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium label-text transition-all ${verificationMode === "email"
                  ? "bg-white text-[#3586FF] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
              <button
                type="button"
                onClick={() => resetVerificationMode("phone")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium label-text transition-all ${verificationMode === "phone"
                  ? "bg-white text-[#3586FF] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <Phone className="w-4 h-4" />
                Phone
              </button>
            </div>
          </div>
        )}
        <div className="font-semibold text-base flex flex-row gap-2 mb-4">
          <CautionIcon />
          <span>Contact details</span>
        </div>
        <div className="w-full flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {verifiedBy === "phone" ||
              (!otpVerified && verificationMode === "phone") ? (
              <CustomInput
                label="Mobile Number"
                labelCls="text-slate-600 label-text font-medium"
                placeholder="Enter 10-digit mobile number"
                name="mobile"
                required
                value={contactDetails.mobile}
                onChange={(e) => handleInputChange("mobile", e.target.value)}
                errorMsg={contactErrors?.mobile}
                type="number"
                disabled={verificationMode !== "phone"}
                className="w-full"
                rootCls="max-w-[350px]"
              />
            ) : null}

            {verifiedBy === "email" ||
              (!otpVerified && verificationMode === "email") ? (
              <CustomInput
                label="Email Address"
                labelCls="text-slate-600 label-text font-medium"
                name="email"
                placeholder="Enter email address"
                required
                value={contactDetails.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                errorMsg={contactErrors?.email}
                type="email"
                disabled={verificationMode !== "email"}
                className="w-full"
                rootCls="max-w-[350px]"
              />
            ) : null}
          </div>

          <div className="flex md:flex-row flex-col  justify-between gap-x-3 gap-y-2 w-full">
            {!otpVerified && (
              <div className="flex flex-col gap-4 p-2 rounded-lg bg-slate-50 border border-slate-100 md:max-w-sm">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    className="bg-[#3586FF] hover:bg-[#456ad3] btn-text text-nowrap text-white font-medium label-text rounded-lg px-4 py-1 w-full"
                    onClick={() => handleSendOtp(sentOtp)}
                  >
                    {sentOtp ? "Verify OTP" : "Send OTP"}
                  </Button>
                  {sentOtp && (
                    <Button
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0}
                      className="bg-white font-medium btn-text text-nowrap text-[#3586FF] label-text border border-[#2563eb] rounded-lg px-4 py-1 w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                      <ResendIcon />
                    </Button>
                  )}
                </div>
                {sentOtp && (
                  <div className="flex flex-col gap-2">
                    <p className="text-slate-600 label-text font-medium">Enter OTP</p>
                    <div className="flex gap-2">
                      {Array(4)
                        .fill("")
                        .map((_, index) => (
                          <input
                            key={index}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            ref={(el) => {
                              inputRefs.current[index] = el as HTMLInputElement;
                            }}
                            pattern="[0-9]*"
                            value={otp[index]}
                            className="w-8 h-8 sm:w-10 sm:h-10 text-center border border-slate-300 rounded-lg text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            onChange={(e) =>
                              handleOtpChange(e.target.value, index)
                            }
                            onKeyDown={(e) => handleKeyDown(e, index)}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {otpVerified && (
              <div className="flex flex-col w-full gap-5">
                <p className="label-text text-slate-600">
                  Add the other credential so the user can log in with either email or phone.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {verificationMode === "email" ? (
                    <>
                      <div className="flex-1 max-w-[350px]">
                        <label className="block label-text font-medium text-slate-600 mb-1">
                          Email <span className="text-emerald-600 text-xs">(verified)</span>
                        </label>
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                          <Mail className="w-4 h-4 text-slate-500" />
                          {contactDetails.email}
                        </div>
                      </div>
                      <CustomInput
                        label="Phone Number"
                        name="mobile"
                        labelCls="text-slate-600 label-text font-medium"
                        placeholder="Enter phone number (required for login)"
                        value={contactDetails?.mobile}
                        errorMsg={contactErrors?.mobile}
                        onChange={(e) =>
                          handleInputChange("mobile", e.target.value)
                        }
                        type="text"
                        required
                        className="w-full text-[12px]"
                        rootCls="flex-1 max-w-[350px]"
                      />
                    </>
                  ) : (
                    <>
                      <div className="flex-1 max-w-[350px]">
                        <label className=" label-text font-medium flex items-center gap-2 text-slate-600 mb-1">
                          Phone <span className="text-emerald-600 text-xs flex items-center gap-1">
                            <VerifiedIcon className="w-4 h-4" />(verified)</span>
                        </label>
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                          <Phone className="w-4 h-4 text-slate-500" />
                          {contactDetails.mobile}
                        </div>
                      </div>
                      <CustomInput
                        label="Email Address"
                        name="email"
                        labelCls="text-slate-600 label-text font-medium"
                        placeholder="Enter email (required for login)"
                        value={contactDetails?.email}
                        errorMsg={contactErrors?.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        type="email"
                        required
                        className="w-full label-text"
                        rootCls="flex-1 max-w-[350px]"
                      />
                    </>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <CustomInput
                    label="Create Password"
                    labelCls="text-slate-600 label-text font-medium"
                    name="password"
                    type="password"
                    value={contactDetails?.password}
                    errorMsg={contactErrors?.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="Enter password"
                    required
                    className="w-full"
                    rootCls="flex-1 max-w-[280px]"
                  />
                  <CustomInput
                    label="Confirm Password"
                    labelCls="text-slate-600 label-text font-medium"
                    name="confirmPassword"
                    type="password"
                    value={contactDetails?.confirmPassword}
                    errorMsg={contactErrors?.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    placeholder="Confirm password"
                    required
                    className="w-full"
                    rootCls="flex-1 max-w-[280px]"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <CustomInput
                    label="First Name"
                    labelCls="text-slate-600 label-text font-medium"
                    name="first_name"
                    placeholder="Enter first name"
                    className="w-full"
                    value={contactDetails?.first_name}
                    errorMsg={contactErrors?.first_name}
                    onChange={(e) =>
                      handleInputChange("first_name", e.target.value)
                    }
                    required
                    type="text"
                    rootCls="flex-1 max-w-[280px]"
                  />
                  <CustomInput
                    label="Last Name"
                    labelCls="text-slate-600 label-text font-medium"
                    placeholder="Enter last name"
                    name="last_name"
                    className="w-full"
                    value={contactDetails?.last_name}
                    errorMsg={contactErrors?.last_name}
                    onChange={(e) =>
                      handleInputChange("last_name", e.target.value)
                    }
                    type="text"
                    required
                    rootCls="flex-1 max-w-[280px]"
                  />
                </div>
                {/* <div className="flex flex-col md:flex-row gap-3 mt-3">
  <CheckboxInput
    label="Assign Customer Branch Role"
    labelCls="font-medium text-[#000000] text-[14px]"
    name="assignCustomerBranchRole"
    className="w-4 h-4"
    checked={!!contactDetails.assignCustomerBranchRole}
    onChange={(checked) =>
      updateContactDetails({ assignCustomerBranchRole: checked })
    }
  />

  <CheckboxInput
    label="Create Custom Builder"
    labelCls="font-medium text-[#000000] text-[14px]"
    name="createCustomBuilder"
    className="w-4 h-4"
    checked={!!contactDetails.createCustomBuilder}
    onChange={(checked) =>
      updateContactDetails({ createCustomBuilder: checked })
    }
  />
</div> */}


              </div>
            )}
          </div>
          <div className="flex justify-end pt-2">
            {otpVerified && (
              <Button
                className="px-5 py-2.5 label-text bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium rounded-lg"
                onClick={submitDetails}
              >
                Save Contact Details
              </Button>
            )}
          </div>
        </div>
      </div>

      {isContactSaved && (
        <div className="bg-white shadow-sm border border-slate-200 rounded-xl md:px-4 px-3 md:py-6 py-4 max-w-[900px]">
          <div className="font-semibold text-base flex flex-row gap-2 mb-4">
            <CautionIcon />
            <span>Address Details</span>
          </div>
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <CustomInput
                label="City"
                placeholder="Enter city"
                labelCls="text-slate-600 label-text font-medium"
                name="city"
                value={addressDetails?.city}
                errorMsg={contactErrors?.city}
                onChange={(e) => handleAddressChange("city", e.target.value)}
                type="text"
                className="w-full"
                required
              />
              <CustomInput
                label="Locality"
                placeholder="Enter locality"
                labelCls="text-slate-600 label-text font-medium"
                name="locality"
                value={addressDetails?.locality}
                errorMsg={contactErrors?.locality}
                onChange={(e) =>
                  handleAddressChange("locality", e.target.value)
                }
                type="text"
                className="w-full"
                required
              />
              <CustomInput
                label="State"
                placeholder="Enter state"
                name="state"
                errorMsg={contactErrors?.state}
                labelCls="text-slate-600 label-text font-medium"
                value={addressDetails?.state}
                onChange={(e) => handleAddressChange("state", e.target.value)}
                type="text"
                className="w-full"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <CustomInput
                label="Zip Code"
                placeholder="Enter zip code"
                labelCls="text-slate-600 label-text font-medium"
                name="zipCode"
                value={addressDetails?.zipCode}
                errorMsg={contactErrors?.zipCode}
                onChange={(e) => handleAddressChange("zipCode", e.target.value)}
                type="number"
                className="w-full"
              />
              <CustomInput
                label="Address Line 1"
                placeholder="Enter address line 1"
                labelCls="text-slate-600 label-text font-medium"
                name="address_line_1"
                value={addressDetails?.address_line_1}
                errorMsg={contactErrors?.address_line_1}
                onChange={(e) =>
                  handleAddressChange("address_line_1", e.target.value)
                }
                type="text"
                className="w-full"
                required
              />
              <CustomInput
                label="Address Line 2 (optional)"
                placeholder="Enter address line 2"
                labelCls="text-slate-600 label-text font-medium"
                name="address_line_2"
                value={addressDetails?.address_line_2}
                onChange={(e) =>
                  handleAddressChange("address_line_2", e.target.value)
                }
                className="w-full"
                type="text"
              />
            </div>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="label-text font-medium text-slate-500">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <div className="flex justify-center mb-6">
              <Button
                onClick={getCurrentPosition}
                disabled={loading}
                className="bg-[#2563eb] hover:bg-[#1d4ed8] flex items-center justify-center gap-2 max-w-[280px] w-full text-white font-medium py-2.5 px-4 rounded-lg label-text"
              >
                <MapPin className="w-4 h-4" />
                {loading ? "Getting location…" : "Use my current location"}
              </Button>
            </div>
            {apiError && <p className="text-red-500 label-text mb-4">{apiError}</p>}

            <div className="flex justify-between gap-3 pt-2">
              <Button
                onClick={handleCancel}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-2.5 font-medium rounded-lg label-text"
              >
                Cancel
              </Button>
              <Button
                onClick={onSaveAddress}
                className="px-5 py-2.5 label-text bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium rounded-lg"
              >
                Save Address
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCBuser;
