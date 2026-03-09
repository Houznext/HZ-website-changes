import React from "react";
import WbShadeOutlinedIcon from "@mui/icons-material/WbShadeOutlined";
import {
  Apartment,
  MapOutlined,
  NaturePeopleOutlined,
} from "@mui/icons-material";
import MapsHomeWorkIcon from "@mui/icons-material/MapsHomeWork";
import HolidayVillageOutlinedIcon from "@mui/icons-material/HolidayVillageOutlined";
import {
  FiImage,
  FiMaximize,
  FiDollarSign,
  FiDivide,
  FiCreditCard,
  FiHome,
  FiTag,
  FiMap,
  FiLayers,
  FiHash,
  FiCheckCircle,
   FiClock,
  FiRefreshCw,
} from "react-icons/fi";

import {
  FaSwimmer,
  FaTree,
  FaParking,
  FaCouch,
  FaTableTennis,
  FaChessBoard,
  FaLeaf,
} from "react-icons/fa";
import {
  MdFireExtinguisher,
  MdFitnessCenter,
  MdElectricBolt,
  MdOutlineSecurity,
  MdStreetview,
  MdChildFriendly,
  MdElevator,
  MdOutlineWaterDrop,
  MdSolarPower,
  MdVideoCameraFront,
  MdOutlineRoom,
  MdPhoneInTalk,
  MdAtm,
  MdStorefront,
  MdBadge,
  MdLocalTaxi,
  MdTheaters,
  MdBusinessCenter,
  MdWorkOutline,
  MdContentCut,
  MdChildCare,
} from "react-icons/md";
import {
  GiCricketBat,
  GiTennisCourt,
  GiBasketballBasket,
  GiCctvCamera,
  GiWaterDrop,
  GiDrippingBlade,
  GiBarrier,
  GiLotus,
  GiRollerSkate,
  GiMountainClimbing,
  GiGolfFlag,
  GiTheater,
  GiPartyPopper,
  GiBarbecue,
} from "react-icons/gi";
import {
  BiBuildingHouse,
  BiRestaurant,
  BiLibrary,
  BiRecycle,
} from "react-icons/bi";
import { IoMdCafe } from "react-icons/io";
import { HiOutlineLightBulb } from "react-icons/hi";
import { RiBikeLine, RiFootprintLine, RiRoadMapLine } from "react-icons/ri";
import { useCompanyPropertyStore } from "@/src/stores/companyproperty";
import { propertyTypeEnum } from "../Property/PropertyDetails/PropertyHelpers";

export enum PurposeType {
  Apartment = "Apartment",
  IndependentFloor = "Independent Floor",
  IndependentHouse = "Independent House",
  Villa = "Villa",
  Plot = "Plot",
  AgriculturalLand = "Agricultural Land",
}

export const purposeTypeOptions: {
  name: PurposeType;
  icon: React.ReactNode;
}[] = [
  { name: PurposeType.Apartment, icon: <Apartment /> },
  { name: PurposeType.IndependentFloor, icon: <WbShadeOutlinedIcon /> },
  { name: PurposeType.IndependentHouse, icon: <MapsHomeWorkIcon /> },
  { name: PurposeType.Villa, icon: <HolidayVillageOutlinedIcon /> },
  { name: PurposeType.Plot, icon: <MapOutlined /> },
  { name: PurposeType.AgriculturalLand, icon: <NaturePeopleOutlined /> },
];

interface Amenity {
  name: string;
  icon: React.ReactNode;
}

export const amenitiesData: Amenity[] = [
  // Sports & Recreation
  { name: "Cricket Pitch", icon: <GiCricketBat /> },
  { name: "Tennis Court", icon: <GiTennisCourt /> },
  { name: "Badminton Court", icon: <GiTennisCourt /> },
  { name: "Basketball Court", icon: <GiBasketballBasket /> },
  { name: "Table Tennis", icon: <FaTableTennis /> },
  { name: "Billiards/Snooker Table", icon: <FaTableTennis /> },
  { name: "Carrom", icon: <FaTableTennis /> },
  { name: "Chess Board", icon: <FaChessBoard /> },
  { name: "Jogging Track", icon: <MdStreetview /> },
  { name: "Gymnasium", icon: <MdFitnessCenter /> },
  { name: "Swimming Pool", icon: <FaSwimmer /> },
  { name: "Kids’ Splash Pool", icon: <FaSwimmer /> },
  { name: "Yoga & Meditation Area", icon: <GiLotus /> },
  { name: "Indoor Games", icon: <FaCouch /> },
  { name: "Skating Rink", icon: <GiRollerSkate /> },
  { name: "Rock Climbing Wall", icon: <GiMountainClimbing /> },
  { name: "Mini Golf Course", icon: <GiGolfFlag /> },

  // Community & Lifestyle
  { name: "Club House", icon: <BiBuildingHouse /> },
  { name: "Multipurpose Hall", icon: <BiBuildingHouse /> },
  { name: "Amphitheater", icon: <GiTheater /> },
  { name: "Mini Theater", icon: <MdTheaters /> },
  { name: "Party Lawn", icon: <GiPartyPopper /> },
  { name: "BBQ / Grill Zone", icon: <GiBarbecue /> },
  { name: "Cafeteria", icon: <IoMdCafe /> },
  { name: "Restaurant", icon: <BiRestaurant /> },
  { name: "Library", icon: <BiLibrary /> },
  { name: "Business Center", icon: <MdBusinessCenter /> },
  { name: "Co-working Space", icon: <MdWorkOutline /> },
  { name: "Salon", icon: <MdContentCut /> },

  // Child & Senior Friendly
  { name: "Children’s Play Area", icon: <MdChildFriendly /> },
  { name: "Senior Citizen Sitout", icon: <MdChildFriendly /> },
  { name: "Creche / Daycare", icon: <MdChildCare /> },

  // Safety & Security
  { name: "24x7 CCTV Surveillance", icon: <GiCctvCamera /> },
  { name: "Fire Alarm", icon: <MdFireExtinguisher /> },
  { name: "Fire Fighting System", icon: <MdFireExtinguisher /> },
  { name: "Gated Community", icon: <MdOutlineSecurity /> },
  { name: "24x7 Security", icon: <MdOutlineSecurity /> },
  { name: "Video Door Phone", icon: <MdVideoCameraFront /> },
  { name: "Guard Room", icon: <MdOutlineRoom /> },

  // Eco-friendly
  { name: "Rainwater Harvesting", icon: <GiWaterDrop /> },
  { name: "Sewage Treatment Plant", icon: <FaLeaf /> },
  { name: "Water Conservation", icon: <GiWaterDrop /> },
  { name: "Energy Management", icon: <MdElectricBolt /> },
  { name: "Solar Powered Lighting", icon: <MdSolarPower /> },
  { name: "Organic Waste Converter", icon: <RiRoadMapLine /> },
  { name: "Green Roof / Terrace Garden", icon: <FaTree /> },
  { name: "Landscaping & Trees", icon: <FaTree /> },

  // Parking & Access
  { name: "Car Parking", icon: <FaParking /> },
  { name: "Open Parking", icon: <FaParking /> },
  { name: "Closed Car Parking", icon: <FaParking /> },
  { name: "Valet Parking", icon: <FaParking /> },
  { name: "Electric Vehicle Charging", icon: <MdElectricBolt /> },
  { name: "Cycle Stand / Bicycle Track", icon: <RiBikeLine /> },

  // Infrastructure
  { name: "Internal Roads & Footpaths", icon: <RiRoadMapLine /> },
  { name: "Storm Water Drains", icon: <GiDrippingBlade /> },
  { name: "Paved Compound", icon: <RiRoadMapLine /> },
  { name: "Street Lighting", icon: <HiOutlineLightBulb /> },
  { name: "Lift(s)", icon: <MdElevator /> },
  { name: "Intercom Facility", icon: <MdPhoneInTalk /> },
  { name: "Electrical Meter Room", icon: <MdElectricBolt /> },

  // Utilities
  { name: "24x7 Water Supply", icon: <MdOutlineWaterDrop /> },
  { name: "Solid Waste Management", icon: <BiRecycle /> },
  { name: "Garbage Disposal", icon: <BiRecycle /> },
  { name: "ATM / Banking Facility", icon: <MdAtm /> },
  { name: "Convenience Store / Retail", icon: <MdStorefront /> },

  // Misc
  { name: "Sun Deck", icon: <HiOutlineLightBulb /> },
  { name: "Boom Barrier Gate", icon: <GiBarrier /> },
  { name: "Visitor Management System", icon: <MdBadge /> },
  { name: "Pickup & Drop-off Zone", icon: <MdLocalTaxi /> },
];

export const validateProjectErrors = ({ project, setErrors }: any) => {
  const newErrors: Record<string, string> = {};

  if (!project?.Name) newErrors.Name = "Project Name is required.";
  const areaSize = project?.ProjectArea?.size;
  const areaUnit = project?.ProjectArea?.unit;

  const allowedUnits = [
    "sq.ft",
    "sq.yard",
    "sq.meter",
    "acre",
    "cent",
    "marla",
    "unit",
  ];
  if (!areaUnit || !allowedUnits.includes(areaUnit)) {
    newErrors.ProjectArea = "Please select a valid unit for Project Area.";
  }

  if (!areaSize && !areaUnit) {
    newErrors.ProjectArea = "Project Area and unit are required.";
  } else if (areaSize < 0.1) {
    newErrors.ProjectArea = "Project Area must be greater than 0.1 acre.";
  } else {
    if (areaUnit === "sq.ft" && areaSize > 19000) {
      newErrors.ProjectArea = "Area in sq.ft must not exceed 19,000.";
    }

    if (areaUnit === "sq.yard" && areaSize > 2100) {
      newErrors.ProjectArea = "Area in sq.yard must not exceed 2,100.";
    }

    if (areaUnit === "sq.meter" && areaSize > 1750) {
      newErrors.ProjectArea = "Area in sq.meter must not exceed 1,750.";
    }

    if (areaUnit === "acre" && areaSize > 10) {
      newErrors.ProjectArea = "Area in acres must not exceed 10.";
    }

    if (areaUnit === "cent" && areaSize > 1000) {
      newErrors.ProjectArea = "Area in cents must not exceed 1,000.";
    }

    if (areaUnit === "marla" && areaSize > 500) {
      newErrors.ProjectArea = "Area in marla must not exceed 500.";
    }
  }
  if (
    !project?.ProjectSize?.unit ||
    !allowedUnits.includes(project.ProjectSize.unit)
  ) {
    newErrors.ProjectSize = "Please select a valid unit for Project Size.";
  }

  if (!project?.ProjectSize?.size)
    newErrors.ProjectSize = "Project Size is required.";
  if (project?.ProjectSize?.size < 2)
    newErrors.ProjectSize = "Project Size must be greater than 2000.";

  if (!project?.AboutProject) {
    newErrors.AboutProject = "AboutProject is required";
  }
  if (!project?.Highlights) {
    newErrors.Highlights = "Highlights are required";
  }
  if (!project?.Specifications) {
    newErrors.Specifications = "Specifications are required";
  }
  if (!project?.Description) {
    newErrors.Description = "Description is required";
  }

  if (!project?.minPrice && project?.minPrice !== 0) {
    newErrors.minPrice = "Minimum price is required.";
  }

  if (!project?.maxPrice && project?.maxPrice !== 0) {
    newErrors.maxPrice = "Maximum price is required.";
  }
  if (
    typeof project?.minPrice === "number" &&
    typeof project?.maxPrice === "number" &&
    project?.minPrice > project?.maxPrice
  ) {
    newErrors.minPrice = "Minimum price cannot be greater than maximum price.";
    newErrors.maxPrice = "Maximum price must be greater than minimum price.";
  }

  if (!project?.MinSize) {
    newErrors.MinSize = "MinSize is required";
  } else if (
    !project.MinSize.unit ||
    !allowedUnits.includes(project.MinSize.unit)
  ) {
    newErrors.MinSize = "Please select a valid unit for Min Size.";
  }

  if (!project?.MaxSize) {
    newErrors.MaxSize = "MaxSize is required";
  } else if (
    !project.MaxSize.unit ||
    !allowedUnits.includes(project.MaxSize.unit)
  ) {
    newErrors.MaxSize = "Please select a valid unit for Max Size.";
  }
  if (
    project?.MinSize &&
    project?.MaxSize &&
    project.MinSize.unit === project.MaxSize.unit
  ) {
    const min = Number(project.MinSize.value);
    const max = Number(project.MaxSize.value);

    if (!isNaN(min) && !isNaN(max) && max < min) {
      newErrors.MaxSize = "Max Size should be greater than Min Size.";
    }
  }

  if (!project?.propertyType?.typeName)
    newErrors.propertyType = "Property Type is required.";

  if (!project?.constructionStatus?.status) {
    newErrors.constructionStatus = "Construction Status is required.";
  } else if (project?.constructionStatus.status === "Under Construction") {
    const possessionDate = new Date(project?.constructionStatus.possessionBy);
    const isValidFutureDate = possessionDate > new Date();
    if (!project?.constructionStatus.possessionBy) {
      newErrors.possessionBy = "Possession date is required.";
    } else if (!isValidFutureDate) {
      newErrors.possessionBy = "Possession date must be in the future.";
    }
  } else {
    if (!project?.constructionStatus.ageOfProperty) {
      newErrors.ageOfProperty = "Age of Property is required.";
    }
    if (!project?.constructionStatus.possessionYears) {
      newErrors.possessionYears = "Possession Years is required.";
    }

    if (project?.constructionStatus.possessionYears < 7) {
      newErrors.possessionYears = "Possession Years must be more than 7 years.";
    }
  }

  if (!project?.location) {
    newErrors.location = "Project location is required.";
  } else {
    if (!project?.location.state) newErrors.state = "state is required";
    if (!project?.location.city) newErrors.city = "City is required";

    if (!project?.location.locality)
      newErrors.locality = "Locality is required";

    if (!project?.location.landmark)
      newErrors.landmark = "Landmark is required";

    if (
      project?.location?.subLocality &&
      typeof project.location.subLocality !== "string"
    ) {
      newErrors.subLocality = "Sub-locality must be a string.";
    }
  }

  setErrors(newErrors);
  // return Object.keys(newErrors).length === 0;
  return newErrors;
};

export const validateForm = () => {
  const { setErrors, companyDetails } = useCompanyPropertyStore.getState();
  const newErrors: any = {};
  const { developerInformation } = companyDetails;

  if (!developerInformation.Name || !developerInformation.Name.trim())
    newErrors.developerInformationName = "Developer Name is required";

  const phoneRegex = /^[0-9]{10}$/;
  if (
    !developerInformation.PhoneNumber ||
    !developerInformation.PhoneNumber.trim()
  )
    newErrors.developerInformationPhoneNumber =
      "Developer Phone Number is required";
  else if (!phoneRegex.test(developerInformation.PhoneNumber))
    newErrors.developerInformationPhoneNumber =
      "Developer Phone Number must be 10 digits";

  if (
    !developerInformation.whatsappNumber ||
    !developerInformation.whatsappNumber.trim()
  )
    newErrors.developerInformationWhatsappNumber =
      "Developer WhatsApp Number is required";
  else if (!phoneRegex.test(developerInformation.whatsappNumber))
    newErrors.developerInformationWhatsappNumber =
      "Developer WhatsApp Number must be 10 digits";

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (
    !developerInformation.officialEmail ||
    !developerInformation.officialEmail.trim()
  )
    newErrors.developerInformationOfficialEmail =
      "Developer Official Email is required";
  else if (!emailRegex.test(developerInformation.officialEmail))
    newErrors.developerInformationOfficialEmail =
      "Developer Official Email is invalid";

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

export const validateCompanyForm = (): boolean => {
  const { setErrors, companyDetails } = useCompanyPropertyStore.getState();
  const newErrors: any = {};
  if (!companyDetails.companyName.trim())
    newErrors.companyName = "Company Name is required";
  if (!companyDetails.RERAId.trim()) newErrors.RERAId = "RERA ID is required";

  if (!companyDetails.about.trim())
    newErrors.about = "About Company is required";

  const currentYear = new Date().getFullYear();
  if (!companyDetails.estdYear) {
    newErrors.estdYear = "Established Year is required";
  } else if (
    isNaN(parseInt(companyDetails.estdYear)) ||
    parseInt(companyDetails.estdYear) < 1950 ||
    parseInt(companyDetails.estdYear) > currentYear
  ) {
    newErrors.estdYear = `Established Year must be between 1950 and ${currentYear}`;
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

export const validateUnitData = (
  unitData: any,
  propertyType: string
): boolean => {
  const { setErrors } = useCompanyPropertyStore.getState();
  let errors: Record<string, string> = {};
  const allowedUnits = [
    "sq.ft",
    "sq.yard",
    "sq.meter",
    "acre",
    "cent",
    "marla",
    "unit",
  ];

  const { BHK, flatSize, plotSize, flooringPlans } = unitData;

  const isPlot =
    propertyType === propertyTypeEnum.Plot ||
    propertyType === propertyTypeEnum.AgriculturalLand;
 
  if (!isPlot) {
    if (!BHK) {
      errors.BHK = "Please select the number of BHK.";
    }

    if (!flatSize || !flatSize.size) {
      errors.flatSize = "Flat Size is required.";
    } else if (flatSize.size < 700 || flatSize.size > 10000) {
      errors.flatSize = "Flat Size should be between 700 sft and 10,000 sft.";
    } else if (!flatSize.unit || !allowedUnits.includes(flatSize.unit)) {
      errors.flatSize = "Please select a valid unit for flat Size.";
    }
  }

  if (!plotSize || !plotSize.size) {
    errors.plotSize = "Plot Size is required.";
  } else if (!plotSize.unit || !allowedUnits.includes(plotSize.unit)) {
    errors.plotSize = "Please select a valid unit for plot Size.";
  }

  const builtUpArea = flooringPlans?.[0]?.BuiltupArea;
  const totalPrice = flooringPlans?.[0]?.TotalPrice;
  const pricePerSft = flooringPlans?.[0]?.pricePerSft;

  if (!builtUpArea || !builtUpArea.size) {
    errors.BuiltupArea = "Built-up Area is required.";
  } else if (builtUpArea.size < 700) {
    errors.BuiltupArea = "Built-up Area should be at least 700 sft.";
  } else if (!builtUpArea.unit || !allowedUnits.includes(builtUpArea.unit)) {
    errors.builtUpArea = "Please select a valid unit for Built up Area.";
  }
  if (
    !isPlot &&
    flatSize?.size &&
    builtUpArea?.size &&
    builtUpArea.size < flatSize.size
  ) {
    errors.BuiltupArea =
      "Built-up Area should be greater than or equal to Flat Size.";
  }
  if (!isPlot && totalPrice <= 3000000) {
    errors.TotalPrice = "Total Price should be greater than 30 lakhs.";
  }

  if (totalPrice === null || totalPrice === undefined) {
    errors.TotalPrice = "Total Price is required.";
  } else if (totalPrice <= 0) {
    errors.TotalPrice = "Total Price should be a positive number.";
  }

  if (pricePerSft === null || pricePerSft === undefined) {
    errors.pricePerSft = "Price per Sq. Ft. is required.";
  } else if (pricePerSft < 3000) {
    errors.pricePerSft = "Price per Sq. Ft. should be at least 3000 Rs.";
  }
  if (!isPlot && pricePerSft < 3000) {
    errors.pricePerSft = "Price per Sq. Ft. should be at least 3000 Rs.";
  }
//   const floorPlanImages = flooringPlans?.[0]?.images;

// if (!floorPlanImages || floorPlanImages.length === 0) {
//   errors.floorPlan = "At least one floor plan image is required.";
// }



  setErrors(errors);

  return Object.keys(errors).length === 0;
};
export const unitIconMap:Record<string, JSX.Element>={
   floorplan: <FiImage />,
  BuiltupArea: <FiMaximize />,
  TotalPrice: <FiDollarSign />,
  pricePerSft: <FiDivide />,
  emiStartsAt: <FiCreditCard />,
  BHK: <FiHome />,
  unitName: <FiTag />,
  flatSize: <FiMaximize />,
  plotSize: <FiMap />,
  flooringPlans: <FiLayers />,
   id: <FiHash />,
  status: <FiCheckCircle />,
  createdAt: <FiClock />,
  updatedAt: <FiRefreshCw />,
}
export const labelMap: Record<string, string> = {
  BuiltupArea: "Built-up Area",
  TotalPrice: "Total Price",
  pricePerSft: "Price / Sq.Ft",
  emiStartsAt: "EMI Starts At",
  unitName: "Unit Name",
  flatSize: "Flat Size",
  plotSize: "Plot Size",
  BHK: "BHK",
  floorplan: "Floorplan",
};


