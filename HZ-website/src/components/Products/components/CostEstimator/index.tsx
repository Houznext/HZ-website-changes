import React, { useEffect, useState } from "react";
import CalculatorInputs from "../Calculator";
import PackageDetails from "./PackageDetails";
import apiClient from "@/utils/apiClient";

interface FormState {
  mobileNumber: string;
  name: string;
  builtupArea: number;
  balcony: number;
  carParking: number;
  location: string;
}

const packageData = [
  {
    title: "Basic Package",
    data: [
      {
        title: "Design & Structure",
        desc: "Includes standard architectural design and structural framework with basic steel reinforcement bars, standard concrete mixes, and essential foundation materials, ensuring structural integrity at an economical cost.",
      },
      {
        title: "Flooring",
        desc: "Offers economical flooring options such as ceramic tiles or basic vitrified tiles with essential underlayment, adhesives, and grouts, focused on budget-friendly solutions.",
      },
      {
        title: "Plumbing",
        desc: "Covers basic plumbing components such as standard PVC pipes, basic fittings, and essential sanitary ware, ensuring functionality with cost-effective materials.",
      },
      {
        title: "Kitchen",
        desc: "Provides basic modular kitchen setups with standard-grade cabinets, basic countertops, and essential appliances, focused on practicality and cost-efficiency.",
      },
      {
        title: "Bathroom",
        desc: "Includes standard sanitary ware, basic anti-skid floor tiles, and cost-effective plumbing for hot/cold water lines, ensuring functionality and durability.",
      },
      {
        title: "Doors & Windows",
        desc: "Features standard doors and windows made from basic materials like UPVC or aluminum with essential glass options, door handles, and locks.",
      },
      {
        title: "Painting",
        desc: "Covers interior and exterior painting with basic emulsion or distemper paints, minimal surface preparation, and standard primers.",
      },
      {
        title: "Electrical",
        desc: "Involves the installation of basic wiring, standard switches, and essential lights and fans, ensuring safety and energy efficiency within a budget.",
      },
    ],
    sqftPrice: 1890,
    carParkingCost: 1134,
  },
  {
    title: "Classic Package",
    data: [
      {
        title: "Design & Structure",
        desc: "Offers enhanced architectural design and structural framework with high-quality steel reinforcement bars and improved concrete mixes, ensuring increased durability and strength.",
      },
      {
        title: "Flooring",
        desc: "Includes mid-range flooring options like better quality vitrified tiles, ceramic tiles, or standard marble, offering improved durability and aesthetic appeal.",
      },
      {
        title: "Plumbing",
        desc: "Covers mid-range plumbing components such as CPVC pipes, better fittings, and enhanced sanitary ware, focusing on durability and corrosion resistance.",
      },
      {
        title: "Kitchen",
        desc: "Provides modular kitchen setups with better quality cabinets, countertops, and appliances, balancing cost with quality and aesthetic appeal.",
      },
      {
        title: "Bathroom",
        desc: "Features mid-range sanitary ware, improved anti-skid floor tiles, and better-quality plumbing, ensuring a balance between functionality and style.",
      },
      {
        title: "Doors & Windows",
        desc: "Includes doors and windows made from mid-range materials like enhanced UPVC or wood, with better glass options and upgraded security features.",
      },
      {
        title: "Painting",
        desc: "Covers interior and exterior painting with mid-range paints, including textured finishes and better surface preparation for a more refined look.",
      },
      {
        title: "Electrical",
        desc: "Involves installation of better-quality wiring, upgraded switches, and more advanced lighting solutions, ensuring higher energy efficiency and safety.",
      },
    ],
    sqftPrice: 2050,
    carParkingCost: 1230,
  },
  {
    title: "Premium Package",
    data: [
      {
        title: "Design & Structure",
        desc: "Features top-tier architectural design and structural framework with premium steel reinforcement bars and superior concrete mixes, ensuring maximum durability and strength.",
      },
      {
        title: "Flooring",
        desc: "Includes premium flooring options such as high-quality marble, hardwood, or designer vitrified tiles, offering superior durability and luxury.",
      },
      {
        title: "Plumbing",
        desc: "Covers premium plumbing components like high-end CPVC or PEX pipes, luxury fittings, and top-quality sanitary ware, focusing on long-lasting durability and style.",
      },
      {
        title: "Kitchen",
        desc: "Offers luxury modular kitchen setups with premium cabinets, countertops made of high-end materials like quartz or marble, and advanced appliances, ensuring a luxurious and functional space.",
      },
      {
        title: "Bathroom",
        desc: "Includes luxury sanitary ware, premium anti-skid floor tiles, and high-quality plumbing, ensuring a sophisticated and durable bathroom design.",
      },
      {
        title: "Doors & Windows",
        desc: "Features doors and windows made from premium wood or aluminum, with advanced glass options and top-tier security features.",
      },
      {
        title: "Painting",
        desc: "Covers interior and exterior painting with premium paints, including designer finishes and meticulous surface preparation for a flawless finish.",
      },
      {
        title: "Electrical",
        desc: "Involves the installation of premium-quality wiring, high-end switches, and advanced lighting solutions, ensuring superior energy efficiency and safety.",
      },
    ],
    sqftPrice: 2440,
    carParkingCost: 1464,
  },
  {
    title: "Royal Package",
    data: [
      {
        title: "Design & Structure",
        desc: "Offers exclusive architectural design and structural framework with the finest steel reinforcement bars and bespoke concrete mixes, ensuring unparalleled durability and grandeur.",
      },
      {
        title: "Flooring",
        desc: "Features the finest flooring options such as imported marble, exotic hardwood, or designer tiles, offering unmatched luxury and elegance.",
      },
      {
        title: "Plumbing",
        desc: "Includes the finest plumbing components like top-grade CPVC or PEX pipes, luxury fittings, and the highest-quality sanitary ware, ensuring long-lasting performance and opulence.",
      },
      {
        title: "Kitchen",
        desc: "Provides a state-of-the-art modular kitchen with bespoke cabinets, the finest countertops, and top-of-the-line appliances, creating a truly luxurious cooking space.",
      },
      {
        title: "Bathroom",
        desc: "Focuses on high-end sanitary ware, the finest anti-skid floor tiles, and premium-quality plumbing, ensuring a luxurious and durable bathroom.",
      },
      {
        title: "Doors & Windows",
        desc: "Includes doors and windows crafted from the finest materials, with custom glass options and the highest security standards, offering both luxury and safety.",
      },
      {
        title: "Painting",
        desc: "Covers interior and exterior painting with the most premium paints and finishes, ensuring a flawless and luxurious finish throughout.",
      },
      {
        title: "Electrical",
        desc: "Involves installation of the most advanced wiring, custom switches, and designer lighting solutions, ensuring the highest standards of energy efficiency and safety.",
      },
    ],
    sqftPrice: 2660,
    carParkingCost: 1596,
  },
];

const dummyLocations = [
  {
    id: 1,
    city: "Hyderabad",
    area: "Madhapur",
    state: "Telangana",
    pincode: "500081",
  },
  {
    id: 2,
    city: "Hyderabad",
    area: "Gachibowli",
    state: "Telangana",
    pincode: "500032",
  },
  {
    id: 3,
    city: "Hyderabad",
    area: "Kondapur",
    state: "Telangana",
    pincode: "500084",
  },
  {
    id: 4,
    city: "Hyderabad",
    area: "Banjara Hills",
    state: "Telangana",
    pincode: "500034",
  },
  {
    id: 5,
    city: "Bangalore",
    area: "Koramangala",
    state: "Karnataka",
    pincode: "560034",
  },
  {
    id: 6,
    city: "Bangalore",
    area: "Indiranagar",
    state: "Karnataka",
    pincode: "560038",
  },
  {
    id: 7,
    city: "Bangalore",
    area: "Whitefield",
    state: "Karnataka",
    pincode: "560066",
  },
  {
    id: 8,
    city: "Bangalore",
    area: "Jayanagar",
    state: "Karnataka",
    pincode: "560041",
  },
  {
    id: 9,
    city: "Pune",
    area: "Kothrud",
    state: "Maharashtra",
    pincode: "411038",
  },
  {
    id: 10,
    city: "Pune",
    area: "Hinjewadi",
    state: "Maharashtra",
    pincode: "411057",
  },
  {
    id: 11,
    city: "Pune",
    area: "Viman Nagar",
    state: "Maharashtra",
    pincode: "411014",
  },
  {
    id: 12,
    city: "Pune",
    area: "Baner",
    state: "Maharashtra",
    pincode: "411045",
  },
  {
    id: 13,
    city: "Mumbai",
    area: "Andheri",
    state: "Maharashtra",
    pincode: "400053",
  },
  {
    id: 14,
    city: "Mumbai",
    area: "Bandra",
    state: "Maharashtra",
    pincode: "400050",
  },
  {
    id: 15,
    city: "Mumbai",
    area: "Powai",
    state: "Maharashtra",
    pincode: "400076",
  },
  {
    id: 16,
    city: "Mumbai",
    area: "Malad",
    state: "Maharashtra",
    pincode: "400064",
  },
];

const CostEstimator: React.FC = () => {
  const [formData, setFormData] = useState<FormState>({
    mobileNumber: "",
    name: "",
    builtupArea: 0,
    balcony: 0,
    carParking: 0,
    location: "",
  });

  const carParkingInputOptions = [0, 1, 2, 3, 4];
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "balcony" || name === "builtupArea") {
      setFormData((prev) => ({ ...prev, [name]: +value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEstimateCost = async (activeTab: number) => {
    const cost = calculateEstimatedCost(formData, activeTab);
    setEstimatedCost(cost); // This will display the estimated cost
    try {
      const payload = {
        phoneNumber: formData.mobileNumber,
        name: formData.name,
        searchLocation: formData.location,
        houseBuiltUpArea: formData.builtupArea,
        balconyUtilityArea: formData.balcony,
        noOfCarParking: formData.carParking,
      };

      const res = await apiClient.post(apiClient.URLS.builder_leads, {
        ...payload,
      });

    } catch (error) {
      console.log(error);
    }
  };

  const calculateEstimatedCost = (
    formData: {
      builtupArea: number;
      balcony: number;
      carParking: number;
      location: string;
    },
    activeTab: number
  ) => {
    const selectedLocation = dummyLocations.find((loc) =>
      formData.location.includes(loc.area)
    );

    if (!selectedLocation) {
      return 0; // If location is not found, return 0 or handle the case accordingly
    }

    const { builtupArea, balcony, carParking } = formData;

    const estimatedCost =
      builtupArea * packageData[activeTab].sqftPrice +
      carParking * packageData[activeTab].carParkingCost * 100 +
      balcony * packageData[activeTab].carParkingCost;

    return estimatedCost;
  };

  return (
    <div className="relative mt-[60px] mb-[40px]">
      <div className="flex flex-col  gap-[10px]">
        <p className="md:text-[24px] text-[18px] font-bold leading-tight md:leading-[52px] text-center">
          Try our Construction cost estimator
        </p>
        <p className="text-[12px] md:text-[14px] font-regular text-gray-500 md:leading-[16px] md:text-center max-w-[900px] mx-auto">
          Fill the form according to your needs, and get estimated cost for your
          dream house construction with products best in quality available in
          the market!
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-[28px] items-center justify-center mx-auto md:w-[85%] w-full md:mt-[40px] mt-[20px] h-full">
        <div className="md:w-[49%] w-full border-[2px] border-[#bbd3f7] rounded-[8px]">
          <CalculatorInputs
            handleInputChange={handleInputChange}
            handleEstimateCost={handleEstimateCost}
            packageDetails={packageData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            estimatedCost={estimatedCost}
            formData={formData}
            carParkingInputOptions={carParkingInputOptions}
            dummyLocations={dummyLocations}
          />
        </div>
        <div className="md:w-[47%] w-full pl-[24px] pr-[10px] py-[16px] h-full border-[2px] border-[#bbd3f7] rounded-[8px] overflow-y-scroll">
          <PackageDetails active={activeTab} packageData={packageData} />
        </div>
      </div>
    </div>
  );
};

export default CostEstimator;

// <Modal
//   isOpen={modal}
//   closeModal={() => setModal(false)}
//   className="max-w-[800px] z-[1000]"
// >
//   <div className="p-4">
//     <h2 className="text-[24px] font-medium mb-4">
//       {job.JobTitle}
//     </h2>
//     {job.ExperienceRange && (
//       <p className="text-[#7f8793] mb-2">
//         Experience Range: {job.ExperienceRange}
//       </p>
//     )}
//     <p className="text-[#7f8793] mb-6">Location: {job.Location}</p>
//     {job.Responsibilities && (
//       <>
//         <h3 className="text-[20px] font-medium mb-2">
//           Job Responsibilities
//         </h3>
//         <ul className="list-disc list-inside mb-4">
//           {job.Responsibilities.map((resp, index) => (
//             <li key={index} className="text-[#7f8793]">
//               {resp}
//             </li>
//           ))}
//         </ul>
//       </>
//     )}
//     {job.Specifications && (
//       <>
//         <h3 className="text-[20px] font-medium mb-2">
//           Job Specifications
//         </h3>
//         <ul className="list-disc list-inside">
//           {job.Specifications.map((spec, index) => (
//             <li key={index} className="text-[#7f8793]">
//               {spec}
//             </li>
//           ))}
//         </ul>
//       </>
//     )}
//     <p className="mt-6 text-[#3586FF] underline">
//       To apply on this job, email your resume at
//     </p>
//   </div>
// </Modal>;
