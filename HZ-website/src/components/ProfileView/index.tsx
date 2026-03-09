import React, { useState, useEffect, useRef } from "react";
import Modal from "@/common/Modal";
import CustomInput from "@/common/FormElements/CustomInput";
import SingleSelect from "@/common/FormElements/SingleSelect";
import Button from "@/common/Button";
import Image from "next/image";
import apiClient from "@/utils/apiClient";
import { FaPlus, FaCamera } from "react-icons/fa";
import { MdPerson, MdLocationOn, MdLock, MdEdit, MdClose, MdDelete } from "react-icons/md";
import { HiOutlineBriefcase } from "react-icons/hi";
import Drawer from "@/common/Drawer";
import DeleteAccount from "../DeleteAccount";
import toast from "react-hot-toast";
import { useAuthUser } from "@/utils/useAuthUser";
import { deleteFile, uploadFile } from "@/utils/uploadFile";
import BackRoute from "@/common/BackRoute";

// Define interfaces
export interface IAddress {
  id?: number;
  name: string;
  phone: string;
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
  profile?: string;
  createdAt?: string;
  addresses: IAddress[];
}

export default function ProfileView() {
  const [userData, setUserData] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "hr">("profile");
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState("");
  const { user, userId, isAuthenticated } = useAuthUser();
  const [settingOpen, setSettingOpen] = useState(false);

  // Personal Information State
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "Owner",
  });

  // Addresses State
  const [addresses, setAddresses] = useState<IAddress[]>([]);

  // Password State
  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Modal States
  const [editPersonalModal, setEditPersonalModal] = useState(false);
  const [editAddressModal, setEditAddressModal] = useState(false);
  const [editPasswordModal, setEditPasswordModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null);
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch User Data
  const fetchUserData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`${apiClient.URLS.user}/${userId}`, undefined, true);
      if (res?.status === 200) {
        const data = res.body;
        setUserData(data);
        setProfile(data?.profile || "");
        setPersonalInfo({
          firstName: data?.firstName || "",
          lastName: data?.lastName || "",
          email: data?.email || "",
          phone: data?.phone || "",
          role: "Owner",
        });
        setAddresses(data?.addresses || []);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Error fetching user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchUserData();
    }
  }, [isAuthenticated, userId]);

  // Get initials for avatar
  const getInitials = () => {
    const first = personalInfo.firstName?.[0] || "";
    const last = personalInfo.lastName?.[0] || "";
    return `${first}${last}`.toUpperCase() || "U";
  };

  // Format member since date
  const getMemberSince = () => {
    if (!userData?.createdAt) return "Member";
    const date = new Date(userData.createdAt);
    return `Member since ${date.getFullYear()}`;
  };

  // Handle profile image upload
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (uploadLoading) return;
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadLoading(true);
    try {
      const uploadedUrl = await uploadFile(file, "userprofiles");
      if (uploadedUrl) {
        setProfile(uploadedUrl);
        // Save immediately
        await apiClient.patch(
          `${apiClient.URLS.user}/${userId}/update-personal-info`,
          { profile: uploadedUrl },
          true
        );
        toast.success("Profile picture updated!");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setUploadLoading(false);
    }
  };

  // Save Personal Information
  const handleSavePersonalInfo = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.user}/${userId}/update-personal-info`,
        {
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          phone: personalInfo.phone,
        },
        true
      );
      if (res.status === 200) {
        toast.success("Personal information updated!");
        setEditPersonalModal(false);
        fetchUserData();
      }
    } catch (error: any) {
      toast.error(error?.body?.message || "Failed to update");
    } finally {
      setIsLoading(false);
    }
  };

  // Save Address
  const handleSaveAddress = async () => {
    if (!userId || !selectedAddress) return;

    // Validate required fields
    if (!selectedAddress.name || !selectedAddress.phone || !selectedAddress.area || !selectedAddress.city || !selectedAddress.state || !selectedAddress.zipCode) {
      toast.error("Please fill all required fields");
      return;
    }

    // Validate phone number (must start with 6-9 and be 10 digits)
    if (!/^[6-9]\d{9}$/.test(selectedAddress.phone)) {
      toast.error("Phone number must start with 6, 7, 8, or 9 and be 10 digits");
      return;
    }

    // Validate pin code (must be 6 digits)
    if (!/^\d{6}$/.test(selectedAddress.zipCode)) {
      toast.error("Pin code must be a 6-digit number");
      return;
    }

    setIsLoading(true);
    try {
      if (isNewAddress) {
        await apiClient.post(`${apiClient.URLS.address}/${userId}`, selectedAddress, true);
        toast.success("Address added!");
      } else {
        await apiClient.patch(
          `${apiClient.URLS.address}/${userId}/${selectedAddress.id}`,
          selectedAddress,
          true
        );
        toast.success("Address updated!");
      }
      setEditAddressModal(false);
      fetchUserData();
    } catch (error: any) {
      toast.error(error?.body?.message || "Failed to save address");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Address
  const handleDeleteAddress = async (addressId: number) => {
    if (!userId ) return;

    try {
      await apiClient.delete(`${apiClient.URLS.address}/${userId}/${addressId}`, {}, true);
      toast.success("Address deleted!");
      fetchUserData();
    } catch (error: any) {
      toast.error(error?.body?.message || "Failed to delete");
    }
  };

  // Save Password
  const handleSavePassword = async () => {
    if (!userId) return;

    if (!passwordInfo.currentPassword || !passwordInfo.newPassword || !passwordInfo.confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordInfo.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post(
        `${apiClient.URLS.user}/${userId}/change-password`,
        passwordInfo,
        true
      );
      toast.success("Password changed!");
      setEditPasswordModal(false);
      setPasswordInfo({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error?.body?.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#3586FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-start p-2 md:px-6">
        {/* Back Button */}
        <div className="mb-4">
          <BackRoute />
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            {/* Avatar with Camera */}
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-[#3586FF] to-[#2563eb] flex items-center justify-center shadow-lg overflow-hidden">
                {profile ? (
                  <Image src={profile} fill alt="Profile" className="object-cover" />
                ) : (
                  <span className="text-white font-bold text-2xl md:text-3xl">{getInitials()}</span>
                )}
              </div>
              {/* Camera Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadLoading}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-xl shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                {uploadLoading ? (
                  <div className="w-4 h-4 border-2 border-[#3586FF] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaCamera className="w-3.5 h-3.5 text-gray-500" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {personalInfo.firstName} {personalInfo.lastName}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#3586FF] text-xs font-semibold rounded-full">
                  <span className="w-1.5 h-1.5 bg-[#3586FF] rounded-full" />
                  {personalInfo.role}
                </span>
                <span className="text-gray-400 text-sm">{getMemberSince()}</span>
              </div>
            </div>
          </div>


        </div>
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <MdPerson className="text-[#3586FF]" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Personal Information</h3>
                  <p className="text-xs text-gray-400">Your basic profile details</p>
                </div>
              </div>
              <Button
                onClick={() => setEditPersonalModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#3586FF] text-[#3586FF] text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                <MdEdit size={16} />
                Edit
              </Button>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">First Name</p>
                  <p className="text-sm font-medium text-gray-900">{personalInfo.firstName || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Last Name</p>
                  <p className="text-sm font-medium text-gray-900">{personalInfo.lastName || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                  <p className="text-sm font-medium text-gray-900">{personalInfo.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">You Are</p>
                  <p className="text-sm font-medium text-gray-900">{personalInfo.role}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-50">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-sm font-medium text-gray-900">{personalInfo.email || "-"}</p>
              </div>
            </div>
          </div>

          {/* Address Information Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <MdLocationOn className="text-[#3586FF]" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Address Information</h3>
                  <p className="text-xs text-gray-400">Manage your saved addresses</p>
                </div>
              </div>
                <Button
                  onClick={() => {
                    setSelectedAddress({ name: "", phone: "", area: "", city: "", state: "", country: "India", zipCode: "" });
                    setIsNewAddress(true);
                    setEditAddressModal(true);
                  }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#3586FF] text-[#3586FF] text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                <FaPlus size={12} />
                Add
              </Button>
            </div>

            <div className="p-5">
              {addresses.length > 0 ? (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Name</p>
                            <p className="text-sm font-medium text-gray-900">{address.name || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                            <p className="text-sm font-medium text-gray-900">{address.phone || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Area</p>
                            <p className="text-sm font-medium text-gray-900">{address.area || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">City</p>
                            <p className="text-sm font-medium text-gray-900">{address.city || "-"}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">State</p>
                            <p className="text-sm font-medium text-gray-900">{address.state || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Country</p>
                            <p className="text-sm font-medium text-gray-900">{address.country || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Pin Code</p>
                            <p className="text-sm font-medium text-gray-900">{address.zipCode || "-"}</p>
                          </div>
                        </div>
                      <div className="flex gap-2 pt-3 border-t border-gray-200">
                        <Button
                          onClick={() => {
                            setSelectedAddress(address);
                            setIsNewAddress(false);
                            setEditAddressModal(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#3586FF] text-[#3586FF] text-xs font-medium hover:bg-blue-50 transition-colors"
                        >
                          <MdEdit size={14} />
                          Edit
                        </Button>
                        <Button
                          onClick={() => address.id && handleDeleteAddress(address.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-400 text-red-500 text-xs font-medium hover:bg-red-50 transition-colors"
                        >
                          <MdDelete size={14} />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MdLocationOn className="text-gray-300" size={28} />
                  </div>
                  <p className="text-gray-400 font-medium">No Addresses Saved</p>
                </div>
              )}
            </div>
          </div>

          {/* Password Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <MdLock className="text-[#3586FF]" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Password</h3>
                  <p className="text-xs text-gray-400">Manage your password</p>
                </div>
              </div>
              <Button
                onClick={() => setEditPasswordModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#3586FF] text-[#3586FF] text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                <MdEdit size={16} />
                Change
              </Button>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Password</p>
                <p className="text-sm font-medium text-gray-900">••••••••</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Personal Info Modal */}
      <Modal isOpen={editPersonalModal} closeModal={() => setEditPersonalModal(false)} className="max-w-lg">
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Edit Personal Information</h2>
            <Button onClick={() => setEditPersonalModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <MdClose size={20} className="text-gray-400" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <CustomInput
                type="text"
                label="First Name"
                value={personalInfo.firstName}
                onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                placeholder="Enter first name"
                required
              />
              <CustomInput
                type="text"
                label="Last Name"
                value={personalInfo.lastName}
                onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                placeholder="Enter last name"
              />
            </div>
            <CustomInput
              type="email"
              label="Email Address"
              value={personalInfo.email}
              disabled
              rootCls="opacity-60"
            />
            <CustomInput
              type="number"
              label="Phone Number"
              value={personalInfo.phone}
              onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
              placeholder="Enter phone number"
            />
            <SingleSelect
              type="single-select"
              name="role"
              label="You Are"
              selectedOption={personalInfo.role}
              options={[{ id: 1, service: "Owner" }, { id: 2, service: "Tenant" }]}
              optionsInterface={{ isObj: true, displayKey: "service" }}
              buttonCls="w-full h-11 border-2 border-gray-200 rounded-xl"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setEditPersonalModal(false)}
              className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePersonalInfo}
              disabled={isLoading}
              className="flex-1 py-2 rounded-xl bg-[#3586FF] text-white font-medium hover:bg-[#2d75e6] disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Address Modal */}
      <Modal isOpen={editAddressModal} closeModal={() => setEditAddressModal(false)} className="max-w-lg">
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">
              {isNewAddress ? "Add New Address" : "Edit Address"}
            </h2>
            <Button onClick={() => setEditAddressModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <MdClose size={20} className="text-gray-400" />
            </Button>
          </div>

          {selectedAddress && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <CustomInput
                  type="text"
                  label="Contact Name"
                  value={selectedAddress.name}
                  onChange={(e) => setSelectedAddress({ ...selectedAddress, name: e.target.value })}
                  placeholder="Enter contact name"
                  required
                />
                <CustomInput
                  type="number"
                  label="Phone Number"
                  value={selectedAddress.phone}
                  onChange={(e) => setSelectedAddress({ ...selectedAddress, phone: e.target.value })}
                  placeholder="Enter 10-digit phone"
                  required
                />
              </div>
              <CustomInput
                type="text"
                label="Area / Street"
                value={selectedAddress.area}
                onChange={(e) => setSelectedAddress({ ...selectedAddress, area: e.target.value })}
                placeholder="Enter area or street"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <CustomInput
                  type="text"
                  label="City"
                  value={selectedAddress.city}
                  onChange={(e) => setSelectedAddress({ ...selectedAddress, city: e.target.value })}
                  placeholder="Enter city"
                  required
                />
                <CustomInput
                  type="text"
                  label="State"
                  value={selectedAddress.state}
                  onChange={(e) => setSelectedAddress({ ...selectedAddress, state: e.target.value })}
                  placeholder="Enter state"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CustomInput
                  type="text"
                  label="Country"
                  value={selectedAddress.country}
                  onChange={(e) => setSelectedAddress({ ...selectedAddress, country: e.target.value })}
                  placeholder="Enter country"
                />
                <CustomInput
                  type="text"
                  label="Pin Code (6 digits)"
                  value={selectedAddress.zipCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setSelectedAddress({ ...selectedAddress, zipCode: val });
                  }}
                  placeholder="Enter 6-digit pin code"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setEditAddressModal(false)}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAddress}
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl bg-[#3586FF] text-white font-medium hover:bg-[#2d75e6] disabled:opacity-50"
            >
              {isLoading ? "Saving..." : isNewAddress ? "Add Address" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={editPasswordModal} closeModal={() => setEditPasswordModal(false)} className="max-w-lg">
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
            <Button onClick={() => setEditPasswordModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <MdClose size={20} className="text-gray-400" />
            </Button>
          </div>

          <div className="space-y-4">
            <CustomInput
              type="password"
              label="Current Password"
              value={passwordInfo.currentPassword}
              onChange={(e) => setPasswordInfo({ ...passwordInfo, currentPassword: e.target.value })}
              placeholder="Enter current password"
              required
            />
            <CustomInput
              type="password"
              label="New Password"
              value={passwordInfo.newPassword}
              onChange={(e) => setPasswordInfo({ ...passwordInfo, newPassword: e.target.value })}
              placeholder="Enter new password"
              required
            />
            <CustomInput
              type="password"
              label="Confirm New Password"
              value={passwordInfo.confirmPassword}
              onChange={(e) => setPasswordInfo({ ...passwordInfo, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              required
            />
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setEditPasswordModal(false)}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePassword}
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl bg-[#3586FF] text-white font-medium hover:bg-[#2d75e6] disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Change Password"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Settings Drawer */}
      <Drawer
        open={settingOpen}
        handleDrawerToggle={() => setSettingOpen(false)}
        closeIconCls="text-gray-600"
        openVariant="right"
        panelCls="w-full max-w-md bg-white shadow-2xl"
      >
        <div className="flex flex-col h-full p-5">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>
          <div className="flex-1">
            <DeleteAccount />
          </div>
          <Button
            onClick={() => setSettingOpen(false)}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
          >
            Close
          </Button>
        </div>
      </Drawer>
    </div>
  );
}
