import Button from "@/common/Button";
import Image from "next/image";
import React, { useState } from "react";
import Modal from "@/common/Modal";
import CustomInput from "@/common/FormElements/CustomInput";
import SingleSelect from "@/common/FormElements/SingleSelect";
import { useRouter } from "next/router";
import { useSolarCalculatorStore } from "@/store/solar-calculator";
import apiClient from "@/utils/apiClient";
import {
  categories,
  cities,
  ServiceCategory,
  states,
} from "@/utils/solar/solar-data";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";
import { FaCalculator } from "react-icons/fa";

interface ISolarCalculatorFormValues {
  state: string;
  city: string;
  pincode: string;
  name: string;
  category: string;
  monthly_bill: number | null;
  phone: number | null;
}

const SolarCalculator = () => {
  const openModal = useSolarCalculatorStore((s) => s.openModal);
  const setOpenModal = useSolarCalculatorStore((s) => s.setOpenModal);
  const setMonthlyBill = useSolarCalculatorStore((s) => s.setMonthlyBill);

  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ISolarCalculatorFormValues>({
    state: "Telangana",
    city: "Hyderabad",
    pincode: "",
    name: "",
    category: "Residential",
    monthly_bill: null,
    phone: null,
  });

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: any) => {
    // SingleSelect sends { label, ... } – pick by key name
    setFormData((prev) => ({
      ...prev,
      [name]: value[name] ?? value.label ?? "",
    }));
  };

  const cards = [
    {
      image: "/solar/icons/calculator.png",
      title: "EMI Calculator",
      desc: "Estimate your monthly EMI payments with accuracy and ease.",
      action: () => setOpenModal(true),
    },
    {
      image: "/solar/icons/calculator.png",
      title: "Solar Calculator",
      desc: "Calculate savings and ROI when switching to solar.",
      action: () => setOpenModal(true),
    },
  ];

  const validateFormData = () => {
    const e: Record<string, string> = {};
    if (!formData.state) e.state = "State is required";
    if (!formData.city) e.city = "City is required";
    if (!formData.pincode) e.pincode = "Pincode is required";
    if (!formData.name) e.name = "Name is required";
    if (!formData.category) e.category = "Category is required";
    if (!formData.monthly_bill) e.monthly_bill = "Monthly bill is required";
    if (!formData.phone) e.phone = "Phone number is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const closeModal = () => {
    setErrors({});
    setOpenModal(false);
  };

  const handleSubmit = async () => {
    if (!validateFormData()) return;

    const payload = {
      Fullname: formData.name,
      Phonenumber: formData?.phone?.toString(),
      platform: "web",
      serviceType: ServiceCategory.Solar,
      city: formData.city,
      state: formData.state,
      category: formData.category,
      monthly_bill: Number(formData.monthly_bill),
      pincode: formData.pincode,
      leadstatus: "New",
    };

    setLoading(true);
    try {
      const res = await apiClient.post(apiClient.URLS.crmlead, payload);
      if (res.status === 201) {
        toast.success("Details submitted successfully");
        setMonthlyBill(Number(formData.monthly_bill));
        router.push("/solar/calculator");

        setFormData({
          state: "Telangana",
          city: "Hyderabad",
          pincode: "",
          name: "",
          category: "Residential",
          monthly_bill: null,
          phone: null,
        });
      } else {
        toast.error("Something went wrong while submitting your details.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <Loader />
      </div>
    );
  }

  return (
    <>
      {/* Mobile sticky CTA */}
      <div className="fixed bottom-[8%] left-0 w-full bg-white/95 backdrop-blur border-t px-4 py-1 z-50 md:hidden">
        <div className="max-w-4xl mx-auto">
          <Button
            className="bg-[#3586FF] font-medium w-full h-8 rounded-md text-white flex items-center justify-center gap-2 text-[12px]"
            onClick={() => setOpenModal(true)}
          >
            <FaCalculator />
            Calculate Now
          </Button>
        </div>
      </div>

      {/* Slimmer container */}
      <section className="px-4 md:px-6 lg:px-8 mt-6 md:mt-0">
        <div className="mx-auto max-w-5xl py-10 md:py-14">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7">
            {cards.map((c, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md transition-all hover:shadow-xl hover:-translate-y-1 duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-white to-purple-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-tr from-[#3586FF]/20 to-transparent blur-3xl transition-transform duration-700 group-hover:scale-105" />

                <div className="absolute inset-0 bg-gradient-to-r from-[#3586FF]/10 to-transparent opacity-0 group-hover:opacity-25 transition-opacity duration-500 rounded-xl pointer-events-none"></div>
                <div className="p-4 md:p-6 flex flex-col gap-5 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 relative">
                      <div className="rounded-xl shadow-md bg-white p-2.5 transition-transform duration-300 group-hover:scale-105">
                        <div className="rounded-lg p-3 bg-gradient-to-br from-[#3586FF] to-[#3586FF] flex items-center justify-center">
                          <Image
                            src={c.image}
                            width={28}
                            height={28}
                            alt={c.title}
                            className="object-contain"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-[18px] md:text-[20px] text-slate-900 group-hover:text-[#3586FF] transition-colors duration-300">
                        {c.title}
                      </h3>
                      <p className="mt-1 font-regular text-[13px] md:text-[14px] leading-relaxed text-slate-600">
                        {c.desc}
                      </p>
                    </div>
                  </div>

                  <Button
                    className="h-11 md:h-12 rounded-[10px] bg-gradient-to-r from-[#3586FF] to-[#3586FF] text-white font-medium hover:brightness-110 hover:shadow-lg transition-all duration-300"
                    onClick={c.action}
                  >
                    Calculate now
                  </Button>
                </div>

                {/* Diagonal gradient line accent */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#3586FF] to-[#3586FF] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compact Modal */}
      <Modal
        isOpen={openModal}
        closeModal={closeModal}
        className="max-w-3xl p-0"
        rootCls="z-[1000000]"
      >
        <div className="bg-white rounded-xl">
          {/* Header */}
          <div className="px-5 md:px-8 pt-6 text-center">
            <h1 className="text-[20px] md:text-[22px] font-bold text-[#3E6196]">
              SOLAR CALCULATOR
            </h1>
            <p className="mt-1 mb-5 md:mb-6 text-[#46484f] text-[14px] md:text-[15px] font-medium">
              Please enter the following details
            </p>
          </div>

          {/* Form */}
          <div className="px-5 md:px-8 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Name */}
              <CustomInput
                type="text"
                name="name"
                label="Name"
                labelCls="font-medium text-[14px]"
                outerInptCls="bg-white"
                className="font-regular text-[13px] md:text-[14px]"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your Name"
                errorMsg={errors.name}
                required
              />

              {/* Phone */}
              <CustomInput
                type="number"
                name="phone"
                label="Phone"
                labelCls="font-medium text-[14px]"
                outerInptCls="bg-white"
                className="font-regular text-[13px] md:text-[14px]"
                value={formData.phone as any}
                onChange={(e: any) =>
                  handleInputChange("phone", e.target.value)
                }
                placeholder="Enter Phone Number"
                errorMsg={errors.phone}
                required
              />

              {/* Monthly Bill */}
              <CustomInput
                type="number"
                name="monthly_bill"
                label="Monthly Bill"
                labelCls="font-medium text-[14px]"
                outerInptCls="bg-white"
                className="font-regular text-[13px] md:text-[14px]"
                value={formData.monthly_bill as any}
                onChange={(e: any) =>
                  handleInputChange("monthly_bill", e.target.value)
                }
                placeholder="Enter Monthly Bill"
                errorMsg={errors.monthly_bill}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mt-4">
              {/* State */}
              <div>
                <label className="font-medium text-[14px] text-[#333]">
                  State <span className="text-red-500">*</span>
                </label>
                <SingleSelect
                  type="single-select"
                  name="state"
                  options={states}
                  buttonCls="py-2"
                  selectedOption={{
                    id: 24,
                    state: formData.state,
                    label: formData.state,
                  }}
                  optionsInterface={{ isObj: true, displayKey: "state" }}
                  handleChange={handleSelectChange}
                  errorMsg={errors.state}
                />
              </div>

              {/* City */}
              <div>
                <label className="font-medium text-[14px] text-[#333]">
                  City <span className="text-red-500">*</span>
                </label>
                <SingleSelect
                  type="single-select"
                  name="city"
                  options={cities}
                  buttonCls="py-2"
                  selectedOption={{
                    id: 4,
                    city: formData.city,
                    label: formData.city,
                  }}
                  optionsInterface={{ isObj: true, displayKey: "city" }}
                  handleChange={handleSelectChange}
                  errorMsg={errors.city}
                />
              </div>

              {/* Pincode */}
              <CustomInput
                type="text"
                name="pincode"
                label="Pincode"
                labelCls="font-medium text-[14px]"
                outerInptCls="bg-white"
                className="font-regular text-[13px] md:text-[14px]"
                value={formData.pincode}
                onChange={(e) => handleInputChange("pincode", e.target.value)}
                placeholder="Enter Pincode"
                errorMsg={errors.pincode}
                required
              />

              {/* Category */}
              <div>
                <label className="font-medium text-[14px] text-[#333]">
                  Category <span className="text-red-500">*</span>
                </label>
                <SingleSelect
                  type="single-select"
                  name="category"
                  options={categories}
                  buttonCls="py-2"
                  selectedOption={{
                    id: 2,
                    category: formData.category,
                    label: formData.category,
                  }}
                  optionsInterface={{ isObj: true, displayKey: "category" }}
                  handleChange={handleSelectChange}
                  errorMsg={errors.category}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                className="w-full md:w-72 h-11 md:h-12 rounded-md bg-[#3586FF] text-white font-medium"
                onClick={handleSubmit}
              >
                Calculate
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SolarCalculator;
