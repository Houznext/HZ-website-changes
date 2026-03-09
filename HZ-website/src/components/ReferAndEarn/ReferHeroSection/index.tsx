import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Button from "@/common/Button";
import CustomInput from "@/common/FormElements/CustomInput";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { ServiceCategory } from "@/utils/solar/solar-data";
import { useRouter } from "next/router";
import { fetchHomePageCity } from "@/utils/locationDetails/datafetchingFunctions";
import { generateSlug } from "@/utils/helpers";
import { getLookingTypePath } from "@/components/Property/PropertyDetails/PropertyHelpers";
import { MapPin, ChevronDown } from "lucide-react";

const ALLOWED_CITIES = [
  { label: "Hyderabad", value: "hyderabad" },
  { label: "Bengaluru", value: "bengaluru" },
  { label: "Chennai", value: "chennai" },
  { label: "Mumbai", value: "mumbai" },
  { label: "Pune", value: "pune" },
] as const;

const DEFAULT_CITY = "hyderabad";

const ReferHeroSection = () => {
  const overlayStyle = {
    background:
      "linear-gradient(105deg, rgba(15,23,42,0.75) 0%, rgba(30,41,59,0.6) 45%, rgba(15,23,42,0.4) 100%)",
  };
  const [selectedCity, setSelectedCity] = useState<string>(DEFAULT_CITY);
  const [properties, setProperties] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [referralData, setReferralData] = useState({
    friendName: "",
    friendPhone: "",
    friendEmail: "",
    friendCity: "",
  });
  const [errors, setErrors] = useState<any>({});
  const router = useRouter();

  const [user, setUser] = useState<any>();
  const session = useSession();

  const fetchReferAndEarnProperties = useCallback(async (city: string) => {
    setLoading(true);
    try {
      const res = await apiClient.get(apiClient.URLS.referAndEarnProperties, {
        city,
        limit: 4,
        page: 1,
      });
      const data = res?.body ?? res;
      setProperties(Array.isArray(data?.data) ? data.data : []);
      setTotal(typeof data?.total === "number" ? data.total : 0);
    } catch (err) {
      console.error("Refer & earn properties fetch error:", err);
      setProperties([]);
      setTotal(0);
      toast.error("Could not load properties");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("city");
    if (stored && ALLOWED_CITIES.some((c) => c.value === stored.toLowerCase())) {
      setSelectedCity(stored.toLowerCase());
    }
  }, []);

  useEffect(() => {
    fetchReferAndEarnProperties(selectedCity);
  }, [selectedCity, fetchReferAndEarnProperties]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location is not supported by your browser");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetchHomePageCity(
            String(latitude),
            String(longitude)
          );
          const fetchedCity = response?.city?.toLowerCase?.();
          if (
            fetchedCity &&
            ALLOWED_CITIES.some((c) => c.value === fetchedCity)
          ) {
            localStorage.setItem("city", fetchedCity);
            setSelectedCity(fetchedCity);
            toast.success(`Showing properties in ${fetchedCity}`);
          } else {
            setSelectedCity(DEFAULT_CITY);
            toast("Showing Hyderabad properties");
          }
        } catch {
          setSelectedCity(DEFAULT_CITY);
          toast("Showing Hyderabad properties");
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        toast.error("Could not get your location");
        setSelectedCity(DEFAULT_CITY);
        setLocationLoading(false);
      }
    );
  };

  const getPropertyDetailUrl = (prop: any) => {
    const lookingType =
      getLookingTypePath(prop?.basicDetails?.lookingType) || "buy";
    const city = prop?.locationDetails?.city || "hyderabad";
    const slug = generateSlug(
      prop?.propertyDetails?.propertyName ||
        prop?.basicDetails?.title ||
        "property"
    );
    return `/properties/${lookingType}/${city}/details/${slug}?id=${prop.propertyId}&type=property`;
  };

  const getCityLabel = (value: string) =>
    ALLOWED_CITIES.find((c) => c.value === value)?.label ?? value;

  useEffect(() => {
    if (session.status === "authenticated") {
      setUser(session?.data?.user);
    }
  }, [session?.status]);

  const handleTextInputChange = (e: any) => {
    const { name, value } = e.target;
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
    setReferralData({ ...referralData, [name]: value });
  };

  const validateForm = () => {
    const newErrors: any = {};
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

  const handleSubmit = async (e: any) => {
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
        toast.success("Successfully Referred");
      }
    } catch (error) {
      console.error("error is", error);
      toast.error("Failed to submit query");
    }
  };

  const handleGenerateLink = async (e: any) => {
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
      if (body?.link) {
        await navigator.clipboard.writeText(body.link);
        toast.success("Referral link copied to clipboard!");
      }
    } catch (error) {
      console.error("error is", error);
      toast.error("Something went wrong!");
    }
  };

  const scrollToProperties = () => {
    document.getElementById("refer-properties")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[560px] md:h-[600px]">
      <Image
        src="/images/background/referandearn.jpg"
        alt="bgimage"
        fill
        className="object-cover object-center"
      />

      <div className="absolute inset-0" style={overlayStyle} />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-center min-h-full w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8 gap-6 md:gap-8">
        <div className="w-full md:w-[70%] flex flex-col items-center md:items-start flex-1 md:flex-initial justify-center">
          <div className="w-full max-w-[480px] bg-white/15 backdrop-blur-lg shadow-xl border border-white/25 rounded-xl md:rounded-2xl px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 text-white">
            <h1 className="font-bold text-[17px] sm:text-[20px] md:text-[32px] lg:text-[38px] leading-tight">
              Refer your friend &{" "}
              <span className="text-[#facc15]">
                earn 0.5% of their
              </span>{" "}
              project&apos;s value
            </h1>
            <p className="text-white/90 text-[12px] sm:text-[13px] md:text-[15px] mt-3 md:mt-4 leading-relaxed">
              Whether it&apos;s a dream home or commercial space, your referrals
              help build something great—and reward you too! Don&apos;t miss out
              on this opportunity to earn while helping others realize their
              construction dreams.
            </p>
            <Button
              type="button"
              onClick={scrollToProperties}
              className="mt-4 md:mt-5 w-full sm:w-fit bg-[#3586FF] hover:bg-[#2563eb] text-white font-medium px-5 py-2.5 rounded-lg text-sm md:text-base flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              See properties you can refer
              <ChevronDown className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
            </Button>
          </div>
        </div>

        <div className="w-full max-w-[400px] md:max-w-[320px] md:w-[28%] lg:max-w-[360px] mx-auto md:mx-0 md:mr-5 shrink-0">
          <form className="flex flex-col gap-[10px] px-4 py-4 sm:px-5 sm:py-5 bg-white rounded-xl shadow-lg border border-gray-100 w-full">
            <h2 className="font-bold text-center text-[#3586FF] text-[16px] md:text-[20px] mb-1">
              Refer and Earn
            </h2>
            <div className="flex flex-col gap-y-[20px]">
              <div className="grid grid-cols-1 md:gap-2 gap-1 w-full">
                <CustomInput
                  label="Your Friend's Name "
                  type="text"
                  name="friendName"
                  labelCls=" font-medium md:text-[14px] text-[10px] leading-[22.8px] mb-0"
                  placeholder="enter name"
                  className=" px-2    w-full  "
                  rootCls="px-2"
                  required
                  errorMsg={errors?.friendName}
                  onChange={handleTextInputChange}
                />
                <CustomInput
                  label="Your Friend's Phone "
                  type="number"
                  name="friendPhone"
                  labelCls=" font-medium md:text-[14px] text-[10px] leading-[22.8px] mb-0"
                  placeholder="enter phone number"
                  className=" px-2 w-full rounded-[4px] "
                  rootCls="px-2"
                  required
                  errorMsg={errors?.friendPhone}
                  onChange={handleTextInputChange}
                />
                <CustomInput
                  label="Your Friend's Email"
                  type="text"
                  name="friendEmail"
                  labelCls=" font-medium md:text-[14px] text-[10px] leading-[22.8px] mb-0"
                  placeholder="enter email"
                  className=" px-2  w-full rounded-[4px] "
                  rootCls="px-2"
                  required
                  errorMsg={errors?.friendEmail}
                  onChange={handleTextInputChange}
                />
                <CustomInput
                  label="Your Friend's City"
                  type="text"
                  name="friendCity"
                  labelCls=" font-medium md:text-[14px] text-[10px] leading-[22.8px] mb-0"
                  placeholder="enter city"
                  className=" px-2 w-full rounded-[4px] "
                  rootCls="px-2"
                  required
                  errorMsg={errors?.friendCity}
                  onChange={handleTextInputChange}
                />
              </div>
              <div className="md:space-y-4 space-y-2">
                <Button
                  className="w-full bg-[#3586FF] hover:bg-[#3586FF] text-white md:py-[6px] py-1 rounded-[6px] transition-all md:text-[16px] text-[12px] font-medium "
                  onClick={handleSubmit}
                >
                  Send Invite
                </Button>
                <Button
                  className="w-full bg-transparent text-[#3586FF] md:py-[6px] py-1 hover:bg-[#3586FF] hover:text-white rounded-[6px] transition-all md:text-[16px] text-[12px] font-medium border-[1px] border-[#3586FF]"
                  onClick={handleGenerateLink}
                >
                  Generate Referral Link
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReferHeroSection;
