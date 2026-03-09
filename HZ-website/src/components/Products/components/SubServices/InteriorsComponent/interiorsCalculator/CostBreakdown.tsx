import {
  Bathtub,
  Home,
  Info,
  Kitchen,
  Layers,
  Restaurant,
  SingleBed,
} from "@mui/icons-material";
import { useMemo, useState } from "react";
import { FormData } from "./index";
import { budgetDetails } from "@/utils/interiorshelper";
import Button from "@/common/Button";
import { MdEdit, MdEmail, MdPhone } from "react-icons/md";
import { FaHandsHelping } from "react-icons/fa";
import { Check, CheckCircle2, CheckCircleIcon, X } from "lucide-react";
import Link from "next/link";

interface RoomSize {
  size: number;
  icon: React.ReactNode;
}

interface RoomCounts {
  livingRoom: number;
  kitchen: number;
  bedroom: number;
  bathroom: number;
  dining: number;
}

interface PackageRate {
  baseRate: number;
  multiplier: number;
  features: string[];
}

const staticRates: Record<string, { baseRate: number; multiplier: number }> = {
  Basic: { baseRate: 800, multiplier: 1 },
  Standard: { baseRate: 1100, multiplier: 1.2 },
  Premium: { baseRate: 1400, multiplier: 1.4 },
};

const generatePackageRates = (): Record<string, PackageRate> => {
  const result: Record<string, PackageRate> = {};

  for (const packageType of Object.keys(staticRates)) {
    const featureSet = new Set<string>();

    budgetDetails.forEach((bhk) => {
      const pkg = bhk.packages.find(
        (p) => p.type.toLowerCase() === packageType.toLowerCase()
      );

      pkg?.features.forEach((f) => {
        featureSet.add(f.description.trim());
      });
    });

    result[packageType] = {
      ...staticRates[packageType],
      features: Array.from(featureSet),
    };
  }

  return result;
};


const PACKAGE_RATES = generatePackageRates();

const ROOM_SIZES: Record<keyof RoomCounts, RoomSize> = {
  livingRoom: { size: 150, icon: <Home /> },
  kitchen: { size: 120, icon: <Kitchen /> },
  bedroom: { size: 120, icon: <SingleBed /> },
  bathroom: { size: 10, icon: <Bathtub /> },
  dining: { size: 70, icon: <Restaurant /> },
};

export const CostBreakdown = ({ formData, setShowResults }: { formData: FormData, setShowResults: (show: boolean) => void }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [visible, setVisible] = useState(false);

  const CEILING_COST_BY_BHK: Record<string, number> = {
    "1BHK": 30000,
    "2BHK": 45000,
    "3BHK": 60000,
    "4BHK": 80000,
    "5BHK": 100000,
  };

  const calculation = useMemo(() => {
    const selectedPackage = PACKAGE_RATES[formData.package];

    const roomBreakdown = Object.entries(formData.rooms).reduce(
      (acc, [room, count]) => {
        const roomType = room as keyof RoomCounts;
        const area = ROOM_SIZES[roomType].size * count;

        const cost = area * selectedPackage?.baseRate * selectedPackage?.multiplier;
        if (count > 0) {
          acc[roomType] = { area, cost };
        }
        return acc;
      },
      {} as Record<string, { area: number; cost: number }>
    );
    const totalArea = Object.values(roomBreakdown).reduce(
      (sum, { area }) => sum + area,
      0
    );
    const baseCost = Object.values(roomBreakdown).reduce(
      (sum, { cost }) => sum + cost,
      0
    );
    const ceilingCost =
      CEILING_COST_BY_BHK[formData.bhkType.toUpperCase()] || 0;

    const totalCost = baseCost + ceilingCost;

    return {
      roomBreakdown,
      totalArea,
      totalCost,
      ceilingCost,
      features: selectedPackage.features,
    };
  }, [formData]);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full  flex items-center">

      <div className="w-full bg-white/95 backdrop-blur-md md:rounded-2xl rounded-md shadow-xl px-3 py-4 md:px-10  border border-white/20 md:max-h-[700px] max-h-[820px] overflow-auto">
        <div className="mb-4">
          <Button
            onClick={() => setShowResults(false)}
            className="mt-3 bg-white border flex items-center justify-center md:py-2 py-1 px-4 font-medium rounded-[6px]  text-[14px] text-gray-700 hover:bg-gray-100"
          >
            <MdEdit className="mr-2 text-[#3586FF]" />  Edit  Estimate
          </Button>
        </div>


        <div className="mb-4 text-center">
          <div className="p-2 bg-gray-200 rounded-full w-[50px] h-[50px] mx-auto mb-2">
            <div className="text-2xl mb-2">🙏</div>
          </div>
          <h2 className="text-[16px] md:text-xl font-bold text-[#3586FF]">
            Thank you for exploring your dream home with us!
          </h2>
          <p className="text-sm md:text-md text-gray-500 mt-1">
            Here's your personalized interior cost estimate summary.
          </p>
        </div>
        <h6 className="md:text-xl text-[18px] font-bold  mb-2 text-gray-800">
          Cost Breakdown:
        </h6>
        <div className="flex justify-between items-center md:mb-6 mb-3">

          <div>
            <h4 className="md:text-3xl text-[14px] text-[#3586FF] font-bold flex items-center">
              <span className="md:text-3xl text-[16px] text-[#3586FF] font-Gpordita-Bold flex items-center">
                <span className=" text-[12px]  text-[#c7b526d5] mb-2">Starts at</span>&nbsp;{formatCurrency(calculation.totalCost)}
              </span>

              <span
                className="text-[#3586FF] text-sm ml-2 cursor-pointer relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Info />
                {showTooltip && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 mt-1 w-80 p-4 bg-white border border-gray-300 rounded shadow-lg text-sm text-gray-700 z-10">
                    <p className="font-Gordita-SemiBold text-[16px] text-[#f1bd3a] mb-2">Estimate Disclaimer:</p>
                    <p className="text-[14px]">
                      This is an average market-based estimate and is subject to change. Final pricing may vary depending on current market rates, material selection, room dimensions, and custom design requirements.
                    </p>
                  </div>
                )}
              </span>
            </h4>
            <span className="md:text-md text-[13px] font-medium text-gray-600">
              Total Area: {calculation.totalArea} sq.ft
            </span>
          </div>
        </div>
        <hr className="my-4 border-gray-300" />
        <div className="grid md:gap-4 gap-2">
          {Object.entries(calculation.roomBreakdown).map(
            ([room, { area, cost }]) => (
              <div
                key={room}
                className="flex justify-between items-center md:p-3 p-2 bg-gray-100 rounded-lg shadow-md"
              >
                <div className="flex items-center md:gap-2 gap-1">
                  {ROOM_SIZES[room as keyof RoomCounts].icon}
                  <div>
                    <span className="md:text-[18px] text-[15px] font-medium capitalize text-gray-700">
                      {room.replace(/([A-Z])/g, " $1")} <span className="mx-1">×</span> {formData.rooms[room as keyof RoomCounts]}
                    </span>
                    <p className=" text-[12px]  text-gray-500">{area} sq.ft (Approx. avg size)</p>
                  </div>
                </div>
                <span className="md:text-[16px] text-[13px] font-medium text-[#3586FF]">
                  {formatCurrency(cost)}
                </span>
              </div>

            )
          )}
          <div
            className="flex justify-between items-center md:p-3 p-2 bg-gray-100 rounded-lg shadow-md"
          >
            <div className="flex items-center md:gap-2 gap-1">
              <Layers />
              <div>
                <span className="md:text-[16px] text-[14px] font-medium capitalize text-gray-700">
                  False Ceiling (POP)
                </span>
                <p className="md:text-[12px] text-[10px] text-gray-500">approx</p>
              </div>
            </div>
            <span className="md:text-[16px] text-[12px] font-medium text-[#3586FF]">
              {formatCurrency(calculation.ceilingCost)}
            </span>
          </div>
        </div>
        <div className="mt-6">
          <h6 className="md:text-lg text-[16px] font-semibold text-gray-800 mb-2">What's Included:</h6>
          <ul className="list-none text-gray-700 font-regular text-[13px] space-y-2">
            {calculation.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-[5px] h-[5px] mr-3">
                  <CheckCircle2 color="#206ef5" className="w-[20px] h-[20px]" />
                </span>
                <span className="text-[14px]">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <hr className="my-6 border-gray-300" />
        <div className="text-center">
          <p className="text-sm md:text-md text-gray-600 font-regular">
            <span className="italic">Note:</span> This is an average estimation based on standard room sizes, finishes, and rates. Final pricing may vary depending on specific dimensions, materials, and design preferences.
          </p>
          <p className="mt-2  text-[#ecbc43] text-[14px] font-regular bg">
            Our team will get in touch with you soon to discuss your requirements in detail.
            <br />
            <div className="text-black">
              You can also call us at : <MdPhone className="inline" />
              <Link href="tel:+918897574909" className="underline text-[#3586FF] hover:text-blue-800 ml-2 transition">
                8897574909
              </Link>
              ,{" "}
              <Link href="tel:+918106120099" className="underline text-[#3586FF] hover:text-blue-800 transition">
                8106120099
              </Link>{" "}
              or mail us at{" "}<MdEmail className="inline" />
              <Link href="mailto:dreama@example.com" className="underline text-[#3586FF] hover:text-blue-800 transition">
                sales@onecasa.in
              </Link>.
            </div>
          </p>

        </div>
      </div>

    </div >
  );
};
