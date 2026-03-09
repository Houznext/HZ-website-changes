import CustomInput from "@/common/FormElements/CustomInput";
import usePostPropertyStore, {
  CommercialFacilities,
} from "@/store/postproperty";
import React, { useState } from "react";

const CommercialFacilites = () => {
  const property = usePostPropertyStore((state) => state.getProperty());
  const propertyDetails = usePostPropertyStore(
    (state) => state.getProperty().propertyDetails
  );
  const setPropertyDetails = usePostPropertyStore(
    (state) => state.setPropertyDetails
  );
  const [error, setError] = useState<{ [key: string]: string }>({});

  const handleChange = (key: keyof CommercialFacilities, value: any) => {
    const updatedPropertyDetails = {
      ...propertyDetails,
      facilities: {
        ...propertyDetails?.facilities,
        [key]: value,
      },
    };

    setPropertyDetails({
      ...property,
      propertyDetails: { ...updatedPropertyDetails },
    });
  };
  return (
    <>
      <CustomInput
        label="Min number of seats"
        type="number"
        labelCls="md:text-[14px] text-[13px] font-medium text-black"
        value={propertyDetails?.facilities?.minSeats || null}
        name="minSeats"
        placeholder="Enter min number of seats"
        onChange={(e) => handleChange("minSeats", +e.target.value)}
        errorMsg={error.minSeats}
      />
      <CustomInput
        label="Number of Cabins"
        type="number"
        labelCls="md:text-[14px] text-[13px] font-medium text-black"                                            
        value={propertyDetails?.facilities?.numberOfCabins}
        name="numberOfCabins"
        placeholder="Enter number of cabins"
        onChange={(e) => handleChange("numberOfCabins", +e.target.value)}
        errorMsg={error.numberOfCabins}
      />
      <CustomInput
        label="No of Meeeting rooms"
        type="number"
        labelCls="md:text-[14px] text-[13px] font-medium text-black"
        value={propertyDetails?.facilities?.numberOfMeetingRooms || null}
        name="numberOfMeetingRooms"
        placeholder="Enter number of meeting rooms"
        onChange={(e) => handleChange("numberOfMeetingRooms", +e.target.value)}
        errorMsg={error.numberOfMeetingRooms}
      />
      <CustomInput
        label="No of wash rooms"
        type="number"
        labelCls="md:text-[14px] text-[13px] font-medium text-black"
        value={propertyDetails?.facilities?.numberOfWashrooms || null}
        name="numberOfWashrooms"
        placeholder="Enter number of wash rooms"
        onChange={(e) => handleChange("numberOfWashrooms", +e.target.value)}
        errorMsg={error.numberOfWashrooms}
      />
    </>
  );
};

export default CommercialFacilites;
