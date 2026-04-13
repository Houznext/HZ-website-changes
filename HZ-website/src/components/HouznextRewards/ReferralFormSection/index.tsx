import React, { useState, useEffect } from "react";
import Button from "@/common/Button";
import CustomInput from "@/common/FormElements/CustomInput";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { ServiceCategory } from "@/utils/solar/solar-data";
import { useRouter } from "next/router";

const ReferralFormSection = () => {
  const [referralData, setReferralData] = useState({
    friendName: "",
    friendPhone: "",
    friendEmail: "",
    friendCity: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const [user, setUser] = useState<any>();
  const session = useSession();

  useEffect(() => {
    if (session.status === "authenticated") {
      setUser(session?.data?.user);
    }
  }, [session?.status]);

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
    setReferralData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!referralData.friendName.trim()) {
      newErrors.friendName = "Friend's name is required.";
    }
    if (!/^\d{10}$/.test(referralData.friendPhone)) {
      newErrors.friendPhone = "Enter a valid 10-digit phone number.";
    }
    if (
      !referralData.friendEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(referralData.friendEmail)
    ) {
      newErrors.friendEmail = "Enter a valid email address.";
    }
    if (!referralData.friendCity.trim()) {
      newErrors.friendCity = "City is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      router.push("/login");
      return;
    }
    if (!validateForm()) return;
    try {
      const payload = {
        friendName: referralData.friendName,
        friendPhone: String(referralData.friendPhone),
        friendEmail: referralData.friendEmail,
        friendCity: referralData.friendCity,
        referrerId: user?.id,
        category: ServiceCategory.CustomBuilder,
      };
      const res = await apiClient.post(apiClient.URLS.referrals, { ...payload });
      if (res.status === 201) {
        setReferralData({
          friendName: "",
          friendPhone: "",
          friendEmail: "",
          friendCity: "",
        });
        toast.success("Successfully referred");
      }
    } catch (error) {
      console.error("Referral submit error:", error);
      toast.error("Failed to submit");
    }
  };

  const handleGenerateLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (!user?.id) {
        toast.error("You must be logged in to generate referral link");
        return;
      }
      const res = await apiClient.get(
        `${apiClient.URLS.referrals}/generate/${user.id}`
      );
      const body = res?.body ?? res;
      const link = body?.link;
      if (link) {
        await navigator.clipboard.writeText(link);
        toast.success("Referral link copied to clipboard!");
      }
    } catch (error) {
      console.error("Generate link error:", error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <section
      id="refer-form"
      className="w-full bg-gray-50 py-12 md:py-16 px-4 scroll-mt-20"
    >
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-6">
            Refer a friend
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <CustomInput
              label="Your Friend's Name"
              type="text"
              name="friendName"
              labelCls="font-medium text-sm text-gray-700 mb-1"
              placeholder="Enter name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3586FF] focus:border-[#3586FF]"
              rootCls="w-full"
              required
              errorMsg={errors?.friendName}
              onChange={handleTextInputChange}
            />
            <CustomInput
              label="Your Friend's Phone"
              type="tel"
              name="friendPhone"
              labelCls="font-medium text-sm text-gray-700 mb-1"
              placeholder="10-digit phone number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3586FF] focus:border-[#3586FF]"
              rootCls="w-full"
              required
              errorMsg={errors?.friendPhone}
              onChange={handleTextInputChange}
            />
            <CustomInput
              label="Your Friend's Email"
              type="email"
              name="friendEmail"
              labelCls="font-medium text-sm text-gray-700 mb-1"
              placeholder="Enter email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3586FF] focus:border-[#3586FF]"
              rootCls="w-full"
              required
              errorMsg={errors?.friendEmail}
              onChange={handleTextInputChange}
            />
            <CustomInput
              label="Your Friend's City"
              type="text"
              name="friendCity"
              labelCls="font-medium text-sm text-gray-700 mb-1"
              placeholder="Enter city"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3586FF] focus:border-[#3586FF]"
              rootCls="w-full"
              required
              errorMsg={errors?.friendCity}
              onChange={handleTextInputChange}
            />
            <div className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                className="w-full bg-[#3586FF] hover:bg-[#2a6ed4] text-white font-medium py-3 rounded-lg transition-colors"
              >
                Send invite
              </Button>
              <Button
                type="button"
                onClick={handleGenerateLink}
                className="w-full bg-white text-[#3586FF] border-2 border-[#3586FF] hover:bg-[#3586FF] hover:text-white font-medium py-3 rounded-lg transition-colors"
              >
                Generate referral link
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ReferralFormSection;
