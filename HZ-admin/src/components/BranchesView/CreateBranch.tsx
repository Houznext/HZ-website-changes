import React, { useRef, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import CustomInput from "@/src/common/FormElements/CustomInput";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import Button from "@/src/common/Button";
import Loader from "@/src/common/Loader";
import { CautionIcon, ResendIcon } from "@/src/features/CustomBuilder/Icons";
import apiClient from "@/src/utils/apiClient";
import CheckboxInput from "@/src/common/FormElements/CheckBoxInput";
import FileInput from "@/src/common/FileInput";
import CustomDate from "@/src/common/FormElements/CustomDate";

type BranchLevel = "ORG" | "STATE" | "CITY" | "AREA" | "OFFICE";
type BranchCategory = "GENERAL" | "CUSTOM_BUILDER" | "INTERIORS";
type VerificationMode = "email" | "phone";
type OwnerIdProofType = "AADHAAR" | "PAN" | "VOTER_ID" | "PASSPORT" | "DRIVING_LICENSE";

interface CreateBranchProps {
  setopenDrawer: (open: boolean) => void;
  handleClose: () => void;
  branches: any[];
  onCreated?: () => void;
  refetchBranches?: () => void;
   mode?: "create" | "edit";
    editingBranch?: any; 
}

interface ContactDetails {
  mobile: string;
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
}

interface BranchFormData {
  branchName: string;
  branchLevel: BranchLevel;
  parentBranchId: number | null;
  category: BranchCategory;
  isHeadOffice: boolean;
  isStateHQ: boolean;
  hasFranchiseFeePaid: boolean;
  franchisePaymentRef: string;
  // Owner identity / verification
  ownerAadhaarNumber: string;
  ownerPanNumber: string;
  ownerGstNumber: string;
  ownerIdProofType: OwnerIdProofType | "";
  ownerIdProofUrl: string;
  ownerPhotoUrl: string;
  ownerDateOfBirth: string;
  ownerAddress: string;
  // Branch physical details
  branchAddress: string;
  branchPhone: string;
  branchEmail: string;
  branchPhotoUrl: string;
}

const BRANCH_LEVEL_OPTIONS = [
  { label: "Head Office (ORG)", value: "ORG" },
  { label: "State", value: "STATE" },
  { label: "City", value: "CITY" },
  { label: "Area", value: "AREA" },
  { label: "Office", value: "OFFICE" },
];

const BRANCH_CATEGORY_OPTIONS = [
  { label: "General", value: "GENERAL" },
  { label: "Custom Builder", value: "CUSTOM_BUILDER" },
  { label: "Interiors", value: "INTERIORS" },
];

const ID_PROOF_TYPE_OPTIONS = [
  { label: "Aadhaar Card", value: "AADHAAR" },
  { label: "PAN Card", value: "PAN" },
  { label: "Voter ID", value: "VOTER_ID" },
  { label: "Passport", value: "PASSPORT" },
  { label: "Driving License", value: "DRIVING_LICENSE" },
];

const INITIAL_CONTACT_DETAILS: ContactDetails = {
  mobile: "",
  email: "",
  password: "",
  confirmPassword: "",
  first_name: "",
  last_name: "",
};

const INITIAL_BRANCH_FORM: BranchFormData = {
  branchName: "",
  branchLevel: "CITY",
  parentBranchId: null,
  category: "GENERAL",
  isHeadOffice: false,
  isStateHQ: false,
  hasFranchiseFeePaid: false,
  franchisePaymentRef: "",
  ownerAadhaarNumber: "",
  ownerPanNumber: "",
  ownerGstNumber: "",
  ownerIdProofType: "",
  ownerIdProofUrl: "",
  ownerPhotoUrl: "",
  ownerDateOfBirth: "",
  ownerAddress: "",
  branchAddress: "",
  branchPhone: "",
  branchEmail: "",
  branchPhotoUrl: "",
};

const CreateBranch: React.FC<CreateBranchProps> = ({
  setopenDrawer,
  handleClose,
  onCreated,
  branches,
   mode = "create",
  refetchBranches,
  editingBranch,
}) => {
  const session = useSession();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Contact & OTP State
  const [contactDetails, setContactDetails] = useState<ContactDetails>(
    INITIAL_CONTACT_DETAILS
  );
  const [contactErrors, setContactErrors] = useState<Record<string, string>>(
    {}
  );
  const [otp, setOtp] = useState<string[]>(Array(4).fill(""));
  const [sentOtp, setSentOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [ownerOtpToken, setOwnerOtpToken] = useState<string | null>(null);
  const [verificationMode, setVerificationMode] =
    useState<VerificationMode>("phone");
  const [verifiedBy, setVerifiedBy] = useState<VerificationMode | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
   const isEdit = mode === "edit";


  // Branch Form State
  const [branchForm, setBranchForm] =
    useState<BranchFormData>(INITIAL_BRANCH_FORM);
     useEffect(() => {
    if (!isEdit) {
      // create mode reset
      setContactDetails(INITIAL_CONTACT_DETAILS);
      setBranchForm(INITIAL_BRANCH_FORM);
      setOtp(Array(4).fill(""));
      setSentOtp(false);
      setOtpVerified(false);
      setOwnerOtpToken(null);
      setVerifiedBy(null);
      setResendTimer(0);
      setContactErrors({});
    }
  }, [isEdit]);
    useEffect(() => {
    if (!isEdit) return;
    if (!editingBranch) return;

    setBranchForm({
      branchName: editingBranch?.name ?? "",
      branchLevel: editingBranch?.level ?? "CITY",
      parentBranchId:
        editingBranch?.parent?.id ?? editingBranch?.parentId ?? null,
      category: editingBranch?.category ?? "GENERAL",
      isHeadOffice: !!editingBranch?.isHeadOffice,
      isStateHQ: !!editingBranch?.isStateHQ,
      hasFranchiseFeePaid: !!editingBranch?.hasFranchiseFeePaid,
      franchisePaymentRef: editingBranch?.franchisePaymentRef ?? "",
      ownerAadhaarNumber: editingBranch?.ownerAadhaarNumber ?? "",
      ownerPanNumber: editingBranch?.ownerPanNumber ?? "",
      ownerGstNumber: editingBranch?.ownerGstNumber ?? "",
      ownerIdProofType: editingBranch?.ownerIdProofType ?? "",
      ownerIdProofUrl: editingBranch?.ownerIdProofUrl ?? "",
      ownerPhotoUrl: editingBranch?.ownerPhotoUrl ?? "",
      ownerDateOfBirth: editingBranch?.ownerDateOfBirth
        ? new Date(editingBranch.ownerDateOfBirth).toISOString().split("T")[0]
        : "",
      ownerAddress: editingBranch?.ownerAddress ?? "",
      branchAddress: editingBranch?.branchAddress ?? "",
      branchPhone: editingBranch?.branchPhone ?? "",
      branchEmail: editingBranch?.branchEmail ?? "",
      branchPhotoUrl: editingBranch?.branchPhotoUrl ?? "",
    });

    // owner prefill (assuming editingBranch.owner exists)
    const owner = editingBranch?.owner || {};
    const fullName: string = owner?.fullName ?? "";
    const [first, ...rest] = fullName.split(" ").filter(Boolean);

    setContactDetails({
      mobile: owner?.phone ?? "",
      email: owner?.email ?? "",
      first_name: first ?? "",
      last_name: rest.join(" ") ?? "",
      password: "",
      confirmPassword: "",
    });

    // ✅ show forms directly
    setOtpVerified(true);
    setSentOtp(false);
    setResendTimer(0);
    setOwnerOtpToken(null);
    setVerifiedBy(null);
  }, [isEdit, editingBranch]);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Timer effect for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Helper Functions
  const updateContactDetails = (partial: Partial<ContactDetails>) => {
    setContactDetails((prev) => ({ ...prev, ...partial }));
  };

  const clearContactErrors = () => setContactErrors({});

  const handleInputChange = (name: keyof ContactDetails, value: string) => {
    updateContactDetails({ [name]: value });
    if (contactErrors[name]) {
      const updatedErrors = { ...contactErrors };
      delete updatedErrors[name];
      setContactErrors(updatedErrors);
    }
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

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    return /^[0-9]{10}$/.test(phone);
  };

  const validateBeforeOtp = (): boolean => {
    if (verificationMode === "phone") {
      if (!contactDetails.mobile) {
        toast.error("Please enter phone number");
        return false;
      }
      if (!validatePhone(contactDetails.mobile)) {
        toast.error("Please enter a valid 10-digit phone number");
        return false;
      }
    } else {
      if (!contactDetails.email) {
        toast.error("Please enter email address");
        return false;
      }
      if (!validateEmail(contactDetails.email)) {
        toast.error("Please enter a valid email address");
        return false;
      }
    }
    return true;
  };

  const validateOwnerFields = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!contactDetails.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!contactDetails.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    const isChangingPassword = !!contactDetails.password?.trim() || !!contactDetails.confirmPassword?.trim();

  if (!isEdit) {
    if (!contactDetails.password) newErrors.password = "Password is required";
    else if (contactDetails.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (contactDetails.password !== contactDetails.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
  } else if (isChangingPassword) {
    if (contactDetails.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (contactDetails.password !== contactDetails.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
  }

    // Validate the non-verified contact method
    if (verifiedBy === "phone") {
      if (contactDetails.email && !validateEmail(contactDetails.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    } else if (verifiedBy === "email") {
      if (contactDetails.mobile && !validatePhone(contactDetails.mobile)) {
        newErrors.mobile = "Please enter a valid 10-digit phone number";
      }
    }

    setContactErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBranchFields = (): boolean => {
    if (!branchForm.branchName.trim()) {
      toast.error("Branch name is required");
      return false;
    }

    if (!branchForm.branchLevel) {
      toast.error("Branch level is required");
      return false;
    }

    if (branchForm.branchLevel !== "ORG" && !branchForm.parentBranchId) {
      toast.error("Parent branch is required for non-ORG levels");
      return false;
    }

    if (
      branchForm.hasFranchiseFeePaid &&
      !branchForm.franchisePaymentRef.trim()
    ) {
      toast.error("Payment reference is required when fee is marked as paid");
      return false;
    }

    // Optional field format validation (only if value is provided)
    if (branchForm.ownerAadhaarNumber && !/^[0-9]{12}$/.test(branchForm.ownerAadhaarNumber)) {
      toast.error("Aadhaar number must be exactly 12 digits");
      return false;
    }

    if (branchForm.ownerPanNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(branchForm.ownerPanNumber)) {
      toast.error("Invalid PAN format (e.g. ABCDE1234F)");
      return false;
    }

    if (
      branchForm.ownerGstNumber &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z][Z][0-9A-Z]$/.test(branchForm.ownerGstNumber)
    ) {
      toast.error("Invalid GST format (e.g. 22AAAAA0000A1Z5)");
      return false;
    }

    if (branchForm.branchPhone && !/^[0-9]{10}$/.test(branchForm.branchPhone)) {
      toast.error("Branch phone must be exactly 10 digits");
      return false;
    }

    if (
      branchForm.branchEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(branchForm.branchEmail)
    ) {
      toast.error("Please enter a valid branch email address");
      return false;
    }

    return true;
  };

  const handleBranchChange = (name: keyof BranchFormData, value: any) => {
    setBranchForm((prev) => {
      const newForm = { ...prev };

      (newForm[name] as any) = value;

      if (name === "branchLevel" && value === "ORG") {
        newForm.parentBranchId = null;
      }

      if (name === "branchLevel" && !["ORG", "STATE", "CITY"].includes(value)) {
        newForm.isStateHQ = false;
      }

      return newForm;
    });
  };

  const resetAll = () => {
    setContactDetails(INITIAL_CONTACT_DETAILS);
    setOtp(Array(4).fill(""));
    setSentOtp(false);
    setOtpVerified(false);
    setOwnerOtpToken(null);
    setVerifiedBy(null);
    clearContactErrors();
    setBranchForm(INITIAL_BRANCH_FORM);
    setResendTimer(0);
  };

  const handleCancel = () => {
    resetAll();
    setopenDrawer(false);
    handleClose();
  };

  const switchVerificationMode = (mode: VerificationMode) => {
    if (otpVerified) return; // Don't allow switching after verification

    setVerificationMode(mode);
    setSentOtp(false);
    setOtp(Array(4).fill(""));
    setResendTimer(0);

    // Clear the contact info for the mode being switched away from
    if (mode === "phone") {
      updateContactDetails({ email: "" });
    } else {
      updateContactDetails({ mobile: "" });
    }
  };

  const handleSendOtp = async () => {
    if (!validateBeforeOtp()) return;

    if (resendTimer > 0) {
      toast.error(`Please wait ${resendTimer} seconds before resending`);
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        email: verificationMode === "email" ? contactDetails.email : undefined,
        phone: verificationMode === "phone" ? contactDetails.mobile : undefined,
      };

      const res = await apiClient.post(
        `${apiClient.URLS.branches}/staff/verify-email`,
        payload,
        true
      );

      const body = res.body;

      if (body?.status === "already_verified") {
        toast.error(
          body.message ||
          "This contact is already verified. Please use a different one."
        );
        setIsLoading(false);
        return;
      }

      if (body?.status === "otp_sent") {
        toast.success(body.message || "OTP sent successfully");
        setSentOtp(true);
        setOtp(Array(4).fill(""));
        setResendTimer(30); // Start 30 second timer
      } else {
        toast.error("Unexpected response while sending OTP");
      }
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      const message =
        err?.body?.message ||
        err?.response?.data?.message ||
        "Error sending OTP";
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 4) {
      toast.error("Please enter complete OTP");
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        email: verificationMode === "email" ? contactDetails.email : undefined,
        phone: verificationMode === "phone" ? contactDetails.mobile : undefined,
        otp: otpValue,
      };

      const res = await apiClient.post(
        `${apiClient.URLS.branches}/staff/verify-otp`,
        payload,
        true
      );

      const body = res.body;
      setCurrentUserId(body.user.id);

      if (!body || body.message === "Invalid OTP") {
        toast.error("Invalid OTP. Please try again");
        setOtp(Array(4).fill(""));
        inputRefs.current[0]?.focus();
        setIsLoading(false);
        return;
      }

      if (body.message === "Existing user verified as STAFF") {
        toast.success("Existing user verified successfully");
      } else if (body.message === "New STAFF user created") {
        toast.success("New staff user created and verified");
      } else {
        toast.success(body.message || "OTP verified successfully");
      }

      setOwnerOtpToken(body.token);
      setOtpVerified(true);
      setVerifiedBy(verificationMode);
      setResendTimer(0);
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      const message =
        err?.body?.message ||
        err?.response?.data?.message ||
        "Error verifying OTP";
      toast.error(Array.isArray(message) ? message[0] : message);
      setOtp(Array(4).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };


   const handleCreateBranch = async () => {
    if (!validateOwnerFields()) return toast.error("Please fill owner details properly");
    if (!validateBranchFields()) return;

    // EDIT
    if (isEdit) {
      if (!editingBranch?.id) return toast.error("Missing branch id");

      const ownerPayload = {
        fullName: `${contactDetails.first_name.trim()} ${contactDetails.last_name.trim()}`,
        phone: contactDetails.mobile.trim(),
        email: contactDetails.email.trim() || undefined,
        ...(contactDetails.password?.trim()
          ? { password: contactDetails.password }
          : {}),
      };

      const payload = {
        name: branchForm.branchName.trim(),
        level: branchForm.branchLevel,
        parentId: branchForm.branchLevel === "ORG" ? null : branchForm.parentBranchId,
        category: branchForm.category,
        isHeadOffice: branchForm.isHeadOffice,
        isStateHQ: branchForm.isStateHQ,
        hasFranchiseFeePaid: branchForm.hasFranchiseFeePaid,
        franchisePaymentRef: branchForm.hasFranchiseFeePaid
          ? branchForm.franchisePaymentRef.trim()
          : null,
        ownerAadhaarNumber: branchForm.ownerAadhaarNumber.trim() || undefined,
        ownerPanNumber: branchForm.ownerPanNumber.trim() || undefined,
        ownerGstNumber: branchForm.ownerGstNumber.trim() || undefined,
        ownerIdProofType: branchForm.ownerIdProofType || undefined,
        ownerIdProofUrl: branchForm.ownerIdProofUrl || undefined,
        ownerPhotoUrl: branchForm.ownerPhotoUrl || undefined,
        ownerDateOfBirth: branchForm.ownerDateOfBirth || undefined,
        ownerAddress: branchForm.ownerAddress.trim() || undefined,
        branchAddress: branchForm.branchAddress.trim() || undefined,
        branchPhone: branchForm.branchPhone.trim() || undefined,
        branchEmail: branchForm.branchEmail.trim() || undefined,
        branchPhotoUrl: branchForm.branchPhotoUrl || undefined,
        owner: ownerPayload,
      };

      setIsLoading(true);
      try {
        const res = await apiClient.patch(
          `${apiClient.URLS.branches}/${editingBranch.id}`,
          payload,
          true
        );

        if (res.status === 200) {
          toast.success("Branch & Owner updated successfully!");
          refetchBranches?.();
          setopenDrawer(false);
          handleClose();
        } else toast.error("Unexpected response while updating");
      } catch (err: any) {
        const message =
          err?.body?.message ||
          err?.response?.data?.message ||
          "Error occurred while updating";
        toast.error(Array.isArray(message) ? message[0] : message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // CREATE
    if (!otpVerified) return toast.error("Please verify OTP first");

    const fullName = `${contactDetails.first_name.trim()} ${contactDetails.last_name.trim()}`;

    const payload = {
      name: branchForm.branchName.trim(),
      level: branchForm.branchLevel,
      parentId:
        branchForm.branchLevel === "ORG" ? undefined : branchForm.parentBranchId,
      category: branchForm.category,
      isHeadOffice: branchForm.isHeadOffice,
      isStateHQ: branchForm.isStateHQ,
      hasFranchiseFeePaid: branchForm.hasFranchiseFeePaid,
      franchisePaymentRef: branchForm.hasFranchiseFeePaid
        ? branchForm.franchisePaymentRef.trim()
        : undefined,
      ownerAadhaarNumber: branchForm.ownerAadhaarNumber.trim() || undefined,
      ownerPanNumber: branchForm.ownerPanNumber.trim() || undefined,
      ownerGstNumber: branchForm.ownerGstNumber.trim() || undefined,
      ownerIdProofType: branchForm.ownerIdProofType || undefined,
      ownerIdProofUrl: branchForm.ownerIdProofUrl || undefined,
      ownerPhotoUrl: branchForm.ownerPhotoUrl || undefined,
      ownerDateOfBirth: branchForm.ownerDateOfBirth || undefined,
      ownerAddress: branchForm.ownerAddress.trim() || undefined,
      branchAddress: branchForm.branchAddress.trim() || undefined,
      branchPhone: branchForm.branchPhone.trim() || undefined,
      branchEmail: branchForm.branchEmail.trim() || undefined,
      branchPhotoUrl: branchForm.branchPhotoUrl || undefined,
      owner: {
        fullName,
        email: contactDetails.email.trim() || undefined,
        phone: contactDetails.mobile.trim(),
        password: contactDetails.password,
      },
    };

    setIsLoading(true);
    try {
      const res = await apiClient.post(apiClient.URLS.branches, payload, true);
      if (res.status === 201 || res.status === 200) {
        toast.success("Branch & Owner created successfully!");
        resetAll();
        onCreated?.();
        setopenDrawer(false);
        refetchBranches?.();
        handleClose();
      } else toast.error("Unexpected response while creating");
    } catch (err: any) {
      const message =
        err?.body?.message ||
        err?.response?.data?.message ||
        "Error occurred while creating";
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare parent branch options
  const parentBranchOptions = React.useMemo(() => {
    if (branchForm.branchLevel === "ORG") {
      return [];
    }
    return branches.map((b: any) => ({
      id: b.id,
      display: `${b.id} - ${b.name}`,
    }));
  }, [branches, branchForm.branchLevel]);

  // Get selected parent branch display value
  const selectedParentDisplay = React.useMemo(() => {
    if (branchForm.branchLevel === "ORG") {
      return "";
    }
    if (!branchForm.parentBranchId) {
      return "";
    }
    const branch = branches.find((b: any) => b.id === branchForm.parentBranchId);
    return branch ? `${branch.id} - ${branch.name}` : "";
  }, [branchForm.parentBranchId, branchForm.branchLevel, branches]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:gap-8 gap-5 md:px-3 px-2 md:py-5 py-3 bg-gray-100 min-w-full">
      <h2 className="text-[16px] md:text-[20px] font-bold text-[#4c93fc]">
      {isEdit ? "Edit Branch & Owner" : "Create Branch & Owner"}
      </h2>
 {!isEdit && (
        <div className="rounded-md px-3 py-5 w-full bg-white shadow-custom max-w-[900px]">
          {!otpVerified && (
            <div className="flex gap-4 mb-4">
              <Button
                onClick={() => switchVerificationMode("phone")}
                className={`px-3 md:py-[8px] py-1 rounded-md font-medium md:text-[14px] text-[12px] ${
                  verificationMode === "phone"
                    ? "bg-[#5297ff] text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                Verify By Phone
              </Button>
              <Button
                onClick={() => switchVerificationMode("email")}
                className={`px-3 md:py-[8px] py-1 rounded-md font-medium md:text-[14px] text-[12px] ${
                  verificationMode === "email"
                    ? "bg-[#5297ff] text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                Verify By Email
              </Button>
            </div>
          )}

          <div className="font-bold text-[18px] flex flex-row gap-2 mb-4">
            <CautionIcon />
            <p className="text-[14px] text-[#3586FF] md:text-[16px]">
              Branch Owner Verification
            </p>
          </div>

          <div className="w-full flex flex-col md:gap-3 gap-2 md:px-3 px-2 md:py-[6px] py-1">
            <div className="flex md:flex-row flex-col gap-3">
              {(!otpVerified && verificationMode === "phone") && (
                <CustomInput
                  label="Mobile Number"
                  labelCls="md:text-[14px] text-[12px] font-medium"
                  placeholder="Enter 10-digit mobile number"
                  name="mobile"
                  required
                  value={contactDetails.mobile}
                  onChange={(e) => handleInputChange("mobile", e.target.value)}
                  errorMsg={contactErrors?.mobile}
                  type="number"
                  maxLength={10}
                  className="w-full"
                  rootCls="max-w-[350px]"
                />
              )}

              {(!otpVerified && verificationMode === "email") && (
                <CustomInput
                  label="Email Address"
                  labelCls="md:text-[14px] text-[12px] font-medium"
                  name="email"
                  placeholder="Enter email address"
                  required
                  value={contactDetails.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  errorMsg={contactErrors?.email}
                  type="email"
                  className="w-full"
                  rootCls="max-w-[350px]"
                />
              )}
            </div>

            {!otpVerified && (
              <div className="flex flex-col md:w-[40%] max-w-[350px] gap-3">
                <div className="flex flex-row gap-2">
                  <Button
                    className="bg-[#3B82F6] text-white md:text-[14px] font-medium text-nowrap text-[12px] rounded-md px-3 py-2 w-full"
                    onClick={sentOtp ? handleVerifyOtp : handleSendOtp}
                  >
                    {sentOtp ? "Verify OTP" : "Send OTP"}
                  </Button>

                  {sentOtp && (
                    <Button
                      className="bg-white font-medium text-[#3B82F6] md:text-[14px] text-nowrap text-[12px] border-[1px] border-[#3B82F6] rounded-md px-3 py-2 w-full flex items-center justify-center gap-2"
                      onClick={handleSendOtp}
                      disabled={resendTimer > 0}
                    >
                      {resendTimer > 0 ? `Retry in ${resendTimer}s` : "Resend OTP"}
                      <ResendIcon />
                    </Button>
                  )}
                </div>

                {sentOtp && (
                  <div className="flex flex-col">
                    <p className="text-[#636B70] text-[12px] md:text-[14px] mb-2 font-medium">
                      Enter 4-Digit OTP
                    </p>
                    <div className="flex flex-row gap-2">
                      {Array(4)
                        .fill("")
                        .map((_, index) => (
                          <input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={otp[index]}
                            ref={(el) => (inputRefs.current[index] = el as any)}
                            pattern="[0-9]*"
                            inputMode="numeric"
                            className="md:w-12 md:h-12 w-8 h-8 text-center border text-[14px] border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                            onChange={(e) => handleOtpChange(e.target.value, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ OWNER CARD (create after otp, edit always) */}
      {(isEdit || otpVerified) && (
        <div className="rounded-md px-3 py-5 w-full bg-white shadow-custom max-w-[900px]">
          <div className="font-bold text-[18px] flex flex-row gap-2 mb-4">
            <CautionIcon />
            <p className="text-[14px] text-[#3586FF] md:text-[16px]">
              Branch Owner Details
            </p>
          </div>

          <div className="flex flex-col md:gap-4 gap-2 md:px-3 px-2">
            <div className="flex md:flex-row flex-col md:gap-3 gap-2">
              <CustomInput
                label="Phone Number"
                name="mobile"
                placeholder="Enter 10-digit phone number"
                value={contactDetails.mobile}
                errorMsg={contactErrors?.mobile}
                onChange={(e) => handleInputChange("mobile", e.target.value)}
                type="number"
                maxLength={10}
                className="w-full"
                rootCls="max-w-[350px]"
                required
              />

              <CustomInput
                label="Email Address (Optional)"
                name="email"
                placeholder="Enter email address"
                value={contactDetails.email}
                errorMsg={contactErrors?.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                type="email"
                className="w-full"
                rootCls="max-w-[350px]"
              />
            </div>

            <div className="flex md:flex-row flex-col md:gap-3 gap-2">
              <CustomInput
                label="First Name"
                labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                name="first_name" 
                placeholder="Enter first name"
                value={contactDetails.first_name}
                errorMsg={contactErrors?.first_name}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
                type="text"
                className="w-full"
                rootCls="max-w-[350px]"
                required
              />
              <CustomInput
                label="Last Name"
                labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                name="last_name"
                placeholder="Enter last name"
                value={contactDetails.last_name}
                errorMsg={contactErrors?.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                type="text"
                className="w-full"
                rootCls="max-w-[350px]"
                required
              />
            </div>

            <div className="flex md:flex-row flex-col md:gap-3 gap-2">
              <CustomInput
                label={isEdit ? "New Password (Optional)" : "Create Password"}
                name="password"
                type="password"
                value={contactDetails.password}
                errorMsg={contactErrors?.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder={isEdit ? "Leave empty to keep same password" : "Enter password"}
                className="w-full"
                rootCls="max-w-[350px]"
                required={!isEdit}
              />
              <CustomInput
                label={isEdit ? "Confirm Password (Optional)" : "Confirm Password"}
                name="confirmPassword"
                type="password"
                value={contactDetails.confirmPassword}
                errorMsg={contactErrors?.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                placeholder={isEdit ? "Confirm only if changing" : "Confirm password"}
                className="w-full"
                rootCls="max-w-[350px]"
                required={!isEdit}
              />
            </div>
          </div>
        </div>
      )}
      {/* OWNER IDENTITY & VERIFICATION CARD */}
      {(isEdit || otpVerified) && (
        <div className="rounded-md px-3 py-5 w-full bg-white shadow-custom max-w-[900px]">
          <div className="font-bold text-[18px] flex flex-row gap-2 mb-4">
            <CautionIcon />
            <p className="text-[14px] text-[#3586FF] md:text-[16px]">
              Owner Identity & Verification
              <span className="text-[12px] text-gray-400 font-normal ml-2">(Optional)</span>
            </p>
          </div>

          <div className="flex flex-col md:gap-4 gap-2 md:px-3 px-2">
            <div className="flex md:flex-row flex-col md:gap-3 gap-2">
              <CustomInput
                label="Aadhaar Number"
                name="ownerAadhaarNumber"
                placeholder="Enter 12-digit Aadhaar number"
                value={branchForm.ownerAadhaarNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 12);
                  handleBranchChange("ownerAadhaarNumber", val);
                }}
                type="text"
                maxLength={12}
                className="w-full"
                rootCls="max-w-[350px]"
              />
              <CustomInput
                label="PAN Number"
                name="ownerPanNumber"
                placeholder="e.g. ABCDE1234F"
                value={branchForm.ownerPanNumber}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().slice(0, 10);
                  handleBranchChange("ownerPanNumber", val);
                }}
                type="text"
                maxLength={10}
                className="w-full"
                rootCls="max-w-[350px]"
              />
            </div>

            <div className="flex md:flex-row flex-col md:gap-3 gap-2">
              <CustomInput
                label="GST Number"
                name="ownerGstNumber"
                placeholder="e.g. 22AAAAA0000A1Z5"
                value={branchForm.ownerGstNumber}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().slice(0, 15);
                  handleBranchChange("ownerGstNumber", val);
                }}
                type="text"
                maxLength={15}
                className="w-full"
                rootCls="max-w-[350px]"
              />
              <div className="flex flex-col gap-1 w-full max-w-[350px]">
                <label className="font-medium label-text leading-[22.8px] text-[#000000] md:text-[14px] text-[12px]">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="ownerDateOfBirth"
                  value={branchForm.ownerDateOfBirth}
                  onChange={(e) =>
                    handleBranchChange("ownerDateOfBirth", e.target.value)
                  }
                  className="w-full border border-[#CFCFCF] rounded-[4px] px-3 py-2 text-[14px] outline-none focus:border-[#3B82F6] transition-colors"
                />
              </div>
            </div>

            <div className="flex md:flex-row flex-col md:gap-3 gap-2">
              <div className="flex flex-col gap-1 w-full max-w-[350px]">
                <SingleSelect
                  type="single-select"
                  name="ownerIdProofType"
                  label="ID Proof Type"
                  labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                  optionsInterface={{ isObj: false }}
                  options={ID_PROOF_TYPE_OPTIONS.map((o) => o.value)}
                  selectedOption={branchForm.ownerIdProofType}
                  handleChange={(_name, val) =>
                    handleBranchChange("ownerIdProofType", val as OwnerIdProofType)
                  }
                  placeholder="Select ID proof type"
                  rootCls="border-b-[1px] px-1 md:py-1 py-0 w-full border border-[#CFCFCF] rounded-[4px]"
                  buttonCls="border-none"
                />
              </div>
              <div className="w-full max-w-[350px]">
                <FileInput
                  type="file"
                  label="ID Proof Document"
                  labelCls="font-medium text-[14px] text-[#000000]"
                  name="ownerIdProofUrl"
                  folderName="branch-id-proofs"
                  initialFileUrl={branchForm.ownerIdProofUrl || undefined}
                  onFileChange={(url) => handleBranchChange("ownerIdProofUrl", url)}
                />
              </div>
            </div>

            <div className="flex md:flex-row flex-col md:gap-3 gap-2">
              <div className="w-full max-w-[350px]">
                <FileInput
                  type="file"
                  label="Owner Photo"
                  labelCls="font-medium text-[14px] text-[#000000]"
                  name="ownerPhotoUrl"
                  folderName="branch-owner-photos"
                  initialFileUrl={branchForm.ownerPhotoUrl || undefined}
                  onFileChange={(url) => handleBranchChange("ownerPhotoUrl", url)}
                />
              </div>
              <CustomInput
                label="Owner Residential Address"
                name="ownerAddress"
                placeholder="Enter owner's full residential address"
                value={branchForm.ownerAddress}
                onChange={(e) => handleBranchChange("ownerAddress", e.target.value)}
                type="text"
                className="w-full"
                rootCls="max-w-[350px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* BRANCH PHYSICAL DETAILS CARD */}
      {(isEdit || otpVerified) && (
        <div className="rounded-md px-3 py-5 w-full bg-white shadow-custom max-w-[900px]">
          <div className="font-bold text-[18px] flex flex-row gap-2 mb-4">
            <CautionIcon />
            <p className="text-[14px] text-[#3586FF] md:text-[16px]">
              Branch Address & Contact
              <span className="text-[12px] text-gray-400 font-normal ml-2">(Optional)</span>
            </p>
          </div>

          <div className="flex flex-col md:gap-4 gap-2 md:px-3 px-2">
            <CustomInput
              label="Branch Office Address"
              name="branchAddress"
              placeholder="Enter full branch office address"
              value={branchForm.branchAddress}
              onChange={(e) => handleBranchChange("branchAddress", e.target.value)}
              type="text"
              className="w-full"
            />

            <div className="flex md:flex-row flex-col md:gap-3 gap-2">
              <CustomInput
                label="Branch Phone"
                name="branchPhone"
                placeholder="Enter 10-digit branch phone"
                value={branchForm.branchPhone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  handleBranchChange("branchPhone", val);
                }}
                type="text"
                maxLength={10}
                className="w-full"
                rootCls="max-w-[350px]"
              />
              <CustomInput
                label="Branch Email"
                name="branchEmail"
                placeholder="e.g. branch@onecasa.com"
                value={branchForm.branchEmail}
                onChange={(e) => handleBranchChange("branchEmail", e.target.value)}
                type="email"
                className="w-full"
                rootCls="max-w-[350px]"
              />
            </div>

            <div className="w-full max-w-[350px]">
              <FileInput
                type="file"
                label="Branch Office Photo"
                labelCls="font-medium text-[14px] text-[#000000]"
                name="branchPhotoUrl"
                folderName="branch-office-photos"
                initialFileUrl={branchForm.branchPhotoUrl || undefined}
                onFileChange={(url) => handleBranchChange("branchPhotoUrl", url)}
              />
            </div>
          </div>
        </div>
      )}

      {/* BRANCH DETAILS CARD */}
      {(isEdit || otpVerified) && (
        <div className="rounded-md px-3 py-5 w-full bg-white shadow-custom max-w-[900px]">
          <div className="font-bold text-[18px] flex flex-row gap-2 mb-4">
            <CautionIcon />
            <p className="text-[14px] text-[#3586FF] md:text-[16px]">Branch Details</p>
          </div>

          <div className="grid md:grid-cols-2 grid-cols-1 md:gap-4 gap-2 md:px-3 px-2">
            <CustomInput
              label="Branch Name"
              type="text"
              name="branchName"
              placeholder="e.g., OneCasa Delhi / Hyderabad State Office"
              value={branchForm.branchName}
              onChange={(e) => handleBranchChange("branchName", e.target.value)}
              required
              className="w-full"
              labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
            />

            <div className="flex flex-col gap-1">
              <SingleSelect
                type="single-select"
                name="branchLevel"
                label="Branch Level"
                labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                optionsInterface={{ isObj: false }}
                options={BRANCH_LEVEL_OPTIONS.map((b) => b.value)}
                selectedOption={branchForm.branchLevel}
                handleChange={(name, val) => {
                  handleBranchChange("branchLevel", val as BranchLevel);
                }}
                placeholder="Select level"
                buttonCls="border-none"
                rootCls="border-b-[1px] px-1 md:py-1 py-0 w-full border border-[#CFCFCF] rounded-[4px]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <SingleSelect
                type="single-select"
                name="parentBranchId"
                label="Parent Branch"
                labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                optionsInterface={{ isObj: false }}
                options={parentBranchOptions.map((b) => b.display)}
                selectedOption={selectedParentDisplay}
                handleChange={(name, val) => {
                  if (branchForm.branchLevel !== "ORG" && val) {
                    const branchId = (val.split(" - ")[0]);
                    handleBranchChange("parentBranchId", branchId);
                  }
                }}
                placeholder={
                  branchForm.branchLevel === "ORG"
                    ? "N/A for ORG level"
                    : "Select parent branch"
                }
                rootCls="border-b-[1px] px-1 md:py-1 py-0 w-full border border-[#CFCFCF] rounded-[4px]"
                buttonCls="border-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <SingleSelect
                type="single-select"
                name="category"
                label="Branch Category"
                labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                optionsInterface={{ isObj: false }}
                options={BRANCH_CATEGORY_OPTIONS.map((c) => c.value)}
                selectedOption={branchForm.category}
                handleChange={(name, val) => {
                  handleBranchChange("category", val as BranchCategory);
                }}
                placeholder="Select category"
                rootCls="border-b-[1px] px-1 md:py-1 py-0 w-full border border-[#CFCFCF] rounded-[4px]"
                buttonCls="border-none"
              />
            </div>

            <div className="flex md:flex-row flex-col gap-2 max-w-[900px] w-full">
              <CheckboxInput
                name="hasFranchiseFeePaid"
                label="Fee Paid"
                labelCls="font-medium text-[14px] text-[#000000]"
                checked={branchForm.hasFranchiseFeePaid}
                onChange={(checked) =>
                  handleBranchChange("hasFranchiseFeePaid", checked)
                }
                className="w-4 h-4"
              />

              {branchForm.hasFranchiseFeePaid && (
                <CustomInput
                  name="franchisePaymentRef"
                  type="text"
                  placeholder="Payment ref / UTR / Transaction ID"
                  value={branchForm.franchisePaymentRef}
                  onChange={(e) =>
                    handleBranchChange("franchisePaymentRef", e.target.value)
                  }
                  className="w-full mt-2"
                  labelCls="font-medium text-[14px] text-[#636B70]"
                />
              )}

              <CheckboxInput
                name="isHeadOffice"
                label="Mark as Head Office"
                labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                checked={branchForm.isHeadOffice}
                onChange={(checked) =>
                  handleBranchChange("isHeadOffice", checked)
                }
                className="w-4 h-4"
              />
              {(branchForm.branchLevel === "ORG" ||
                branchForm.branchLevel === "STATE" ||
                branchForm.branchLevel === "CITY") && (
                  <CheckboxInput
                    name="isStateHQ"
                    label="Mark as State Headquarters"
                    labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                    checked={branchForm.isStateHQ}
                    onChange={(checked) =>
                      handleBranchChange("isStateHQ", checked)
                    }
                    className="w-4 h-4"
                  />
                )}
            </div>

            <div className="flex justify-end gap-3 mt-5 md:col-span-2">
              <Button
                onClick={handleCancel}
                className="bg-gray-300 text-black px-6 py-2 font-medium md:rounded-[8px] rounded-[6px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateBranch}
                className="md:px-5 px-3 md:py-[6px] py-1 text-[12px] md:text-[14px] bg-[#3B82F6] text-white font-medium md:rounded-[8px] rounded-[6px]"
                disabled={isLoading}
              >
                {isEdit ? "Update Branch & Owner" : "Create Branch & Owner"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateBranch;