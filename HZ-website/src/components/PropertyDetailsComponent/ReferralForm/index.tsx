import React, { useState, useEffect } from "react";
import Button from "@/common/Button";
import CheckboxInput from "@/common/FormElements/CheckBoxInput";
import CustomInput from "@/common/FormElements/CustomInput";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";
import { ChevronLeft, X } from "lucide-react";

interface ReferAndEarnFormProps {
  propertyId: string;
  /** Logged-in user ID (referrer). Required to link who referred this lead. */
  referrerUserId?: number | string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function ReferralForm({
  propertyId,
  referrerUserId,
  onSuccess,
  onClose,
}: ReferAndEarnFormProps) {
  const [formData, setFormData] = useState({
    leadName: "",
    leadPhone: "",
    leadEmail: "",
    leadCity: "",
    requirementNote: "",
    relationshipType: "",
    agreeToContact: false,
  });
  const [property, setProperty] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTextInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const name = formData.leadName?.trim();
    if (!name) {
      newErrors.leadName = "Friend's name is required";
    }

    const hasPhone = !!formData.leadPhone?.trim();
    const hasEmail = !!formData.leadEmail?.trim();
    if (!hasPhone && !hasEmail) {
      newErrors.leadPhone = "At least one of phone or email is required";
      newErrors.leadEmail = "At least one of phone or email is required";
    } else {
      if (hasPhone) {
        const phone = formData.leadPhone.replace(/\D/g, "");
        if (phone.length !== 10) {
          newErrors.leadPhone = "Please enter a valid 10-digit mobile number";
        }
      }
      if (hasEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.leadEmail.trim())) {
          newErrors.leadEmail = "Please enter a valid email address";
        }
      }
    }

    if (!formData.agreeToContact) {
      newErrors.agreeToContact = "You must agree to be contacted regarding this referral";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (referrerUserId == null) {
      toast.error("Please log in to submit a referral");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      const payload = {
        propertyId,
        referrerUserId:
          referrerUserId != null ? String(referrerUserId) : undefined,
        leadName: formData.leadName,
        leadPhone: formData.leadPhone,
        leadEmail: formData.leadEmail,
        leadCity: formData.leadCity,
        requirementNote: formData.requirementNote,
        relationshipType: formData.relationshipType || undefined,
        category: "PROPERTY",
      };

      const res = await apiClient.post(
        `${apiClient.URLS.referandearn}/referrals`,
        { ...payload },
        true
      );

      if (res?.status === 201 || res?.status === 200) {
        setFormData({
          leadName: "",
          leadPhone: "",
          leadEmail: "",
          leadCity: "",
          requirementNote: "",
          relationshipType: "",
          agreeToContact: false,
        });
        setErrors({});

        toast.success("Referral submitted successfully ");
        onSuccess?.();
      }
    } catch (error) {
      console.error("Referral error:", error);
      toast.error("Failed to submit referral");
    }
  };
  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) return;

      try {
        const response = await apiClient.get(
          `${apiClient.URLS.property}/${propertyId}`
        );
        setProperty(response.body);
      } catch (error) {
        console.error("Error fetching property:", error);
      }
    };

    fetchProperty();
  }, [propertyId]);

  return (
    <div className="w-full max-w-full overflow-hidden rounded-none bg-white md:max-w-[560px] md:rounded-2xl md:shadow-xl">
      {/* Header with Back + Close */}
      <div className="bg-gradient-to-br from-[#3586FF] to-[#5297ff] px-3 py-3 text-white md:px-6 md:py-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex shrink-0 rounded-lg p-1 text-white/90 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Back"
              >
                <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold tracking-tight md:text-xl">Refer & Earn</h2>
              <p className="mt-0.5 text-xs font-medium text-white/90 md:mt-1 md:text-sm">
                Share your friend’s details and earn rewards when they convert
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex shrink-0 rounded-lg p-1 text-white/90 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close"
            >
              <X className="h-6 w-6 md:h-7 md:w-7" />
            </button>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5 md:mt-3 md:gap-2">
          <span className="rounded-lg bg-white/20 px-2 py-0.5 text-xs font-medium backdrop-blur-sm md:px-2.5 md:py-1">
            {property?.propertyDetails?.propertyName ?? "—"}
          </span>
          <span className="rounded-lg bg-white/20 px-2 py-0.5 text-xs font-medium backdrop-blur-sm md:px-2.5 md:py-1">
            {property?.locationDetails?.locality ?? property?.locationDetails?.subLocality ?? "-"}
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-3 py-3 md:px-6 md:py-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          <CustomInput
            label="Friend's Name"
            type="text"
            name="leadName"
            value={formData.leadName}
            placeholder="Enter friend's name"
            labelCls="font-medium text-[13px] text-slate-700"
            className="w-full border-slate-200 rounded-lg px-3  text-[14px] "
            rootCls="w-full"
            required
            errorMsg={errors.leadName}
            onChange={handleTextInputChange}
          />

          <div>
            <p className="mb-1.5 text-[13px] font-medium text-slate-700">
              Phone Number <span className="text-red-500">*</span>
            </p>
            <CustomInput
              label=""
              type="number"
              name="leadPhone"
              value={formData.leadPhone}
              placeholder="10-digit mobile number"
              labelCls="sr-only"
              className="w-full border-slate-200 rounded-lg px-3  text-[14px] "
              rootCls="w-full"
              errorMsg={errors.leadPhone}
              onChange={handleTextInputChange}
            />
          </div>

          <div>
            <p className="mb-1.5 text-[13px] font-medium text-slate-700">
              Email <span className="text-red-500">*</span>
            </p>
            <CustomInput
              label=""
              type="email"
              name="leadEmail"
              value={formData.leadEmail}
              placeholder="Enter email"
              labelCls="sr-only"
              className="w-full border-slate-200 rounded-lg px-3  text-[14px] "
              rootCls="w-full"
              errorMsg={errors.leadEmail}
              onChange={handleTextInputChange}
            />
            {!errors.leadEmail && <p className="mt-1 text-xs text-slate-500">At least one of phone or email is required</p>}
          </div>

          <CustomInput
            label="City"
            type="text"
            name="leadCity"
            value={formData.leadCity}
            placeholder="Enter city"
            labelCls="font-medium text-[13px] text-slate-700"
            className="w-full border-slate-200 rounded-lg px-3  text-[14px] "
            rootCls="w-full"
            onChange={handleTextInputChange}
          />

          <div className="md:col-span-2">
            <CustomInput
              label="Relationship Type"
              type="text"
              name="relationshipType"
              value={formData.relationshipType}
              placeholder="e.g. Friend, Colleague"
              labelCls="font-medium text-[13px] text-slate-700"
              className="w-full border-slate-200 rounded-lg px-3  text-[14px] "
              rootCls="w-full"
              onChange={handleTextInputChange}
            />
          </div>

          <div className="md:col-span-2">
            <CustomInput
              name="requirementNote"
              type="textarea"
              label="Requirement Note"
              value={formData.requirementNote}
              labelCls="font-medium text-[13px] text-slate-700"
              className="w-full min-h-[80px] border-slate-200 rounded-lg px-3  text-[14px]  resize-none"
              rootCls="w-full"
              placeholder="Budget, BHK, location, etc."
              onChange={handleTextInputChange}
            />
          </div>

          <div className="md:col-span-2">
            <CheckboxInput
              type="checkbox"
              label="I agree to be contacted regarding this referral"
              labelCls="font-medium text-[13px] text-slate-600"
              name="agreeToContact"
              checked={formData.agreeToContact}
              onChange={handleCheckboxChange}
            />
            {errors.agreeToContact && (
              <p className="mt-1 text-xs text-red-500">{errors.agreeToContact}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Button
              className="mt-0 w-full rounded-xl bg-[#3586FF] .5 font-semibold text-white shadow-md transition hover:bg-[#2a6de8] focus:outline-none focus:ring-2 focus:ring-[#3586FF] focus:ring-offset-2 md:py-3 py-1 md:mt-1 md:text-[14px] text-[12px]"
              type="submit"
            >
              Submit Referral
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
