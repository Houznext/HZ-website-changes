import React, { useState, useEffect, useRef, useMemo } from "react";
import CustomInput from "@/src/common/FormElements/CustomInput";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import Button from "@/src/common/Button";
import Image from "next/image";
import apiClient from "@/src/utils/apiClient";
import Modal from "@/src/common/Modal";
import Loader from "@/src/common/Loader";
import { uploadFile, getSignedImageUrl } from "@/src/utils/uploadFile";
import withAdminLayout from "@/src/common/AdminLayout";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import CustomDate from "@/src/common/FormElements/CustomDate";
import { Eye, Download, User, Building2, CreditCard, Phone, Shield, Calendar, Clock, Briefcase, FileText, Plus, Edit3, Trash2, X, Save, ChevronRight, Mail, MapPin, Lock, Camera, CheckCircle2, AlertCircle, DollarSign, Users } from "lucide-react";
import ReusableSearchFilter from "@/src/common/SearchFilter";
import { 
  FiUser, 
  FiMapPin, 
  FiLock, 
  FiCalendar, 
  FiClock, 
  FiBriefcase, 
  FiDollarSign,
  FiFileText,
  FiRefreshCw,
  FiChevronLeft
} from "react-icons/fi";

export interface IAddress {
  country: string;
  state: string;
  city: string;
  zipCode: string;
  area: string;
}

export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addresses: IAddress[];
}

export interface ICardItem {
  key: string;
  label: string;
  value: string;
}

export interface IInformationProps {
  title: string;
  icon: string;
  cardItems: any;
  height: string;
  cardHeight?: string;
  handleInputChange?: any;
  user?: any;
}

export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "INTERN"
  | "CONTRACTOR";

export type LeaveType = "CASUAL" | "SICK" | "EARNED" | "COMP_OFF" | "LOP";
export type LeaveStatus = "APPLIED" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface EmployeeLeave {
  id: number;
  type: LeaveType;
  fromDate: string;
  toDate: string;
  days: number;
  status: LeaveStatus;
  reason?: string;
  approvedAt?: string | null;
}

export type PayslipStatus = "GENERATED" | "SENT" | "PAID";

export interface EmployeePayslip {
  id: number;
  month: number;
  year: number;
  grossEarnings: number;
  totalDeductions: number;
  netPay: number;
  payDate: string;
  payslipNumber?: string;
  pdfUrl?: string;
  status: PayslipStatus;
}

// ---- HR DETAILS ----

export interface EmployeeHrDetails {
  employeeCode?: string;
  dateOfBirth?: string;
  designation?: string;
  employmentType?: EmploymentType;
  joiningDate?: string;
  relievingDate?: string;
  branchId?: number;

  aadhaarNumber?: string;
  panNumber?: string;

  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  baseSalary?: number;
  salaryCurrency?: string;

  emergencyContactName?: string;
  emergencyContactPhone?: string;

  casualLeaveBalance?: number;
  sickLeaveBalance?: number;
  earnedLeaveBalance?: number;
  compOffBalance?: number;
  lopDays?: number;
}

type HrSectionKey = "employment" | "kycBank" | "emergency";

type HrSubTab = "details" | "leaves" | "payslips";

function ProfileView() {
  const [userData, setUserData] = useState<IUser | null>(null);
  const [openProfileModal, setOpenProfileModal] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "hr">("profile");
  const [activeHrSubTab, setActiveHrSubTab] = useState<HrSubTab>("details");

  const fileInputRef = useRef<any>(null);
  const session = useSession();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState("");
  const [profileImgError, setProfileImgError] = useState(false);

  const [personalInformation, setPersonalInformation] =
    useState<IInformationProps>({
      title: "Personal Information",
      icon: "/profileview/Information.png",
      height: "h-auto",
      cardHeight: "h-auto",
      cardItems: [],
    });

  const [addressInformation, setAddressInformation] =
    useState<IInformationProps>({
      title: "Address Information",
      icon: "/profileview/Gps.png",
      height: "h-auto",
      cardHeight: "h-auto",
      cardItems: [],
    });

  const [passwordDetails, setPasswordDetails] = useState({
    title: "Password Details",
    icon: "/profileview/Password.png",
    height: "h-auto",
    cardHeight: "h-[173px]",
    cardItems: [
      { key: "currentPassword", label: "Current password", value: "" },
      { key: "newPassword", label: "New password", value: "" },
      {
        key: "confirmNewPassword",
        label: "Confirm new password",
        value: "",
      },
    ],
  });

  // HR state
  const [hrData, setHrData] = useState<EmployeeHrDetails | null>(null);
  const [hrLoading, setHrLoading] = useState<boolean>(false);
  const [hrSaving, setHrSaving] = useState<boolean>(false);
  const [activeHrModal, setActiveHrModal] = useState<HrSectionKey | null>(null);
  const [hrForm, setHrForm] = useState<EmployeeHrDetails>({});

  const [leaves, setLeaves] = useState<EmployeeLeave[]>([]);
  const [leavesLoading, setLeavesLoading] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveSaving, setLeaveSaving] = useState(false);
  const [leaveForm, setLeaveForm] = useState<{
    type: { id: LeaveType; service: string } | "";

    fromDate: string;
    toDate: string;
    days: string;
    reason: string;
  }>({
    type: "",
    fromDate: "",
    toDate: "",
    days: "",
    reason: "",
  });

  const [payslips, setPayslips] = useState<EmployeePayslip[]>([]);
  const [payslipsLoading, setPayslipsLoading] = useState(false);

  useEffect(() => {
    if (session?.status === "authenticated" && session?.data?.user) {
      setUser(session?.data?.user);
    }
  }, [session?.data?.user, session?.status]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const res = await apiClient.get(
          `${apiClient.URLS.user}/${user?.id}`,
          {}
        );
        if (res?.status === 200 && res?.body) {
          const userData = res?.body;

          setUserData(userData);
          if (userData?.profile) {
            getSignedImageUrl(userData.profile).then((signedUrl) => {
              setProfile(signedUrl);
              setProfileImgError(false);
            });
          }

          setPersonalInformation((prev) => ({
            ...prev,
            cardItems: [
              {
                key: "firstname",
                label: "First name",
                value: userData?.firstName,
              },
              {
                key: "lastname",
                label: "Last name",
                value: userData?.lastName,
              },
              {
                key: "phonenumber",
                label: "Phone number",
                value: userData?.phone,
              },
              { key: "youare", label: "You are", value: "Owner" },
              {
                key: "emailaddress",
                label: "Email Address",
                value: userData?.email,
              },
            ],
          }));

          setAddressInformation((prev) => ({
            ...prev,
            cardItems: userData?.addresses
              ?.sort((a: any, b: any) => a.id - b.id)
              .map((address: any) => [
                {
                  key: `${address.id}_address_area`,
                  label: "Area",
                  value: address.area,
                },
                {
                  key: `${address.id}_address_city`,
                  label: "City",
                  value: address.city,
                },
                {
                  key: `${address.id}_address_state`,
                  label: "State",
                  value: address.state,
                },
                {
                  key: `${address.id}_address_country`,
                  label: "Country",
                  value: address.country,
                },
                {
                  key: `${address.id}_address_zipCode`,
                  label: "Pin Code",
                  value: address.zipCode,
                },
              ]),
          }));
          toast.success("User data fetched successfully");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Error fetching user data");
      } finally {
        setLoading(false);
      }
    };
    if (session?.status === "authenticated") {
      fetchUserData();
    }
  }, [user?.id, session?.status]);

  useEffect(() => {
    if (session?.status !== "authenticated" || !user?.id) return;

    const fetchHrData = async () => {
      setHrLoading(true);
      try {
        const res = await apiClient.get(
          `${apiClient.URLS.hrBaseUrl}/user/${user?.id}`,
          {},
          true
        );
        if (res?.status === 200 && res?.body) {
          setHrData(res.body as EmployeeHrDetails);
          setHrForm(res.body as EmployeeHrDetails);
        } else {
          setHrData({});
        }
      } catch (err) {
        console.error("Error fetching HR details", err);
        setHrData({});
      } finally {
        setHrLoading(false);
      }
    };

    const fetchLeaves = async () => {
      setLeavesLoading(true);
      try {
        const res = await apiClient.get(
          `${apiClient.URLS.hrBaseUrl}/leaves/me`,
          {},
          true
        );
        if (res?.status === 200 && res?.body) {
          setLeaves(res.body as EmployeeLeave[]);
        } else {
          setLeaves([]);
        }
      } catch (err) {
        console.error("Error fetching leaves", err);
        setLeaves([]);
      } finally {
        setLeavesLoading(false);
      }
    };

    const fetchPayslips = async () => {
      setPayslipsLoading(true);
      try {
        const res = await apiClient.get(
          `${apiClient.URLS.hrBaseUrl}/payslips/me`,
          {},
          true
        );
        if (res?.status === 200 && res?.body) {
          setPayslips(res.body as EmployeePayslip[]);
        } else {
          setPayslips([]);
        }
      } catch (err) {
        console.error("Error fetching payslips", err);
        setPayslips([]);
      } finally {
        setPayslipsLoading(false);
      }
    };

    fetchHrData();
    fetchLeaves();
    fetchPayslips();
  }, [session?.status, user?.id]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const uploadedUrl = await uploadFile(file, "userprofiles");

        if (uploadedUrl) {
          const signedUrl = await getSignedImageUrl(uploadedUrl);
          setProfile(signedUrl || uploadedUrl);
          setProfileImgError(false);
        } else {
          console.error("Failed to upload file.");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  const handleDelete = () => {
    setProfile("");
  };

  const handleInputChange = (
    key: string,
    value: string,
    title: string,
    id?: number
  ) => {
    if (title === "Personal Information") {
      setPersonalInformation((prevInfo: any) => ({
        ...prevInfo,
        cardItems: prevInfo.cardItems.map((item: any) => {
          return item.key === key ? { ...item, value: value } : item;
        }),
      }));
    } else if (title === "Address Information") {
      setAddressInformation((prev) => {
        const updatedCardItems = prev.cardItems.map((items: any) => {
          return items.map((item: any) =>
            item.key === key ? { ...item, value: value } : item
          );
        });

        return {
          ...prev,
          cardItems: [...updatedCardItems],
        };
      });
    } else if (title === "Password Details") {
      setPasswordDetails((prev) => ({
        ...prev,
        cardItems: prev.cardItems.map((item: any) => {
          return item.key === key ? { ...item, value: value } : item;
        }),
      }));
    }
  };

  const handleSaveProfile = async (e: any) => {
    e.preventDefault();
    const res = await apiClient.patch(
      `${apiClient.URLS.user}/${user?.id}/update-personal-info`,
      {
        profile,
      },
      true
    );
    if (res.status === 200) {
      setOpenProfileModal(false);
      toast.success("Profile picture updated");
    }
  };

  const EMPLOYMENT_FIELDS: (keyof EmployeeHrDetails)[] = [
    "employeeCode",
    "designation",
    "employmentType",
    "dateOfBirth",
    "joiningDate",
    "relievingDate",
  ];

  const KYC_BANK_FIELDS: (keyof EmployeeHrDetails)[] = [
    "aadhaarNumber",
    "panNumber",
    "bankName",
    "accountHolderName",
    "accountNumber",
    "ifscCode",
    "upiId",
    "baseSalary",
    "salaryCurrency",
  ];

  const EMERGENCY_FIELDS: (keyof EmployeeHrDetails)[] = [
    "emergencyContactName",
    "emergencyContactPhone",
  ];

  const openHrModal = (section: HrSectionKey) => {
    setActiveHrModal(section);
  };

  const closeHrModal = () => {
    setActiveHrModal(null);
  };

  const updateHrField = (field: keyof EmployeeHrDetails, value: any) => {
    setHrForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getFieldsForSection = (section: HrSectionKey) => {
    switch (section) {
      case "employment":
        return EMPLOYMENT_FIELDS;
      case "kycBank":
        return KYC_BANK_FIELDS;
      case "emergency":
        return EMERGENCY_FIELDS;
      default:
        return [];
    }
  };

  const getSectionTitle = (section: HrSectionKey) => {
    switch (section) {
      case "employment":
        return "Employment Details";
      case "kycBank":
        return "KYC & Bank Details";
      case "emergency":
        return "Emergency Contact";
    }
  };

  const handleSaveHrSection = async () => {
    if (!activeHrModal) return;
    setHrSaving(true);

    const fields = getFieldsForSection(activeHrModal);
    const payload: Partial<EmployeeHrDetails> = {};

    fields.forEach((field) => {
      if (hrForm[field] !== undefined) {
        (payload as any)[field] = hrForm[field];
      }
    });

    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.hrBaseUrl}/user/${user?.id}`,
        payload,
        true
      );
      if (res?.status === 200) {
        toast.success("HR details updated");
        const merged: EmployeeHrDetails = {
          ...(hrData || {}),
          ...(payload as any),
        };
        setHrData(merged);
        setHrForm(merged);
        closeHrModal();
      } else {
        toast.error("Failed to update HR details");
      }
    } catch (err) {
      console.error("Error updating HR details", err);
      toast.error("Error updating HR details");
    } finally {
      setHrSaving(false);
    }
  };

  const openLeaveModal = () => {
    setLeaveForm({
      type: "",
      fromDate: "",
      toDate: "",
      days: "",
      reason: "",
    });
    setLeaveModalOpen(true);
  };

  const handleApplyLeave = async () => {
    if (
      !leaveForm.type ||
      !leaveForm.fromDate ||
      !leaveForm.toDate ||
      !leaveForm.days
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setLeaveSaving(true);
    try {
      const payload = {
        type: leaveForm.type?.id,
        fromDate: leaveForm.fromDate,
        toDate: leaveForm.toDate,
        days: Number(leaveForm.days),
        reason: leaveForm.reason,
      };

      const res = await apiClient.post(
        `${apiClient.URLS.hrBaseUrl}/leaves/me`,
        payload,
        true
      );

      if (res?.status === 201 || res?.status === 200) {
        toast.success("Leave applied successfully");
        setLeaveModalOpen(false);

        // Refresh leaves
        const listRes = await apiClient.get(
          `${apiClient.URLS.hrBaseUrl}/leaves/me`,
          {},
          true
        );
        if (listRes?.status === 200 && listRes?.body) {
          setLeaves(listRes.body as EmployeeLeave[]);
        }
      } else {
        toast.error("Failed to apply leave");
      }
    } catch (err: any) {
      console.error("Error applying leave", err);
      toast.error(
        err?.body?.message || "Error applying leave, please check details"
      );
    } finally {
      setLeaveSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-sm text-slate-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  const firstName = personalInformation.cardItems.find((item: any) => item.key === "firstname")?.value || "";
  const lastName = personalInformation.cardItems.find((item: any) => item.key === "lastname")?.value || "";
  const userInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  console.log("personalInformation,",profile);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-6">
        <div className="mx-auto max-w-8xl space-y-5">
          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 font-medium transition-colors"
          >
            <FiChevronLeft className="w-4 h-4" />
            Back
          </button>

          {/* Header Section */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Avatar Section */}
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                    {profile && !profileImgError ? (
                      <img
                        src={profile}
                        alt="Profile"
                        className="object-cover w-full h-full"
                        onError={() => setProfileImgError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                        {userInitials || <User className="w-12 h-12" />}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setOpenProfileModal(true)}
                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white border-2 border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                    {firstName} {lastName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-100">
                      <Shield className="w-4 h-4" />
                      Owner
                    </span>
                    <span className="text-sm text-slate-500">
                      Member since {new Date().getFullYear()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mt-6 p-1 bg-slate-100 rounded-xl w-fit">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === "profile"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab("hr")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === "hr"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  HR Details
                </button>
              </div>
            </div>
          </div>

          {/* Profile Picture Modal */}
          {openProfileModal && (
            <Modal
              isOpen={openProfileModal}
              closeModal={() => setOpenProfileModal(false)}
              className="md:w-[400px] w-[90%] !p-0 overflow-hidden"
              isCloseRequired={false}
            >
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Profile Picture</h3>
                  </div>
                  <button
                    onClick={() => setOpenProfileModal(false)}
                    className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-5">
                <div className="flex justify-center">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-slate-100 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                    {profile && !profileImgError ? (
                      <img
                        src={profile}
                        alt="Profile"
                        className="object-cover w-full h-full"
                        onError={() => setProfileImgError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                        {userInitials || <User className="w-10 h-10" />}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={triggerFileInput}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-blue-200 bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    {profile ? "Change" : "Upload"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {profile && (
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-red-200 bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                </div>

                <div className="flex gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setOpenProfileModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            </Modal>
          )}

          {/* ---------------- PROFILE TAB ---------------- */}
          {activeTab === "profile" && (
            <div className="space-y-5">
              <CardContainer
                title={personalInformation.title}
                icon={personalInformation.icon}
                cardItems={personalInformation.cardItems}
                height={personalInformation.height}
                user={user}
                handleInputChange={handleInputChange}
              />

              <CardContainer
                title={addressInformation.title}
                icon={addressInformation.icon}
                cardItems={addressInformation.cardItems}
                height={addressInformation.height}
                user={user}
                handleInputChange={handleInputChange}
              />

              <CardContainer
                {...passwordDetails}
                user={user}
                handleInputChange={handleInputChange}
              />
            </div>
          )}

          {activeTab === "hr" && (
            <div className="space-y-5">
              {/* HR Sub-tabs */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
                <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                  <button
                    onClick={() => setActiveHrSubTab("details")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeHrSubTab === "details"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    HR Details
                  </button>
                  <button
                    onClick={() => setActiveHrSubTab("leaves")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeHrSubTab === "leaves"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    Leaves
                  </button>
                  <button
                    onClick={() => setActiveHrSubTab("payslips")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeHrSubTab === "payslips"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    Payslips
                  </button>
                </div>
              </div>

              {activeHrSubTab === "details" && (
                <>
                  {hrLoading ? (
                    <div className="w-full flex justify-center py-10">
                      <Loader />
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <HrCard
                        title="Employment Details"
                        icon="briefcase"
                        rows={[
                          { label: "Employee Code", value: hrData?.employeeCode || "-" },
                          { label: "Designation", value: hrData?.designation || "-" },
                          { label: "Employment Type", value: hrData?.employmentType || "-" },
                          { label: "Date of Birth", value: hrData?.dateOfBirth || "-" },
                          { label: "Joining Date", value: hrData?.joiningDate || "-" },
                          { label: "Relieving Date", value: hrData?.relievingDate || "-" },
                        ]}
                        onEdit={() => openHrModal("employment")}
                      />

                      <HrCard
                        title="KYC & Bank Details"
                        icon="creditcard"
                        rows={[
                          { label: "Aadhaar Number", value: hrData?.aadhaarNumber || "-" },
                          { label: "PAN Number", value: hrData?.panNumber || "-" },
                          { label: "Bank Name", value: hrData?.bankName || "-" },
                          { label: "Account Holder Name", value: hrData?.accountHolderName || "-" },
                          { label: "Account Number", value: hrData?.accountNumber || "-" },
                          { label: "IFSC Code", value: hrData?.ifscCode || "-" },
                          { label: "UPI ID", value: hrData?.upiId || "-" },
                          { label: "Base Salary", value: hrData?.baseSalary != null ? `₹${hrData.baseSalary.toLocaleString()} ${hrData.salaryCurrency || "INR"}` : "-" },
                        ]}
                        onEdit={() => openHrModal("kycBank")}
                      />

                      <HrCard
                        title="Emergency Contact"
                        icon="phone"
                        rows={[
                          { label: "Contact Name", value: hrData?.emergencyContactName || "-" },
                          { label: "Contact Phone", value: hrData?.emergencyContactPhone || "-" },
                        ]}
                        onEdit={() => openHrModal("emergency")}
                      />
                    </div>
                  )}
                </>
              )}

              {activeHrSubTab === "leaves" && (
                <LeaveSection
                  hrData={hrData}
                  leaves={leaves}
                  loading={leavesLoading}
                  onApplyLeaveClick={openLeaveModal}
                />
              )}

              {activeHrSubTab === "payslips" && (
                <PayslipSection payslips={payslips} loading={payslipsLoading} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* HR Edit Modal */}
      {activeHrModal && (
        <Modal
          isOpen={true}
          closeModal={closeHrModal}
          className="md:w-[700px] w-[95%] !p-0 overflow-hidden"
          isCloseRequired={false}
        >
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{getSectionTitle(activeHrModal)}</h3>
                  <p className="text-blue-100 text-sm">Update your information</p>
                </div>
              </div>
              <button
                onClick={closeHrModal}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getFieldsForSection(activeHrModal).map((field) => {
                const labelMap: Record<keyof EmployeeHrDetails, string> = {
                  employeeCode: "Employee Code",
                  dateOfBirth: "Date of Birth",
                  designation: "Designation",
                  employmentType: "Employment Type",
                  joiningDate: "Joining Date",
                  relievingDate: "Relieving Date",
                  branchId: "Branch",
                  aadhaarNumber: "Aadhaar Number",
                  panNumber: "PAN Number",
                  bankName: "Bank Name",
                  accountHolderName: "Account Holder Name",
                  accountNumber: "Account Number",
                  ifscCode: "IFSC Code",
                  upiId: "UPI ID",
                  baseSalary: "Base Salary",
                  salaryCurrency: "Salary Currency",
                  emergencyContactName: "Emergency Contact Name",
                  emergencyContactPhone: "Emergency Contact Phone",
                  casualLeaveBalance: "Casual Leave Balance",
                  sickLeaveBalance: "Sick Leave Balance",
                  earnedLeaveBalance: "Earned Leave Balance",
                  compOffBalance: "Comp Off Balance",
                  lopDays: "LOP Days",
                };

                const isDateField = field === "dateOfBirth" || field === "joiningDate" || field === "relievingDate";
                const isNumberField = field === "baseSalary" || field === "branchId" || field === "casualLeaveBalance" || field === "sickLeaveBalance" || field === "earnedLeaveBalance" || field === "compOffBalance" || field === "lopDays";
                const isPhoneField = field === "emergencyContactPhone";

                if (isDateField) {
                  const today = new Date().toISOString().split("T")[0];
                  const maxDate = field === "relievingDate" ? undefined : today;

                  return (
                    <CustomDate
                      key={field}
                      label={labelMap[field]}
                      value={hrForm[field] ? String(hrForm[field]) : ""}
                      onChange={(e) => updateHrField(field, e.target.value)}
                      placeholder={`Select ${labelMap[field]}`}
                      max={maxDate}
                    />
                  );
                }

                if (field === "employmentType") {
                  return (
                    <SingleSelect
                      key={field}
                      type="single-select"
                      name="employmentType"
                      label={labelMap[field]}
                      selectedOption={
                        [
                          { id: "FULL_TIME", service: "Full Time" },
                          { id: "PART_TIME", service: "Part Time" },
                          { id: "INTERN", service: "Intern" },
                          { id: "CONTRACTOR", service: "Contractor" },
                        ].find((opt) => opt.id === hrForm.employmentType) || ""
                      }
                      options={[
                        { id: "FULL_TIME", service: "Full Time" },
                        { id: "PART_TIME", service: "Part Time" },
                        { id: "INTERN", service: "Intern" },
                        { id: "CONTRACTOR", service: "Contractor" },
                      ]}
                      optionsInterface={{ isObj: true, displayKey: "service" }}
                      handleChange={(name, opt) => updateHrField("employmentType", opt?.id || null)}
                    />
                  );
                }

                return (
                  <CustomInput
                    key={field}
                    type={(isNumberField ? "number" : isPhoneField ? "tel" : "text") as any}
                    label={labelMap[field]}
                    name={field}
                    placeholder={`Enter ${labelMap[field]}`}
                    value={hrForm[field] !== undefined && hrForm[field] !== null ? String(hrForm[field]) : ""}
                    onChange={(e) => {
                      const value = isNumberField ? Number(e.target.value || 0) : e.target.value;
                      updateHrField(field, value);
                    }}
                  />
                );
              })}
            </div>

            <div className="flex gap-3 justify-end pt-5 mt-5 border-t border-slate-100">
              <button
                onClick={closeHrModal}
                className="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveHrSection}
                disabled={hrSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all disabled:opacity-50"
              >
                {hrSaving ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {hrSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Leave Application Modal */}
      {leaveModalOpen && (
        <Modal
          isOpen={leaveModalOpen}
          closeModal={() => setLeaveModalOpen(false)}
          className="md:w-[600px] w-[95%] !p-0 overflow-hidden"
          isCloseRequired={false}
        >
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Apply for Leave</h3>
                  <p className="text-emerald-100 text-sm">Submit your leave request</p>
                </div>
              </div>
              <button
                onClick={() => setLeaveModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SingleSelect
                type="single-select"
                name="leaveType"
                label="Leave Type"
                selectedOption={leaveForm.type}
                options={[
                  { id: "CASUAL", service: "Casual Leave" },
                  { id: "SICK", service: "Sick Leave" },
                  { id: "EARNED", service: "Earned Leave" },
                  { id: "COMP_OFF", service: "Comp Off" },
                  { id: "LOP", service: "Leave Without Pay (LOP)" },
                ]}
                optionsInterface={{ isObj: true, displayKey: "service" }}
                handleChange={(name, value) => setLeaveForm((prev) => ({ ...prev, type: value }))}
              />

              <CustomInput
                type="number"
                label="Total Days"
                name="days"
                placeholder="e.g. 1, 2, 3"
                value={leaveForm.days}
                onChange={(e) => setLeaveForm((prev) => ({ ...prev, days: e.target.value }))}
              />

              <CustomDate
                label="From Date"
                name="fromDate"
                value={leaveForm.fromDate}
                onChange={(e) => setLeaveForm((prev) => ({ ...prev, fromDate: e.target.value }))}
              />

              <CustomDate
                label="To Date"
                name="toDate"
                value={leaveForm.toDate}
                onChange={(e) => setLeaveForm((prev) => ({ ...prev, toDate: e.target.value }))}
              />
            </div>

            <CustomInput
              type="textarea"
              label="Reason"
              name="reason"
              placeholder="Describe your reason for leave..."
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm((prev) => ({ ...prev, reason: e.target.value }))}
            />

            <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setLeaveModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyLeave}
                disabled={leaveSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all disabled:opacity-50"
              >
                {leaveSaving ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {leaveSaving ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

const CardContainer = ({
  title,
  icon,
  cardItems,
  height,
  handleInputChange,
  user,
}: IInformationProps) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [cardItemsState, setCardItemsState] = useState<any>(cardItems);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get icon based on title
  const getIcon = () => {
    if (title === "Personal Information") return <User className="w-5 h-5" />;
    if (title === "Address Information") return <MapPin className="w-5 h-5" />;
    if (title === "Password Details") return <Lock className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const getIconBgColor = () => {
    if (title === "Personal Information") return "from-blue-500 to-indigo-600";
    if (title === "Address Information") return "from-emerald-500 to-teal-600";
    if (title === "Password Details") return "from-amber-500 to-orange-600";
    return "from-slate-500 to-slate-600";
  };

  const handleEditClick = (address: any) => {
    setSelectedAddress(address);
    setOpenModal(true);
  };

  const handleAddAddressClick = () => {
    setSelectedAddress([
      { key: `${99999}_address_area`, label: "Area", value: "" },
      { key: `${99999}_address_city`, label: "City", value: "" },
      { key: `${99999}_address_state`, label: "State", value: "" },
      { key: `${99999}_address_country`, label: "Country", value: "" },
      { key: `${99999}_address_zipCode`, label: "Pin Code", value: "" },
    ]);
    setOpenModal(true);
  };

  useEffect(() => {
    setCardItemsState(cardItems);
  }, [cardItems]);

  const onPersonalInfoSave = async () => {
    setIsLoading(true);
    const payLoad = {
      email: cardItemsState.find((item: any) => item.key === "emailaddress")?.value,
      firstName: cardItemsState.find((item: any) => item.key === "firstname")?.value,
      lastName: cardItemsState.find((item: any) => item.key === "lastname")?.value,
      phone: cardItemsState.find((item: any) => item.key === "phonenumber")?.value,
    };
    try {
      await apiClient.patch(`${apiClient.URLS.user}/${user?.id}/update-personal-info`, { ...payLoad }, true);
      toast.success("Profile updated successfully");
    } catch (err) {
      console.log(err);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressChange = (e: any, key: string) => {
    setSelectedAddress((prev: any) => {
      return prev.map((item: any) => {
        return item.key === key ? { ...item, value: e.target.value } : item;
      });
    });
  };

  const onAddresInfoSave = async () => {
    setIsLoading(true);
    const updatedCardItems = cardItemsState.map((address: any) => {
      return address.map((item: any) => {
        const selectedItem = selectedAddress.find((selected: any) => selected.key === item.key);
        return selectedItem ? { ...item, value: selectedItem.value } : item;
      });
    });

    const newItems = selectedAddress.filter((selected: any) => {
      return !updatedCardItems.some((address: any) => address.some((item: any) => item.key === selected.key));
    });

    if (newItems.length) {
      const newAddress = newItems.map((item: any) => ({
        ...item,
        key: `99999_${item.key.split("_")[2]}`,
      }));
      updatedCardItems.push(newAddress);
    }

    const newAddressesPayload: any = [];
    const updatedAddressesPayload: any = [];

    updatedCardItems.forEach((cardItems: any) => {
      const idString = cardItems[0].key.split("_")[0];
      const id = isNaN(parseInt(idString, 10)) ? null : parseInt(idString, 10);

      const addressPayload = cardItems.reduce((acc: any, item: any) => {
        const key = item.key.split("_").pop();
        acc[key] = item.value;
        return acc;
      }, {});

      if (!id || id === 99999) {
        newAddressesPayload.push(addressPayload);
      } else {
        addressPayload.id = id;
        updatedAddressesPayload.push(addressPayload);
      }
    });

    try {
      if (newAddressesPayload.length > 0) {
        for (const address of newAddressesPayload) {
          await apiClient.post(`${apiClient.URLS.address}/${user?.id}`, address, true);
        }
      }

      if (updatedAddressesPayload.length > 0) {
        const updatePromises = updatedAddressesPayload.map(async (address: any) => {
          const res = await apiClient.patch(`${apiClient.URLS.address}/${user?.id}/${address.id}`, address, true);
          return res.data;
        });
        await Promise.all(updatePromises);
      }

      setOpenModal(false);
      setCardItemsState(updatedCardItems);
      toast.success("Address saved successfully");
    } catch (error) {
      console.error("Error saving address information:", error);
      toast.error("Failed to save address");
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteAddress = async (id: string) => {
    const addressId = parseInt(id, 10);
    if (isNaN(addressId) || addressId === 99999) {
      console.error("Invalid address ID. Cannot delete.");
      return;
    }

    try {
      await apiClient.delete(`${apiClient.URLS.address}/${user?.id}/${addressId}`, true);
      const updatedCardItems = cardItemsState.filter((cardItems: any) => {
        const idString = cardItems[0].key.split("_")[0];
        return parseInt(idString, 10) !== addressId;
      });
      setCardItemsState(updatedCardItems);
      toast.success("Address deleted");
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
    }
  };

  const onPasswordInfoSave = async () => {
    setIsLoading(true);
    const payLoad = {
      currentPassword: cardItemsState.find((item: any) => item.key === "currentPassword")?.value,
      newPassword: cardItemsState.find((item: any) => item.key === "newPassword")?.value,
      confirmPassword: cardItemsState.find((item: any) => item.key === "confirmNewPassword")?.value,
    };

    try {
      const res = await apiClient.post(`${apiClient.URLS.user}/${user?.id}/change-password`, { ...payLoad }, true);
      if (res?.status === 200) {
        toast.success("Password changed successfully");
        handleInputChange("currentPassword", "", "Password Details");
        handleInputChange("newPassword", "", "Password Details");
        handleInputChange("confirmNewPassword", "", "Password Details");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (title === "Personal Information") {
      await onPersonalInfoSave();
    } else if (title === "Password Details") {
      await onPasswordInfoSave();
    }
    setOpenModal(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getIconBgColor()} text-white flex items-center justify-center shadow-lg`}>
            {getIcon()}
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500">
              {title === "Personal Information" && "Your basic profile details"}
              {title === "Address Information" && "Manage your saved addresses"}
              {title === "Password Details" && "Update your account password"}
            </p>
          </div>
        </div>

        <button
          onClick={() => title === "Address Information" ? handleAddAddressClick() : setOpenModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-blue-200 bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition-colors"
        >
          {title !== "Address Information" ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {title !== "Address Information" ? "Edit" : "Add"}
        </button>
      </div>

      {/* Card Content */}
      <div className="p-5">
        {title === "Address Information" ? (
          cardItemsState.length > 0 ? (
            <div className="space-y-4">
              {cardItemsState.map((addressArray: any, index: number) => (
                <div key={index} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {addressArray.map((address: any) => (
                      <div key={address.key} className="space-y-1">
                        <p className="text-xs font-medium text-slate-500">{address.label}</p>
                        <p className="text-sm font-semibold text-slate-800">{address.value || "-"}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => handleEditClick(addressArray)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteAddress(addressArray[0].key.split("_")[0])}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-semibold text-slate-700 mb-1">No Addresses Saved</h4>
              <p className="text-sm text-slate-500 mb-4">Add your first address to get started</p>
              <button
                onClick={handleAddAddressClick}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/25"
              >
                <Plus className="w-4 h-4" />
                Add Address
              </button>
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {cardItemsState.map((item: any) => (
              item.label !== "New password" && item.label !== "Confirm new password" && (
                <div key={item.key} className="space-y-1.5">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {item.label === "Current password" ? "••••••••" : item.value || "-"}
                  </p>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {openModal && (
        <Modal
          isOpen={openModal}
          closeModal={() => setOpenModal(false)}
          className="md:w-[700px] w-[95%] !p-0 overflow-hidden"
          isCloseRequired={false}
        >
          <div className={`bg-gradient-to-r ${getIconBgColor()} p-5`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  {getIcon()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                  <p className="text-white/70 text-sm">Update your information</p>
                </div>
              </div>
              <button
                onClick={() => setOpenModal(false)}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <div className="p-5">
            {title === "Address Information" && selectedAddress ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedAddress).map((cardItemsState: any, index: number) => (
                    <div key={index}>
                      {cardItemsState.map((item: any) => {
                        if (typeof item === "string") return null;
                        return (
                          <CustomInput
                            key={item.key}
                            type="text"
                            label={item.label}
                            placeholder={`Enter ${item.label}`}
                            name={item.key}
                            required
                            onChange={(e) => handleAddressChange(e, item.key)}
                            value={item.value}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setOpenModal(false)}
                    className="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onAddresInfoSave}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${getIconBgColor()} text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50`}
                  >
                    {isLoading ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isLoading ? "Saving..." : "Save Address"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cardItemsState.map((item: any, index: number) => (
                    <div key={index}>
                      {item.key === "youare" ? (
                        <SingleSelect
                          type="single-select"
                          name={item.key}
                          label="You are"
                          selectedOption={item.value}
                          options={[
                            { id: 1, service: "Owner" },
                            { id: 2, service: "Admin" },
                          ]}
                          optionsInterface={{ isObj: true, displayKey: "service" }}
                        />
                      ) : (
                        <CustomInput
                          type={
                            item.key === "emailaddress" ? "email" :
                            item.key.includes("password") || item.key.includes("Password") ? "password" : "text"
                          }
                          label={item.label}
                          name={item.key}
                          placeholder={`Enter ${item.label}`}
                          required
                          value={item.value}
                          onChange={(e) => handleInputChange(item.key, e.target.value, title)}
                          disabled={item.key === "emailaddress"}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 justify-end pt-5 mt-5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setOpenModal(false)}
                    className="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${getIconBgColor()} text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50`}
                  >
                    {isLoading ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

// ---------------- HR CARD (for HR tab) ----------------

type HrCardProps = {
  title: string;
  icon: string;
  rows: { label: string; value: string | number }[];
  onEdit: () => void;
};

const HrCard: React.FC<HrCardProps> = ({ title, icon, rows, onEdit }) => {
  const getIcon = () => {
    if (icon === "briefcase") return <Briefcase className="w-5 h-5" />;
    if (icon === "creditcard") return <CreditCard className="w-5 h-5" />;
    if (icon === "phone") return <Phone className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const getIconBgColor = () => {
    if (icon === "briefcase") return "from-blue-500 to-indigo-600";
    if (icon === "creditcard") return "from-emerald-500 to-teal-600";
    if (icon === "phone") return "from-rose-500 to-pink-600";
    return "from-slate-500 to-slate-600";
  };

  const getIconShadow = () => {
    if (icon === "briefcase") return "shadow-blue-500/25";
    if (icon === "creditcard") return "shadow-emerald-500/25";
    if (icon === "phone") return "shadow-rose-500/25";
    return "shadow-slate-500/25";
  };

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getIconBgColor()} text-white flex items-center justify-center shadow-lg ${getIconShadow()}`}>
            {getIcon()}
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500">
              {icon === "briefcase" && "Your employment information"}
              {icon === "creditcard" && "KYC and banking details"}
              {icon === "phone" && "Emergency contact information"}
            </p>
          </div>
        </div>

        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-blue-200 bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          Edit
        </button>
      </div>

      {/* Card Content */}
      <div className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-5">
          {rows.map((row) => (
            <div key={row.label} className="space-y-1.5">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{row.label}</p>
              <p className="text-sm font-semibold text-slate-800 break-words">{row.value || "-"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

type LeaveSectionProps = {
  hrData: EmployeeHrDetails | null;
  leaves: EmployeeLeave[];
  loading: boolean;
  onApplyLeaveClick: () => void;
};

const LeaveSection: React.FC<LeaveSectionProps> = ({
  hrData,
  leaves,
  loading,
  onApplyLeaveClick,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, Record<string, boolean>>>({});

  const monthOptions = [
    { id: "1", label: "Jan" }, { id: "2", label: "Feb" }, { id: "3", label: "Mar" },
    { id: "4", label: "Apr" }, { id: "5", label: "May" }, { id: "6", label: "Jun" },
    { id: "7", label: "Jul" }, { id: "8", label: "Aug" }, { id: "9", label: "Sep" },
    { id: "10", label: "Oct" }, { id: "11", label: "Nov" }, { id: "12", label: "Dec" },
  ];

  const LeaveType = { CASUAL: "CASUAL", SICK: "SICK", EARNED: "EARNED", COMP_OFF: "COMP_OFF", LOP: "LOP" } as const;
  type LeaveType = (typeof LeaveType)[keyof typeof LeaveType];

  const LeaveStatus = { APPLIED: "APPLIED", APPROVED: "APPROVED", REJECTED: "REJECTED", CANCELLED: "CANCELLED" } as const;
  type LeaveStatus = (typeof LeaveStatus)[keyof typeof LeaveStatus];

  const isEmpty = (filters?: Record<string, boolean>) => !filters || Object.values(filters).every((v) => !v);

  const filteredLeaves = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return leaves.filter((l) => {
      const matchSearch = !q || l?.type?.toLowerCase().includes(q) || l?.reason?.toLowerCase().includes(q);
      if (!matchSearch) return false;

      const typeFilters = selectedFilters.type;
      if (!isEmpty(typeFilters) && !typeFilters?.[l.type]) return false;

      const statusFilters = selectedFilters.status;
      if (!isEmpty(statusFilters) && !statusFilters?.[l.status]) return false;

      const monthFilters = selectedFilters.month;
      const month = new Date(l.fromDate).getMonth() + 1;
      if (!isEmpty(monthFilters) && !monthFilters?.[String(month)]) return false;

      return true;
    });
  }, [leaves, searchQuery, selectedFilters]);

  const leaveBalances = [
    { label: "Casual Leave", value: hrData?.casualLeaveBalance ?? 0, color: "from-blue-500 to-indigo-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Sick Leave", value: hrData?.sickLeaveBalance ?? 0, color: "from-rose-500 to-pink-600", bg: "bg-rose-50", border: "border-rose-100" },
    { label: "Earned Leave", value: hrData?.earnedLeaveBalance ?? 0, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "Comp Off", value: hrData?.compOffBalance ?? 0, color: "from-amber-500 to-orange-600", bg: "bg-amber-50", border: "border-amber-100" },
    { label: "LOP Days", value: hrData?.lopDays ?? 0, color: "from-slate-500 to-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
  ];

  return (
    <div className="space-y-5">
      {/* Leave Balance Cards */}
      <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Leave Balance</h3>
              <p className="text-xs text-slate-500">Your available leave days</p>
            </div>
          </div>
          <button
            onClick={onApplyLeaveClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Apply Leave
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {leaveBalances.map((item) => (
              <div key={item.label} className={`p-4 rounded-xl ${item.bg} border ${item.border}`}>
                <p className="text-xs font-medium text-slate-500 mb-1">{item.label}</p>
                <p className="text-2xl font-bold text-slate-800">{item.value}</p>
                <p className="text-xs text-slate-500">days available</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leave History */}
      <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Leave History</h3>
              <p className="text-xs text-slate-500">Your leave applications</p>
            </div>
          </div>
          <ReusableSearchFilter
            searchText={searchQuery}
            placeholder="Search by leave type or reason"
            onSearchChange={setSearchQuery}
            filters={[
              { groupLabel: "Leave Type", key: "type", options: Object.keys(LeaveType).map((t) => ({ id: t, label: t.replace("_", " ") })) },
              { groupLabel: "Status", key: "status", options: [{ id: LeaveStatus.APPLIED, label: "Applied" }, { id: LeaveStatus.APPROVED, label: "Approved" }, { id: LeaveStatus.REJECTED, label: "Rejected" }, { id: LeaveStatus.CANCELLED, label: "Cancelled" }] },
              { groupLabel: "Month", key: "month", options: monthOptions },
            ]}
            selectedFilters={selectedFilters}
            onFilterChange={setSelectedFilters}
          />
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader />
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-semibold text-slate-700 mb-1">No Leave Records</h4>
              <p className="text-sm text-slate-500">No leave applications match your search</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">From</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">To</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Days</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-sm font-semibold text-slate-800">{leave?.type?.replace("_", " ")}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{leave.fromDate}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{leave.toDate}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-slate-800">{leave.days}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          leave.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                          leave.status === "REJECTED" ? "bg-red-100 text-red-700" :
                          leave.status === "CANCELLED" ? "bg-slate-100 text-slate-600" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {leave.status === "APPROVED" && <CheckCircle2 className="w-3 h-3" />}
                          {leave.status === "REJECTED" && <AlertCircle className="w-3 h-3" />}
                          {leave.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 max-w-[200px] truncate">{leave.reason || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------------- PAYSLIP SECTION ----------------

type PayslipSectionProps = {
  payslips: EmployeePayslip[];
  loading: boolean;
};

const PayslipSection: React.FC<PayslipSectionProps> = ({ payslips, loading }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, Record<string, boolean>>>({});

  const monthLabel = (m: number) => ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m] || m;
  const monthOptions = [
    { id: "1", label: "Jan" }, { id: "2", label: "Feb" }, { id: "3", label: "Mar" },
    { id: "4", label: "Apr" }, { id: "5", label: "May" }, { id: "6", label: "Jun" },
    { id: "7", label: "Jul" }, { id: "8", label: "Aug" }, { id: "9", label: "Sep" },
    { id: "10", label: "Oct" }, { id: "11", label: "Nov" }, { id: "12", label: "Dec" },
  ];

  const PAYSLIP_STATUS = [
    { id: "GENERATED", label: "Generated" },
    { id: "SENT", label: "Sent" },
    { id: "PAID", label: "Paid" },
  ];

  const isEmpty = (filters?: Record<string, boolean>) => !filters || Object.values(filters).every((v) => !v);

  const filteredSlips = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return payslips.filter((s) => {
      const monthYear = `${monthLabel(s.month)} ${s.year}`.toLowerCase();
      const matchSearch = !q || s.payslipNumber?.toLowerCase().includes(q) || monthYear.includes(q);
      if (!matchSearch) return false;
      if (!isEmpty(selectedFilters.status) && !selectedFilters.status?.[s.status]) return false;
      if (!isEmpty(selectedFilters.month) && !selectedFilters.month?.[String(s.month)]) return false;
      return true;
    });
  }, [payslips, searchQuery, selectedFilters]);

  const downloadPdf = async (url: string, filename: string) => {
    try {
      const response = await fetch(url, { method: "GET" });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download PDF");
    }
  };

  // Calculate total earnings
  const totalEarnings = payslips.reduce((acc, p) => acc + (p.netPay || 0), 0);

  return (
    <div className="space-y-5">
      {/* Summary Card */}
      <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-green-500/25">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Payslips</h3>
              <p className="text-xs text-slate-500">Your salary statements</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
              <p className="text-xs font-medium text-slate-500 mb-1">Total Payslips</p>
              <p className="text-2xl font-bold text-slate-800">{payslips.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <p className="text-xs font-medium text-slate-500 mb-1">YTD Earnings</p>
              <p className="text-2xl font-bold text-slate-800">₹{totalEarnings.toLocaleString("en-IN")}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
              <p className="text-xs font-medium text-slate-500 mb-1">Paid</p>
              <p className="text-2xl font-bold text-slate-800">{payslips.filter((p) => p.status === "PAID").length}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200">
              <p className="text-xs font-medium text-slate-500 mb-1">Pending</p>
              <p className="text-2xl font-bold text-slate-800">{payslips.filter((p) => p.status !== "PAID").length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payslips List */}
      <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">All Payslips</h3>
              <p className="text-xs text-slate-500">View and download your payslips</p>
            </div>
          </div>
          <ReusableSearchFilter
            searchText={searchQuery}
            placeholder="Search by payslip no. or month/year"
            onSearchChange={setSearchQuery}
            filters={[
              { groupLabel: "Status", key: "status", options: PAYSLIP_STATUS },
              { groupLabel: "Month", key: "month", options: monthOptions },
            ]}
            selectedFilters={selectedFilters}
            onFilterChange={setSelectedFilters}
          />
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader />
            </div>
          ) : filteredSlips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-semibold text-slate-700 mb-1">No Payslips Found</h4>
              <p className="text-sm text-slate-500">No payslips match your search criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Month</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pay Date</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Pay</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSlips.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-slate-600">{monthLabel(p.month)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{monthLabel(p.month)} {p.year}</p>
                            {p.payslipNumber && <p className="text-xs text-slate-500">#{p.payslipNumber}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {p.payDate ? new Date(p.payDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-bold text-slate-800">₹{p.netPay?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          p.status === "PAID" ? "bg-emerald-100 text-emerald-700" :
                          p.status === "SENT" ? "bg-blue-100 text-blue-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {p.status === "PAID" && <CheckCircle2 className="w-3 h-3" />}
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {p.pdfUrl ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={p.pdfUrl}
                              target="_blank"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </a>
                            <button
                              onClick={() => downloadPdf(p.pdfUrl!, `Payslip-${p.year}-${String(p.month).padStart(2, "0")}.pdf`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">No PDF available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAdminLayout(ProfileView);
