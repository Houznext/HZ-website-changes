import React, { useState } from "react";
import Button from "@/common/Button";
import SingleSelect from "@/common/FormElements/SingleSelect";
import SelectBtnGrp from "@/common/SelectBtnGrp";
import { ServiceCategory } from "@/utils/solar/solar-data";
import { FaPaintRoller, FaWater, FaShieldAlt } from "react-icons/fa";
import apiClient from "@/utils/apiClient";
import { HiCheck } from "react-icons/hi";
import { Home, Brush, Ruler, IndianRupee, RotateCcw } from "lucide-react";
import {
  MdArrowForward,
  MdArrowBack,
  MdFormatPaint,
  MdOutlineStarRate,
  MdPersonOutline,
  MdHome,
  MdOutlineGrass,
  MdOutlinePalette,
} from "react-icons/md";
import toast from "react-hot-toast";
import CustomInput from "@/common/FormElements/CustomInput";
import {
  stateOptions,
  RadioButton,
} from "@/components/Products/components/SubServices/InteriorsComponent/interiorsCalculator";
import ThemeLoader from "@/common/ThemeLoader";

const PaintingCostEstimator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    city: "",
    paintArea: "",
    bhkType: "",
    paintingType: "",
    package: "",
    Fullname: "",
    Phonenumber: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [estimate, setEstimate] = useState<number | null>(null);

  const cityOptions = [
    { id: 1, name: "Bangalore" },
    { id: 2, name: "Hyderabad" },
    { id: 3, name: "Chennai" },
    { id: 4, name: "Pune" },
    { id: 5, name: "Andhra" },
  ];

  const paintAreaOptions = [
    { id: 1, name: "Interiors" },
    { id: 2, name: "Exteriors" },
    { id: 3, name: "Both" },
  ];

  const stepLabels = ["Location & Area", "Preference", "Personal Details"];

  const stepIcons = [
    <MdFormatPaint />,
    <MdOutlineStarRate />,
    <MdPersonOutline />,
  ];
  const validateFields = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!formData.paintArea) newErrors.paintArea = "Paint area is required";
      if (!formData.bhkType) newErrors.bhkType = "BHK type is required";
      if (!formData.paintingType)
        newErrors.paintingType = "Painting type is required";
    } else if (step === 2) {
      if (!formData.package)
        newErrors.package = "Please select one of a package";
    } else if (step === 3) {
      if (!formData.Fullname) newErrors.Fullname = "Full name is required";
      if (!formData.Phonenumber) {
        newErrors.Phonenumber = "Phone number is required";
      } else if (!/^[6-9]\d{9}$/.test(formData.Phonenumber)) {
        newErrors.Phonenumber =
          "Phone number must start with 6,7,8,9 and be 10 digits long";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  type BHKType = "1bhk" | "2bhk" | "3bhk" | "4bhk" | "5bhk";
  type PaintingType = "Fresh Painting" | "Repainting" | "Rental Painting";
  type PackageTier = "Economy" | "Premium" | "Luxury";

  interface EstimatorFormData {
    bhkType: BHKType | "";
    paintingType: PaintingType | "";
    paintArea: string;
    package: PackageTier | "";
    city?: string;
  }

  const BHK_TO_PAINTABLE_AREA_SQFT: Record<BHKType, number> = {
    "1bhk": 900,
    "2bhk": 1300,
    "3bhk": 1700,
    "4bhk": 2100,
    "5bhk": 2500,
  };

  const PACKAGE_RATE_PER_SQFT: Record<PackageTier, number> = {
    Economy: 16,
    Premium: 24,
    Luxury: 32,
  };

  const PAINTING_TYPE_MULTIPLIER: Record<PaintingType, number> = {
    "Fresh Painting": 1.0,
    Repainting: 0.85,
    "Rental Painting": 0.65,
  };

  const PAINT_AREA_MULTIPLIER: Record<string, number> = {
    "Full House": 1.0,
    "Interior Only": 0.85,
    "Exterior Only": 0.55,
    "Both (Interior + Exterior)": 1.25,
    "Ceiling Only": 0.25,
    "Single Room": 0.3,
  };

  const WASTAGE_BUFFER = 0.05; // 5%
  const GST_RATE = 0.18;

  function calculateEstimateAdvanced(formData: EstimatorFormData) {
    const bhk = (formData.bhkType || "2bhk") as BHKType;
    const pkg = (formData.package || "Economy") as PackageTier;
    const paintingType = (formData.paintingType ||
      "Repainting") as PaintingType;
    const paintAreaKey = formData.paintArea || "Full House";

    const bhkAreaSqft = BHK_TO_PAINTABLE_AREA_SQFT[bhk];
    const paintAreaMultiplier = PAINT_AREA_MULTIPLIER[paintAreaKey] ?? 1;
    const paintingTypeMultiplier = PAINTING_TYPE_MULTIPLIER[paintingType] ?? 1;
    const ratePerSqft = PACKAGE_RATE_PER_SQFT[pkg];

    const areaAppliedSqft = Math.round(bhkAreaSqft * paintAreaMultiplier);
    const baseAmount = areaAppliedSqft * ratePerSqft * paintingTypeMultiplier;
    const bufferAmount = baseAmount * WASTAGE_BUFFER;
    const subtotalBeforeTax = baseAmount + bufferAmount;
    const gstAmount = subtotalBeforeTax * GST_RATE;
    const grandTotal = Math.round(subtotalBeforeTax + gstAmount);

    return grandTotal;
  }

  const handleNextStep = () => {
    if (!validateFields(currentStep)) return;
    setErrors({});
    if (currentStep < 3) setCurrentStep((prev) => prev + 1);
    else handleSubmit();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const payload = {
        Fullname: formData.Fullname,
        Phonenumber: formData.Phonenumber,
        bhk: formData.bhkType || "N/A",

        paintingPackage: formData.package,
        paintArea: formData.paintArea,
        paintingType: formData.paintingType,

        city: formData.city || "Bangalore",
        platform: "Website",
        serviceType: ServiceCategory.Painting,
        leadstatus: "New",
      };

      const response = await apiClient.post(apiClient.URLS.crmlead, payload);

      if (response?.status === 201) {
        setSubmittedData({ ...formData });
        const estimate = calculateEstimateAdvanced(formData as any);
        setEstimate(estimate);
        setFormData({
          Fullname: "",
          Phonenumber: "",
          bhkType: "",
          package: "",
          paintArea: "",
          paintingType: "",
          city: "",
        });
        setErrors({});
        // setCurrentStep(1);

        // setEstimateData(estimate);
        setShowResults(true);

        toast.success("Team will reach out to you soon 🤝");
      }
    } catch {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const paintingTypeOptions = [
    {
      id: 1,
      title: "Fresh Painting",
      subtitle: "Painting wall from scratch",
      tooltip:
        "Fresh Painting means painting your walls for the first time or repainting after removing old paint completely.",
    },
    {
      id: 2,
      title: "Repainting",
      subtitle: "Existing paint refresh",
      tooltip:
        "Repainting means applying a new coat over existing paint to refresh or change color.",
    },
    {
      id: 3,
      title: "Rental Painting",
      subtitle: "Temporary painting for rentals",
      tooltip:
        "Rental Painting is a temporary paint job suitable for rented homes.",
    },
  ];

  const renderStep1 = () => (
    <div className="md:space-y-4 space-y-2 max-w-2xl mx-auto">
      <div>
        <SingleSelect
          type="single-select"
          name="city"
          label="Where do you live?"
          labelCls="label-text label-text text-[#3586FF]"
          options={cityOptions}
          rootCls=" rounded-md px-2 bg-white border-b-[1px]  md:px-1 px-1 w-full  border border-[#CFCFCF] rounded-[4px]"
          buttonCls="border-none"
          selectedOption={
            cityOptions.find((o) => o.name === formData.city) || null
          }
          optionsInterface={{ isObj: true, displayKey: "name" }}
          handleChange={(name, value) => handleChange("city", value.name)}
        />
      </div>

      <div className="">
        <SelectBtnGrp
          label="  What part of your house do you wish to paint?"
          labelCls="text-[#3586FF] "
          options={paintAreaOptions.map((o) => o.name)}
          className="gap-2 flex flex-wrap"
          btnClass="md:text-[12px] text-[11px] font-medium rounded-md md:px-[18px] px-[12px] shadow-custom md:py-[8px] py-[5px] border-[1px] border-gray-200 hover:bg-gray-100"
          onSelectChange={(value) => handleChange("paintArea", value as string)}
          slant={false}
          required
          defaultValue={formData.paintArea}
        />
        {errors.paintArea && (
          <p className="text-red-500 text-sm mt-1">{errors.paintArea}</p>
        )}
      </div>
      <div>
        <h2 className="font-medium label-text text-[#3586FF] mb-2">
          Select the size of your house
        </h2>
        <div className="flex flex-row md:gap-3 gap-2">
          {["1", "2", "3", "4", "5"].map((bhk) => (
            <RadioButton
              key={bhk}
              id={`${bhk}bhk`}
              name="bhkType"
              value={`${bhk}bhk`}
              checked={formData.bhkType === `${bhk}bhk`}
              onChange={() => handleChange("bhkType", `${bhk}bhk`)}
              className="md:px-3  p-2 md:text-sm text-[10px] font-medium rounded-lg border border-gray-200 hover:border-blue-400 transition-colors"
            >
              {bhk} BHK
            </RadioButton>
          ))}
        </div>
        {errors.bhkType && (
          <p className="text-red-500 text-sm mt-1">{errors.bhkType}</p>
        )}
      </div>

      <div>
        <p className="font-medium label-text text-[#3586FF] mb-2">
          What type of painting does your house require?
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          {paintingTypeOptions.map((option) => (
            <div
              key={option.id}
              className={`relative bg-white  flex-1 border rounded-lg md:p-4 p-1 transition
                    ${formData.paintingType === option.title
                  ? "border-[#3586FF] bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl scale-105 ring-2 ring-blue-200"
                  : "border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-lg hover:border-blue-300"
                }
                  `}
              onClick={() => handleChange("paintingType", option.title)}
            >
              {formData.paintingType === option.title && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#3586FF] rounded-full flex items-center justify-center shadow-lg">
                  <HiCheck className="w-4 h-4 text-white" />
                </div>
              )}

              <div className="flex flex-col justify-between md:items-center">
                <div className="md:space-y-2 space-y-2 p-1">
                  <h3 className="font-bold md:text-[14px] text-[12px] text-black text-start md:text-center">
                    {option.title}
                  </h3>
                  <div className="md:block hidden w-12 h-1  bg-gradient-to-r  from-blue-400 to-purple-500 rounded-full mx-auto mb-3"></div>
                  <div className="md:hidden block w-full h-[1px]  bg-gray-500 mx-auto mb-3"></div>
                  <p className="text-gray-600 md:text-[12px] text-[10px] font-regular md:text-center text-start">
                    {option.subtitle}
                  </p>
                </div>

                <div className="relative group cursor-pointer md:mt-2 mt-0 flex items-end justify-end">
                  <span className="text-[#3586FF] underline font-regular md:text-[10px] text-[8px] ">
                    what's {option.title}?
                  </span>

                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-gray-800 text-white text-[10px] rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-regular">
                    {option.tooltip}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {errors.paintingType && (
          <p className="text-red-500 text-sm mt-1">{errors.paintingType}</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => {
    const packages = [
      {
        name: "Economy",
        desc: "I'm looking for budget-friendly painting which doesn't compromise on the quality!",
        options: [
          {
            label: "Matt Finish",
            icon: <FaPaintRoller className="md:w-4 w-2  md:h-4 h-2" />,
          },
          {
            label: "Non-Washable",
            icon: <FaWater className="md:w-4 w-2  md:h-4 h-2" />,
          },
          {
            label: "Durability Upto 2 years",
            icon: <FaShieldAlt className="md:w-4 w-2  md:h-4 h-2" />,
          },
        ],

        headerCls: "from-green-600 to-green-200",
        ringCls: "ring-green-600",
        borderCls: "border-green-600",
      },
      {
        name: "Premium",
        desc: "I want my walls to have a classy and elegant feel!",
        options: [
          {
            label: "Matt & Sheen Finish",
            icon: <FaPaintRoller className="md:w-4 w-2  md:h-4 h-2" />,
          },
          {
            label: "Semi-Washable",
            icon: <FaWater className="md:w-4 w-2  md:h-4 h-2" />,
          },
          {
            label: "Durability Upto 5 years",
            icon: <FaShieldAlt className="md:w-4 w-2  md:h-4 h-2" />,
          },
        ],
        headerCls: "from-sky-600 to-sky-200",
        ringCls: "ring-sky-600",
        borderCls: "border-sky-600",
      },
      {
        name: "Luxury",
        desc: "I want my walls to look exquisite and royal, much to my friends’ envy!",
        options: [
          {
            label: "Matt & Sheen Finish",
            icon: <FaPaintRoller className="md:w-4 w-2  md:h-4 h-2" />,
          },
          {
            label: "Fully-Washable",
            icon: <FaWater className="md:w-4 w-2  md:h-4 h-2" />,
          },
          {
            label: "Durability Upto 7 years",
            icon: <FaShieldAlt className="md:w-4 w-2  md:h-4 h-2" />,
          },
        ],
        headerCls: "from-amber-500 to-amber-200",
        ringCls: "ring-amber-500",
        borderCls: "border-amber-500",
      },
    ] as const;

    const filteredPackages =
      formData.paintingType === "Rental Painting"
        ? packages.filter((pkg) => pkg.name !== "Luxury")
        : packages;

    return (
      <div className="mx-auto w-full max-w-[100%] ">
        {errors.package && (
          <p className="text-red-500 text-sm mt-1">{errors.package}</p>
        )}

        <p className="font-medium label-text text-[#3586FF] mb-2">
          How would you describe your preference?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-full mx-auto">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.name}
              onClick={() => handleChange("package", pkg.name)}
              className={`cursor-pointer w-full flex flex-col justify-between md:gap-4 gap-2 md:p-3 p-1 md:rounded-[12px] rounded-[6px] text-center shadow-sm transition-all duration-300
    bg-gradient-to-b ${pkg.headerCls} 
    ${formData.package === pkg.name
                  ? `ring-2 ${pkg.ringCls} ${pkg.borderCls} scale-[1.01] shadow-md`
                  : "hover:shadow-md hover:scale-[1.01] focus:ring-2 focus:ring-gray-300"
                }`}
            >
              {formData.package === pkg.name && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#3586FF] rounded-full flex items-center justify-center shadow-lg">
                  <HiCheck className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="flex items-start flex-col gap-2">
                <h3 className="font-bold md:text-[16px] text-[12px] text-white">
                  {pkg.name}
                </h3>
                <p className="md:text-[14px] font-medium text-[10px] text-white">
                  {pkg.desc}
                </p>
              </div>

              <div className=" px-0 pb-5">
                <div className="rounded-xl border border-gray-100 bg-white md:p-2 p-1 shadow-sm">
                  <ul className="md:space-y-3 space-y-1 flex items-start flex-col ">
                    {pkg.options.map((opt) => (
                      <li
                        key={opt.label}
                        className="flex items-center md:gap-2 gap-1"
                      >
                        <span className="inline-flex md:h-8 md:w-8 w-6 h-6 items-center justify-center rounded-full bg-black text-white">
                          {opt.icon}
                        </span>
                        <span className="text-[10px] font-regular md:text-[12px] text-gray-700">
                          {opt.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="flex flex-col items-center md:gap-4 gap-2 md:max-w-full max-w-[300px] ">
      <div className="md:space-y-3 space-y-1 ">
        <p className="font-bold text-center md:text-[16px] text-[14px]">
          GET YOUR ESTIMATE ON WHATSAPP
        </p>
        <p className="md:text-[14px] text-[12px] text-center font-medium text-gray-500">
          You're one step away!
        </p>
      </div>
      <div
        className="flex flex-col gap-2  shadow md:px-3 md:py-3 
        px-2 py-1 rounded-md w-full"
      >
        <CustomInput
          label="Full Name"
          type="text"
          name="Fullname"
          labelCls="font-medium label-text text-black"
          value={formData.Fullname}
          required
          placeholder="Enter Full Name"
          onChange={handleInputChange}
          errorMsg={errors.Fullname}
        />
        <CustomInput
          label="Phone"
          type="number"
          name="Phonenumber"
          labelCls="font-medium label-text text-black"
          value={formData.Phonenumber}
          required
          placeholder="Enter Phone"
          onChange={handleInputChange}
          errorMsg={errors?.Phonenumber}
        />

        <div className="flex flex-col md:gap-y-[8px] gap-y-[4px] w-full">
          <p className="font-medium text-gray-700 md:text-[14px] text-[12px]">
            City <span className="text-red-500">*</span>
          </p>
          <SingleSelect
            type="single-select"
            name="state"
            labelCls="font-medium text-gray-700 md:text-[14px] text-[12px]"
            options={cityOptions}
            rootCls="border-b-[1px]  px-1 w-full border border-[#CFCFCF] rounded-[4px] bg-white"
            buttonCls="border-none"
            optionCls="md:text-[14px] text-[12px] font-medium hover:bg-gray-300 text-gray-700 max-w-[300px]"
            selectedOption={
              cityOptions.find((item) => item.name === formData.city) ||
              cityOptions[0]
            }
            optionsInterface={{
              isObj: true,
              displayKey: "name",
            }}
            handleChange={(name, value) =>
              handleInputChange({
                target: { name, value: value.name },
              } as React.ChangeEvent<HTMLInputElement>)
            }
          />
        </div>
      </div>
    </div>
  );

  const renderLeftContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col items-center justify-center w-full text-center space-y-3 md:space-y-6">
            <div className="relative">
              <div className="md:w-20 w-14 md:h-20  h-14 flex items-center justify-center rounded-[6px] md:rounded-[12px] bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 shadow-2xl shadow-yellow-500/40 transform hover:scale-105 transition-all duration-300">
                <MdFormatPaint className="md:w-10 w-7 md:h-10 h-7 text-white" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 blur-lg opacity-30 -z-10 animate-pulse"></div>
            </div>

            <div className="space-y-3">
              <h1 className="text-[14px] md:text-[18px] lg:text-[26px] font-bold text-white leading-tight tracking-tight">
                Smart Painting{" "}
                <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent drop-shadow-2xl">
                  Calculator
                </span>
              </h1>
              <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto shadow-lg"></div>
            </div>

            <div className="md:space-y-4 space-y-2">
              <p className="text-gray-100 text-[12px] md:text-[16px] font-medium max-w-md leading-relaxed bg-white/10 backdrop-blur-sm md:p-4 p-2 md:rounded-[12px] rounded-[6px] border border-white/20">
                Discover your{" "}
                <span className="text-yellow-300 font-bold">
                  perfect paint budget
                </span>{" "}
                in seconds with our intelligent estimation technology
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                {[
                  "AI-Powered Estimates",
                  "Real-Time Pricing",
                  "No Hidden Costs",
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-1 md:px-3 py-1 rounded-full border border-white/20"
                  >
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                    <span className="text-gray-200 text-[10px] md:text-[12px] font-medium">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm p-1.5 md:p-3 rounded-2xl border border-yellow-400/30">
              <p className="text-[10px] md:text-[12px] font-regular text-yellow-200 italic">
                Precision • Transparency • Excellence
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col items-center justify-center w-full text-center space-y-3 md:space-y-6 md:px-4 px-2">
            <div className="relative md:w-20 w-14 md:h-20 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/30 ring-4 ring-yellow-500/20">
              <MdOutlineStarRate className="md:w-9 w-7 md:h-9 h-7 text-white" />
              <div className="absolute inset-0 rounded-full animate-pulse bg-yellow-400/10"></div>
            </div>

            <div>
              <h1 className="text-[q8px] md:text-[26px] font-bold text-white leading-tight tracking-wide">
                Choose Your{" "}
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-md">
                  Finish Preference
                </span>
              </h1>
            </div>

            <div className="w-20 h-[4px] bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full shadow-md"></div>

            <p className="text-gray-200 text-[12px] font-medium md:text-[16px] max-w-lg leading-relaxed">
              Select from our curated{" "}
              <span className="text-yellow-400 font-regular">
                Economy
              </span>
              ,{" "}
              <span className="text-yellow-400 font-regular">
                Premium
              </span>
              , or{" "}
              <span className="text-yellow-400 font-regular">
                Luxury
              </span>{" "}
              finishes — each designed to perfectly blend quality, style, and
              budget.
            </p>

            <p className="text-[10px] md:text-[12px] font-regular text-gray-400 italic">
              Designed for every space • Comfort • Class • Creativity
            </p>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col items-center justify-center w-full text-center space-y-3 md:space-y-6 md:px-4 px-2">
            <div className="relative md:w-20 w-14 md:h-20 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/30 ring-4 ring-yellow-500/20">
              <MdPersonOutline className="md:w-9 w-7 md:h-9 h-7 text-white" />
              <div className="absolute inset-0 rounded-full animate-pulse bg-yellow-400/10"></div>
            </div>

            <div>
              <h1 className="text-[18px] md:text-[26px] font-bold text-white leading-tight tracking-wide">
                Share Your{" "}
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-md">
                  Details
                </span>
              </h1>
            </div>

            <div className="w-20 h-[4px] bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full shadow-md"></div>

            <p className="text-gray-200 text-[12px] font-medium md:text-[16px] max-w-lg leading-relaxed">
              Tell us your{" "}
              <span className="text-yellow-400 font-semibold">name</span>,{" "}
              <span className="text-yellow-400 font-semibold">
                phone number
              </span>
              , and <span className="text-yellow-400 font-semibold">city</span>{" "}
              — we’ll deliver a personalized painting estimate tailored just for
              you.
            </p>

            <p className="text-[10px] md:text-[12px] font-regular text-gray-400 italic">
              100% Secure • Fast Response • Personalized Experience
            </p>
          </div>
        );
    }
  };

  if (loading) return <ThemeLoader />;

  const renderEstimator = () => (
    <div className="bg-gradient-to-br from-white to-blue-50 md:rounded-[16px] rounded-[6px] shadow-2xl border border-blue-100 max-w-[900px] w-full mx-auto p-4 md:p-8 text-center transition-all duration-300 hover:shadow-3xl">
      <h2 className="text-[#3586FF] font-bold text-[16px] md:text-[20px] mb-6 flex items-center justify-center gap-2">
        <Brush className="w-5 h-5 text-blue-400" />
        Your Estimated Painting Cost
      </h2>

      <div className="flex flex-col md:flex-row md:justify-around gap-4 md:gap-8 mb-6">
        <div className="flex items-center justify-center gap-2 bg-white shadow-sm rounded-md px-4 py-3 border border-blue-100">
          <Home className="w-5 h-5 text-[#3586FF]" />
          <p className="text-gray-700 text-sm md:text-base">
            <span className="font-medium text-[#3586FF]">
              House Size:
            </span>{" "}
            {submittedData.bhkType}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 bg-white shadow-sm rounded-md px-4 py-3 border border-blue-100">
          <Brush className="w-5 h-5 text-[#3586FF]" />
          <p className="text-gray-700 text-sm md:text-base">
            <span className="font-medium text-[#3586FF]">
              Painting Type:
            </span>{" "}
            {submittedData.paintingType}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 bg-white shadow-sm rounded-md px-4 py-3 border border-blue-100">
          <Ruler className="w-5 h-5 text-[#3586FF]" />
          <p className="text-gray-700 text-sm md:text-base">
            <span className="font-medium text-[#3586FF]">
              Paint Area:
            </span>{" "}
            {submittedData.paintArea}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 md:pt-6 pt-3">
        <p className="text-gray-600 font-medium md:text-[16px] text-[12px] mb-1 flex items-center justify-center gap-1">
          <IndianRupee className="w-4 h-4 text-green-600" />
          Estimated Total Cost
        </p>

        <p className="text-green-600 font-bold text-[32px] md:text-[42px] tracking-wide drop-shadow-sm">
          ₹ {estimate?.toLocaleString() || "—"}
        </p>

        <p className="text-gray-400 md:text-sm text-[10px] mt-1">
          (Including materials, labour & taxes)
        </p>
      </div>
      <div className="flex items-center justify-center">
        <Button
          className="mt-8 bg-[#3586FF] flex items-center gap-1 text-white rounded-md font-medium md:text-[16px] text-[12px] md:px-6 px-4 md:py-2.5 py-1.5 hover:bg-blue-600 hover:shadow-lg transition-all duration-300"
          onClick={() => {
            setShowResults(false);
            setCurrentStep(1);
          }}
        >
          <RotateCcw className="w-4 h-4 animate-spin" />
          Start Again
        </Button>
      </div>
    </div>
  );

  return (
    <div
      className="flex flex-col items-center justify-center w-full bg-cover bg-center h-auto md:p-5 p-2 "
      style={{
        backgroundImage:
          "url('https://dreamcasaimages.s3.ap-south-1.amazonaws.com/moderninterior_3bb508d0fa.png')",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40 h-full"></div>
      <div className="relative container mx-auto md:px-4 px-2 md:mt-0 mt-5 grid grid-cols-1 lg:grid-cols-2 md:gap-8 gap-4 items-center h-full">
        <div className="flex flex-col justify-center space-y-6 bg-white/10 backdrop-blur-md md:p-4  p-2 rounded-[6px] md:rounded-[12px] border border-white/20">
          {renderLeftContent()}
        </div>

        <div className="bg-white/95 rounded-[6px] md:rounded-[12px] shadow-2xl md:p-8 p-4 border border-gray-200 max-w-full mx-auto">
          {!showResults ? (
            <>
              <div className="relative md:mb-12 mb-6">
                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2">
                  <div
                    className="h-full bg-gradient-to-r from-[#3586FF] to-green-500 transition-all duration-500 ease-out"
                    style={{
                      width: `${((currentStep - 1) / 2) * 100}%`,
                    }}
                  ></div>
                </div>

                <div className="flex justify-between relative">
                  {[1, 2, 3].map((step, idx) => (
                    <div
                      key={step}
                      className="flex flex-col items-center flex-1"
                    >
                      <div
                        className={`md:w-10 w-7 md:h-10 h-7 flex items-center justify-center rounded-full md:text-[14px] text-[12px] font-bold relative z-10 transition-all duration-300 transform
          ${currentStep === step
                            ? "bg-[#3586FF] text-white shadow-lg shadow-[#3586FF]/30 scale-110 ring-4 ring-blue-100"
                            : step < currentStep
                              ? "bg-green-500 text-white shadow-lg shadow-green-500/30 scale-105"
                              : "bg-gray-100 text-gray-400 shadow"
                          }`}
                      >
                        {step < currentStep ? (
                          <HiCheck className="w-5 h-5" />
                        ) : (
                          <span className="text-[16px] md:text-[18px]">
                            {stepIcons[idx]}
                          </span>
                        )}
                      </div>

                      <p
                        className={`md:text-[14px] text-[12px] font-medium mt-3 transition-colors duration-300 ${currentStep === step
                          ? "text-[#3586FF] font-bold"
                          : step < currentStep
                            ? "text-green-600"
                            : "text-gray-500"
                          }`}
                      >
                        {stepLabels[idx]}
                      </p>


                      <span className="md:text-[14px] text-[12px] font-regular text-gray-400 mt-1">
                        {step < currentStep
                          ? "Completed"
                          : step === currentStep
                            ? "Active"
                            : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="min-h-[250px] w-full">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && (
                  <div className="w-full max-w-full mx-auto md:px-4 px-1">
                    {renderStep2()}
                  </div>
                )}
                {currentStep === 3 && (
                  <div className="w-full min-w-[500px] mx-auto md:px-4 px-1">
                    {renderStep3()}
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-6">
                {currentStep > 1 && (
                  <Button
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    className="flex items-center gap-2 md:px-6 px-3 md:py-2 py-1.5 md:text-[16px] text-[12px] font-medium bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    <MdArrowBack /> Previous
                  </Button>
                )}
                <Button
                  onClick={handleNextStep}
                  className="flex items-center gap-2 md:px-6 px-3 md:py-2 py-1.5 md:text-[16px] text-[12px] ml-auto bg-[#3586FF] font-medium text-white rounded-md hover:bg-blue-600"
                >
                  {currentStep < 3 ? (
                    <>
                      Next <MdArrowForward />
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </>
          ) : (
            renderEstimator()
          )}
        </div>
      </div>
    </div>
  );
};

export default PaintingCostEstimator;
