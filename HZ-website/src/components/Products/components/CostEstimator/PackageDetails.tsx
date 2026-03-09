import React, { useState } from "react";
import { MinusIcon, PlusIcon } from "@/components/Icons";

interface PackageDetailsProps {
  active: number;
  packageData: { title: string; data: { title: string; desc: string }[] }[];
}

const PackageDetails: React.FC<PackageDetailsProps> = ({
  active,
  packageData,
}) => {
  const [dropdownState, setDropdownState] = useState<{
    [key: number]: boolean;
  }>({});

  const handleDropdownToggle = (index: number) => {
    setDropdownState((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  return (
    <div>
      <p className="text-center font-bold text-[#3586FF] sticky top-0 leading-8 md:text-[20px] text-[16px] mb-3 z-20 ">
        {packageData[active].title}
      </p>
      <div className="w-full z-10">
        {packageData[active].data.map((item, index) => (
          <div className="relative flex flex-col w-full border-b-[1px] py-[7px] px-[10px] border-b-[#E6E6E6]" key={index}>
            <div className="flex flex-row justify-between items-center w-full py-1">
              <p className="font-medium md:text-[16px] text-[14px]">
                {item.title}
              </p>
              <div
                onClick={() => handleDropdownToggle(index)}
                className="cursor-pointer"
              >
                {dropdownState[index] ? <MinusIcon /> : <PlusIcon />}
              </div>
            </div>

            {dropdownState[index] && (
              <div className="absolute left-0 top-full mt-2 w-full bg-white shadow-md rounded-md p-2 z-10">
                <p className="text-gray-500 md:text-[16px] text-[12px]">{item.desc}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackageDetails;
