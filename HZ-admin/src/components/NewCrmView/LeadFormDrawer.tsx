import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Drawer from "@/src/common/Drawer";
import Button from "@/src/common/Button";
import CustomInput from "@/src/common/FormElements/CustomInput";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import apiClient from "@/src/utils/apiClient";
import {
  Lead,
  categoryData,
  propertytypedata,
  platformData,
  leaddata,
  statesOptions,
  PlatForm,
} from "./types";
import SearchComponent from "@/src/common/SearchSelect";
import { FiUser, FiHome, FiFileText, FiX, FiUserPlus, FiEdit3 } from "react-icons/fi";

interface LeadFormDrawerProps {
  open: boolean;
  onClose: () => void;
  leadId: string | null;
  onSuccess: (lead: Lead) => void;
  formData: any;
  setFormData: any;
  branchOptions: any;
}

interface FormData {
  Fullname: string;
  Phonenumber: string;
  email: string;
  propertytype: string;
  bhk: string;
  city: string;
  state: string;
  serviceType: string;
  platform: string;
  leadstatus: string;
  review: string;
  houseNo?: string;
  apartmentName?: string;
  areaName?: string;
  pincode?: string;
  isFuturePotential?: boolean;
}

export default function LeadFormDrawer({
  open,
  onClose,
  leadId,
  onSuccess,
  setFormData,
  formData,
  branchOptions,
}: LeadFormDrawerProps) {
  const session = useSession();
  const user = session?.data?.user;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const membership =
  (session?.data?.user as any)?.branchMemberships?.find((m: any) => m.isPrimary) ||
  (session?.data?.user as any)?.branchMemberships?.[0];

const canShowBranchFilter =
  membership?.branchRoles?.some((r: any) => r.roleName === "SuperAdmin") &&
  membership?.isBranchHead === true &&
  membership?.level === "ORG";


  useEffect(() => {
    if (leadId && open) {
      fetchLead(leadId);
    } else if (!leadId && open) {
      resetForm();
    }
  }, [leadId, open]);
  const onBranchChange = (option: any) => {
    setFormData((prev) => ({
      ...prev,
      branchId: option?.value,
    }));
  };

  const fetchLead = async (id: any) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`${apiClient.URLS.crmlead}/${id}`,{},true);
      if (res.status === 200 && res.body) {
        setFormData({
          Fullname: res.body.Fullname || "",
          Phonenumber: res.body.Phonenumber || "",
          email: res.body.email || "",
          propertytype: res.body.propertytype || "Flat",
          bhk: res.body.bhk || "",
          city: res.body.city || "",
          state: res.body.state || "",
          serviceType: res.body.serviceType || "RealEstate",
          platform: res.body.platform || "Walkin",
          leadstatus: res.body.leadstatus || "New",
          review: res.body.review || "",
          houseNo: res.body.houseNo || "",
          apartmentName: res.body.apartmentName || "",
          areaName: res.body.areaName || "",
          pincode: res.body.pincode || "",
          branchId: res.body.branchId || ""
        });
      }
    } catch (error) {
      console.error("Error fetching lead:", error);
      toast.error("Failed to load lead data");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      Fullname: "",
      Phonenumber: "",
      email: "",
      propertytype: "Flat",
      bhk: "",
      city: "",
      state: "",
      serviceType: "RealEstate",
      platform: "Walkin",
      leadstatus: "New",
      review: "",
      houseNo: "",
      apartmentName: "",
      areaName: "",
      pincode: "",
      branchId: membership?.branchId || "",
      isFuturePotential: false,
    });
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.Fullname.trim()) {
      newErrors.Fullname = "Full name is required";
    }

    if (!formData.Phonenumber.trim()) {
      newErrors.Phonenumber = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.Phonenumber)) {
      newErrors.Phonenumber = "Phone must be 10 digits starting with 6-9";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    const branchIdToSend = canShowBranchFilter
  ? formData.branchId || membership?.branchId
  : membership?.branchId;

    try {
      const payload = {
        Fullname: formData.Fullname.trim(),
        Phonenumber: formData.Phonenumber.trim(),
        email: formData.email.trim() || undefined,
        propertytype: formData.propertytype || "Flat",
        bhk: formData.bhk || undefined,
        city: formData.city.trim(),
        state: formData.state.trim() || "Andhra Pradesh",
        serviceType: formData.serviceType || "RealEstate",
        platform: formData.platform || "MAGIC BRICKS",
        leadstatus: formData.leadstatus,
        review: formData.review.trim() || undefined,
        houseNo: formData.houseNo?.trim() || undefined,
        apartmentName: formData.apartmentName?.trim() || undefined,
        areaName: formData.areaName?.trim() || undefined,
        pincode: formData.pincode?.trim() || undefined,
        branchId: branchIdToSend,
        isFuturePotential: formData.isFuturePotential ?? false,
        createdById: (user as any)?.id,
      };

      let res;
      if (leadId) {
        res = await apiClient.patch(
          `${apiClient.URLS.crmlead}/${leadId}`,
          {
            ...payload,
            actorId: (user as any)?.id,
            // actorBranchId: payload.branchId,
            actorBranchId: branchIdToSend, 
          },
          true
        );
      } else {
        // Create new lead
        res = await apiClient.post(apiClient.URLS.crmlead, payload, true);
      }

      if (res.status === 200 || res.status === 201) {
        toast.success(
          leadId ? "Lead updated successfully!" : "Lead created successfully!"
        );
        onSuccess(res.body);
        resetForm();
      }
    } catch (error: any) {
      console.error("Error saving lead:", error);
      const errorMessage =
        error?.response?.data?.message || "Failed to save lead";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  const selectedPlatform =
  platformData.find((item) => item.platform === formData.platform) ??
  platformData.find((item) => item.platform === PlatForm.WALKIN) ??
  platformData[0];

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Drawer
      open={open}
      handleDrawerToggle={handleClose}
      closeIconCls="text-slate-500 hover:text-slate-800"
      openVariant="right"
      rootCls="z-[99999999]"
      panelCls="w-[95%] md:w-[80%] lg:w-[calc(82%-190px)] shadow-2xl z-[9999999]"
      overLayCls="bg-slate-900/60 backdrop-blur-sm"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-slate-100 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white grid place-items-center shadow-lg shadow-blue-500/30">
                {leadId ? <FiEdit3 className="w-5 h-5" /> : <FiUserPlus className="w-5 h-5" />}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                  {leadId ? "Edit Lead" : "Add New Lead"}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  {leadId ? "Update lead information" : "Fill in the details to create a new lead"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto"
        >
          <div className="px-6 py-6 space-y-6">
            {/* Required Fields Notice */}
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-amber-700 font-medium">Fields marked with <span className="text-red-500">*</span> are required</p>
            </div>

            {/* Basic Information */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
              <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FiUser className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-800">Basic Information</h2>
                    <p className="text-xs text-slate-500">Contact details of the lead</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <CustomInput
                    label="Full Name"
                    type="text"
                    name="Fullname"
                    value={formData.Fullname}
                     labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                    placeholder="Enter name here"
                    required
                    onChange={handleInputChange}
                    errorMsg={errors.Fullname}
                  />

                  <CustomInput
                    label="Phone Number"
                    type="number"
                    name="Phonenumber"
                    value={formData.Phonenumber}
                    placeholder="Enter 10-digit number"
                     labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                    required
                    onChange={handleInputChange}
                    errorMsg={errors.Phonenumber}
                  />

                  <CustomInput
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="Enter email here"
                     labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                    onChange={handleInputChange}
                    errorMsg={errors.email}
                  />

                  <SingleSelect
                    type="single-select"
                    label="Service Category"
                    name="serviceType"
                    options={categoryData}
                     labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                   
                    selectedOption={
                      categoryData.find(
                        (item) => item.role === formData.serviceType
                      ) || categoryData[0]
                    }
                    optionsInterface={{
                      isObj: true,
                      displayKey: "role",
                    }}
                    handleChange={(name, value) =>
                      setFormData((prev) => ({
                        ...prev,
                        serviceType: value.role,
                      }))
                    }
                    
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
              <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <FiHome className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-800">Property Details</h2>
                    <p className="text-xs text-slate-500">Property and location information</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <CustomInput
                    label="BHK"
                    type="text"
                    name="bhk"
                    value={formData.bhk}
                    placeholder="e.g., 2, 3, 4"
                    onChange={handleInputChange}
                     labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  />

                  <SingleSelect
                    type="single-select"
                    label="Property Type"
                    name="propertytype"
                    options={propertytypedata}
                     labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                    selectedOption={
                      propertytypedata.find(
                        (item) => item.propertytype === formData.propertytype
                      ) || propertytypedata[0]
                    }
                    required
                    optionsInterface={{
                      isObj: true,
                      displayKey: "propertytype",
                    }}
                    handleChange={(name, value) =>
                      setFormData((prev) => ({
                        ...prev,
                        propertytype: value.propertytype,
                      }))
                    }
                  />

                  <CustomInput
                    label="City"
                    type="text"
                    name="city"
                    value={formData.city}
                    placeholder="Enter city"
                    onChange={handleInputChange}
                    required
                    errorMsg={errors.city}
                     labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  />

                  <div>
                    <SingleSelect
                      type="single-select"
                      label="State"
                      placeholder="Select State"
                       labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                      name="state"
                      options={statesOptions}
                      selectedOption={
                        statesOptions.find((item) => item === formData.state) ||
                        statesOptions[0]
                      }
                      required
                      optionsInterface={{
                        isObj: false,
                      }}
                      handleChange={(name, value) =>
                        setFormData((prev) => ({ ...prev, state: value }))
                      }
                      errorMsg={errors.state}
                    />
                  </div>

                  <CustomInput
                    label="House No"
                    type="text"
                    name="houseNo"
                    value={formData.houseNo}
                    placeholder="House/Flat number"
                    onChange={handleInputChange}
                     labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  />

                  <CustomInput
                    label="Apartment/Street"
                    type="text"
                    name="apartmentName"
                    value={formData.apartmentName}
                    placeholder="Building/Street name"
                    onChange={handleInputChange}
                     labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  />

                  <CustomInput
                    label="Area/Locality"
                    type="text"
                    name="areaName"
                    value={formData.areaName}
                    placeholder="Area or locality"
                    onChange={handleInputChange}
                     labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  />

                  <CustomInput
                    label="Pincode"
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    placeholder="6-digit pincode"
                    onChange={handleInputChange}
                     labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  />
                </div>
              </div>
            </div>

            {/* Lead Details */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
              <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FiFileText className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-800">Lead Details</h2>
                    <p className="text-xs text-slate-500">Status and source information</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <SingleSelect
                    type="single-select"
                    name="leadstatus"
                    options={leaddata}
                     labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                    label="Lead Status"
                    selectedOption={
                      leaddata.find(
                        (item) => item.leadstatus === formData.leadstatus
                      ) || leaddata[0]
                    }
                    optionsInterface={{
                      isObj: true,
                      displayKey: "leadstatus",
                    }}
                    required
                    handleChange={(name, value) =>
                      setFormData((prev) => ({
                        ...prev,
                        leadstatus: value.leadstatus,
                      }))
                    }
                  />

                  <SingleSelect
                    type="single-select"
                    label="Platform"
                    name="platform"
                     labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                    required
                    options={platformData}
                    selectedOption={selectedPlatform}
                    optionsInterface={{
                      isObj: true,
                      displayKey: "platform",
                    }}
                    handleChange={(name, value) =>
                      setFormData((prev) => ({
                        ...prev,
                        platform: value.platform,
                      }))
                    }
                  />
{canShowBranchFilter ? (
                  <SearchComponent
                    label="Branch"
                    inputClassName="text-[13px] font-regular py-2.5"
                    labelCls="mb-1.5 inline-block text-[13px] font-semibold text-slate-700 tracking-wide"
                    rootClassName="py-1 rounded-xl w-full"
                    placeholder="Select branch"
                    value={
                      branchOptions.find((opt) => opt.value === formData.branchId)
                        ?.label || ""
                    }
                    onChange={onBranchChange}
                    options={branchOptions}
                    isMulti={false}
                    showDeleteIcon={true}
                  />):null}

                  <CustomInput
                    label="Review / Notes"
                    type="textarea"
                    name="review"
                    value={formData.review}
                    placeholder="Add notes or review"
                    onChange={handleInputChange}
                     labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  />

                  <div className="flex items-center gap-3 col-span-full">
                    <input
                      type="checkbox"
                      id="isFuturePotential"
                      checked={formData.isFuturePotential ?? false}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isFuturePotential: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                    />
                    <label
                      htmlFor="isFuturePotential"
                      className="text-sm font-medium text-slate-700"
                    >
                      Mark as Future Potential (preserve for re-engagement)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-5 flex items-center justify-between">
            <p className="text-xs text-slate-400 hidden md:block">
              {leadId ? "Changes will be saved immediately" : "Lead will be created after submission"}
            </p>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button
                className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition-all duration-200"
                type="button"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:from-blue-600 hover:to-blue-700 active:scale-[.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : leadId ? (
                  <>
                    <FiEdit3 className="w-4 h-4" />
                    Update Lead
                  </>
                ) : (
                  <>
                    <FiUserPlus className="w-4 h-4" />
                    Create Lead
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Drawer>
  );
}
